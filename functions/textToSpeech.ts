import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text, voice_id } = await req.json();
    const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
    const voiceId = voice_id || '21m00Tcm4TlvDq8ikWAM';

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
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8
          },
        }),
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs error:', response.status, errorText);
      return Response.json({ error: 'Speech synthesis failed' }, { status: 500 });
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