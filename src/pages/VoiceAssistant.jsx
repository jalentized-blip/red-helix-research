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

  useEffect(() => {
    if (!isRecording && transcript && !transcript.includes('(interim)')) {
      const finalTranscript = transcript.replace('(interim)', '').trim();
      if (finalTranscript) {
        setResponses(prev => [...prev, { id: Date.now(), text: finalTranscript }]);
        setTranscript('');
        speakText(finalTranscript);
      }
    }
  }, [isRecording]);

  return (
    <div className="min-h-screen bg-stone-950 pt-24 pb-20 flex flex-col">
      <div className="max-w-2xl mx-auto w-full px-4 flex flex-col h-[calc(100vh-120px)]">
        {/* Header */}
        <div className="mb-8">
          <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-red-600 hover:text-red-500 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <h1 className="text-3xl font-black text-amber-50">Voice Assistant</h1>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-between">
          {/* Responses */}
          <div className="w-full flex-1 overflow-y-auto space-y-4 mb-8">
            {responses.length === 0 ? (
              <div className="text-center text-stone-400">
                <p>Click the circle below and start speaking</p>
              </div>
            ) : (
              responses.map((response) => (
                <motion.div
                  key={response.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-center"
                >
                  <div className="max-w-[70%] rounded-2xl px-6 py-3 bg-red-700 text-amber-50 text-center">
                    <p>{response.text}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Circular Button */}
          <div className="flex flex-col items-center gap-4">
            <audio ref={audioRef} className="hidden" />

            <motion.button
              onClick={toggleRecording}
              disabled={isSpeaking}
              className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all disabled:opacity-50 ${
                isRecording
                  ? 'bg-red-600 shadow-lg shadow-red-600/50'
                  : isSpeaking
                  ? 'bg-blue-600 shadow-lg shadow-blue-600/50'
                  : 'bg-red-700 hover:bg-red-600 shadow-lg shadow-red-700/50'
              }`}
              animate={
                isRecording
                  ? { scale: [1, 1.05, 1] }
                  : isSpeaking
                  ? { scale: [1, 1.05, 1] }
                  : {}
              }
              transition={{ repeat: Infinity, duration: 1 }}
            >
              <Mic className="w-12 h-12 text-amber-50" />

              {isRecording && (
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-red-400"
                  animate={{ scale: [1, 1.2] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                />
              )}
            </motion.button>

            {/* Status Text */}
            <div className="h-6">
              {isRecording && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-400 text-sm font-medium"
                >
                  Listening...
                </motion.p>
              )}
              {isSpeaking && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-blue-400 text-sm font-medium"
                >
                  Speaking...
                </motion.p>
              )}
            </div>

            {isRecording && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-stone-400 text-center text-sm max-w-xs"
              >
                {transcript.replace('(interim)', '') || 'Waiting for speech...'}
              </motion.p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}