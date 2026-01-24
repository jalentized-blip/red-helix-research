import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import GrayMarketEducationModule from '@/components/GrayMarketEducationModule';

// Uses ElevenLabs free tier voice

export default function PeppyBot() {
  const [showEducationModule, setShowEducationModule] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "👋 Hello! I'm PeppyBot, your peptide research education assistant.\n\n**Important Disclaimer:** All information I provide is strictly for educational and research purposes only. The products on this website are NOT intended for human consumption.\n\nI'm here to discuss peptide research, answer questions about various compounds, and help you navigate our website resources. What would you like to learn about today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  if (showEducationModule) {
    return (
      <div className="min-h-screen bg-stone-950">
        <div className="max-w-6xl mx-auto px-4 pt-8">
          <button
            onClick={() => setShowEducationModule(false)}
            className="mb-6 text-stone-400 hover:text-amber-50 transition-colors flex items-center gap-2"
          >
            ← Back to Chat
          </button>
        </div>
        <GrayMarketEducationModule />
      </div>
    );
  }



  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);





  const handleAIResponse = async (userMessage) => {
    setIsLoading(true);

    try {
      // Special response for gray market peptides question
      const grayMarketQuestion = userMessage.toLowerCase().includes('gray market');
      
      const systemPrompt = grayMarketQuestion 
        ? `You are PeppyBot, an enthusiastic peptide expert with an optimistic perspective on innovation in the research space.

GRAY MARKET PEPTIDES RESPONSE:
Structure your answer with these sections:

**🚀 Enthusiastic Intro:**
Express genuine excitement about how the gray market has democratized access to peptide research. Frame it as a driver of innovation and accessibility for serious researchers.

**✨ Key Benefits:**
- Innovation acceleration: smaller suppliers often pioneer new compounds before big pharma
- Access and affordability: research that would be cost-prohibitive is now accessible
- Researcher empowerment: people can explore compounds independently
- Market competition: drives quality improvements across the board

**🔬 Theoretical Safety Through Self-Testing:**
- Explain how independent researchers conducting COAs (Certificates of Analysis) through labs like Janoshik creates accountability
- Note that self-testing and community verification builds a decentralized quality system
- Mention how transparent documentation and peer review within research communities improves safety standards
- Frame user-conducted testing as a form of crowdsourced quality assurance

**⚠️ Balanced Disclaimers:**
- All peptides are for research/educational purposes only, not human consumption
- Mention importance of proper sourcing, documentation, and testing
- Note that quality varies and due diligence is essential
- Emphasize personal responsibility in any research endeavors

Keep it conversational, optimistic but grounded. Use markdown formatting. Make it feel like a knowledgeable friend sharing perspective.

User question: ${userMessage}`
        : `You are PeppyBot, a chill AI buddy who talks about peptide research. Keep it real and conversational—like chatting with a knowledgeable friend.

      RULES:
      1. Keep responses SHORT (1-3 sentences max, unless they ask for details)
      2. Be casual and friendly, not robotic or overly formal
      3. Only discuss peptides and research use
      4. If asked about non-peptide stuff, just say you focus on peptides
      5. NEVER mention external websites, links, or external URLs
      6. If someone asks about buying, purchasing, ordering, finding, or getting peptides for sale—respond with: "Check out our Products section—we've got quality peptides ready to go! Click the Products button and start shopping." Don't mention any other sources.
      7. Don't be preachy—just give helpful info
      8. Only provide direct knowledge and conversation about peptides

      Just answer their question naturally and conversationally.

      User question: ${userMessage}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: systemPrompt,
        add_context_from_internet: true
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      const errorMsg = "I apologize, but I encountered an error. Please try again or contact our support team if the issue persists.";
      setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
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
        <div className="bg-stone-900/50 backdrop-blur-sm border border-stone-800 rounded-xl overflow-hidden relative">
          {/* Messages */}
            <div className="relative h-[60vh] overflow-hidden rounded-lg">
              <div className="h-full overflow-y-auto p-6 space-y-4">
                <AnimatePresence initial={false}>
                  {messages.map((message, index) => {
                    const isProductsMessage = message.role === 'assistant' && message.content.includes('Products');
                    return (
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
                          isProductsMessage ? (
                            <div className="space-y-3">
                              <p className="mb-3">{message.content.replace('Click the Products button and start shopping.', '').trim()}</p>
                              <Link to={createPageUrl('Home') + '?section=products'} className="inline-block bg-red-700 hover:bg-red-600 text-amber-50 px-4 py-2 rounded-lg font-semibold transition-colors">
                                Shop Products
                              </Link>
                            </div>
                          ) : (
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
                          )
                        ) : (
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        )}
                      </div>
                    </motion.div>
                  );
                  })}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
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
        <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
          <Link to={createPageUrl('Home') + '#products'} className="p-3 bg-stone-900/50 border border-stone-800 rounded-lg hover:border-barn-brown/50 transition-colors text-center">
            <p className="text-sm font-semibold text-amber-50">Products</p>
          </Link>
          <Link to={createPageUrl('PeptideCalculator')} className="p-3 bg-stone-900/50 border border-stone-800 rounded-lg hover:border-barn-brown/50 transition-colors text-center">
            <p className="text-sm font-semibold text-amber-50">Calculator</p>
          </Link>
          <Link to={createPageUrl('LearnMore')} className="p-3 bg-stone-900/50 border border-stone-800 rounded-lg hover:border-barn-brown/50 transition-colors text-center">
            <p className="text-sm font-semibold text-amber-50">Learn More</p>
          </Link>
          <Link to={createPageUrl('Home') + '#certificates'} className="p-3 bg-stone-900/50 border border-stone-800 rounded-lg hover:border-barn-brown/50 transition-colors text-center">
            <p className="text-sm font-semibold text-amber-50">COAs</p>
          </Link>
          <button onClick={() => setShowEducationModule(true)} className="p-3 bg-stone-900/50 border border-stone-800 rounded-lg hover:border-barn-brown/50 transition-colors text-center">
            <p className="text-sm font-semibold text-amber-50">Gray Market 101</p>
          </button>
        </div>
      </div>
    </div>
  );
}