import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
const YOUR_TELEGRAM_ID = '7218640631'; // Jake's Telegram ID (you'll need to update this)

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message } = await req.json();

    if (!message || !message.trim()) {
      return Response.json({ error: 'Message cannot be empty' }, { status: 400 });
    }

    // Send message to Telegram
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: YOUR_TELEGRAM_ID,
        text: `📧 *New Message from Website*\n\n*From:* ${user.full_name}\n*Email:* ${user.email}\n\n*Message:*\n${message}`,
        parse_mode: 'Markdown'
      })
    });

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.statusText}`);
    }

    const result = await response.json();
    return Response.json({ success: true, messageId: result.result.message_id });
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});