import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Mic, Save, Download, Trash2, Plus, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ELEVENLABS_VOICES = [
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella' },
  { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Aria' },
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam' },
  { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam' },
  { id: 'default', name: 'My Voice Bot' },
];

export default function VoiceAssistant() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('default');
  const [conversationId, setConversationId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [conversationTitle, setConversationTitle] = useState('');
  const [savedConversations, setSavedConversations] = useState([]);
  const [textInput, setTextInput] = useState('');
  const [inputMethod, setInputMethod] = useState(null); // 'voice' or 'text'
  const audioRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    loadSavedConversations();
  }, []);

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
      let finalTranscript = '';
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += t;
        } else {
          interimTranscript += t;
        }
      }
      
      if (finalTranscript) {
        setTranscript(finalTranscript + (interimTranscript ? ' ' + interimTranscript : ''));
      } else if (interimTranscript) {
        setTranscript(interimTranscript);
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
    return new Promise((resolve) => {
      try {
        setIsSpeaking(true);
        base44.functions.invoke('textToSpeech', {
          text: textToSpeak,
          voice_id: selectedVoice
        }).then(response => {
          const audioUrl = response.data.audioUrl;
          if (audioRef.current) {
            audioRef.current.src = audioUrl;
            audioRef.current.onended = () => {
              setIsSpeaking(false);
              resolve();
            };
            audioRef.current.play().catch(err => {
              console.error('Error playing audio:', err);
              setIsSpeaking(false);
              resolve();
            });
          } else {
            setIsSpeaking(false);
            resolve();
          }
        }).catch(err => {
          console.error('Error getting audio:', err);
          setIsSpeaking(false);
          resolve();
        });
      } catch (err) {
        console.error('Error in speakText:', err);
        setIsSpeaking(false);
        resolve();
      }
    });
  };

  const loadSavedConversations = async () => {
    try {
      const conversations = await base44.entities.ConversationHistory.list();
      setSavedConversations(conversations.reverse());
    } catch (err) {
      console.error('Error loading conversations:', err);
    }
  };

  const loadConversation = async (conv) => {
    setConversationId(conv.id);
    setMessages(conv.messages || []);
    setSelectedVoice(conv.voice_id || ELEVENLABS_VOICES[0].id);
  };

  const newConversation = () => {
    setConversationId(null);
    setMessages([]);
    setConversationTitle('');
  };

  const saveConversation = async () => {
    if (!conversationTitle.trim()) return;

    try {
      if (conversationId) {
        await base44.entities.ConversationHistory.update(conversationId, {
          title: conversationTitle,
          messages,
          voice_id: selectedVoice,
          last_message_at: new Date().toISOString()
        });
      } else {
        const newConv = await base44.entities.ConversationHistory.create({
          conversation_id: `conv_${Date.now()}`,
          title: conversationTitle,
          messages,
          voice_id: selectedVoice,
          last_message_at: new Date().toISOString()
        });
        setConversationId(newConv.id);
      }
      setShowSaveDialog(false);
      loadSavedConversations();
    } catch (err) {
      console.error('Error saving conversation:', err);
    }
  };

  const deleteConversation = async (convId) => {
    try {
      await base44.entities.ConversationHistory.delete(convId);
      if (conversationId === convId) newConversation();
      loadSavedConversations();
    } catch (err) {
      console.error('Error deleting conversation:', err);
    }
  };

  const handleProcessTranscript = async (finalTranscript, method = 'voice') => {
    setMessages(prev => [...prev, { role: 'user', content: finalTranscript, timestamp: new Date().toISOString() }]);
    setTranscript('');
    setIsLoading(true);

    try {
      const response = await base44.functions.invoke('aiVoiceResponse', {
        userMessage: finalTranscript,
        conversationId: conversationId
      });

      const aiResponse = response.data.response || response.response;
      if (!aiResponse) {
        throw new Error('No response from AI');
      }
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse, timestamp: new Date().toISOString() }]);
      
      if (method === 'voice') {
        await speakText(aiResponse);
      }
    } catch (err) {
      console.error('Error getting response:', err);
      if (method === 'voice') {
        const errorMsg = "Sorry, I couldn't process that. Please try again.";
        await speakText(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isRecording && transcript.trim()) {
      handleProcessTranscript(transcript.trim(), 'voice');
    }
  }, [isRecording]);

  const handleSendMessage = async () => {
    if (!textInput.trim()) return;
    const messageText = textInput;
    setTextInput('');
    await handleProcessTranscript(messageText, 'text');
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-20 flex flex-col">
      <div className="max-w-2xl mx-auto w-full px-4 flex flex-col h-[calc(100vh-120px)]">
        {/* Header with Controls */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-[#dc2626] hover:text-red-700 font-medium">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
            <div className="flex gap-2">
              <Button
                onClick={newConversation}
                variant="outline"
                size="sm"
                className="text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-[#dc2626]"
              >
                <Plus className="w-4 h-4 mr-1" />
                New
              </Button>
              <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-[#dc2626]"
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white border-slate-200">
                  <DialogHeader>
                    <DialogTitle className="text-slate-900">Save Conversation</DialogTitle>
                  </DialogHeader>
                  <Input
                    placeholder="Conversation title..."
                    value={conversationTitle}
                    onChange={(e) => setConversationTitle(e.target.value)}
                    className="bg-slate-50 border-slate-200 text-slate-900"
                  />
                  <div className="flex gap-2 mt-4">
                    <Button onClick={saveConversation} className="bg-[#dc2626] hover:bg-red-700 text-white flex-1">
                      Save
                    </Button>
                    <Button onClick={() => setShowSaveDialog(false)} variant="outline" className="flex-1 border-slate-200 text-slate-600 hover:bg-slate-50">
                      Cancel
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Voice Assistant</h1>
              {conversationTitle && <p className="text-slate-500 text-sm mt-1">{conversationTitle}</p>}
            </div>
            <div className="w-40">
              <label className="text-xs text-slate-500 mb-2 block font-medium uppercase tracking-wide">Voice</label>
              <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-900 h-9 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  {ELEVENLABS_VOICES.map(voice => (
                    <SelectItem key={voice.id} value={voice.id} className="text-slate-900 focus:bg-slate-100">
                      {voice.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 flex flex-col gap-4 min-h-0">
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {messages.length === 0 ? (
              <div className="text-center text-slate-400 flex items-center justify-center h-full flex-col gap-4">
                <Mic className="w-12 h-12 text-slate-200" />
                <p className="font-medium">Click the circle below and start speaking</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] rounded-2xl px-6 py-4 shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-[#dc2626] text-white rounded-br-none' 
                      : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200'
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  </div>
                </motion.div>
              ))
            )}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-slate-100 text-slate-500 rounded-2xl px-6 py-4 rounded-bl-none border border-slate-200">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Real-time Transcription Display */}
          {isRecording && transcript && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-slate-50 border border-red-100 rounded-xl px-4 py-3 max-w-md mx-auto shadow-sm"
            >
              <p className="text-slate-600 text-sm leading-relaxed text-center italic">{transcript}</p>
            </motion.div>
          )}

          {/* Circular Button */}
          <div className="flex flex-col items-center gap-4 py-4">
            <audio ref={audioRef} className="hidden" />

            <motion.button
              onClick={toggleRecording}
              disabled={isSpeaking || isLoading}
              className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all disabled:opacity-50 ${
                isRecording
                  ? 'bg-[#dc2626] shadow-xl shadow-red-200'
                  : isSpeaking
                  ? 'bg-blue-600 shadow-xl shadow-blue-200'
                  : 'bg-[#dc2626] hover:bg-red-700 shadow-xl shadow-red-200'
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
              <Mic className="w-10 h-10 text-white" />

              {isRecording && (
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-red-200 opacity-50"
                  animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
              )}
            </motion.button>

            <div className="h-6">
              {isRecording && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[#dc2626] text-sm font-bold uppercase tracking-wider">
                  Listening...
                </motion.p>
              )}
              {isSpeaking && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-blue-600 text-sm font-bold uppercase tracking-wider">
                  Speaking...
                </motion.p>
              )}
              {isLoading && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-slate-400 text-sm font-bold uppercase tracking-wider">
                  Processing...
                </motion.p>
              )}
            </div>
          </div>
        </div>

        {/* Text Input Box */}
        <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-6 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#dc2626] focus:ring-1 focus:ring-[#dc2626] transition-all shadow-sm"
            disabled={isLoading || isSpeaking}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || isSpeaking || !textInput.trim()}
            className="bg-[#dc2626] hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-sm text-white"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {/* Saved Conversations Sidebar */}
        {savedConversations.length > 0 && (
          <div className="mt-8 pt-8 border-t border-slate-200">
            <p className="text-xs text-slate-400 mb-3 uppercase font-bold tracking-wider">Recent Conversations</p>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {savedConversations.slice(0, 5).map(conv => (
                <div key={conv.id} className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm text-slate-600 hover:border-slate-300 transition-colors">
                  <button
                    onClick={() => loadConversation(conv)}
                    className="flex-1 text-left truncate hover:text-[#dc2626] font-medium"
                  >
                    {conv.title}
                  </button>
                  <button
                    onClick={() => deleteConversation(conv.id)}
                    className="text-slate-400 hover:text-[#dc2626] transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
