import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
const ELEVENLABS_VOICE_ID = Deno.env.get("ELEVENLABS_VOICE_ID");

Deno.serve(async (req) => {
  try {
    if (!ELEVENLABS_API_KEY) {
      return Response.json({ 
        error: 'ElevenLabs API key not configured' 
      }, { status: 500 });
    }

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text, voice_id } = await req.json();

    if (!text) {
      return Response.json({ 
        error: 'Text is required' 
      }, { status: 400 });
    }

    const finalVoiceId = voice_id || ELEVENLABS_VOICE_ID;

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${finalVoiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.statusText}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(audioBuffer);
    let base64Audio = '';
    for (let i = 0; i < uint8Array.length; i++) {
      base64Audio += String.fromCharCode(uint8Array[i]);
    }
    const dataUrl = `data:audio/mpeg;base64,${btoa(base64Audio)}`;
    
    return Response.json({ audioUrl: dataUrl });
  } catch (error) {
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});