import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text } = await req.json();
    const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
    const voiceId = Deno.env.get('ELEVENLABS_VOICE_ID');

    if (!apiKey) {
      return Response.json({ error: 'API key not configured' }, { status: 500 });
    }

    if (!text || text.trim().length === 0) {
      return Response.json({ error: 'Text is required' }, { status: 400 });
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey.trim(),
        },
        body: JSON.stringify({
          text: text.trim(),
          model_id: 'eleven_turbo_v2_5',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8
          },
        }),
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs error status:', response.status);
      console.error('ElevenLabs error response:', errorText);
      console.error('Request details - Voice ID:', voiceId, 'Text length:', text.trim().length);
      return Response.json({ error: `ElevenLabs error: ${errorText}` }, { status: 500 });
    }

    const audioBlob = await response.arrayBuffer();
    const base64Audio = btoa(
      new Uint8Array(audioBlob).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
    
    return Response.json({ audioUrl: `data:audio/mpeg;base64,${base64Audio}` });
  } catch (error) {
    console.error('Function error:', error.message);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
});