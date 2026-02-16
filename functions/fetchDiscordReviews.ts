import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const token = Deno.env.get('DISCORD_BOT_TOKEN');
    if (!token) {
      return Response.json({ error: 'Discord token not configured' }, { status: 500 });
    }

    // Channel ID for #Customer-Reviews (need to fetch from Discord)
    // Using the invite link: https://discord.gg/BwQHufvmQ8
    // First, we need to get the guild and channel
    
    // For now, we'll use a direct approach - fetch messages from the channel
    // You would need to get the channel ID from the Discord server
    
    // Fetch messages from the #Customer-Reviews channel
    // The channel ID needs to be known - this would be obtained from Discord
    const channelId = Deno.env.get('DISCORD_CHANNEL_ID');
    
    if (!channelId) {
      return Response.json({ error: 'Discord channel ID not configured' }, { status: 500 });
    }

    const response = await fetch(
      `https://discord.com/api/v10/channels/${channelId}/messages?limit=50`,
      {
        headers: {
          Authorization: `Bot ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return Response.json({ error: 'Failed to fetch Discord messages' }, { status: 500 });
    }

    const messages = await response.json();

    // Filter and format messages
    const reviews = messages
      .filter(msg => msg.content && msg.author && !msg.author.bot)
      .slice(0, 3)
      .map(msg => ({
        text: msg.content,
        author: msg.author.username,
        role: 'Discord Member',
        date: new Date(msg.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        badge: 'Verified Community',
        avatar: msg.author.avatar
      }))
      .reverse();

    return Response.json({ reviews });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});