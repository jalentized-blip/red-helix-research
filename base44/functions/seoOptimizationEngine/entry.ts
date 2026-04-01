import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

async function callOpenAI(prompt) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are the dedicated SEO strategist and content execution engine for redhelixresearch.com — a research peptide e-commerce website.

BUSINESS CONTEXT:
- Industry: Research peptides sold strictly for research/laboratory use only
- Core differentiator: Affordability — research-grade peptides at prices significantly below competitors without compromising purity
- Mission: Maximize organic traffic, educate visitors, drive research peptide sales
- Goals: (1) Drive organic traffic that converts, (2) Establish authority as educational resource, (3) Rank for high-intent commercial AND informational keywords, (4) Build long-term topical authority

TONE: Authoritative but accessible. Scientific but approachable. Frame affordability as "democratizing access to research tools" — never "cheap/bargain bin."

CRITICAL COMPLIANCE RULES:
- NEVER make health claims or imply human consumption or therapeutic use
- NEVER fabricate research citations — only reference real published studies
- NEVER use black-hat SEO tactics
- ALWAYS include research-use-only disclaimers
- ALWAYS prioritize long-term authority over short-term tricks

KEYWORD STRATEGY FOCUS:
- High-intent commercial: "buy [peptide] online," "affordable research peptides," "[peptide] for sale," "discount research peptides"
- Educational/informational: "what is [peptide]," "[peptide] research studies," "how [peptide] works," "[peptide] benefits in research"
- Comparison/affordability: "cheapest research peptides," "[peptide] price comparison," "best value research peptides"

PRODUCTS: BPC-157, Semaglutide (GLP-1), Tirzepatide, TB-500, and other research peptides.
COMPETITORS: peptidesciences.com, limitlesslife.io, swisschemlab.com, aminoasylum.com

Always respond with valid JSON only. No markdown, no explanations outside the JSON.`
        },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 4000,
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'OpenAI API error');
  return JSON.parse(data.choices[0].message.content);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    let isScheduled = false;
    let user = null;
    try {
      user = await base44.auth.me();
    } catch (_e) {
      isScheduled = true;
    }
    if (!isScheduled && user && user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const today = new Date().toISOString().split('T')[0];
    const timestamp = new Date().toISOString();
    console.log(`[SEO Engine] Starting daily optimization run — ${timestamp}`);

    // ─── PHASE 1: Keyword Research & Trend Analysis ───
    const trendResearch = await callOpenAI(`
Today is ${today}. Perform weekly keyword research and trend analysis for redhelixresearch.com.

Identify the highest-impact SEO opportunities across three keyword categories:
1. HIGH-INTENT COMMERCIAL keywords (buy X, X for sale, affordable X, discount research peptides, cheap X)
2. EDUCATIONAL/INFORMATIONAL keywords (what is X, how X works, X research studies, X mechanism of action)
3. COMPARISON/AFFORDABILITY keywords (cheapest research peptides, best value peptide supplier, X price comparison)

Focus peptides: BPC-157, Semaglutide, Tirzepatide, TB-500, GLP-1, CJC-1295, Ipamorelin, Sermorelin, IGF-1, Melanotan.

Also identify:
- Featured snippet / People Also Ask opportunities
- Content gaps vs competitors (peptidesciences.com, limitlesslife.io, swisschemlab.com, aminoasylum.com)
- Quick wins achievable in the next 7 days
- The single highest-ROI action for TODAY

Return JSON: {
  "tactics": [{"tactic_name": "", "category": "", "why_it_works": "", "implementation": "", "expected_impact": "high|medium|low", "effort": "low|medium|high", "priority_score": 0, "keywords": []}],
  "trending_keywords": [],
  "commercial_keywords": [{"keyword": "", "intent": "", "volume_estimate": "", "difficulty": "low|medium|high", "priority": "high|medium|low"}],
  "educational_keywords": [{"keyword": "", "target_page": "", "volume_estimate": "", "content_type": ""}],
  "affordability_keywords": [{"keyword": "", "angle": "", "volume_estimate": ""}],
  "competitor_gaps": [],
  "quick_wins": [],
  "todays_highest_impact_action": ""
}`);

    console.log(`[SEO Engine] Phase 1 complete — keyword research done`);

    // ─── PHASE 2: Content Strategy & Creation ───
    const contentStrategy = await callOpenAI(`
Today is ${today}. Create a full content strategy and execution plan for redhelixresearch.com.

Generate content that follows these rules:
- Write for humans first, search engines second
- Lead with genuine research value — not marketing fluff
- Frame affordability as "making research-grade peptides accessible to independent researchers and smaller labs"
- Include E-E-A-T signals: cite real published research, use precise scientific terminology
- Include research-use-only disclaimers throughout
- Add CTAs that guide readers toward product pages without being pushy

Produce:
1. Five complete FAQ answers (300-500 words each) targeting high-value researcher questions about BPC-157, semaglutide/GLP-1, tirzepatide, TB-500, and peptide supplier selection. Include affordability angle naturally.
2. Five "People Also Ask" opportunities currently showing in Google for peptide searches — write ideal concise answers (50-100 words) optimized for featured snippets
3. Optimized title tags and meta descriptions for five key pages: Home, Products, BPC-157 product, Semaglutide product, and Learn More/Research page. Focus: keyword + affordability angle, under 60/155 chars respectively
4. Internal linking map: which pages should link to which, with anchor text, to build hub-and-spoke topical authority
5. One content calendar for the next 7 days: each day has a content piece (type, working title, primary keyword, secondary keywords, word count target, affordability angle to weave in)

Return JSON: {
  "faq_content": [{"question": "", "answer": "", "target_page": "", "target_keywords": [], "search_volume_estimate": "", "affordability_angle": ""}],
  "people_also_ask": [{"question": "", "ideal_answer": "", "target_url": "", "featured_snippet_format": "paragraph|list|table"}],
  "optimized_meta_descriptions": [{"page": "", "optimized_title": "", "optimized_description": "", "target_keyword": "", "affordability_element": ""}],
  "internal_linking": [{"source_page": "", "target_page": "", "anchor_text": "", "reason": ""}],
  "content_calendar": [{"day": 1, "content_type": "", "working_title": "", "primary_keyword": "", "secondary_keywords": [], "word_count_target": 0, "affordability_angle": "", "target_page_or_new": ""}]
}`);

    console.log(`[SEO Engine] Phase 2 complete — content strategy done`);

    // ─── PHASE 3: Technical SEO + Competitor Intelligence ───
    const technicalAudit = await callOpenAI(`
Today is ${today}. Perform a technical SEO audit and bi-weekly competitor analysis for redhelixresearch.com.

TECHNICAL AUDIT — React SPA on Vite/Tailwind. Check for:
1. Core Web Vitals issues (LCP, CLS, INP) — specific fixes for React SPAs
2. E-E-A-T improvement signals (author bios, citations, trust signals, purity certificate displays, COA visibility)
3. Schema markup gaps (Product, FAQ, Article, BreadcrumbList, HowTo, Review schemas)
4. Mobile-first indexing issues
5. Index bloat risks (admin pages, checkout pages, thin content being indexed)
6. URL structure improvements (clean, keyword-rich, short: /research-peptides/bpc-157)
7. Sitemap and robots.txt best practices for SPAs
8. Page speed issues specific to e-commerce SPAs
9. Missing canonical tags risks
10. JavaScript SEO concerns for Google crawling React

KEYWORD CLUSTERS — Top 5 clusters with highest 90-day ranking opportunity:
Each cluster should have primary + secondary keywords, volume estimate, difficulty, and which page to target.

COMPETITOR ANALYSIS — For peptidesciences.com, limitlesslife.io, swisschemlab.com, aminoasylum.com:
- Top keywords they rank for that we're missing
- Content they produce that we don't (gaps we can fill)
- Their weaknesses (thin content, missing affordability angle, poor E-E-A-T)
- Specific exploitation opportunities for redhelixresearch.com

LINK BUILDING — Weekly recommendations:
- Top 10 target websites/blogs/directories for backlinks (research, biotech, biohacking, independent science)
- 3 outreach email templates (guest post pitch, resource link pitch, broken link replacement)
- 5 guest post topic ideas for science/research/biotech publications
- Reddit/forum communities where we can add genuine value (specific subreddits, thread topics)

Return JSON: {
  "technical_fixes": [{"issue": "", "fix": "", "priority": "high|medium|low", "implementation_code": "", "compliance_note": ""}],
  "eeat_improvements": [{"signal": "", "how_to_add": "", "impact": "high|medium|low", "affordability_connection": ""}],
  "keyword_clusters": [{"cluster_name": "", "primary_keyword": "", "secondary_keywords": [], "monthly_volume_estimate": "", "difficulty": "", "opportunity_score": "", "recommended_page": "", "commercial_angle": ""}],
  "backlink_opportunities": [{"source_type": "", "specific_targets": [], "strategy": "", "expected_da": "", "outreach_template": ""}],
  "link_building_targets": [{"website": "", "type": "", "why_relevant": "", "approach": ""}],
  "forum_opportunities": [{"platform": "", "community": "", "topic_angle": "", "sample_value_add": ""}],
  "competitors": [{"name": "", "top_keywords": [], "content_gaps": [], "weaknesses": [], "our_advantage": ""}],
  "exploitation_opportunities": [{"opportunity": "", "keyword": "", "content_angle": "", "urgency": "high|medium|low", "affordability_tie_in": ""}]
}`);

    console.log(`[SEO Engine] Phase 3 complete — technical audit and competitor intel done`);

    // ─── PHASE 4: Action Plan + Schema Markup ───
    const actionPlanAndSchema = await callOpenAI(`
Today is ${today}. Based on this SEO data for redhelixresearch.com, build today's prioritized action plan and schema markup.

Keyword opportunities: ${JSON.stringify(trendResearch?.commercial_keywords?.slice(0, 5))}
Quick wins: ${JSON.stringify(trendResearch?.quick_wins)}
Today's highest impact action: ${trendResearch?.todays_highest_impact_action}
Technical issues: ${JSON.stringify(technicalAudit?.technical_fixes?.slice(0, 3))}
Content calendar day 1: ${JSON.stringify(contentStrategy?.content_calendar?.[0])}
Exploitation opportunities: ${JSON.stringify(technicalAudit?.exploitation_opportunities?.slice(0, 3))}

1. Create a 7-item prioritized action plan (ranked by ROI) covering: content creation, technical fixes, keyword targeting, affordability messaging, link building, schema, and CRO.
   Each item: rank, task, category, steps array, expected_impact, auto_implement (boolean — true only if code/content can be applied without human judgment), status, compliance_note.
   Include: summary (2-3 sentences), top_opportunity, estimated_traffic_gain, weekly_theme.

2. Generate 3 ready-to-inject JSON-LD schema blocks:
   - Product schema with AggregateRating for BPC-157 (include affordability signal in description)
   - HowTo schema for peptide reconstitution (research use only, detailed steps)
   - FAQPage schema using our top FAQ content (research-use-only disclaimers included)
   Each schema: name, target_page, type, description, json_ld (valid complete JSON-LD string), expected_rich_result.

3. CRO recommendations: 3 specific A/B test ideas focused on affordability messaging, trust signals (COA display, purity certificates), and conversion path from educational content to product page.

Return JSON: {
  "action_items": [{"rank": 0, "task": "", "category": "", "steps": [], "expected_impact": "high|medium|low", "auto_implement": false, "status": "pending", "compliance_note": ""}],
  "summary": "",
  "top_opportunity": "",
  "estimated_traffic_gain": "",
  "weekly_theme": "",
  "schemas": [{"name": "", "target_page": "", "type": "", "description": "", "json_ld": "", "expected_rich_result": ""}],
  "cro_recommendations": [{"test_name": "", "hypothesis": "", "variant_a": "", "variant_b": "", "metric_to_track": "", "expected_lift": ""}]
}`);

    console.log(`[SEO Engine] Phase 4 complete — action plan, schema, and CRO done`);

    // Split results
    const actionPlan = {
      action_items: actionPlanAndSchema?.action_items,
      summary: actionPlanAndSchema?.summary,
      top_opportunity: actionPlanAndSchema?.top_opportunity,
      estimated_traffic_gain: actionPlanAndSchema?.estimated_traffic_gain,
      weekly_theme: actionPlanAndSchema?.weekly_theme,
      cro_recommendations: actionPlanAndSchema?.cro_recommendations,
    };
    const newSchemaMarkup = { schemas: actionPlanAndSchema?.schemas };
    const competitorIntel = {
      competitors: technicalAudit?.competitors,
      exploitation_opportunities: technicalAudit?.exploitation_opportunities,
    };

    // ─── SAVE REPORT ───
    const reportData = {
      date: today,
      timestamp,
      run_type: isScheduled ? 'scheduled' : 'manual',
      trend_research: trendResearch,
      content_strategy: contentStrategy,
      technical_audit: {
        technical_fixes: technicalAudit?.technical_fixes,
        eeat_improvements: technicalAudit?.eeat_improvements,
        keyword_clusters: technicalAudit?.keyword_clusters,
        backlink_opportunities: technicalAudit?.backlink_opportunities,
        link_building_targets: technicalAudit?.link_building_targets,
        forum_opportunities: technicalAudit?.forum_opportunities,
      },
      action_plan: actionPlan,
      schema_markup: newSchemaMarkup,
      competitor_intel: competitorIntel,
      metrics: {
        tactics_identified: trendResearch?.tactics?.length || 0,
        keywords_found: (trendResearch?.commercial_keywords?.length || 0) + (trendResearch?.educational_keywords?.length || 0) + (trendResearch?.affordability_keywords?.length || 0),
        content_pieces: contentStrategy?.faq_content?.length || 0,
        technical_fixes: technicalAudit?.technical_fixes?.length || 0,
        schema_blocks: newSchemaMarkup?.schemas?.length || 0,
        auto_implementable: actionPlan?.action_items?.filter(i => i.auto_implement)?.length || 0,
        estimated_traffic_gain: actionPlan?.estimated_traffic_gain || 'Unknown'
      },
      status: 'completed'
    };

    await base44.asServiceRole.entities.SEOReport.create(reportData);
    console.log(`[SEO Engine] Report saved`);

    // ─── EMAIL SUMMARY ───
    const topActions = actionPlan?.action_items?.slice(0, 3) || [];
    const topKeywords = trendResearch?.commercial_keywords?.slice(0, 5) || [];
    const quickWins = trendResearch?.quick_wins?.slice(0, 3) || [];
    const contentDay1 = contentStrategy?.content_calendar?.[0];

    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        from_name: 'Red Helix SEO Engine',
        to: 'jake@redhelixresearch.com',
        subject: `🚀 Daily SEO Report — ${today} | ${actionPlan?.weekly_theme || actionPlan?.estimated_traffic_gain || 'Analysis Complete'}`,
        body: `<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;padding:30px;background:#f8fafc;">
<div style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
  <div style="background:linear-gradient(135deg,#0f172a,#1e293b);padding:28px 32px;text-align:center;">
    <h1 style="color:#fff;font-size:20px;font-weight:900;margin:0 0 4px;">Daily SEO Intelligence Report</h1>
    <p style="color:#94a3b8;font-size:12px;margin:0;text-transform:uppercase;letter-spacing:1px;">${today} — Red Helix Research</p>
    ${actionPlan?.weekly_theme ? `<p style="color:#8B2635;font-size:12px;font-weight:700;margin:8px 0 0;text-transform:uppercase;letter-spacing:1px;">This Week: ${actionPlan.weekly_theme}</p>` : ''}
  </div>
  <div style="padding:28px 32px;">
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;margin-bottom:24px;">
      <p style="color:#15803d;font-size:13px;font-weight:700;margin:0 0 6px;">Today's Analysis</p>
      <p style="color:#166534;font-size:15px;font-weight:600;margin:0;">${actionPlan?.summary || 'SEO analysis complete.'}</p>
      <p style="color:#16a34a;font-size:13px;margin:8px 0 0;"><strong>Est. Traffic Gain:</strong> ${actionPlan?.estimated_traffic_gain || 'TBD'}</p>
    </div>
    <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:12px;padding:16px;margin-bottom:24px;">
      <p style="color:#92400e;font-size:12px;font-weight:800;margin:0 0 6px;">⭐ Today's Highest-Impact Action</p>
      <p style="color:#78350f;font-size:14px;margin:0;">${trendResearch?.todays_highest_impact_action || actionPlan?.top_opportunity || 'See full report'}</p>
    </div>
    ${contentDay1 ? `
    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:16px;margin-bottom:24px;">
      <p style="color:#1d4ed8;font-size:12px;font-weight:800;margin:0 0 6px;">📝 Content to Create Today</p>
      <p style="color:#1e3a8a;font-size:14px;font-weight:700;margin:0 0 4px;">${contentDay1.working_title}</p>
      <p style="color:#3730a3;font-size:12px;margin:0;">Type: ${contentDay1.content_type} · Keyword: ${contentDay1.primary_keyword} · ${contentDay1.word_count_target} words</p>
    </div>` : ''}
    <h2 style="color:#0f172a;font-size:15px;font-weight:800;text-transform:uppercase;letter-spacing:1px;margin:0 0 16px;">Priority Actions</h2>
    ${topActions.map((item, i) => `
    <div style="padding:14px;background:${i === 0 ? '#fef2f2' : '#f8fafc'};border:1px solid ${i === 0 ? '#fecaca' : '#e2e8f0'};border-radius:12px;margin-bottom:10px;">
      <p style="color:#0f172a;font-size:14px;font-weight:700;margin:0 0 6px;">${i + 1}. ${item.task}</p>
      <span style="background:#e0e7ff;color:#3730a3;font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;">${item.category}</span>
      <span style="background:${item.auto_implement ? '#dcfce7' : '#fef9c3'};color:${item.auto_implement ? '#15803d' : '#854d0e'};font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;margin-left:6px;">${item.auto_implement ? '✓ Auto' : 'Manual'}</span>
      <span style="background:#f1f5f9;color:#475569;font-size:10px;padding:2px 8px;border-radius:20px;margin-left:6px;">${item.expected_impact} impact</span>
      ${item.compliance_note ? `<p style="color:#ef4444;font-size:11px;margin:6px 0 0;">⚠ ${item.compliance_note}</p>` : ''}
    </div>`).join('')}
    <h2 style="color:#0f172a;font-size:15px;font-weight:800;text-transform:uppercase;letter-spacing:1px;margin:24px 0 12px;">🔑 Top Commercial Keywords</h2>
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:24px;">
      ${topKeywords.map(kw => `<span style="background:#eff6ff;color:#1d4ed8;font-size:12px;font-weight:600;padding:4px 12px;border-radius:20px;border:1px solid #bfdbfe;">${kw.keyword || kw}</span>`).join('')}
    </div>
    <h2 style="color:#0f172a;font-size:15px;font-weight:800;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">⚡ Quick Wins This Week</h2>
    ${quickWins.map(win => `<div style="padding:10px 14px;background:#f8fafc;border-left:3px solid #8B2635;border-radius:0 8px 8px 0;margin-bottom:8px;"><p style="margin:0;color:#334155;font-size:13px;">${win}</p></div>`).join('')}
    <div style="text-align:center;margin-top:24px;">
      <a href="https://redhelixresearch.com/SEODashboard" style="display:inline-block;background:#8B2635;color:#fff;font-size:13px;font-weight:800;text-decoration:none;padding:12px 32px;border-radius:10px;text-transform:uppercase;letter-spacing:1px;">View Full SEO Dashboard →</a>
    </div>
  </div>
  <div style="background:#f8fafc;padding:16px 32px;border-top:1px solid #e2e8f0;text-align:center;">
    <p style="color:#94a3b8;font-size:11px;margin:0;">Red Helix Research SEO Engine — Daily at 3:00 AM CT · Powered by OpenAI</p>
  </div>
</div>
</body>
</html>`
      });
    } catch (emailErr) {
      console.warn('[SEO Engine] Email failed (non-blocking):', emailErr.message);
    }

    return Response.json({
      success: true,
      date: today,
      metrics: reportData.metrics,
      summary: actionPlan?.summary,
      top_opportunity: actionPlan?.top_opportunity,
      todays_action: trendResearch?.todays_highest_impact_action,
      weekly_theme: actionPlan?.weekly_theme,
      action_items: actionPlan?.action_items?.length || 0,
      message: 'SEO optimization run complete.'
    });

  } catch (error) {
    console.error('[SEO Engine] Fatal error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});