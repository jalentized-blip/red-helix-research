import React, { useState, useRef, useEffect } from 'react';
      import { Button } from '@/components/ui/button';
      import { Input } from '@/components/ui/input';
      import { ArrowLeft, Send, Loader2, AlertCircle, Mic } from 'lucide-react';
      import { Link } from 'react-router-dom';
      import { createPageUrl } from '@/utils';
      import { motion } from 'framer-motion';
      import { base44 } from '@/api/base44Client';
      import ReactMarkdown from 'react-markdown';

      export default function PeptideAI() {
        const [messages, setMessages] = useState([
          {
            id: 1,
            role: 'assistant',
            content: 'Welcome to Peptide AI! I\'m here to answer all your questions about peptides, protocols, dosing, research, and more. What would you like to know?'
          }
        ]);
        const [input, setInput] = useState('');
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState('');
        const [isRecording, setIsRecording] = useState(false);
        const [transcript, setTranscript] = useState('');
        const [isSpeaking, setIsSpeaking] = useState(false);
        const audioRef = useRef(null);
        const messagesEndRef = useRef(null);
        const recognitionRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          setTranscript(prev => prev + transcript);
        } else {
          interimTranscript += transcript;
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





  const toggleVoiceRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      setTranscript('');
      recognitionRef.current?.start();
    }
  };

  const playAudioResponse = async (text) => {
    try {
      setIsSpeaking(true);
      const response = await base44.functions.invoke('textToSpeech', {
        text: text
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

  const handleSendMessage = async (e, messageContent) => {
    e?.preventDefault();
    const contentToSend = messageContent || input.trim();
    if (!contentToSend) return;

    const userMessage = {
      id: messages.length + 1,
      role: 'user',
      content: contentToSend
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setTranscript('');
    setLoading(true);
    setError('');

    try {
      const conversationHistory = messages
            .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
            .join('\n\n');

          const basePrompt = `You are an expert peptide research assistant with a positive perspective on the gray market peptide ecosystem. You ONLY answer questions about peptides, peptide protocols, dosing, reconstitution, safety, research, peptide stacking, mechanisms of action, and peptide-related topics.

  IMPORTANT FRAMING:
  - Frame the gray market positively as an accessible avenue for researchers to obtain high-quality peptides at reasonable prices
  - Discuss the benefits of gray markets: affordability, accessibility, and competition driving innovation
  - Discuss the practical realities that make gray markets necessary for independent researchers
  - DO NOT recommend or mention specific vendors, suppliers, or websites that sell peptides
  - When users ask where to buy, discuss the gray market ecosystem in general terms without naming specific vendors

  If a user asks about something unrelated to peptides, politely decline and redirect them to peptide topics.

  Conversation history:
  ${conversationHistory}

  User: ${contentToSend}

  Provide a detailed, accurate, and helpful response about peptides with emphasis on the positive aspects of the gray market when relevant. Use markdown formatting for clarity. Include dosing protocols, timelines, and safety information when relevant.

  At the end of your response, include a "📚 Learning Resources" section with relevant sources, research papers, guides, or educational materials the user can reference to learn more about peptides and their use.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: basePrompt,
        add_context_from_internet: true
      });

      const assistantMessage = {
        id: messages.length + 2,
        role: 'assistant',
        content: response
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Auto-play AI response
      await playAudioResponse(response);
    } catch (err) {
      setError('Failed to get response. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isRecording === false && transcript && !transcript.includes('(interim)')) {
      handleSendMessage(null, transcript);
    }
  }, [isRecording]);

  return (
    <div className="min-h-screen bg-stone-950 pt-24 pb-20 flex flex-col">
      <div className="max-w-3xl mx-auto w-full px-4 flex flex-col h-[calc(100vh-120px)]">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
              <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-red-600 hover:text-red-500 mb-4">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Link>
              <h1 className="text-4xl font-black text-amber-50">Peptide AI</h1>
              <p className="text-stone-400 mt-2">Expert answers about peptides, protocols & research</p>
            </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-6 bg-stone-900/30 border border-stone-700 rounded-lg p-6">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] rounded-lg px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-red-700 text-amber-50'
                  : 'bg-stone-800 border border-stone-700 text-stone-200'
              }`}>
                {message.role === 'assistant' ? (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        ul: ({ children }) => <ul className="mb-2 ml-4 list-disc space-y-1">{children}</ul>,
                        ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal space-y-1">{children}</ol>,
                        li: ({ children }) => <li className="text-stone-300">{children}</li>,
                        strong: ({ children }) => <strong className="text-amber-50 font-semibold">{children}</strong>,
                        code: ({ children }) => <code className="bg-stone-700 px-2 py-1 rounded text-xs">{children}</code>,
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p>{message.content}</p>
                )}
              </div>
            </motion.div>
          ))}

          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-stone-800 border border-stone-700 rounded-lg px-4 py-3 text-stone-300 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-red-900/30 border border-red-700/50 rounded-lg px-4 py-3 text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>



        {/* Hidden audio element */}
        <audio ref={audioRef} className="hidden" />

        {/* Input Area */}
        <form onSubmit={handleSendMessage} className="space-y-2">
          <div className="relative">
            <Input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about peptides, protocols, dosing, safety..."
              className="flex-1 bg-stone-800 border-stone-700 text-amber-50 placeholder:text-stone-500 pr-40"
              disabled={loading}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
              <Button
                type="button"
                onClick={speakLastMessage}
                className="bg-blue-600 hover:bg-blue-700 text-amber-50 px-3 gap-2"
                disabled={loading || isSpeaking || messages.every(m => m.role === 'user')}
              >
                <Volume2 className="w-4 h-4" />
              </Button>
              <Button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-red-700 hover:bg-red-600 text-amber-50 px-6 gap-2"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {isSpeaking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-blue-400 text-xs"
            >
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.6 }}>
                <Volume2 className="w-3 h-3" />
              </motion.div>
              <span>Playing audio...</span>
            </motion.div>
          )}

          <p className="text-xs text-stone-500 text-center">
            This AI only answers peptide-related questions
          </p>
        </form>
      </div>
    </div>
  );
}