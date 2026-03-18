import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Admin access required' }, { status: 403 });
        }

        const { task, orderData, destination, carriers } = await req.json();

        if (!task) {
            return Response.json({ error: 'Task is required' }, { status: 400 });
        }

        let prompt = '';

        if (task === 'predict_delays') {
            prompt = `You are a logistics expert. Analyze this order data and predict potential shipping delays:
Order ID: ${orderData.order_number}
Destination: ${orderData.shipping_address?.city}, ${orderData.shipping_address?.state} ${orderData.shipping_address?.zip}
Items: ${orderData.items?.map(i => `${i.productName} (qty: ${i.quantity})`).join(', ')}
Carrier: ${orderData.carrier || 'Unknown'}

Provide a brief risk assessment (low/medium/high) and 2-3 specific factors that could cause delays.`;
        } else if (task === 'suggest_carrier') {
            prompt = `You are a shipping logistics expert. Recommend the best carrier for this shipment based on cost, speed, and destination:
Destination: ${destination}
Available carriers: ${carriers?.join(', ') || 'USPS, UPS, FedEx, DHL'}
Order items: ${orderData.items?.map(i => i.productName).join(', ')}

Recommend 1 primary carrier and explain why (30 words max).`;
        } else if (task === 'draft_communication') {
            prompt = `You are a customer service expert. Draft a brief, empathetic customer email for this situation:
Order Number: ${orderData.order_number}
Issue: ${orderData.issue}
Destination: ${orderData.shipping_address?.city}, ${orderData.shipping_address?.state}

Keep it to 2-3 sentences. Be professional but friendly. Include a call-to-action if relevant.`;
        }

        const response = await base44.integrations.Core.InvokeLLM({
            prompt,
            add_context_from_internet: false
        });

        return Response.json({ 
            success: true, 
            task, 
            result: response 
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});