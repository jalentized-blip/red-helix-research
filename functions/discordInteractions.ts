import nacl from 'npm:tweetnacl';
import { Buffer } from 'node:buffer';

/**
 * Handles Discord Interactions (Slash Commands, Buttons, etc.)
 * Specifically handles the "accept_rules" button to assign the Verified role.
 */
Deno.serve(async (req) => {
  try {
    const PUBLIC_KEY = Deno.env.get('DISCORD_PUBLIC_KEY');
    if (!PUBLIC_KEY) {
      console.error('Missing DISCORD_PUBLIC_KEY');
      return new Response('Server Configuration Error', { status: 500 });
    }

    // 1. Verify Signature
    const signature = req.headers.get('X-Signature-Ed25519');
    const timestamp = req.headers.get('X-Signature-Timestamp');
    const body = await req.text();

    if (!signature || !timestamp) {
      return new Response('Invalid Request', { status: 401 });
    }

    const isVerified = nacl.sign.detached.verify(
      Buffer.from(timestamp + body),
      Buffer.from(signature, 'hex'),
      Buffer.from(PUBLIC_KEY, 'hex')
    );

    if (!isVerified) {
      return new Response('Invalid Signature', { status: 401 });
    }

    const interaction = JSON.parse(body);

    // 2. Handle PING (Required for Endpoint Verification)
    if (interaction.type === 1) {
      return Response.json({ type: 1 });
    }

    // 3. Handle Button Click (MESSAGE_COMPONENT = 3)
    if (interaction.type === 3 && interaction.data.custom_id === 'accept_rules') {
      const guildId = interaction.guild_id;
      const userId = interaction.member.user.id;
      const roleId = Deno.env.get('DISCORD_VERIFIED_ROLE_ID');
      const botToken = Deno.env.get('DISCORD_BOT_TOKEN');

      if (!roleId || !botToken) {
          console.error('Missing DISCORD_VERIFIED_ROLE_ID or DISCORD_BOT_TOKEN');
          return Response.json({
              type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
              data: { 
                  content: 'Configuration error: Role ID or Bot Token missing. Please contact admin.', 
                  flags: 64 // EPHEMERAL
              }
          });
      }

      // Add Role to User
      const response = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${userId}/roles/${roleId}`, {
          method: 'PUT',
          headers: {
              Authorization: `Bot ${botToken}`,
              'Content-Type': 'application/json'
          }
      });

      if (response.ok || response.status === 204) {
          return Response.json({
              type: 4,
              data: { 
                  content: '✅ You have been verified! Welcome to the server.', 
                  flags: 64 // EPHEMERAL
              }
          });
      } else {
          const err = await response.text();
          console.error('Failed to add role:', err);
           return Response.json({
              type: 4,
              data: { 
                  content: 'Failed to assign role. Please ensure the bot has "Manage Roles" permission and the Verified role is below the bot\'s role.', 
                  flags: 64 // EPHEMERAL
              }
          });
      }
    }

    return Response.json({ error: 'Unknown Interaction' }, { status: 400 });

  } catch (error) {
    console.error('Interaction Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
});
