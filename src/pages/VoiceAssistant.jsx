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
];

export default function VoiceAssistant() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(ELEVENLABS_VOICES[0].id);
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
    <div className="min-h-screen bg-stone-950 pt-24 pb-20 flex flex-col">
      <div className="max-w-2xl mx-auto w-full px-4 flex flex-col h-[calc(100vh-120px)]">
        {/* Header with Controls */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-red-600 hover:text-red-500">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
            <div className="flex gap-2">
              <Button
                onClick={newConversation}
                variant="outline"
                size="sm"
                className="text-amber-50 border-red-600/30 hover:bg-red-600/10"
              >
                <Plus className="w-4 h-4" />
                New
              </Button>
              <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-amber-50 border-red-600/30 hover:bg-red-600/10"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-stone-900 border-stone-700">
                  <DialogHeader>
                    <DialogTitle className="text-amber-50">Save Conversation</DialogTitle>
                  </DialogHeader>
                  <Input
                    placeholder="Conversation title..."
                    value={conversationTitle}
                    onChange={(e) => setConversationTitle(e.target.value)}
                    className="bg-stone-800 border-stone-700 text-amber-50"
                  />
                  <div className="flex gap-2">
                    <Button onClick={saveConversation} className="bg-red-700 hover:bg-red-600 flex-1">
                      Save
                    </Button>
                    <Button onClick={() => setShowSaveDialog(false)} variant="outline" className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-amber-50">Voice Assistant</h1>
              {conversationTitle && <p className="text-stone-400 text-sm mt-1">{conversationTitle}</p>}
            </div>
            <div className="w-40">
              <label className="text-xs text-stone-400 mb-2 block">Voice</label>
              <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                <SelectTrigger className="bg-stone-800 border-stone-700 text-amber-50 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-stone-900 border-stone-700">
                  {ELEVENLABS_VOICES.map(voice => (
                    <SelectItem key={voice.id} value={voice.id}>
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
              <div className="text-center text-stone-400 flex items-center justify-center h-full">
                <p>Click the circle below and start speaking</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] rounded-2xl px-6 py-3 text-center ${
                    msg.role === 'user' 
                      ? 'bg-red-700 text-amber-50' 
                      : 'bg-amber-100 text-stone-900'
                  }`}>
                    <p className="text-sm">{msg.content}</p>
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
                <div className="bg-amber-100 text-stone-900 rounded-2xl px-6 py-3">
                  <p className="text-sm">Thinking...</p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Circular Button */}
          <div className="flex flex-col items-center gap-4">
            <audio ref={audioRef} className="hidden" />

            <motion.button
              onClick={toggleRecording}
              disabled={isSpeaking || isLoading}
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

            <div className="h-6">
              {isRecording && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm font-medium">
                  Listening...
                </motion.p>
              )}
              {isSpeaking && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-blue-400 text-sm font-medium">
                  Speaking...
                </motion.p>
              )}
              {isLoading && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-amber-400 text-sm font-medium">
                  Processing...
                </motion.p>
              )}
            </div>

            {isRecording && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-stone-400 text-center text-sm max-w-xs">
                {transcript.replace('(interim)', '') || 'Waiting for speech...'}
              </motion.p>
            )}
          </div>
        </div>

        {/* Text Input Box */}
        <div className="mt-8 flex gap-2">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 bg-stone-800 border border-stone-700 rounded-lg px-4 py-2 text-amber-50 placeholder-stone-500 focus:outline-none focus:border-red-600"
            disabled={isLoading || isSpeaking}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || isSpeaking || !textInput.trim()}
            className="bg-red-700 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition-colors"
          >
            <Send className="w-4 h-4 text-amber-50" />
          </button>
        </div>

        {/* Saved Conversations Sidebar */}
        {savedConversations.length > 0 && (
          <div className="mt-8 pt-8 border-t border-stone-700">
            <p className="text-xs text-stone-400 mb-3 uppercase">Recent Conversations</p>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {savedConversations.slice(0, 5).map(conv => (
                <div key={conv.id} className="flex items-center gap-2 bg-stone-800/50 p-2 rounded text-xs text-amber-50">
                  <button
                    onClick={() => loadConversation(conv)}
                    className="flex-1 text-left truncate hover:text-red-400"
                  >
                    {conv.title}
                  </button>
                  <button
                    onClick={() => deleteConversation(conv.id)}
                    className="text-stone-500 hover:text-red-600"
                  >
                    <Trash2 className="w-3 h-3" />
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