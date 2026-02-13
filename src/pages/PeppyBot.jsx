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
  const [sessionId] = useState(() => {
    let sid = localStorage.getItem('peppybot_session_id');
    if (!sid) {
      sid = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('peppybot_session_id', sid);
    }
    return sid;
  });

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "👋 Hello! I'm PeppyBot, your peptide research education assistant.\n\n**Important Disclaimer:** All information I provide is strictly for educational and research purposes only. The products on this website are NOT intended for human consumption.\n\nI'm here to discuss peptide research, answer questions about various compounds, and help you navigate our website resources. What would you like to learn about today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await base44.entities.PeppyBotConversation.filter(
          { session_id: sessionId },
          'timestamp',
          1000
        );

        if (history && history.length > 0) {
          const loadedMessages = history.map(h => ({
            role: h.role,
            content: h.message
          }));
          setMessages(loadedMessages);
        }
        setHistoryLoaded(true);
      } catch (error) {
        console.error('Error loading conversation history:', error);
        setHistoryLoaded(true);
      }
    };

    loadHistory();
  }, [sessionId]);



  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Save message to database
  const saveMessage = async (role, content) => {
    try {
      await base44.entities.PeppyBotConversation.create({
        session_id: sessionId,
        role: role,
        message: content,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };





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
- Implied references (if they say "how much should I use?" after we talked about SM, they're asking about SM dosing)
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

      const aiMsg = { role: 'assistant', content: response };
      setMessages(prev => [...prev, aiMsg]);
      await saveMessage('assistant', response);
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

    const userMsg = { role: 'user', content: userMessage };
    setMessages(prev => [...prev, userMsg]);
    await saveMessage('user', userMessage);
    await handleAIResponse(userMessage);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-white pt-32 pb-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#dc2626] transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Shop
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#dc2626] rounded-2xl flex items-center justify-center shadow-lg shadow-[#dc2626]/20">
              <span className="text-2xl">🧬</span>
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">PeppyBot Research Assistant</h1>
              <p className="text-slate-500 text-sm font-medium">AI-Powered Peptide Education</p>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="bg-slate-50 border border-slate-200 rounded-[32px] overflow-hidden shadow-sm h-[600px] flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-4 ${
                    msg.role === 'user'
                      ? 'bg-[#dc2626] text-white rounded-tr-none shadow-lg shadow-[#dc2626]/20'
                      : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'
                  }`}
                >
                  <ReactMarkdown 
                    className={`prose text-sm max-w-none ${
                      msg.role === 'user' 
                        ? 'prose-invert prose-p:text-white prose-headings:text-white prose-strong:text-white' 
                        : 'prose-slate prose-p:text-slate-600 prose-headings:text-slate-900 prose-strong:text-slate-900 prose-a:text-[#dc2626]'
                    }`}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#dc2626]" />
                  <span className="text-sm text-slate-500 font-medium">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-200">
            <div className="relative flex items-center gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask about peptides, protocols, or research..."
                className="min-h-[50px] max-h-[150px] pr-12 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#dc2626] focus:ring-[#dc2626]/20 rounded-xl resize-none py-3"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 bottom-2 w-8 h-8 p-0 rounded-lg bg-[#dc2626] hover:bg-red-700 text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-center text-[10px] text-slate-400 mt-2 font-medium">
              PeppyBot provides educational information only. Not medical advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}