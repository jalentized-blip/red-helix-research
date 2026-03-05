import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Admin access required' }, { status: 403 });
        }

        const { action, labelData } = await req.json();
        const API_KEY = Deno.env.get('PIRATESHIP_API_KEY');

        if (!API_KEY) {
            return Response.json({ error: 'PirateShip API key not configured' }, { status: 500 });
        }

        const PIRATESHIP_API = 'https://api.pirateship.com/v1';

        if (action === 'create_label') {
            const response = await fetch(`${PIRATESHIP_API}/labels`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    rate_id: labelData.rate_id,
                    label_download: {
                        format: 'pdf'
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`PirateShip API error: ${response.statusText}`);
            }

            const labelResponse = await response.json();
            return Response.json({ success: true, label: labelResponse });
        }

        if (action === 'get_rates') {
            const response = await fetch(`${PIRATESHIP_API}/rates`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    to_zip: labelData.to_zip,
                    to_state: labelData.to_state,
                    to_country: labelData.to_country || 'US',
                    weight: labelData.weight,
                    length: labelData.length || 0,
                    width: labelData.width || 0,
                    height: labelData.height || 0
                })
            });

            if (!response.ok) {
                throw new Error(`PirateShip API error: ${response.statusText}`);
            }

            const rates = await response.json();
            return Response.json({ success: true, rates });
        }

        return Response.json({ error: 'Unknown action' }, { status: 400 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});