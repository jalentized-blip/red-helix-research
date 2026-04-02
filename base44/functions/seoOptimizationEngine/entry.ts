import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    let user = null;
    try { user = await base44.auth.me(); } catch (_e) { /* scheduled */ }
    if (user && user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const today = new Date().toISOString().split('T')[0];
    const timestamp = new Date().toISOString();

    const BRAND_CONTEXT = 'You are an expert SEO strategist for Red Helix Research, a research peptide e-commerce platform selling BPC-157, TB-500, Semaglutide, Tirzepatide, and other peptides for research purposes only. The brand is science-forward, transparent, and community-driven. Target audience: researchers, biohackers, and health optimization enthusiasts. Competitors: Limitless Life Nootropics, Peptide Sciences, Core Peptides, Amino Asylum. All content must be research-context compliant.';

    async function callGPT(prompt) {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: BRAND_CONTEXT },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
          max_tokens: 3000,
        }),
      });
      if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
      const data = await res.json();
      return JSON.parse(data.choices[0].message.content);
    }

    // Create in-progress record
    const report = await base44.asServiceRole.entities.SEOReport.create({
      date: today,
      timestamp,
      run_type: user ? 'manual' : 'scheduled',
      status: 'in_progress',
    });

    // Run all 5 analyses
    const [trendResearch, contentStrategy, technicalAudit, competitorIntel, schemaMarkup] = await Promise.all([
      callGPT(`Research SEO trends for Red Helix Research today (${today}). Return JSON: { "tactics": [{"tactic_name":"","why_it_works":"","expected_impact":"high|medium|low","implementation_time":"","specific_to_peptides":true}], "trending_keywords": [], "quick_wins": [], "competitor_gaps": [] }. Provide 8 tactics, 15 trending keywords, 5 quick wins, 5 competitor gaps focused on peptide research keywords, E-E-A-T, and featured snippets.`),

      callGPT(`Generate content SEO strategy for Red Helix Research (${today}). Return JSON: { "faq_content": [{"question":"","answer":"","target_keywords":[],"target_page":"","search_volume_estimate":""}], "people_also_ask": [{"question":"","ideal_answer":"","target_url":""}], "optimized_meta_descriptions": [{"page":"","current_issue":"","optimized_title":"","optimized_description":"","target_keyword":""}], "internal_linking": [{"source_page":"","target_page":"","anchor_text":"","context":""}] }. Include 6 FAQs, 5 PAA items, meta for 6 pages, 8 internal links.`),

      callGPT(`Perform technical SEO audit for Red Helix Research (${today}). Return JSON: { "technical_fixes": [{"issue":"","fix":"","priority":"high|medium|low","implementation_code":null}], "keyword_clusters": [{"cluster_name":"","primary_keyword":"","secondary_keywords":[],"monthly_volume_estimate":"","difficulty":"low|medium|high","opportunity_score":"","recommended_page":""}], "backlink_opportunities": [{"source_type":"","strategy":"","expected_da":""}], "eeat_improvements": [{"signal":"","how_to_add":"","impact":"high|medium|low"}] }. Include 5 fixes, 6 keyword clusters, 5 backlink opportunities, 6 E-E-A-T improvements.`),

      callGPT(`Analyze competitors for Red Helix Research (${today}): Limitless Life Nootropics, Peptide Sciences, Core Peptides, Amino Asylum. Return JSON: { "competitors": [{"name":"","top_keywords":[],"content_gaps":[],"weaknesses":[]}], "exploitation_opportunities": [{"opportunity":"","keyword":"","content_angle":"","urgency":"high|medium"}] }. Analyze all 4 competitors, find 5+ exploitation opportunities.`),

      callGPT(`Generate JSON-LD schema markup for Red Helix Research (${today}). Return JSON: { "schemas": [{"name":"","type":"","target_page":"","json_ld":"","expected_rich_result":""}] }. Create 5 schemas: Product (BPC-157), FAQPage, HowTo (peptide reconstitution), Organization, BreadcrumbList (Products page).`),
    ]);

    // Generate action plan based on findings
    const actionPlan = await callGPT(`Based on today's SEO analysis (${today}) for Red Helix Research, create a prioritized action plan. Return JSON: { "summary": "", "top_opportunity": "", "action_items": [{"rank":1,"task":"","category":"content|technical|links|schema|keywords","expected_impact":"high|medium|low","time_to_implement":"","auto_implement":false,"steps":[]}] }. Create 10 prioritized action items. Mark auto-implementable ones as auto_implement: true.`);

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
      schema_markup: schemaMarkup,
      action_plan: actionPlan,
      metrics,
      status: 'completed',
    });

    return Response.json({ success: true, report_id: report.id, date: today, metrics });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});