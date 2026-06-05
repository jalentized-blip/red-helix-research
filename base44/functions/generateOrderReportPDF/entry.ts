import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { jsPDF } from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Fetch all orders
    let orders = [];
    let skip = 0;
    const limit = 100;
    while (true) {
      const batch = await base44.asServiceRole.entities.Order.list('-created_date', limit, skip);
      if (!batch || batch.length === 0) break;
      orders = orders.concat(batch);
      if (batch.length < limit) break;
      skip += limit;
    }

    // ─── STATS CALCULATIONS ─────────────────────────────────────────────────
    const totalOrders = orders.length;
    const totalGrossRevenue = orders.reduce((s, o) => s + (o.total_amount || 0), 0);
    const totalSubtotal = orders.reduce((s, o) => s + (o.subtotal || 0), 0);
    const totalShipping = orders.reduce((s, o) => s + (o.shipping_cost || 0), 0);
    const totalDiscount = orders.reduce((s, o) => s + (o.discount_amount || 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalGrossRevenue / totalOrders : 0;

    // Orders by status
    const statusCounts = {};
    orders.forEach(o => {
      const s = o.status || 'unknown';
      statusCounts[s] = (statusCounts[s] || 0) + 1;
    });

    // Orders by payment method
    const paymentMethodCounts = {};
    orders.forEach(o => {
      const pm = o.payment_method || 'unknown';
      paymentMethodCounts[pm] = (paymentMethodCounts[pm] || 0) + 1;
    });

    // Top 10 products by quantity and revenue
    const productStats = {};
    orders.forEach(o => {
      (o.items || []).forEach(item => {
        const key = `${item.productName || 'Unknown'} — ${item.specification || ''}`.trim().replace(/— $/, '');
        if (!productStats[key]) productStats[key] = { qty: 0, revenue: 0 };
        productStats[key].qty += item.quantity || 1;
        productStats[key].revenue += (item.price || 0) * (item.quantity || 1);
      });
    });
    const topProducts = Object.entries(productStats)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 10);

    // ─── PDF GENERATION ──────────────────────────────────────────────────────
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 15;
    let y = margin;

    const checkPage = (needed = 10) => {
      if (y + needed > pageH - margin) {
        doc.addPage();
        y = margin;
      }
    };

    const sectionHeader = (title) => {
      checkPage(14);
      doc.setFillColor(139, 38, 53);
      doc.rect(margin, y, pageW - margin * 2, 8, 'F');
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(title, margin + 3, y + 5.5);
      doc.setTextColor(0, 0, 0);
      y += 11;
    };

    const row = (label, value, indent = 0) => {
      checkPage(7);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(label, margin + indent, y);
      doc.setFont('helvetica', 'normal');
      const valStr = String(value ?? '—');
      const lines = doc.splitTextToSize(valStr, pageW - margin * 2 - 55 - indent);
      doc.text(lines, margin + 55 + indent, y);
      y += lines.length * 5 + 1;
    };

    const divider = () => {
      checkPage(4);
      doc.setDrawColor(220, 220, 220);
      doc.line(margin, y, pageW - margin, y);
      y += 3;
    };

    // ── COVER / TITLE ────────────────────────────────────────────────────────
    doc.setFillColor(139, 38, 53);
    doc.rect(0, 0, pageW, 35, 'F');
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('Red Helix Research', pageW / 2, 14, { align: 'center' });
    doc.setFontSize(13);
    doc.text('Complete Order & Business Report', pageW / 2, 23, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })} (CST)`, pageW / 2, 30, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    y = 42;

    // ── SUMMARY STATS ────────────────────────────────────────────────────────
    sectionHeader('BUSINESS SUMMARY');
    row('Total Orders', totalOrders);
    row('Total Gross Revenue', `$${totalGrossRevenue.toFixed(2)}`);
    row('Total Product Sales (Subtotal)', `$${totalSubtotal.toFixed(2)}`);
    row('Total Shipping Collected', `$${totalShipping.toFixed(2)}`);
    row('Total Discounts Applied', `$${totalDiscount.toFixed(2)}`);
    row('Average Order Value', `$${avgOrderValue.toFixed(2)}`);
    y += 3;

    // ── ORDERS BY STATUS ─────────────────────────────────────────────────────
    sectionHeader('ORDERS BY STATUS');
    Object.entries(statusCounts).forEach(([status, count]) => {
      row(status.replace(/_/g, ' ').toUpperCase(), count);
    });
    y += 3;

    // ── ORDERS BY PAYMENT METHOD ─────────────────────────────────────────────
    sectionHeader('ORDERS BY PAYMENT METHOD');
    Object.entries(paymentMethodCounts).forEach(([method, count]) => {
      row(method.replace(/_/g, ' ').toUpperCase(), count);
    });
    y += 3;

    // ── TOP 10 PRODUCTS ──────────────────────────────────────────────────────
    sectionHeader('TOP 10 PRODUCTS BY REVENUE');
    topProducts.forEach(([name, stats], i) => {
      checkPage(8);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(`${i + 1}. ${name}`, margin, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.text(`     Qty Sold: ${stats.qty}   |   Revenue: $${stats.revenue.toFixed(2)}`, margin, y);
      y += 6;
    });
    y += 3;

    // ── DETAILED ORDER LIST ──────────────────────────────────────────────────
    sectionHeader(`ALL ORDERS (${totalOrders} total)`);
    y += 2;

    orders.forEach((order, idx) => {
      checkPage(60);

      // Order header bar
      doc.setFillColor(245, 245, 245);
      doc.rect(margin, y, pageW - margin * 2, 7, 'F');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(139, 38, 53);
      doc.text(`Order #${order.order_number || order.id}`, margin + 2, y + 5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`${new Date(order.created_date).toLocaleDateString('en-US')}`, pageW - margin - 2, y + 5, { align: 'right' });
      doc.setTextColor(0, 0, 0);
      y += 10;

      // Customer info
      row('Customer Name', order.customer_name);
      row('Customer Email', order.customer_email);
      row('Customer Phone', order.customer_phone);

      // Shipping address
      if (order.shipping_address) {
        const addr = order.shipping_address;
        const fullAddr = [addr.address, addr.city, addr.state, addr.zip, addr.country].filter(Boolean).join(', ');
        row('Shipping Address', fullAddr);
      }

      // Order details
      row('Status', (order.status || '').replace(/_/g, ' ').toUpperCase());
      row('Payment Method', order.payment_method);
      row('Payment Status', order.payment_status);
      row('Transaction ID', order.transaction_id);
      row('Square Order ID', order.square_order_id);

      // Financials
      row('Subtotal', `$${(order.subtotal || 0).toFixed(2)}`);
      row('Discount Amount', `$${(order.discount_amount || 0).toFixed(2)}`);
      row('Shipping Cost', `$${(order.shipping_cost || 0).toFixed(2)}`);
      row('Total Amount', `$${(order.total_amount || 0).toFixed(2)}`);

      // Codes
      if (order.promo_code) row('Promo Code', order.promo_code);
      if (order.affiliate_code) row('Affiliate Code', order.affiliate_code);
      if (order.affiliate_email) row('Affiliate Email', order.affiliate_email);
      if (order.affiliate_commission) row('Affiliate Commission', `$${(order.affiliate_commission || 0).toFixed(2)}`);
      if (order.referral_code) row('Referral Code', order.referral_code);

      // Tracking
      if (order.tracking_number) row('Tracking Number', order.tracking_number);
      if (order.kit_tracking_number) row('Kit Tracking Number', order.kit_tracking_number);
      if (order.carrier) row('Carrier', order.carrier);
      if (order.estimated_delivery) row('Est. Delivery', order.estimated_delivery);
      if (order.delivered_date) row('Delivered Date', order.delivered_date);

      // Crypto info
      if (order.crypto_currency) row('Crypto Currency', order.crypto_currency);
      if (order.crypto_amount) row('Crypto Amount', order.crypto_amount);
      if (order.crypto_address) row('Crypto Address', order.crypto_address);

      // Admin notes
      if (order.admin_notes) row('Admin Notes', order.admin_notes);

      // Items
      checkPage(10);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Items Ordered:', margin, y);
      y += 5;

      (order.items || []).forEach(item => {
        checkPage(6);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        const itemLine = `  • ${item.productName || 'Unknown'} | ${item.specification || ''} | Qty: ${item.quantity || 1} | Price: $${(item.price || 0).toFixed(2)} | Subtotal: $${((item.price || 0) * (item.quantity || 1)).toFixed(2)}`;
        const lines = doc.splitTextToSize(itemLine, pageW - margin * 2 - 5);
        doc.text(lines, margin, y);
        y += lines.length * 5;
      });

      // Record IDs
      y += 2;
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(130, 130, 130);
      doc.text(`Record ID: ${order.id}  |  Created: ${order.created_date}  |  Updated: ${order.updated_date}`, margin, y);
      doc.setTextColor(0, 0, 0);
      y += 4;

      divider();

      if (idx < orders.length - 1) y += 2;
    });

    // Page numbers
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} of ${totalPages}  |  Red Helix Research — Confidential`, pageW / 2, pageH - 8, { align: 'center' });
    }

    const pdfBytes = doc.output('arraybuffer');

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=RedHelixResearch_OrderReport_${new Date().toISOString().slice(0, 10)}.pdf`,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});