import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Loader2, ArrowLeft, Mic, MicOff, Volume2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';

const VOICE_OPTIONS = [
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel - Calm Female' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah - Professional Female' },
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam - Deep Male' },
  { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam - Friendly Male' },
  { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh - Young Male' },
  { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold - Mature Male' },
  { id: 'ODq5zmih8GrVes37Dizd', name: 'Patrick - Energetic Male' },
  { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie - Casual Male' },
];

export default function PeppyBot() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "👋 Hello! I'm PeppyBot, your peptide research education assistant.\n\n**Important Disclaimer:** All information I provide is strictly for educational and research purposes only. The products on this website are NOT intended for human consumption.\n\nI'm here to discuss peptide research, answer questions about various compounds, and help you navigate our website resources. What would you like to learn about today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volume, setVolume] = useState([0.8]);
  const [selectedVoice, setSelectedVoice] = useState('21m00Tcm4TlvDq8ikWAM');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [audioDevices, setAudioDevices] = useState({ input: [], output: [] });
  const [selectedInputDevice, setSelectedInputDevice] = useState('');
  const [selectedOutputDevice, setSelectedOutputDevice] = useState('');
  const [showAdvancedAudio, setShowAdvancedAudio] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Enumerate audio devices
  useEffect(() => {
    const getAudioDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInput = devices.filter(device => device.kind === 'audioinput');
        const audioOutput = devices.filter(device => device.kind === 'audiooutput');

        setAudioDevices({ input: audioInput, output: audioOutput });

        if (audioInput.length > 0 && !selectedInputDevice) {
          setSelectedInputDevice(audioInput[0].deviceId);
        }
        if (audioOutput.length > 0 && !selectedOutputDevice) {
          setSelectedOutputDevice(audioOutput[0].deviceId);
        }
      } catch (err) {
        console.error('Error enumerating audio devices:', err);
      }
    };

    getAudioDevices();

    // Listen for device changes
    navigator.mediaDevices.addEventListener('devicechange', getAudioDevices);
    return () => navigator.mediaDevices.removeEventListener('devicechange', getAudioDevices);
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      // Set audio input device if supported
      if (selectedInputDevice && recognitionRef.current.mediaDevices?.getUserMedia) {
        recognitionRef.current.mediaDevices = { getUserMedia: (constraints) => {
          constraints.audio = { deviceId: { exact: selectedInputDevice } };
          return navigator.mediaDevices.getUserMedia(constraints);
        }};
      }

      recognitionRef.current.onresult = (event) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript;
          } else {
            interim += transcript;
          }
        }

        if (final) {
          setMessages(prev => [...prev, { role: 'user', content: final }]);
          setInterimTranscript('');
          handleAIResponse(final);
        } else {
          setInterimTranscript(interim);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        if (isVoiceMode && isListening) {
          recognitionRef.current.start();
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [isVoiceMode, isListening]);

  const toggleVoiceMode = () => {
    if (isVoiceMode) {
      // Stop voice mode
      setIsVoiceMode(false);
      setIsListening(false);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    } else {
      // Start voice mode
      setIsVoiceMode(true);
      setIsListening(true);
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    }
  };

  const speakText = async (text) => {
    try {
      setIsSpeaking(true);
      
      // Clean markdown and special characters for better speech
      const cleanText = text
        .replace(/\*\*/g, '')
        .replace(/⚠️/g, 'Warning:')
        .replace(/[#*_]/g, '')
        .replace(/\n+/g, '. ')
        .substring(0, 500); // Limit length for faster response
      
      console.log('Requesting TTS for:', cleanText.substring(0, 50));
      
      const response = await base44.functions.invoke('textToSpeech', { 
        text: cleanText,
        voice_id: selectedVoice 
      });
      
      console.log('TTS response:', response.data);
      
      if (response.data?.audioUrl) {
        // Stop any currently playing audio
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
        
        console.log('Creating audio element');
        const audio = new Audio(response.data.audioUrl);
        audioRef.current = audio;
        audio.volume = volume[0];
        
        // Set output device if supported
        if (selectedOutputDevice && audio.setSinkId) {
          try {
            await audio.setSinkId(selectedOutputDevice);
            console.log('Audio output device set:', selectedOutputDevice);
          } catch (err) {
            console.warn('Could not set output device:', err);
          }
        }
        
        audio.onloadeddata = () => {
          console.log('Audio loaded successfully');
        };
        
        audio.onended = () => {
          console.log('Audio playback ended');
          setIsSpeaking(false);
          audioRef.current = null;
        };
        
        audio.onerror = (e) => {
          console.error('Audio playback error:', e);
          console.error('Audio src:', audio.src);
          setIsSpeaking(false);
          audioRef.current = null;
        };
        
        console.log('Starting playback');
        try {
          // Ensure audio plays with user gesture context
          const playPromise = audio.play();
          if (playPromise !== undefined) {
            await playPromise;
          }
        } catch (err) {
          console.error('Play error:', err);
          setIsSpeaking(false);
        }
      } else {
        console.error('No audioUrl in response');
        setIsSpeaking(false);
      }
    } catch (error) {
      console.error('Text-to-speech error:', error);
      setIsSpeaking(false);
    }
  };

  const handleAIResponse = async (userMessage) => {
    setIsLoading(true);

    try {
      const systemPrompt = `You are PeppyBot, an educational AI assistant specializing in peptide research. Your role is STRICTLY limited to discussing peptides and research use only.

CRITICAL RULES:
1. ALWAYS include this disclaimer in your first response to any new topic: "⚠️ **Educational Purposes Only**: This information is strictly for research and educational purposes. Products discussed are NOT for human consumption."
2. Only discuss peptides in a positive, educational, research-focused manner
3. Reference relevant communities when helpful: GLP1Forums, Stairway to Gray, The Gray Market, and similar peptide research communities
4. When users ask about topics covered on the website, suggest relevant sections:
   - Product catalog: "Check out our Products section"
   - Dosing/mixing: "Visit our Peptide Calculator tool"
   - Quality/testing: "See our COAs section for lab testing"
   - General info: "Browse our Learn More section"
   - Ordering/account: "Visit your Account page"
5. If asked about non-peptide topics, politely redirect: "I'm specifically designed to discuss peptide research. For other topics, please contact our support team."
6. Maintain a helpful, educational, and professional tone
7. When discussing specific peptides, reference scientific literature and community research when relevant

Available website sections to suggest:
- Products (peptide catalog)
- Peptide Calculator (dosing/reconstitution)
- Learn More (peptide information)
- COAs (certificates of analysis)
- Account (orders and profile)
- About (company information)
- Contact (support)

User question: ${userMessage}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: systemPrompt,
        add_context_from_internet: true
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      
      if (isVoiceMode) {
        await speakText(response);
      }
    } catch (error) {
      const errorMsg = "I apologize, but I encountered an error. Please try again or contact our support team if the issue persists.";
      setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
      
      if (isVoiceMode) {
        await speakText(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    await handleAIResponse(userMessage);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 pt-32 pb-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-stone-400 hover:text-amber-50 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Shop
          </Link>
          <h1 className="text-4xl font-bold text-amber-50 mb-2">PeppyBot</h1>
          <p className="text-stone-400">Your peptide research education assistant</p>
        </div>

        {/* Chat Container */}
        <div className="bg-stone-900/50 backdrop-blur-sm border border-stone-800 rounded-xl overflow-hidden">
          {/* Messages */}
          <div className="h-[60vh] overflow-y-auto p-6 space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-red-700 text-amber-50'
                        : 'bg-stone-800 text-stone-100'
                    }`}
                  >
                    {message.role === 'assistant' ? (
                      <ReactMarkdown
                        className="prose prose-invert prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          strong: ({ children }) => <strong className="text-amber-50 font-semibold">{children}</strong>,
                          ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
                          li: ({ children }) => <li className="mb-1">{children}</li>,
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    ) : (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-stone-800 rounded-lg p-4 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-amber-50 animate-spin" />
                  <span className="text-stone-300 text-sm">PeppyBot is thinking...</span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Voice Mode Indicator */}
          {isVoiceMode && (
            <div className="border-t border-stone-800 bg-stone-800/50">
              <div className="px-4 py-3">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-2 ${isListening ? 'text-red-500' : 'text-stone-400'}`}>
                      {isListening ? <Mic className="w-4 h-4 animate-pulse" /> : <MicOff className="w-4 h-4" />}
                      <span className="text-sm font-medium">
                        {isListening ? 'Listening...' : 'Voice Paused'}
                      </span>
                    </div>
                    {interimTranscript && (
                      <span className="text-sm text-stone-400 italic">"{interimTranscript}"</span>
                    )}
                    {isSpeaking && (
                      <span className="text-sm text-amber-50 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Speaking...
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setShowAdvancedAudio(!showAdvancedAudio)}
                    className="text-xs text-stone-400 hover:text-amber-50 transition-colors underline"
                  >
                    {showAdvancedAudio ? 'Hide' : 'Audio Settings'}
                  </button>
                </div>

                {showAdvancedAudio && (
                  <div className="mb-4 p-3 bg-stone-900/50 rounded-lg border border-stone-700 space-y-3">
                    <div className="text-xs font-semibold text-stone-300 uppercase">Audio Input Device</div>
                    {audioDevices.input.length > 0 ? (
                      <Select value={selectedInputDevice} onValueChange={setSelectedInputDevice}>
                        <SelectTrigger className="w-full bg-stone-700 border-stone-600 text-amber-50 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-stone-800 border-stone-700">
                          {audioDevices.input.map((device) => (
                            <SelectItem key={device.deviceId} value={device.deviceId} className="text-amber-50">
                              {device.label || `Microphone ${device.deviceId.substring(0, 5)}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-xs text-stone-400">No input devices found</p>
                    )}

                    <div className="text-xs font-semibold text-stone-300 uppercase mt-3">Audio Output Device</div>
                    {audioDevices.output.length > 0 ? (
                      <Select value={selectedOutputDevice} onValueChange={setSelectedOutputDevice}>
                        <SelectTrigger className="w-full bg-stone-700 border-stone-600 text-amber-50 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-stone-800 border-stone-700">
                          {audioDevices.output.map((device) => (
                            <SelectItem key={device.deviceId} value={device.deviceId} className="text-amber-50">
                              {device.label || `Speaker ${device.deviceId.substring(0, 5)}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-xs text-stone-400">No output devices found</p>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                    <SelectTrigger className="w-48 bg-stone-700 border-stone-600 text-amber-50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-stone-800 border-stone-700">
                      {VOICE_OPTIONS.map((voice) => (
                        <SelectItem key={voice.id} value={voice.id} className="text-amber-50">
                          {voice.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-stone-400" />
                    <Slider
                      value={volume}
                      onValueChange={(val) => {
                        setVolume(val);
                        if (audioRef.current) {
                          audioRef.current.volume = val[0];
                        }
                      }}
                      max={1}
                      step={0.1}
                      className="w-24"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-stone-800 p-4">
            <div className="flex gap-2">
              <Button
                onClick={toggleVoiceMode}
                className={`${isVoiceMode ? 'bg-red-700 hover:bg-red-600' : 'bg-stone-700 hover:bg-stone-600'} text-amber-50`}
              >
                {isVoiceMode ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isVoiceMode ? "Voice mode active - or type your message..." : "Ask me about peptide research, dosing, storage, or anything else..."}
                className="flex-1 bg-stone-800 border-stone-700 text-amber-50 placeholder:text-stone-400 resize-none"
                rows={3}
                disabled={isLoading || isVoiceMode}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading || isVoiceMode}
                className="bg-red-700 hover:bg-red-600 text-amber-50 self-end"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
            <p className="text-xs text-stone-500 mt-2">
              {isVoiceMode ? 'Voice chat active - Click mic to disable' : 'Press Enter to send, Shift+Enter for new line'}
            </p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link to={createPageUrl('Home') + '#products'} className="p-3 bg-stone-900/50 border border-stone-800 rounded-lg hover:border-red-700/50 transition-colors text-center">
            <p className="text-sm font-semibold text-amber-50">Products</p>
          </Link>
          <Link to={createPageUrl('PeptideCalculator')} className="p-3 bg-stone-900/50 border border-stone-800 rounded-lg hover:border-red-700/50 transition-colors text-center">
            <p className="text-sm font-semibold text-amber-50">Calculator</p>
          </Link>
          <Link to={createPageUrl('LearnMore')} className="p-3 bg-stone-900/50 border border-stone-800 rounded-lg hover:border-red-700/50 transition-colors text-center">
            <p className="text-sm font-semibold text-amber-50">Learn More</p>
          </Link>
          <Link to={createPageUrl('Home') + '#certificates'} className="p-3 bg-stone-900/50 border border-stone-800 rounded-lg hover:border-red-700/50 transition-colors text-center">
            <p className="text-sm font-semibold text-amber-50">COAs</p>
          </Link>
        </div>
      </div>
    </div>
  );
}