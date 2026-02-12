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
- Semaglutide (GLP-1 agonist): Activates GLP-1 receptors, regulates insulin secretion, slows gastric emptying, affects appetite centers. ~4,113 Da, 31 AA.
- Tirzepatide (GLP-1/GIP dual agonist): Dual receptor activation for enhanced metabolic effects. ~4,672 Da, 39 AA. Do NOT combine with Semaglutide — overlapping receptor activation.
- AOD-9604: Modified hGH fragment (177-191) targeting beta-3 adrenergic lipolysis without IGF-1 elevation. ~1,817 Da, 16 AA. TGA-listed in Australia for osteoarthritis.
- MOTS-c: Mitochondrial-derived peptide (MDP), exercise mimetic via AMPK activation, metabolic regulation. ~2,174 Da, 16 AA. Discovered by Lee lab at USC.

**Recovery & Healing:**
- BPC-157: Promotes angiogenesis via VEGF pathway, enhances fibroblast migration, accelerates tissue repair. ~1,494 Da, 15 AA. Sequence: GEPPPGKPADDDAGD.
- TB-500 (Thymosin Beta-4): Primary G-actin sequestering molecule, regulates cell migration, angiogenesis, anti-inflammatory signaling. ~4,963 Da, 43 AA.
- GHK-Cu: Copper tripeptide stimulating collagen synthesis via gene expression modulation, wound healing, anti-inflammatory effects. ~517 Da, 3 AA.
- KPV: C-terminal tripeptide of α-MSH, potent anti-inflammatory via NF-κB inhibition. ~342 Da, 3 AA. Commonly used for gut health.

**GH Secretagogues:**
- CJC-1295: Synthetic GHRH analog providing sustained GH elevation. ~3,649 Da, 30 AA. Synergizes with GHRP-class peptides.
- Ipamorelin: Selective ghrelin receptor agonist, minimal cortisol/prolactin elevation. ~711 Da, 5 AA. Cleanest GHRP profile.
- Sermorelin (GRF 1-29): Shortest functional GHRH fragment, physiological pulsatile GH release. ~3,358 Da, 29 AA. Previously FDA-approved diagnostic.
- Tesamorelin: FDA-approved GHRH analog (Egrifta) for HIV lipodystrophy. ~5,136 Da, 44 AA. Enhanced stability vs Sermorelin.
- GHRP-2: Most potent GHRP-class peptide for GH release, causes appetite increase and mild cortisol/prolactin elevation. ~817 Da, 6 AA.
- GHRP-6: First-generation GHRP with strongest appetite stimulation, gastroprotective effects. ~873 Da, 6 AA.
- Hexarelin: Strongest GH-releasing GHRP with unique CD36-mediated cardioprotective effects. ~887 Da, 6 AA. Subject to tachyphylaxis.
- MK-677 (Ibutamoren): Non-peptide oral GH secretagogue, 24-hour half-life, sustained IGF-1 elevation. ~528 Da. Not a peptide — small molecule.

**Cognitive & Focus:**
- Semax: ACTH(4-10) analog with Pro-Gly-Pro, BDNF upregulation (2-8x), neuroprotection. ~813 Da, 7 AA. Approved in Russia/Ukraine. Intranasal.
- Selank: Tuftsin analog with Pro-Gly-Pro, anxiolytic via GABAergic modulation without sedation, immunomodulator. ~751 Da, 7 AA. Approved in Russia.
- Dihexa: Angiotensin IV analog, 10M x more potent than BDNF at HGF/c-Met signaling, synaptogenesis. ~507 Da. Preclinical only — no human trials.
- P21: CNTF-derived peptide promoting hippocampal neurogenesis via CREB pathway. ~1,339 Da, 11 AA. Preclinical only.
- Pinealon: Glu-Asp-Arg tripeptide bioregulator for CNS neuroprotection. ~404 Da, 3 AA. Distinct from Epithalon.

**Anti-Aging & Longevity:**
- Epithalon (Ala-Glu-Asp-Gly): Tetrapeptide telomerase activator via hTERT expression, melatonin regulation. ~390 Da, 4 AA. Khavinson research program.
- NAD+: Essential coenzyme for sirtuins, PARPs, CD38. Levels decline ~50% ages 40-60. ~663 Da. Not a peptide — dinucleotide coenzyme.
- SS-31 (Elamipretide): Mitochondria-targeted tetrapeptide stabilizing cardiolipin, restoring electron transport chain. ~640 Da, 4 AA. Active FDA trials.

**Sexual Health:**
- PT-141 (Bremelanotide): MC4R agonist, FDA-approved (Vyleesi 2019) for HSDD. ~1,025 Da, 7 AA. Do NOT combine with Melanotan II.
- Kisspeptin-10: KISS1R agonist, master HPG axis regulator, IVF oocyte maturation trigger research. ~1,302 Da, 10 AA. Very short half-life (~28 min).
- Gonadorelin (GnRH): Natural reproductive axis regulator. ~1,182 Da, 10 AA.
- Melanotan II: Non-selective melanocortin agonist (MC1R-MC5R) for pigmentation and sexual function. ~1,024 Da, 7 AA. Do NOT combine with PT-141.

**Sleep & Neurohormonal:**
- DSIP: Endogenous delta sleep-inducing peptide, sleep architecture regulation. ~848 Da, 9 AA.
- Oxytocin: Hypothalamic neuropeptide for social behavior, mood, and neuroendocrine regulation. ~1,007 Da, 9 AA.

**Blends:**
- KLOW Blend (KPV+BPC-157+GHK-Cu+TB-500): Multi-pathway healing blend combining anti-inflammatory (KPV via NF-κB inhibition), localized tissue repair (BPC-157 via VEGF/NO system), collagen synthesis and gene expression modulation (GHK-Cu), and systemic cell migration/protection (TB-500 via actin regulation)

**Key Contraindications:**
- Semaglutide + Tirzepatide: NEVER combine — overlapping GLP-1 receptor activation increases adverse effects
- PT-141 + Melanotan II: NEVER combine — excessive melanocortin receptor activation
- Kisspeptin-10 + Gonadorelin: MODERATE caution — both stimulate GnRH pathways

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
