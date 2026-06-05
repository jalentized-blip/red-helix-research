import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { jsPDF } from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const products = await base44.asServiceRole.entities.Product.list();

    // ─── STATS ───────────────────────────────────────────────────────────────
    const totalProducts = products.length;
    const totalSpecs = products.reduce((s, p) => s + (p.specifications?.length || 0), 0);
    const inStockProducts = products.filter(p => p.in_stock && !p.hidden).length;
    const hiddenProducts = products.filter(p => p.hidden).length;
    const outOfStockProducts = products.filter(p => !p.in_stock && !p.hidden).length;

    const categoryCounts = {};
    products.forEach(p => {
      const c = p.category || 'uncategorized';
      categoryCounts[c] = (categoryCounts[c] || 0) + 1;
    });

    // Total stock units across all specs
    const totalStockUnits = products.reduce((s, p) => {
      return s + (p.specifications || []).reduce((ss, spec) => ss + (spec.stock_quantity || 0), 0);
    }, 0);

    // Price range
    const allPrices = products.flatMap(p => (p.specifications || []).map(s => s.price)).filter(Boolean);
    const minPrice = allPrices.length ? Math.min(...allPrices) : 0;
    const maxPrice = allPrices.length ? Math.max(...allPrices) : 0;

    // ─── PDF ─────────────────────────────────────────────────────────────────
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

    // ── COVER ────────────────────────────────────────────────────────────────
    doc.setFillColor(139, 38, 53);
    doc.rect(0, 0, pageW, 35, 'F');
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('Red Helix Research', pageW / 2, 14, { align: 'center' });
    doc.setFontSize(13);
    doc.text('Complete Product Catalog Report', pageW / 2, 23, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })} (CST)`, pageW / 2, 30, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    y = 42;

    // ── SUMMARY ──────────────────────────────────────────────────────────────
    sectionHeader('PRODUCT CATALOG SUMMARY');
    row('Total Products', totalProducts);
    row('Total Specifications', totalSpecs);
    row('In-Stock Products', inStockProducts);
    row('Out-of-Stock Products', outOfStockProducts);
    row('Hidden Products', hiddenProducts);
    row('Total Stock Units (all specs)', totalStockUnits);
    row('Price Range', `$${minPrice.toFixed(2)} – $${maxPrice.toFixed(2)}`);
    y += 3;

    // ── BY CATEGORY ──────────────────────────────────────────────────────────
    sectionHeader('PRODUCTS BY CATEGORY');
    Object.entries(categoryCounts).forEach(([cat, count]) => {
      row(cat.replace(/_/g, ' ').toUpperCase(), count);
    });
    y += 3;

    // ── STOCK ALERTS ─────────────────────────────────────────────────────────
    const lowStockSpecs = [];
    products.forEach(p => {
      (p.specifications || []).forEach(spec => {
        if (spec.stock_quantity !== undefined && spec.stock_quantity !== null && spec.stock_quantity <= 5 && !spec.hidden) {
          lowStockSpecs.push({ product: p.name, spec: spec.name, qty: spec.stock_quantity });
        }
      });
    });

    if (lowStockSpecs.length > 0) {
      sectionHeader(`LOW STOCK ALERTS (≤5 units) — ${lowStockSpecs.length} specs`);
      lowStockSpecs.forEach(({ product, spec, qty }) => {
        checkPage(6);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(qty === 0 ? 180 : 200, 0, 0);
        doc.text(`${product} — ${spec}`, margin, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(`Stock: ${qty}`, margin + 120, y);
        y += 6;
      });
      y += 3;
    }

    // ── DETAILED PRODUCT LIST ─────────────────────────────────────────────────
    sectionHeader(`ALL PRODUCTS (${totalProducts} total)`);
    y += 2;

    products.forEach((product, idx) => {
      checkPage(50);

      // Product header
      doc.setFillColor(245, 245, 245);
      doc.rect(margin, y, pageW - margin * 2, 7, 'F');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(139, 38, 53);
      doc.text(product.name || 'Unnamed Product', margin + 2, y + 5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      const statusLabel = product.hidden ? 'HIDDEN' : product.in_stock ? 'IN STOCK' : 'OUT OF STOCK';
      doc.text(statusLabel, pageW - margin - 2, y + 5, { align: 'right' });
      doc.setTextColor(0, 0, 0);
      y += 10;

      // Product fields
      row('Category', (product.category || '').replace(/_/g, ' ').toUpperCase());
      row('Description', product.description);
      row('Starting Price', product.price_from != null ? `$${Number(product.price_from).toFixed(2)}` : '—');
      row('Default Cost Price', product.cost_price != null ? `$${Number(product.cost_price).toFixed(2)}` : '—');
      row('Badge', product.badge || '—');
      row('Featured', product.is_featured ? 'Yes' : 'No');
      row('Hidden', product.hidden ? 'Yes' : 'No');
      row('In Stock (flag)', product.in_stock ? 'Yes' : 'No');
      if (product.image_url) row('Image URL', product.image_url);

      // Specifications table
      checkPage(12);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Specifications:', margin, y);
      y += 5;

      const specs = product.specifications || [];
      if (specs.length === 0) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8.5);
        doc.text('  No specifications defined.', margin, y);
        y += 6;
      } else {
        // Table header
        checkPage(8);
        doc.setFillColor(230, 230, 230);
        doc.rect(margin, y, pageW - margin * 2, 6, 'F');
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('Name', margin + 2, y + 4);
        doc.text('Price', margin + 60, y + 4);
        doc.text('Cost', margin + 85, y + 4);
        doc.text('Stock Qty', margin + 110, y + 4);
        doc.text('In Stock', margin + 135, y + 4);
        doc.text('Hidden', margin + 158, y + 4);
        y += 7;

        specs.forEach((spec, si) => {
          checkPage(6);
          if (si % 2 === 0) {
            doc.setFillColor(252, 252, 252);
            doc.rect(margin, y - 1, pageW - margin * 2, 6, 'F');
          }
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(0, 0, 0);

          const specName = doc.splitTextToSize(spec.name || '—', 55);
          doc.text(specName, margin + 2, y + 3);
          doc.text(spec.price != null ? `$${Number(spec.price).toFixed(2)}` : '—', margin + 60, y + 3);
          doc.text(spec.cost_price != null ? `$${Number(spec.cost_price).toFixed(2)}` : '—', margin + 85, y + 3);
          doc.text(spec.stock_quantity != null ? String(spec.stock_quantity) : '∞', margin + 110, y + 3);
          doc.text(spec.in_stock === false ? 'No' : 'Yes', margin + 135, y + 3);
          doc.text(spec.hidden ? 'Yes' : 'No', margin + 158, y + 3);
          y += Math.max(specName.length * 5, 6);
        });
      }

      // Record IDs
      y += 2;
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(130, 130, 130);
      doc.text(`Record ID: ${product.id}  |  Created: ${product.created_date}  |  Updated: ${product.updated_date}`, margin, y);
      doc.setTextColor(0, 0, 0);
      y += 4;

      divider();
      if (idx < products.length - 1) y += 2;
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
        'Content-Disposition': `attachment; filename=RedHelixResearch_ProductReport_${new Date().toISOString().slice(0, 10)}.pdf`,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});