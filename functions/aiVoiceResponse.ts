import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userMessage, conversationId } = await req.json();

    if (!userMessage) {
      return Response.json({ error: 'Missing userMessage' }, { status: 400 });
    }

    // Fetch conversation history for context
    let conversation = null;
    if (conversationId) {
      try {
        const conversations = await base44.entities.ConversationHistory.filter({
          conversation_id: conversationId,
          created_by: user.email
        });
        if (conversations.length > 0) {
          conversation = conversations[0];
        }
      } catch (err) {
        console.log('No existing conversation found');
      }
    }

    // Build context from previous messages
    let contextMessages = [];
    if (conversation && conversation.messages) {
      contextMessages = conversation.messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));
    }

    // Call LLM with context
    const llmResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a helpful voice assistant. Keep responses concise and natural for voice interaction (1-2 sentences max). The user just said: "${userMessage}". Respond naturally and conversationally.`,
      add_context_from_internet: false
    });

    const assistantMessage = llmResponse;

    return Response.json({
      response: assistantMessage,
      conversationId: conversationId || null
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});