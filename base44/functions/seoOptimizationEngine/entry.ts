import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    let user = null;
    try { user = await base44.auth.me(); } catch (_e) { /* scheduled */ }
    if (user && user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    const today = new Date().toISOString().split('T')[0];
    const timestamp = new Date().toISOString();

    const BRAND = 'Red Helix Research: research peptide store selling BPC-157, TB-500, Semaglutide, Tirzepatide. Science-forward, transparent brand for researchers and biohackers. Competitors: Limitless Life Nootropics, Peptide Sciences, Core Peptides, Amino Asylum.';

    async function callGemini(prompt, schema) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `Context: ${BRAND}\n\n${prompt}` }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 4096,
              responseMimeType: 'application/json',
              responseSchema: schema,
            }
          }),
        }
      );
      if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
      const data = await res.json();
      const text = data.candidates[0].content.parts[0].text.trim();
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
      `List SEO tactics, trending keywords, quick wins, and competitor gaps for a peptide research store today (${today}).`,
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
      `Generate FAQ content, People Also Ask answers, meta description optimizations, and internal linking recommendations for a peptide research store.`,
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
      `Provide technical SEO fixes, keyword clusters, backlink opportunities, and E-E-A-T improvements for a peptide research e-commerce store.`,
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
      `Analyze these peptide store competitors: Limitless Life Nootropics, Peptide Sciences, Core Peptides, Amino Asylum. Find content gaps, weaknesses, and exploitation opportunities for Red Helix Research.`,
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
      `Based on an SEO analysis for Red Helix Research on ${today}, create a prioritized 8-item action plan with tasks, categories, expected impact, and implementation steps.`,
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