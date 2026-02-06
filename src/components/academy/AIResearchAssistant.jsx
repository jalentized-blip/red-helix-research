import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send, Sparkles, Brain, Loader2, BookOpen, FlaskConical, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

const SUGGESTED_PROMPTS = [
  'Explain how BPC-157 promotes tissue repair',
  'What is the proper reconstitution protocol?',
  'Compare TB-500 vs BPC-157 for recovery research',
  'How do GLP-1 agonists affect cellular metabolism?',
  'What are the key factors in peptide stability?',
  'Explain peptide bioavailability considerations'
];

const KNOWLEDGE_BASE = {
  reconstitution: 'Peptide reconstitution requires sterile bacteriostatic water. Add water slowly down the vial side to avoid foaming. Never shake - only gentle swirling. Standard ratio is 2-3ml water per vial.',
  storage: 'Lyophilized peptides: room temperature or refrigerated. Reconstituted: always refrigerated 2-8°C. Use within 30 days of reconstitution for optimal stability.',
  bpc157: 'BPC-157 (Body Protection Compound) is a pentadecapeptide derived from gastric juices. Mechanism: Promotes angiogenesis through VEGF pathway, modulates growth factor expression, enhances fibroblast migration. Primary research focus: tissue repair, wound healing, gut health.',
  tb500: 'TB-500 (Thymosin Beta-4) is a 43-amino acid peptide. Mechanism: Regulates actin polymerization, promotes cell migration and differentiation, modulates inflammation. Research applications: muscle recovery, tissue repair, flexibility.',
  glp1: 'GLP-1 receptor agonists (Semaglutide, Tirzepatide) bind to GLP-1 receptors on pancreatic beta cells. Mechanism: Stimulates insulin secretion, inhibits glucagon, slows gastric emptying, affects hypothalamic appetite centers. Research focus: metabolic regulation.',
  dosing: 'Research dosing depends on peptide type, study goals, and subject parameters. Always start conservative. Common calculation: (desired dose in mcg / vial strength in mg) × dilution volume = draw amount.',
  safety: 'Research safety protocols: Verify COAs, use sterile technique, proper PPE, documented handling procedures, appropriate storage, regular stability checks, clear labeling, proper disposal.'
};

export default function AIResearchAssistant({ onBack }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `# Welcome to Your AI Research Assistant 🧬

I'm here to help you understand peptide research concepts, mechanisms of action, and research protocols. I can explain:

- **Peptide Mechanisms**: How specific peptides work at the cellular level
- **Research Protocols**: Proper handling, reconstitution, and storage
- **Safety & Quality**: COA interpretation, stability, and best practices
- **Comparative Analysis**: Differences between peptide families
- **Dosing Calculations**: Understanding research parameters

What would you like to learn about today?`
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

  const generateResponse = async (question) => {
    try {
      // Create a detailed prompt for the LLM
      const prompt = `You are an expert peptide research educator. Answer this question about research peptides with scientific accuracy and educational focus. Include mechanisms of action when relevant, safety considerations, and practical research applications.

Question: ${question}

Provide a comprehensive, well-structured answer that:
1. Explains the core concept clearly
2. Includes relevant mechanisms of action
3. Mentions safety/quality considerations
4. Uses scientific terminology appropriately
5. Maintains focus on research applications only

Keep response under 500 words but be thorough and educational.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: false
      });

      return response;
    } catch (error) {
      return "I apologize, but I encountered an error generating a response. Please try rephrasing your question or ask about a different topic.";
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    // Generate AI response
    const aiResponse = await generateResponse(userMessage);
    
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: aiResponse 
    }]);
    setIsLoading(false);
  };

  const handleSuggestedPrompt = (prompt) => {
    setInput(prompt);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-5xl mx-auto"
    >
      <div className="flex items-center justify-between mb-8">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Academy
        </Button>
        <div className="flex items-center gap-2 text-stone-400 text-sm">
          <Brain className="w-4 h-4" />
          AI-Powered Research Assistant
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-stone-900/60 border border-stone-700 rounded-2xl overflow-hidden">
        {/* Messages */}
        <div className="h-[600px] overflow-y-auto p-6 space-y-6">
          <AnimatePresence>
            {messages.map((message, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user' 
                    ? 'bg-red-600/20 border border-red-600/30' 
                    : 'bg-blue-600/20 border border-blue-600/30'
                }`}>
                  {message.role === 'user' ? (
                    <FlaskConical className="w-5 h-5 text-red-400" />
                  ) : (
                    <Sparkles className="w-5 h-5 text-blue-400" />
                  )}
                </div>
                <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                  <div className={`inline-block max-w-[85%] ${
                    message.role === 'user'
                      ? 'bg-red-600/20 border border-red-600/30 rounded-2xl rounded-tr-sm p-4'
                      : 'bg-stone-800/50 border border-stone-700 rounded-2xl rounded-tl-sm p-4'
                  }`}>
                    {message.role === 'user' ? (
                      <p className="text-amber-50">{message.content}</p>
                    ) : (
                      <ReactMarkdown
                        className="prose prose-invert prose-sm max-w-none"
                        components={{
                          h1: ({children}) => <h1 className="text-xl font-bold text-amber-50 mb-3">{children}</h1>,
                          h2: ({children}) => <h2 className="text-lg font-bold text-amber-50 mb-2 mt-4">{children}</h2>,
                          h3: ({children}) => <h3 className="text-base font-bold text-amber-50 mb-2 mt-3">{children}</h3>,
                          p: ({children}) => <p className="text-stone-300 mb-3 leading-relaxed">{children}</p>,
                          ul: ({children}) => <ul className="list-disc list-inside text-stone-300 mb-3 space-y-1">{children}</ul>,
                          ol: ({children}) => <ol className="list-decimal list-inside text-stone-300 mb-3 space-y-1">{children}</ol>,
                          li: ({children}) => <li className="text-stone-300">{children}</li>,
                          strong: ({children}) => <strong className="text-amber-50 font-bold">{children}</strong>,
                          code: ({children}) => <code className="bg-stone-900 px-2 py-1 rounded text-red-400 text-sm">{children}</code>,
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-4"
            >
              <div className="w-10 h-10 bg-blue-600/20 border border-blue-600/30 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="inline-block bg-stone-800/50 border border-stone-700 rounded-2xl rounded-tl-sm p-4">
                  <div className="flex items-center gap-3 text-stone-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Analyzing your question...</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts */}
        {messages.length <= 1 && (
          <div className="px-6 py-4 border-t border-stone-700 bg-stone-900/40">
            <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">
              Suggested Questions
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_PROMPTS.slice(0, 3).map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestedPrompt(prompt)}
                  className="text-xs px-3 py-2 bg-stone-800/50 border border-stone-700 rounded-lg hover:border-blue-600/50 hover:bg-blue-600/10 text-stone-300 hover:text-amber-50 transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-stone-700 bg-stone-900/80">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about peptide mechanisms, protocols, or research applications..."
              className="flex-1 bg-stone-800/50 border border-stone-700 rounded-xl px-4 py-3 text-amber-50 placeholder:text-stone-500 focus:outline-none focus:border-blue-600/50"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="px-6"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
          <div className="flex items-center gap-2 mt-3 text-xs text-stone-500">
            <AlertTriangle className="w-3 h-3" />
            Educational purposes only. Not medical advice. For research use only.
          </div>
        </div>
      </div>
    </motion.div>
  );
}