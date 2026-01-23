import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");

// Curated selection of natural-sounding voices
const VOICES = {
  "Sarah": { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah" },
  "James": { id: "pNInz6obpgDQGcFmaJgB", name: "James" },
  "Aria": { id: "9BWtsMINqrJLrRacOk9x", name: "Aria" },
  "Daniel": { id: "onwK4e9ZDvHVJNcpOqAM", name: "Daniel" },
  "Grace": { id: "JBFqnCBsd6RMkjVDRZzw", name: "Grace" },
  "Chris": { id: "iP3nJ0z0nHULyNhWrRac", name: "Chris" },
  "Luna": { id: "Xb7hH8MSUJpSbSDYk0k2", name: "Luna" },
  "River": { id: "DCf6VLC2l8vsMfsOm8QJ", name: "River" }
};

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

    const { text, voiceId } = await req.json();

    if (!text) {
      return Response.json({ 
        error: 'Text is required' 
      }, { status: 400 });
    }

    // Use default voice if not specified or invalid
    const voice = voiceId && VOICES[voiceId] ? VOICES[voiceId] : VOICES["Sarah"];

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice.id}`,
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
    
    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache',
      }
    });
  } catch (error) {
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});