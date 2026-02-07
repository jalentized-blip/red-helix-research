import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Helper function to post the "Rules & Verification" message to a Discord channel.
 * This should be called once by an admin to set up the verification channel.
 */
Deno.serve(async (req) => {
    try {
        // Basic Admin Check
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user || user.role !== 'admin') {
             return Response.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
        }

        const token = Deno.env.get('DISCORD_BOT_TOKEN');
        const channelId = Deno.env.get('DISCORD_CHANNEL_ID');

        if (!token || !channelId) {
            return Response.json({ 
                error: 'Missing DISCORD_BOT_TOKEN or DISCORD_CHANNEL_ID configuration' 
            }, { status: 500 });
        }

        // The Message Payload
        const body = {
            content: "**Welcome to Red Helix Research!** 🧬\n\nTo access the community, you must verify that you are **21+ years of age** and agree to our **Terms of Service**.\n\n**Disclaimer:**\n> All products discussed and sold are for **laboratory research purposes only** and are **not for human consumption**. By entering, you agree to adhere to these guidelines and local regulations.\n\nClick the button below to accept and verify.",
            components: [{
                type: 1, // Action Row
                components: [{
                    type: 2, // Button
                    style: 3, // Success (Green)
                    label: "I Agree & Enter Server",
                    custom_id: "accept_rules",
                    emoji: { name: "✅" }
                }]
            }]
        };

        const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
            method: 'POST',
            headers: {
                Authorization: `Bot ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const err = await response.json();
            return Response.json({ error: 'Discord API Error', details: err }, { status: 500 });
        }

        return Response.json({ 
            success: true, 
            message: 'Verification message posted successfully!',
            data: await response.json()
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
