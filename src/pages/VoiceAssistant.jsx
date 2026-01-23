import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Mic } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';

export default function VoiceAssistant() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [responses, setResponses] = useState([]);
  const [recordingAmplitude, setRecordingAmplitude] = useState(0);
  const audioRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onstart = () => {
      setIsRecording(true);
      setTranscript('');
    };

    recognitionRef.current.onresult = (event) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          setTranscript(prev => prev + t);
        } else {
          interimTranscript += t;
        }
      }
      if (interimTranscript) {
        setTranscript(prev => prev.split('(interim)')[0] + interimTranscript + '(interim)');
      }
    };

    recognitionRef.current.onend = () => {
      setIsRecording(false);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      setTranscript('');
      recognitionRef.current?.start();
    }
  };

  const speakText = async (textToSpeak) => {
    try {
      setIsSpeaking(true);
      const response = await base44.functions.invoke('textToSpeech', {
        text: textToSpeak
      });

      const audioUrl = response.data.audioUrl;

      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        audioRef.current.onended = () => setIsSpeaking(false);
      }
    } catch (err) {
      console.error('Error playing audio:', err);
      setIsSpeaking(false);
    }
  };

  const handleSpeak = () => {
    if (text.trim()) {
      const finalText = text.trim();
      setResponses(prev => [...prev, { id: Date.now(), text: finalText }]);
      speakText(finalText);
      setText('');
    }
  };

  useEffect(() => {
    if (!isRecording && transcript && !transcript.includes('(interim)')) {
      const finalTranscript = transcript.replace('(interim)', '').trim();
      if (finalTranscript) {
        const messageId = Date.now();
        setResponses(prev => [...prev, { id: messageId, text: finalTranscript }]);
        setTranscript('');
        speakText(finalTranscript);
      }
    }
  }, [isRecording]);

  return (
    <div className="min-h-screen bg-stone-950 pt-24 pb-20 flex flex-col">
      <div className="max-w-3xl mx-auto w-full px-4 flex flex-col h-[calc(100vh-120px)]">
        {/* Header */}
        <div className="mb-6">
          <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-red-600 hover:text-red-500 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <h1 className="text-4xl font-black text-amber-50">Voice Assistant</h1>
          <p className="text-stone-400 mt-2">Convert text to speech or speak to hear it back</p>
        </div>

        {/* Responses Container */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-6 bg-stone-900/30 border border-stone-700 rounded-lg p-6">
          {responses.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-stone-500 text-center">Type or speak something to hear it in voice</p>
            </div>
          ) : (
            responses.map((response) => (
              <motion.div
                key={response.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center"
              >
                <div className="max-w-[85%] rounded-lg px-4 py-3 bg-red-700 text-amber-50">
                  <p>{response.text}</p>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Hidden audio element */}
        <audio ref={audioRef} className="hidden" />

        {/* Input Area */}
        <div className="space-y-2">
          <div className="relative">
            <Input
              type="text"
              value={isRecording ? transcript.replace('(interim)', '') : text}
              onChange={(e) => !isRecording && setText(e.target.value)}
              placeholder="Type text or use the mic to speak..."
              className="flex-1 bg-stone-800 border-stone-700 text-amber-50 placeholder:text-stone-500 pr-40"
              disabled={isRecording || isSpeaking}
              onKeyPress={(e) => e.key === 'Enter' && handleSpeak()}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
              <Button
                type="button"
                onClick={toggleRecording}
                className={`px-3 gap-2 transition-colors ${
                  isRecording
                    ? 'bg-red-600 hover:bg-red-700 text-amber-50'
                    : 'bg-blue-600 hover:bg-blue-700 text-amber-50'
                }`}
                disabled={isSpeaking}
              >
                {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
              <Button
                type="button"
                onClick={handleSpeak}
                disabled={!text.trim() || isSpeaking || isRecording}
                className="bg-red-700 hover:bg-red-600 text-amber-50 px-6 gap-2"
              >
                <Volume2 className="w-4 h-4" />
                Speak
              </Button>
            </div>
          </div>

          {isRecording && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-red-400 text-xs"
            >
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.6 }}>
                <Mic className="w-3 h-3" />
              </motion.div>
              <span>Recording...</span>
            </motion.div>
          )}

          {isSpeaking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-amber-400 text-xs"
            >
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.6 }}>
                <Volume2 className="w-3 h-3" />
              </motion.div>
              <span>Playing audio...</span>
            </motion.div>
          )}

          <p className="text-xs text-stone-500 text-center">
            Type text and click Speak, or use the mic button to record voice
          </p>
        </div>
      </div>
    </div>
  );
}