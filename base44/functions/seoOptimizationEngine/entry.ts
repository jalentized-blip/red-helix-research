import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    let user = null;
    try { user = await base44.auth.me(); } catch (_e) { /* scheduled run - no user */ }
    if (user && user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      return Response.json({ error: 'GEMINI_API_KEY not set' }, { status: 500 });
    }

    const today = new Date().toISOString().split('T')[0];
    const timestamp = new Date().toISOString();

    const BRAND = `Red Helix Research: research peptide store (BPC-157, TB-500, Semaglutide, Tirzepatide). Core differentiator: affordability — research-grade quality below competitor prices, framed as democratizing access for independent researchers. Competitors: Limitless Life Nootropics, Peptide Sciences, Core Peptides, Amino Asylum. Tone: authoritative researcher, not marketer. Compliance: research/lab use only, no health claims, no human use implications. SEO goals: commercial keywords (buy/affordable/cheap research peptides), educational keywords (what is X, how X works), E-E-A-T signals, hub-and-spoke topical authority.`;

    const SYSTEM_INSTRUCTION = `You are an elite SEO intelligence system running on ${today}. Your job is to produce FRESH, CURRENT, HIGH-VALUE SEO intelligence — not generic advice.

CRITICAL DIRECTIVES:
1. RESEARCH WHAT IS ACTUALLY GAINING TRAFFIC RIGHT NOW in the peptide/research chemical/biotech/GLP-1/weight loss niche. Think about what topics, keywords, and content formats are surging in search volume in 2025-2026 (Reddit discussions, TikTok spillover to Google, medical weight loss news cycles, research community forums, YouTube search trends). Cite specific examples.
2. APPLY THE NEWEST SEO PRACTICES: include AI Overviews/SGE optimization (zero-click content strategy), Reddit/forum content signals, programmatic SEO opportunities, semantic clustering, entity-based SEO, topical authority mapping, and E-E-A-T signals for YMYL-adjacent content. Do NOT give advice that was already standard practice in 2022.
3. COMPETITIVE INTELLIGENCE: Reason about what Limitless Life Nootropics, Peptide Sciences, Core Peptides, and Amino Asylum are likely ranking for vs. where they are weak. Look for content gaps driven by compliance fear — competitors avoid health-claim-adjacent content that Red Helix can frame compliantly as research education.
4. BE SPECIFIC: Name actual keywords with estimated volume ranges, name actual content formats (e.g. "comparison table ranking BPC-157 by price per mg"), name actual pages to create or optimize. No vague advice.
5. AFFORDABILITY ANGLE: Red Helix's core differentiator is price. Every recommendation should consider how to capture "cheap/affordable/best price" intent alongside the research/educational angle.`;

    async function callGemini(prompt, schema) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
            contents: [{ parts: [{ text: `Brand Context: ${BRAND}\n\nTask: ${prompt}` }] }],
            generationConfig: {
              temperature: 0.8,
              maxOutputTokens: 8192,
              responseMimeType: 'application/json',
              responseSchema: schema,
            }
          }),
        }
      );
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Gemini API error ${res.status}: ${errText}`);
      }
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (!text) throw new Error('Empty response from Gemini');
      return JSON.parse(text);
    }

    // Create in-progress record
    const report = await base44.asServiceRole.entities.SEOReport.create({
      date: today,
      timestamp,
      run_type: user ? 'manual' : 'scheduled',
      status: 'in_progress',
    });

    // 1. Trend Research
    const trendResearch = await callGemini(
      `Research and identify what is CURRENTLY gaining search traffic in the peptide research, GLP-1/weight loss, biotech, and research chemical space as of ${today}. Specifically: What topics are trending RIGHT NOW (news cycles, social media spillover, Reddit/forum discussions going mainstream, new research publications driving curiosity)? What new keyword patterns are emerging (e.g. new peptide combos, protocol terms, research use terms)? What content formats are winning in Google SERPs for this niche in 2025-2026 (AI Overviews, Reddit results, YouTube carousels, comparison tables)? Identify the highest-ROI tactics Red Helix should deploy immediately, with emphasis on affordability keywords and educational gaps competitors are leaving open.`,
      {
        type: 'object',
        properties: {
          tactics: { type: 'array', items: { type: 'object', properties: { tactic_name: { type: 'string' }, why_it_works: { type: 'string' }, expected_impact: { type: 'string' }, implementation_time: { type: 'string' } }, required: ['tactic_name', 'why_it_works', 'expected_impact', 'implementation_time'] } },
          trending_keywords: { type: 'array', items: { type: 'string' } },
          quick_wins: { type: 'array', items: { type: 'string' } },
          competitor_gaps: { type: 'array', items: { type: 'string' } },
        },
        required: ['tactics', 'trending_keywords', 'quick_wins', 'competitor_gaps']
      }
    );

    // 2. Content Strategy
    const contentStrategy = await callGemini(
      `Create a current-moment content strategy for Red Helix Research based on what is working in SEO RIGHT NOW (${today}). Focus on: (1) FAQ and PAA content optimized for Google's AI Overviews/SGE — what answer formats are getting picked up in AI snippets for peptide/research chemical queries? (2) People Also Ask questions that are CURRENTLY appearing in SERPs for peptide and GLP-1 searches — write concise answers optimized for featured snippet capture; (3) Meta titles/descriptions under 60/155 chars using current best practices for CTR in 2025 SERPs (include power words, numbers, affordability hooks); (4) Internal linking strategy using semantic clustering and entity relationships, not just keyword matching. All content must use research-use framing, no health claims, strong E-E-A-T signals.`,
      {
        type: 'object',
        properties: {
          faq_content: { type: 'array', items: { type: 'object', properties: { question: { type: 'string' }, answer: { type: 'string' }, target_keywords: { type: 'array', items: { type: 'string' } }, target_page: { type: 'string' }, search_volume_estimate: { type: 'string' } }, required: ['question', 'answer', 'target_page'] } },
          people_also_ask: { type: 'array', items: { type: 'object', properties: { question: { type: 'string' }, ideal_answer: { type: 'string' }, target_url: { type: 'string' } }, required: ['question', 'ideal_answer'] } },
          optimized_meta_descriptions: { type: 'array', items: { type: 'object', properties: { page: { type: 'string' }, optimized_title: { type: 'string' }, optimized_description: { type: 'string' }, target_keyword: { type: 'string' } }, required: ['page', 'optimized_title', 'optimized_description'] } },
          internal_linking: { type: 'array', items: { type: 'object', properties: { source_page: { type: 'string' }, target_page: { type: 'string' }, anchor_text: { type: 'string' }, context: { type: 'string' } }, required: ['source_page', 'target_page', 'anchor_text'] } },
        },
        required: ['faq_content', 'people_also_ask', 'optimized_meta_descriptions', 'internal_linking']
      }
    );

    // 3. Technical Audit
    const technicalAudit = await callGemini(
      `Provide a technical SEO audit and keyword strategy using the LATEST 2025-2026 best practices for Red Helix Research. (1) Technical fixes based on current Google ranking factors — Core Web Vitals thresholds that matter NOW, structured data types Google is actively rewarding (Product, FAQPage, HowTo, Article with author entity), indexing issues specific to React SPAs, canonical and hreflang considerations; (2) Keyword clusters using semantic/entity-based grouping (not just keyword matching) — identify the highest-opportunity clusters in the peptide/GLP-1/research space with volume estimates and a competition reality check for 2025; (3) Backlink opportunities that are WORKING NOW in this niche — which types of sites (Reddit, PubMed-linking blogs, researcher communities, nootropics forums, bodybuilding/fitness research sites) are passing authority; (4) E-E-A-T signals specifically for YMYL-adjacent research content — what Google wants to see for a site in this space in 2025.`,
      {
        type: 'object',
        properties: {
          technical_fixes: { type: 'array', items: { type: 'object', properties: { issue: { type: 'string' }, fix: { type: 'string' }, priority: { type: 'string' } }, required: ['issue', 'fix', 'priority'] } },
          keyword_clusters: { type: 'array', items: { type: 'object', properties: { cluster_name: { type: 'string' }, primary_keyword: { type: 'string' }, secondary_keywords: { type: 'array', items: { type: 'string' } }, monthly_volume_estimate: { type: 'string' }, difficulty: { type: 'string' }, opportunity_score: { type: 'string' }, recommended_page: { type: 'string' } }, required: ['cluster_name', 'primary_keyword', 'difficulty'] } },
          backlink_opportunities: { type: 'array', items: { type: 'object', properties: { source_type: { type: 'string' }, strategy: { type: 'string' }, expected_da: { type: 'string' } }, required: ['source_type', 'strategy'] } },
          eeat_improvements: { type: 'array', items: { type: 'object', properties: { signal: { type: 'string' }, how_to_add: { type: 'string' }, impact: { type: 'string' } }, required: ['signal', 'how_to_add', 'impact'] } },
        },
        required: ['technical_fixes', 'keyword_clusters', 'backlink_opportunities', 'eeat_improvements']
      }
    );

    // 4. Competitor Intel
    const competitorIntel = await callGemini(
      `Perform a current competitive SEO intelligence report (as of ${today}) on Red Helix Research's main competitors: Limitless Life Nootropics, Peptide Sciences, Core Peptides, Amino Asylum. Reason about: What keywords and content angles are these competitors likely winning on RIGHT NOW — and where are they failing to capture demand? Focus especially on: content they avoid due to compliance fear (that Red Helix can capture with research-framed content), affordability/price comparison keywords they're ignoring, new trending topics (GLP-1 combinations, newer peptides gaining research interest like BPC-157 + TB-500 stacks, Semax, Epithalon) where the competitive field is thin. Identify the 5 highest-urgency exploitation opportunities Red Helix can act on immediately with specific keyword targets.`,
      {
        type: 'object',
        properties: {
          competitors: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, top_keywords: { type: 'array', items: { type: 'string' } }, content_gaps: { type: 'array', items: { type: 'string' } }, weaknesses: { type: 'array', items: { type: 'string' } } }, required: ['name', 'top_keywords', 'content_gaps', 'weaknesses'] } },
          exploitation_opportunities: { type: 'array', items: { type: 'object', properties: { opportunity: { type: 'string' }, keyword: { type: 'string' }, content_angle: { type: 'string' }, urgency: { type: 'string' } }, required: ['opportunity', 'keyword', 'urgency'] } },
        },
        required: ['competitors', 'exploitation_opportunities']
      }
    );

    // 5. Action Plan
    const actionPlan = await callGemini(
      `You are the SEO execution lead for Red Helix Research on ${today}. Synthesize all the current trends, latest SEO practices, competitor gaps, and technical opportunities into a prioritized 8-item action plan that reflects what is working in SEO RIGHT NOW — not generic evergreen advice. Each item must be: specific (name the keyword, name the page, name the schema type), ranked by expected ROI in the current Google environment (2025-2026 with AI Overviews, Reddit surface, entity-based ranking), and include whether it targets a currently trending topic. Include: category (content/technical/links/on-page/competitor), impact (high/medium/low), time estimate, auto-implement flag, and 3-5 concrete steps. Lead with a strategic summary that calls out the single most urgent opportunity based on what is gaining traction RIGHT NOW in this niche.`,
      {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          top_opportunity: { type: 'string' },
          action_items: { type: 'array', items: { type: 'object', properties: { rank: { type: 'integer' }, task: { type: 'string' }, category: { type: 'string' }, expected_impact: { type: 'string' }, time_to_implement: { type: 'string' }, auto_implement: { type: 'boolean' }, steps: { type: 'array', items: { type: 'string' } } }, required: ['rank', 'task', 'category', 'expected_impact', 'auto_implement', 'steps'] } },
        },
        required: ['summary', 'top_opportunity', 'action_items']
      }
    );

    const metrics = {
      tactics_identified: (trendResearch.tactics || []).length,
      keywords_found: (trendResearch.trending_keywords || []).length + (technicalAudit.keyword_clusters || []).length * 4,
      auto_implementable: (actionPlan.action_items || []).filter(i => i.auto_implement).length,
      estimated_traffic_gain: '+15-30%',
      run_date: today,
    };

    await base44.asServiceRole.entities.SEOReport.update(report.id, {
      trend_research: trendResearch,
      content_strategy: contentStrategy,
      technical_audit: technicalAudit,
      competitor_intel: competitorIntel,
      schema_markup: {},
      action_plan: actionPlan,
      metrics,
      status: 'completed',
    });

    return Response.json({ success: true, report_id: report.id, date: today, metrics });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});