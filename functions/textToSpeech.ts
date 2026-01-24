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
    const voiceId = voice_id || Deno.env.get('ELEVENLABS_VOICE_ID') || '21m00Tcm4TlvDq8ikWAM';

    if (!apiKey) {
      return Response.json({ error: 'ElevenLabs API key not configured' }, { status: 500 });
    }

    // Call ElevenLabs API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('ElevenLabs error:', error);
      return Response.json({ error: 'Text-to-speech failed' }, { status: 500 });
    }

    // Get audio data
    const audioBlob = await response.arrayBuffer();
    
    // Upload to storage
    const audioFile = new File([audioBlob], 'speech.mp3', { type: 'audio/mpeg' });
    const { file_url } = await base44.asServiceRole.integrations.Core.UploadFile({ file: audioFile });

    return Response.json({ audioUrl: file_url });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});