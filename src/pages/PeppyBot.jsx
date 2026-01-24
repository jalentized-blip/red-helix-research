import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Loader2, ArrowLeft, Mic, MicOff, Volume2, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import VoiceVisualizer from '@/components/VoiceVisualizer';

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
  const [debugInfo, setDebugInfo] = useState('');
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);

  // Create persistent audio element on mount
  useEffect(() => {
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audioRef.current = audio;
    addDebug('Audio element initialized');
  }, []);

  const addDebug = (msg) => {
    console.log('[DEBUG]', msg);
    setDebugInfo(prev => `${prev}\n${msg}`.slice(-200));
  };

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
          addDebug(`Speech recognized: ${final.substring(0, 30)}`);
          handleAIResponse(final, true);
        } else {
          setInterimTranscript(interim);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        // Always restart if in voice mode, regardless of listening state
        if (isVoiceMode) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.error('Error restarting recognition:', e);
          }
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
      addDebug('speakText called');
      
      // Clean markdown and special characters for better speech
      const cleanText = text
            .replace(/\*\*/g, '')
            .replace(/⚠️/g, 'Warning:')
            .replace(/[#*_]/g, '')
            .replace(/\n+/g, '. ')
            .substring(0, 1000);

      addDebug(`Invoking textToSpeech with voice: ${selectedVoice}`);
      const response = await base44.functions.invoke('textToSpeech', { 
        text: cleanText,
        voice_id: selectedVoice 
      });

      addDebug(`Response received: ${response.status}`);

      if (response.data?.audioUrl) {
        addDebug('Audio URL received, setting up playback');
        
        // Use persistent audio element
        const audio = audioRef.current;
        
        // Reset audio element
        audio.pause();
        audio.currentTime = 0;
        
        // Set properties
        audio.src = response.data.audioUrl;
        audio.volume = volume[0];
        audio.muted = false;
        
        addDebug(`Audio configured - Volume: ${volume[0]}`);

        // Set output device if supported
        if (selectedOutputDevice && audio.setSinkId) {
          try {
            await audio.setSinkId(selectedOutputDevice);
            addDebug('Output device set');
          } catch (err) {
            addDebug(`Output device error: ${err.message}`);
          }
        }

        // Set up event listeners
        audio.onplay = () => {
          addDebug('Audio playback started');
          setIsSpeaking(true);
        };

        audio.onended = () => {
          addDebug('Audio playback ended');
          setIsSpeaking(false);
          // Resume listening if in voice mode
          if (isVoiceMode && recognitionRef.current) {
            addDebug('Resuming listening');
            recognitionRef.current.start();
          }
        };

        audio.onerror = (e) => {
          addDebug(`Audio error: ${audio.error?.message || e}`);
          setIsSpeaking(false);
        };

        // Play the audio
        addDebug('Attempting to play audio');
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              addDebug('Audio playing successfully');
            })
            .catch((err) => {
              addDebug(`Play error: ${err.message}`);
              setIsSpeaking(false);
            });
        }
      } else {
        addDebug('No audio URL in response');
      }
    } catch (error) {
      addDebug(`Text-to-speech error: ${error.message}`);
      setIsSpeaking(false);
    }
  };

  const testVoice = async () => {
    addDebug('Testing voice...');
    await speakText('Hello, this is a test of the voice system.');
  };

  const handleAIResponse = async (userMessage, forceVoiceMode = null) => {
    setIsLoading(true);
    addDebug(`User message: ${userMessage.substring(0, 50)}`);

    // Use forced voice mode if provided (from handleSend), otherwise use current state
    const shouldUseVoice = forceVoiceMode !== null ? forceVoiceMode : isVoiceMode;
    addDebug(`Should use voice: ${shouldUseVoice}`);

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

      addDebug('Calling InvokeLLM...');
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: systemPrompt,
        add_context_from_internet: true
      });

      addDebug('LLM response received');

      // Add message immediately for real-time display
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);

      // Only speak if in voice mode
      if (shouldUseVoice) {
        addDebug('Starting voice playback');
        // Keep response concise for voice by truncating after first few sentences
        const voiceText = response.split('\n')[0].substring(0, 500);
        await speakText(voiceText);
      }
    } catch (error) {
      addDebug(`Error: ${error.message}`);
      const errorMsg = "I apologize, but I encountered an error. Please try again or contact our support team if the issue persists.";
      setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);

      if (shouldUseVoice) {
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

    // Capture voice mode before turning it off
    const wasInVoiceMode = isVoiceMode;
    addDebug(`Sending message - was in voice mode: ${wasInVoiceMode}`);

    // Typing in chat switches to text mode
    if (isVoiceMode) {
      setIsVoiceMode(false);
      setIsListening(false);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }

    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    await handleAIResponse(userMessage, wasInVoiceMode);
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
        <div className="bg-stone-900/50 backdrop-blur-sm border border-stone-800 rounded-xl overflow-hidden relative">
          {/* Messages */}
            <div className="relative h-[60vh] overflow-hidden rounded-lg">
              <VoiceVisualizer isActive={isSpeaking} audioRef={audioRef} />
              <div className={`h-full overflow-y-auto p-6 space-y-4 ${isSpeaking ? 'blur-sm' : ''} transition-all duration-300`}>
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
                <div ref={messagesEndRef} />
              </div>
            </div>

          {/* Voice Mode Indicator */}
          {isVoiceMode && (
            <div className="border-t border-stone-800 px-4 py-3 bg-stone-800/50">
              <div className="flex items-center justify-between">
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

          {/* Debug Info */}
          {debugInfo && (
           <div className="border-t border-stone-800 px-4 py-3 bg-stone-900/50">
             <div className="text-xs font-semibold text-stone-300 uppercase mb-2">Debug Info</div>
             <pre className="text-xs text-stone-400 bg-stone-950 p-2 rounded overflow-auto max-h-24 whitespace-pre-wrap break-words">{debugInfo}</pre>
             <Button
               onClick={() => setDebugInfo('')}
               variant="outline"
               size="sm"
               className="mt-2 text-xs bg-stone-700 border-stone-600 text-amber-50"
             >
               Clear
             </Button>
           </div>
          )}

          {/* Advanced Audio Settings Dropdown */}
          {showAdvancedAudio && (
           <div className="border-t border-stone-800 px-4 py-3 bg-stone-900/50 space-y-3">
             <div className="flex items-center justify-between mb-3">
               <div className="text-xs font-semibold text-stone-300 uppercase">Audio Settings</div>
               <Button
                 onClick={testVoice}
                 size="sm"
                 className="bg-amber-600 hover:bg-amber-700 text-stone-950 text-xs"
               >
                 🔊 Test Voice
               </Button>
             </div>
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

          {/* Input Area */}
          <div className="border-t border-stone-800 p-4">
            <div className="flex gap-2">
              <div className="flex flex-col gap-2">
                <Button
                  onClick={toggleVoiceMode}
                  className={`${isVoiceMode ? 'bg-red-700 hover:bg-red-600' : 'bg-stone-700 hover:bg-stone-600'} text-amber-50`}
                >
                  {isVoiceMode ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </Button>
                <Button
                  onClick={() => setShowAdvancedAudio(!showAdvancedAudio)}
                  variant="outline"
                  size="icon"
                  className="bg-stone-700 hover:bg-stone-600 border-stone-600 text-amber-50"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isVoiceMode ? "Voice mode active - or type your message..." : "Ask me about peptide research, dosing, storage, or anything else..."}
                className="flex-1 bg-stone-800 border-stone-700 text-amber-50 placeholder:text-stone-400 resize-none"
                rows={3}
                disabled={isLoading}
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