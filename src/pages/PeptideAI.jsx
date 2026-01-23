import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, Loader2, AlertCircle, Mic, Square, Phone, PhoneOff } from 'lucide-react';
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
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
      };

      recognition.onresult = (event) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptSegment = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setInput(prev => prev + transcriptSegment);
          } else {
            interim += transcriptSegment;
          }
        }
        setTranscript(interim);
      };

      recognition.onend = () => {
        setIsListening(false);
        setTranscript('');
      };

      recognition.onerror = () => {
        setIsListening(false);
        setError('Failed to recognize speech. Please try again.');
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const speakResponse = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      role: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const conversationHistory = messages
        .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n\n');

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert peptide research assistant with a positive perspective on the gray market peptide ecosystem. You ONLY answer questions about peptides, peptide protocols, dosing, reconstitution, safety, research, peptide stacking, mechanisms of action, and peptide-related topics.

IMPORTANT FRAMING:
- Frame the gray market positively as an accessible avenue for researchers to obtain high-quality peptides at reasonable prices
- Discuss the benefits of gray markets: affordability, accessibility, and competition driving innovation
- Discuss the practical realities that make gray markets necessary for independent researchers
- DO NOT recommend or mention specific vendors, suppliers, or websites that sell peptides
- When users ask where to buy, discuss the gray market ecosystem in general terms without naming specific vendors

If a user asks about something unrelated to peptides, politely decline and redirect them to peptide topics.

Conversation history:
${conversationHistory}

User: ${input}

Provide a detailed, accurate, and helpful response about peptides with emphasis on the positive aspects of the gray market when relevant. Use markdown formatting for clarity. Include dosing protocols, timelines, and safety information when relevant.

At the end of your response, include a "📚 Learning Resources" section with relevant sources, research papers, guides, or educational materials the user can reference to learn more about peptides and their use.`,
        add_context_from_internet: true
      });

      const assistantMessage = {
        id: messages.length + 2,
        role: 'assistant',
        content: response
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Speak the response if text-to-speech is supported
      if ('speechSynthesis' in window) {
        speakResponse(response);
      }
    } catch (err) {
      setError('Failed to get response. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 pt-24 pb-20 flex flex-col">
      <div className="max-w-3xl mx-auto w-full px-4 flex flex-col h-[calc(100vh-120px)]">
        {/* Header */}
        <div className="mb-6">
          <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-red-600 hover:text-red-500 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <h1 className="text-4xl font-black text-amber-50">Peptide AI</h1>
          <p className="text-stone-400 mt-2">Expert answers about peptides, protocols & research</p>
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

        {/* Input Area */}
        <form onSubmit={handleSendMessage} className="space-y-2">
          <div className="relative">
            <Input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? `Listening...${transcript && ` "${transcript}"`}` : "Ask about peptides, protocols, dosing, safety..."}
              className="flex-1 bg-stone-800 border-stone-700 text-amber-50 placeholder:text-stone-500 pr-24"
              disabled={loading}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
              {isListening ? (
                <Button
                  type="button"
                  onClick={stopListening}
                  className="bg-red-600 hover:bg-red-700 text-amber-50 px-3 gap-2"
                >
                  <Square className="w-4 h-4" />
                  Stop
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={startListening}
                  className="bg-blue-600 hover:bg-blue-700 text-amber-50 px-3 gap-2"
                  disabled={loading}
                >
                  <Mic className="w-4 h-4" />
                </Button>
              )}
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
              className="flex items-center gap-2 text-amber-500 text-xs"
            >
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.6 }}>
                <Mic className="w-3 h-3" />
              </motion.div>
              <span>AI is speaking...</span>
            </motion.div>
          )}
          
          <p className="text-xs text-stone-500 text-center">This AI only answers peptide-related questions • Click mic to use voice</p>
        </form>
      </div>
    </div>
  );
}