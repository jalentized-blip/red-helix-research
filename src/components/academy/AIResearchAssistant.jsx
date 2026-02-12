import React, { useState, useRef, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send, Sparkles, Brain, Loader2, FlaskConical, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const SUGGESTED_PROMPTS = [
  'Explain how BPC-157 promotes tissue repair',
  'What is the proper reconstitution protocol?',
  'Compare Semaglutide vs Tirzepatide for metabolic research',
  'How does TB-500 work for tissue recovery?',
  'What are the benefits of CJC/Ipamorelin blend?',
  'Explain NAD+ mechanisms for cellular health'
];

// Memoized message component
const Message = React.memo(({ message }) => (
  <div className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
      message.role === 'user' 
        ? 'bg-[#dc2626] text-white shadow-sm shadow-red-200' 
        : 'bg-slate-900 text-white shadow-sm shadow-slate-200'
    }`}>
      {message.role === 'user' ? (
        <FlaskConical className="w-5 h-5" />
      ) : (
        <Sparkles className="w-5 h-5" />
      )}
    </div>
    <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
      <div className={`inline-block max-w-[85%] text-left ${
        message.role === 'user'
          ? 'bg-[#dc2626] border border-[#dc2626] rounded-[24px] rounded-tr-sm p-5 shadow-sm'
          : 'bg-slate-50 border border-slate-100 rounded-[24px] rounded-tl-sm p-5 shadow-sm'
      }`}>
        {message.role === 'user' ? (
          <p className="text-white font-medium">{message.content}</p>
        ) : (
          <ReactMarkdown
            className="prose prose-slate prose-sm max-w-none"
            components={{
              h1: ({children}) => <h1 className="text-xl font-black text-slate-900 mb-3 uppercase tracking-tighter">{children}</h1>,
              h2: ({children}) => <h2 className="text-lg font-black text-slate-900 mb-2 mt-4 uppercase tracking-tighter">{children}</h2>,
              h3: ({children}) => <h3 className="text-base font-black text-slate-900 mb-2 mt-3 uppercase tracking-tighter">{children}</h3>,
              p: ({children}) => <p className="text-slate-600 mb-3 leading-relaxed">{children}</p>,
              ul: ({children}) => <ul className="list-disc list-inside text-slate-600 mb-3 space-y-1">{children}</ul>,
              ol: ({children}) => <ol className="list-decimal list-inside text-slate-600 mb-3 space-y-1">{children}</ol>,
              li: ({children}) => <li className="text-slate-600">{children}</li>,
              strong: ({children}) => <strong className="text-slate-900 font-bold">{children}</strong>,
              code: ({children}) => <code className="bg-slate-200 px-2 py-1 rounded text-[#dc2626] text-sm font-mono">{children}</code>,
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  </div>
));

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

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  const generateResponse = useCallback(async (question) => {
    try {
      const knowledgeContext = `
Available Research Peptides Knowledge Base:

**Weight Loss & Metabolic:**
- Semaglutide (GLP-1 agonist): Activates GLP-1 receptors, regulates insulin secretion, slows gastric emptying, affects appetite centers
- Tirzepatide (GLP-1/GIP dual agonist): Dual receptor activation for enhanced metabolic effects
- AOD 9604: Modified growth hormone fragment targeting lipolysis without growth effects

**Recovery & Healing:**
- BPC-157: Promotes angiogenesis via VEGF pathway, enhances fibroblast migration, accelerates tissue repair
- TB-500 (Thymosin Beta-4): Regulates actin polymerization, cell migration, reduces inflammation
- GHK-Cu: Copper peptide stimulating collagen synthesis, wound healing, anti-inflammatory effects

**Performance & Longevity:**
- CJC-1295/Ipamorelin: Growth hormone secretagogue combination for sustained GH release
- Ipamorelin: Selective ghrelin receptor agonist, minimal cortisol/prolactin elevation
- NAD+: Cellular energy metabolism, DNA repair, sirtuin activation
- MOTS-c: Mitochondrial-derived peptide, metabolic regulation, exercise mimetic
- Epithalon: Telomerase activator, circadian rhythm regulation

**Cognitive & Focus:**
- Semax: Nootropic with BDNF enhancement, cognitive performance
- Selank: Anxiolytic with immune modulation, stress reduction
- Dihexa: Neurogenesis promoter, synapse formation
- P21: CREB pathway activator, memory formation

**Sexual Health:**
- PT-141 (Bremelanotide): MC4R agonist for libido enhancement
- Kisspeptin-10: Gonadotropin regulation, reproductive function

**Blends:**
- KLOW80: KPV+GHK-Cu+BPC+TB500 multi-pathway healing blend
- NAD+ Stack: Comprehensive cellular health combination

Question: \${question}

Provide a comprehensive, well-structured answer that:
1. Explains the core concept clearly
2. Includes relevant mechanisms of action from the knowledge base
3. Mentions safety/quality considerations
4. Uses scientific terminology appropriately
5. Maintains focus on research applications only

Keep response under 500 words but be thorough and educational.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: knowledgeContext,
        add_context_from_internet: false
      });

      return response;
    } catch (error) {
      return "I apologize, but I encountered an error generating a response. Please try rephrasing your question or ask about a different topic.";
    }
  }, []);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    const aiResponse = await generateResponse(userMessage);
    
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: aiResponse 
    }]);
    setIsLoading(false);
  }, [input, isLoading, generateResponse]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleSuggestedPrompt = useCallback((prompt) => {
    setInput(prompt);
  }, []);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="rounded-full border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Academy
        </Button>
        <div className="flex items-center gap-2 text-slate-400 text-sm font-medium uppercase tracking-wider">
          <Brain className="w-4 h-4 text-[#dc2626]" />
          AI-Powered Research Assistant
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white border border-slate-200 rounded-[40px] overflow-hidden shadow-xl shadow-slate-100 relative">
        {/* Messages */}
        <div className="h-[600px] overflow-y-auto p-8 md:p-12 space-y-8 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          {messages.map((message, idx) => (
            <Message key={idx} message={message} />
          ))}

          {isLoading && (
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="inline-block bg-slate-50 border border-slate-100 rounded-[24px] rounded-tl-sm p-5 shadow-sm">
                  <div className="flex items-center gap-3 text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin text-[#dc2626]" />
                    <span className="text-sm font-medium">Analyzing research data...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts */}
        {messages.length <= 1 && (
          <div className="px-8 md:px-12 py-6 border-t border-slate-100 bg-slate-50/50">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
              Suggested Research Topics
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestedPrompt(prompt)}
                  className="text-xs px-4 py-2.5 bg-white border border-slate-200 rounded-full hover:border-[#dc2626]/30 hover:bg-[#dc2626] hover:text-white transition-all font-medium shadow-sm"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-6 md:p-8 border-t border-slate-100 bg-white">
          <div className="flex gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about peptide mechanisms, protocols, or research applications..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#dc2626]/50 focus:ring-4 focus:ring-[#dc2626]/5 transition-all"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="h-auto px-8 rounded-2xl bg-[#dc2626] hover:bg-red-700 text-white shadow-lg shadow-red-200 transition-all active:scale-95"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
          <div className="flex items-center gap-2 mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <AlertTriangle className="w-3.5 h-3.5 text-[#dc2626]" />
            Educational purposes only. Not medical advice. For research use only.
          </div>
        </div>
      </div>
    </div>
  );
}
