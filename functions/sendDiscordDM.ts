import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { message } = await req.json();

    if (!message || message.trim().length === 0) {
      return Response.json({ error: 'Message cannot be empty' }, { status: 400 });
    }

    const botToken = Deno.env.get('DISCORD_BOT_TOKEN');
    const ownerId = Deno.env.get('DISCORD_OWNER_ID');

    if (!botToken || !ownerId) {
      return Response.json({ error: 'Discord config missing' }, { status: 500 });
    }

    // Get or create DM channel with owner
    const dmResponse = await fetch('https://discord.com/api/v10/users/@me/channels', {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipient_id: ownerId,
      }),
    });

    if (!dmResponse.ok) {
      const error = await dmResponse.text();
      return Response.json({ error: 'Failed to open DM channel', details: error }, { status: 500 });
    }

    const dmData = await dmResponse.json();
    const channelId = dmData.id;

    // Send message to the DM channel
    const messageResponse = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: message,
      }),
    });

    if (!messageResponse.ok) {
      const error = await messageResponse.text();
      return Response.json({ error: 'Failed to send message', details: error }, { status: 500 });
    }

    return Response.json({ success: true, message: 'Message sent to Discord' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});