import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

async function callOpenAI(prompt, schema) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 4000,
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'OpenAI API error');
  const content = data.choices[0].message.content;
  return JSON.parse(content);
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

    // ─── PHASE 1: Research current SEO trends & competitor landscape ───
    const trendResearch = await callOpenAI(
      `You are an expert SEO strategist for a research peptide e-commerce site (redhelixresearch.com). 
      Identify the TOP 10 highest-impact SEO tactics for a research peptide supplier in ${new Date().getFullYear()}.
      
      Focus on:
      1. Current Google ranking factors for supplement/research chemical vendors
      2. High-volume, low-competition long-tail keywords for: research peptides, BPC-157, semaglutide, tirzepatide, TB-500
      3. Featured snippet opportunities (People Also Ask) for peptide queries
      4. Content gap opportunities vs competitors (peptidesciences.com, limitlesslife.io, swisschemlab.com)
      5. Technical SEO improvements (Core Web Vitals, E-E-A-T signals)
      6. Schema markup types ranking well for health/supplement sites
      7. Backlink strategies for research chemical vendors
      8. Voice search optimization
      9. Social proof signals Google picks up on
      10. Quick wins achievable within 30 days
      
      For each tactic provide: tactic_name, category, why_it_works, implementation, expected_impact (high/medium/low), effort, priority_score (1-10), keywords array.
      Also include trending_keywords array, competitor_gaps array, quick_wins array.
      
      Return valid JSON with: { tactics: [...], trending_keywords: [...], competitor_gaps: [...], quick_wins: [...] }`,
      null
    );

    console.log(`[SEO Engine] Phase 1 complete — trend research done`);

    // ─── PHASE 2: Generate content recommendations ───
    const contentStrategy = await callOpenAI(
      `You are an SEO content strategist for redhelixresearch.com, a research peptide supplier. Today: ${today}.
      
      Generate a content strategy to rank in Google over the next 30 days:
      
      1. Write 5 FAQ answers targeting searches like:
         - "how to use BPC-157 for research"
         - "best GLP-1 peptide for research 2025"
         - "tirzepatide vs semaglutide research comparison"
         - "where to buy research peptides cheap USA"
         - "BPC-157 healing research studies"
      
      2. Identify 5 People Also Ask questions for peptide searches and write ideal answers
      
      3. Write meta descriptions optimized for CTR for 5 high-priority pages
      
      4. Generate internal linking recommendations (which pages should link to which)
      
      Return JSON: { faq_content: [{question, answer, target_page, target_keywords, search_volume_estimate}], people_also_ask: [{question, ideal_answer, target_url}], optimized_meta_descriptions: [{page, optimized_description, optimized_title, target_keyword, current_issue}], internal_linking: [{source_page, target_page, anchor_text, reason}] }`,
      null
    );

    console.log(`[SEO Engine] Phase 2 complete — content strategy done`);

    // ─── PHASE 3: Technical SEO audit ───
    const technicalAudit = await callOpenAI(
      `Perform a technical SEO audit for redhelixresearch.com — a React SPA selling research peptides.
      Setup: React SPA, Vite, Tailwind CSS.
      
      Provide SPECIFIC, IMPLEMENTABLE improvements for:
      1. Core Web Vitals optimization (LCP, CLS, INP) — specific fixes for React SPAs
      2. E-E-A-T signals to add
      3. Structured data opportunities overlooked by peptide vendors
      4. Mobile-first indexing signals
      5. JavaScript SEO for React apps
      
      Also identify TOP 5 keyword clusters with highest ranking opportunity in next 90 days.
      
      Also list competitor intel for: peptidesciences.com, limitlesslife.io, swisschemlab.com, aminoasylum.com
      — for each: top_keywords they rank for, content_gaps, weaknesses.
      Also list top 5 exploitation_opportunities (keyword + content_angle + urgency).
      
      Return JSON: { technical_fixes: [{issue, fix, priority, implementation_code}], eeat_improvements: [{signal, how_to_add, impact}], keyword_clusters: [{cluster_name, primary_keyword, secondary_keywords, monthly_volume_estimate, difficulty, opportunity_score, recommended_page}], backlink_opportunities: [{source_type, strategy, expected_da}], competitors: [{name, top_keywords, content_gaps, weaknesses}], exploitation_opportunities: [{opportunity, keyword, content_angle, urgency}] }`,
      null
    );

    console.log(`[SEO Engine] Phase 3 complete — technical audit done`);

    // ─── PHASE 4: Action plan + Schema ───
    const actionPlanAndSchema = await callOpenAI(
      `Based on this SEO research for redhelixresearch.com on ${today}:
      
      Tactics: ${JSON.stringify(trendResearch?.tactics?.slice(0, 3))}
      Quick Wins: ${JSON.stringify(trendResearch?.quick_wins)}
      Keywords: ${JSON.stringify(trendResearch?.trending_keywords?.slice(0, 8))}
      Technical Issues: ${JSON.stringify(technicalAudit?.technical_fixes?.slice(0, 3))}
      Content Opportunities: ${JSON.stringify(contentStrategy?.people_also_ask?.slice(0, 3))}
      
      1. Create a 7-item action plan ranked by ROI. Each item: rank, task, category, steps array, expected_impact, auto_implement (boolean), status.
         Include summary, top_opportunity, estimated_traffic_gain.
      
      2. Generate 3 ready-to-inject JSON-LD schema markup blocks for the site:
         - A Product schema with Review aggregation for BPC-157 or Semaglutide
         - A HowTo schema for peptide reconstitution
         - A FAQPage schema using the top FAQ content
         Each schema: name, target_page, description, json_ld (valid JSON-LD as string), expected_rich_result, type.
      
      Return JSON: { action_items: [...], summary, top_opportunity, estimated_traffic_gain, schemas: [{name, target_page, description, json_ld, expected_rich_result, type}] }`,
      null
    );

    console.log(`[SEO Engine] Phase 4 complete — action plan and schema done`);

    // Split out results
    const actionPlan = {
      action_items: actionPlanAndSchema?.action_items,
      summary: actionPlanAndSchema?.summary,
      top_opportunity: actionPlanAndSchema?.top_opportunity,
      estimated_traffic_gain: actionPlanAndSchema?.estimated_traffic_gain,
    };
    const newSchemaMarkup = { schemas: actionPlanAndSchema?.schemas };
    const competitorIntel = {
      competitors: technicalAudit?.competitors,
      exploitation_opportunities: technicalAudit?.exploitation_opportunities,
    };

    // ─── SAVE REPORT TO DATABASE ───
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
      },
      action_plan: actionPlan,
      schema_markup: newSchemaMarkup,
      competitor_intel: competitorIntel,
      metrics: {
        tactics_identified: trendResearch?.tactics?.length || 0,
        keywords_found: trendResearch?.trending_keywords?.length || 0,
        content_pieces: contentStrategy?.faq_content?.length || 0,
        technical_fixes: technicalAudit?.technical_fixes?.length || 0,
        schema_blocks: newSchemaMarkup?.schemas?.length || 0,
        auto_implementable: actionPlan?.action_items?.filter(i => i.auto_implement)?.length || 0,
        estimated_traffic_gain: actionPlan?.estimated_traffic_gain || 'Unknown'
      },
      status: 'completed'
    };

    await base44.asServiceRole.entities.SEOReport.create(reportData);
    console.log(`[SEO Engine] Report saved to database`);

    // ─── SEND ADMIN SUMMARY EMAIL ───
    const topActions = actionPlan?.action_items?.slice(0, 3) || [];
    const topKeywords = trendResearch?.trending_keywords?.slice(0, 5) || [];
    const quickWins = trendResearch?.quick_wins?.slice(0, 3) || [];

    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        from_name: 'Red Helix SEO Engine',
        to: 'jake@redhelixresearch.com',
        subject: `🚀 Daily SEO Report — ${today} | ${actionPlan?.estimated_traffic_gain || 'Analysis Complete'}`,
        body: `
<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;padding:30px;background:#f8fafc;">
<div style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
  <div style="background:linear-gradient(135deg,#0f172a,#1e293b);padding:28px 32px;text-align:center;">
    <h1 style="color:#fff;font-size:20px;font-weight:900;margin:0 0 4px;">Daily SEO Intelligence Report</h1>
    <p style="color:#94a3b8;font-size:12px;margin:0;text-transform:uppercase;letter-spacing:1px;">${today} — Red Helix Research</p>
  </div>
  <div style="padding:28px 32px;">
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;margin-bottom:24px;">
      <p style="color:#15803d;font-size:13px;font-weight:700;margin:0 0 6px;">Today's Analysis</p>
      <p style="color:#166534;font-size:15px;font-weight:600;margin:0;">${actionPlan?.summary || 'SEO analysis complete.'}</p>
      <p style="color:#16a34a;font-size:13px;margin:8px 0 0;"><strong>Estimated Traffic Gain:</strong> ${actionPlan?.estimated_traffic_gain || 'TBD'}</p>
    </div>
    <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:12px;padding:16px;margin-bottom:24px;">
      <p style="color:#92400e;font-size:12px;font-weight:800;margin:0 0 6px;">⭐ Top Opportunity</p>
      <p style="color:#78350f;font-size:14px;margin:0;">${actionPlan?.top_opportunity || 'See full report'}</p>
    </div>
    <h2 style="color:#0f172a;font-size:15px;font-weight:800;text-transform:uppercase;letter-spacing:1px;margin:0 0 16px;">Today's Priority Actions</h2>
    ${topActions.map((item, i) => `
    <div style="padding:14px;background:${i === 0 ? '#fef2f2' : '#f8fafc'};border:1px solid ${i === 0 ? '#fecaca' : '#e2e8f0'};border-radius:12px;margin-bottom:10px;">
      <p style="color:#0f172a;font-size:14px;font-weight:700;margin:0 0 4px;">${i + 1}. ${item.task}</p>
      <span style="background:#e0e7ff;color:#3730a3;font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;">${item.category}</span>
      <span style="background:${item.auto_implement ? '#dcfce7' : '#fef9c3'};color:${item.auto_implement ? '#15803d' : '#854d0e'};font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;margin-left:6px;">${item.auto_implement ? '✓ Auto' : 'Manual'}</span>
    </div>`).join('')}
    <h2 style="color:#0f172a;font-size:15px;font-weight:800;text-transform:uppercase;letter-spacing:1px;margin:24px 0 12px;">🔑 Trending Keywords</h2>
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:24px;">
      ${topKeywords.map(kw => `<span style="background:#eff6ff;color:#1d4ed8;font-size:12px;font-weight:600;padding:4px 12px;border-radius:20px;border:1px solid #bfdbfe;">${kw}</span>`).join('')}
    </div>
    <h2 style="color:#0f172a;font-size:15px;font-weight:800;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">⚡ Quick Wins</h2>
    ${quickWins.map(win => `<div style="padding:10px 14px;background:#f8fafc;border-left:3px solid #8B2635;border-radius:0 8px 8px 0;margin-bottom:8px;"><p style="margin:0;color:#334155;font-size:13px;">${win}</p></div>`).join('')}
    <div style="text-align:center;margin-top:24px;">
      <a href="https://redhelixresearch.com/SEODashboard" style="display:inline-block;background:#8B2635;color:#fff;font-size:13px;font-weight:800;text-decoration:none;padding:12px 32px;border-radius:10px;text-transform:uppercase;letter-spacing:1px;">View Full SEO Dashboard →</a>
    </div>
  </div>
  <div style="background:#f8fafc;padding:16px 32px;border-top:1px solid #e2e8f0;text-align:center;">
    <p style="color:#94a3b8;font-size:11px;margin:0;">Red Helix Research SEO Engine — Runs automatically every day at 3:00 AM CT</p>
  </div>
</div>
</body>
</html>`
      });
    } catch (emailErr) {
      console.warn('[SEO Engine] Email notification failed:', emailErr.message);
    }

    return Response.json({
      success: true,
      date: today,
      metrics: reportData.metrics,
      summary: actionPlan?.summary,
      top_opportunity: actionPlan?.top_opportunity,
      action_items: actionPlan?.action_items?.length || 0,
      message: 'SEO optimization run complete. Report saved and email sent.'
    });

  } catch (error) {
    console.error('[SEO Engine] Fatal error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});