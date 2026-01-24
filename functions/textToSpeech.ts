import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text, voice_id } = await req.json();
    let apiKey = Deno.env.get('ELEVENLABS_API_KEY');
    const voiceId = voice_id || '21m00Tcm4TlvDq8ikWAM';

    if (!apiKey) {
      console.error('No API key found');
      return Response.json({ error: 'ElevenLabs API key not configured' }, { status: 500 });
    }

    if (!text || text.trim().length === 0) {
      console.error('No text provided');
      return Response.json({ error: 'Text is required' }, { status: 400 });
    }

    // Trim whitespace from API key and text
    apiKey = apiKey.trim();
    const cleanText = text.trim();

    console.log('Generating speech for:', cleanText.substring(0, 50));
    console.log('Using voice ID:', voiceId);
    console.log('API Key present:', !!apiKey, 'Key length:', apiKey?.length);

    // Call ElevenLabs API with v1 endpoint
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text: cleanText,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8
          },
        }),
      }
    );

    console.log('ElevenLabs response status:', response.status);
    console.log('ElevenLabs response headers:', JSON.stringify([...response.headers.entries()]));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error status:', response.status);
      console.error('ElevenLabs API error body:', errorText);
      return Response.json({ error: `ElevenLabs error (${response.status}): ${errorText}` }, { status: 500 });
    }

    console.log('Audio generated successfully');

    // Get audio data and convert to base64
    const audioBlob = await response.arrayBuffer();
    const base64Audio = btoa(
      new Uint8Array(audioBlob).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
    
    const audioDataUrl = `data:audio/mpeg;base64,${base64Audio}`;

    return Response.json({ audioUrl: audioDataUrl });
  } catch (error) {
    console.error('Function error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});