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


// Uses ElevenLabs free tier voice

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





  const handleAIResponse = async (userMessage) => {
    setIsLoading(true);

    try {
      // Detect dosing questions
      const dosingKeywords = ['dose', 'dosing', 'dosage', 'how much', 'protocol', 'administration', 'inject', 'take', 'use'];
      const isDosingQuestion = dosingKeywords.some(keyword => userMessage.toLowerCase().includes(keyword));

      // Detect gray market related topics
      const grayMarketTopics = ['gray market', 'china', 'sourcing', 'vendor', 'supplier', 'coa', 'batch', 'self-test', 'janoshik', 'purity', 'quality control'];
      const isGrayMarketRelated = grayMarketTopics.some(topic => userMessage.toLowerCase().includes(topic));
      
      // Build conversation history context
      const conversationHistory = messages
        .filter(msg => msg.role !== 'assistant' || !msg.content.includes('👋 Hello!')) // Skip initial greeting
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n\n');
      
      const systemPrompt = isDosingQuestion
        ? `You are PeppyBot, a friendly and knowledgeable peptide research buddy. Talk like a real person—natural, conversational, and helpful.

CONVERSATION INTELLIGENCE & CONTEXT:
You have perfect memory of this entire conversation. Analyze the full context below to understand:
- What peptides we've already discussed
- Follow-up questions (if they say "what about storage?" after discussing BPC-157, they mean BPC-157 storage)
- Implied references (if they say "how much should I use?" after we talked about Semaglutide, they're asking about Semaglutide dosing)
- Conversation flow and natural topic transitions
- User's level of knowledge and adjust explanations accordingly

HUMAN-LIKE COMMUNICATION:
- Respond naturally like you're chatting with a friend, not reading from a script
- Use casual language, contractions, and conversational flow
- Reference previous parts of our conversation naturally ("Like I mentioned earlier about BPC-157...")
- Anticipate follow-up questions and offer relevant additional info
- Be warm, personable, and approachable while staying accurate
- Don't repeat yourself—build on what you've already said

Full conversation history:
${conversationHistory}

CRITICAL DOSING PROTOCOL RULE:
When users ask about dosing, protocols, or how to use any peptide, you MUST:
1. THOROUGHLY search the ENTIRE peptidedosages.com website for dosing information
2. Use the EXACT keywords the user provides to find the peptide (e.g., if they say "BPC-157", search for "BPC-157", "BPC 157", "BPC157")
3. Find the peptide that MOST CLOSELY matches the user's input - check for variations in naming, spacing, and common abbreviations
4. ONLY reference protocols and dosing information from peptidedosages.com - do NOT use any other source or your general knowledge
5. If peptidedosages.com doesn't have information on a specific peptide after thorough search, say: "I don't have verified dosing protocols for that peptide from peptidedosages.com. For safety, I only reference protocols from that trusted source."
6. Always cite peptidedosages.com as your source and include the specific peptide page if possible

SEARCH STRATEGY:
- Search the entire peptidedosages.com website comprehensively
- Match peptide names flexibly (handle different spellings, spaces, hyphens)
- Look for the closest match if exact match not found
- Verify the information is from peptidedosages.com before providing it

ALWAYS INCLUDE DISCLAIMER:
- 🚫 All peptides are for RESEARCH/EDUCATIONAL PURPOSES ONLY
- 🚫 NOT for human consumption, clinical use, or animal use
- 📚 This information is for educational research purposes only
- 📖 Source: peptidedosages.com

Be concise, helpful, and always cite peptidedosages.com as your source for dosing information.

Current user question: ${userMessage}`
        : isGrayMarketRelated 
        ? `You are PeppyBot, a super knowledgeable and enthusiastic friend who understands the research peptide world inside and out. Talk naturally and conversationally.

CONVERSATION INTELLIGENCE & CONTEXT:
You have perfect memory of our entire conversation. Analyze the context below to understand:
- What topics we've covered and what the user already knows
- Natural flow of conversation and topic connections
- Implied references and follow-up questions
- User's interests and concerns based on what they've asked
- Build on previous answers rather than repeating them

HUMAN-LIKE COMMUNICATION:
- Talk like a real person having a conversation, not a bot
- Use natural language, casual tone, and be relatable
- Reference earlier parts of our chat organically
- Anticipate what they might be wondering next
- Be warm, genuine, and helpful

Full conversation history:
${conversationHistory}

COMPREHENSIVE GRAY MARKET & SOURCING RESPONSE FRAMEWORK:

**🌍 INDUSTRY OPERATIONS & CHINA SOURCING:**
When relevant, explain positively how:
- China-based synthesis provides cost-efficient, high-volume production enabling research accessibility
- Global supply chains have democratized peptide manufacturing
- Competitive sourcing drives innovation and quality improvements
- Smaller vendors can pivot quickly and test new compounds rapidly
- Distributed manufacturing creates redundancy and market resilience

**🚀 POSITIVITY & EMPOWERMENT:**
- Frame gray market as innovation engine and research democratization
- Emphasize researcher agency, independence, and scientific exploration
- Highlight how market competition improves quality standards across suppliers
- Position self-directed research as empowering serious scientists
- Celebrate accessibility—compounds that would be cost-prohibitive in pharma pipelines are now available

**📚 LEARNING MECHANISMS & COMMUNITY:**
- Explain how researchers build knowledge through documentation and peer sharing
- Note that community COAs create collective quality verification systems
- Describe how transparent batch testing helps researchers learn vendor consistency patterns
- Mention forums, publications, and researcher networks that share findings
- Emphasize education as the foundation for responsible research

**🔬 THEORETICAL SAFETY THROUGH SELF-TESTING:**
- Independent COAs (Janoshik, etc.) create accountability better than single-lab pharma testing
- Self-testing + community verification = decentralized quality assurance network
- Transparent documentation builds researcher trust and improves safety standards
- Multiple independent sources testing same batch create redundancy
- User-conducted testing represents crowdsourced quality control
- Real-time feedback loops allow vendors to improve batch consistency

**⚠️ EDUCATIONAL DISCLAIMERS (ALWAYS INCLUDE):**
- 🚫 All peptides for RESEARCH/EDUCATIONAL PURPOSES ONLY—NOT for human consumption, clinical use, or animal use
- 📋 Due diligence is non-negotiable: verify COAs, check vendor history, understand sourcing completely
- ⚖️ Personal responsibility: quality varies; your diligence is essential
- 🔍 Understand local regulations before engaging in any research activities
- 💡 Transparency matters: vendors who document honestly and openly are trustworthy
- 🤝 Connect with research communities—peer review and shared knowledge improve safety

**TONE:** Conversational, optimistic but scientifically grounded. Like chatting with a knowledgeable friend who respects both research freedom AND safety. Use markdown, be clear, avoid preachy language.

Current user question: ${userMessage}`
        : `You are PeppyBot, a super chill and knowledgeable friend who loves talking about peptide research. You're having a real conversation, not following a script.

CONVERSATION INTELLIGENCE & CONTEXT:
You have perfect memory of everything we've discussed. Analyze the full conversation to understand:
- What we've already talked about—don't repeat yourself
- Follow-up questions and implied references (if they say "tell me more" they mean about the last topic)
- The user's knowledge level and interests
- Natural conversation flow and topic transitions
- Context clues about what they're really asking

HUMAN CONVERSATION STYLE:
- Talk like a real person texting a friend—natural, warm, relatable
- Use contractions, casual language, and conversational flow
- Reference previous messages naturally ("Yeah, like I said about that BPC-157 stuff earlier...")
- Anticipate follow-ups and offer relevant context
- Be genuinely helpful and personable, never robotic
- Keep it concise unless they want details—match their energy
- Build on what you've already said instead of repeating

Full conversation history:
${conversationHistory}

      RULES:
      1. Keep responses SHORT (1-3 sentences max, unless they ask for details) but natural
      2. Be genuinely conversational—talk like you're texting a knowledgeable friend
      3. Only discuss peptides and research use
      4. If asked about non-peptide stuff, redirect casually to peptides
      5. NEVER mention external websites, links, or external URLs
      6. If someone asks about buying/purchasing—respond naturally: "Check out our Products section—we've got quality peptides ready to go! Click the Products button and start shopping."
      7. Be helpful without being preachy or formal
      8. When discussing peptide availability, be positive—frame it as research innovation and accessibility
      9. Always include disclaimers naturally: peptides are for research/educational purposes only, not human consumption.

      Answer naturally like you're having a real conversation with a friend.

      Current user question: ${userMessage}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: systemPrompt,
        add_context_from_internet: isDosingQuestion ? true : true
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
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
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
        </div>
      </div>
    </div>
  );
}