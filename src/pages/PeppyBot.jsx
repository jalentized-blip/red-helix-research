import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';

export default function PeppyBot() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "👋 Hello! I'm PeppyBot, your peptide research education assistant.\n\n**Important Disclaimer:** All information I provide is strictly for educational and research purposes only. The products on this website are NOT intended for human consumption.\n\nI'm here to discuss peptide research, answer questions about various compounds, and help you navigate our website resources. What would you like to learn about today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
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
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I apologize, but I encountered an error. Please try again or contact our support team if the issue persists."
      }]);
    } finally {
      setIsLoading(false);
    }
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

          {/* Input Area */}
          <div className="border-t border-stone-800 p-4">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about peptide research, dosing, storage, or anything else..."
                className="flex-1 bg-stone-800 border-stone-700 text-amber-50 placeholder:text-stone-400 resize-none"
                rows={3}
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
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
              Press Enter to send, Shift+Enter for new line
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