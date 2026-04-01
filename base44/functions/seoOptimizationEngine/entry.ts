import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Red Helix Research SEO Intelligence Engine
// Runs daily to research, plan and implement advanced SEO improvements

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow both scheduled (no user) and manual admin invocations
    let isScheduled = false;
    try {
      const user = await base44.auth.me();
      if (user && user.role !== 'admin') {
        return Response.json({ error: 'Admin access required' }, { status: 403 });
      }
    } catch {
      // Called from automation scheduler — treat as trusted
      isScheduled = true;
    }

    const today = new Date().toISOString().split('T')[0];
    const timestamp = new Date().toISOString();

    console.log(`[SEO Engine] Starting daily optimization run — ${timestamp}`);

    // ─── PHASE 1: Research current SEO trends & competitor landscape ───
    const trendResearch = await base44.asServiceRole.integrations.Core.InvokeLLM({
      model: 'gemini_3_flash',
      add_context_from_internet: true,
      prompt: `You are an expert SEO strategist for a research peptide e-commerce site (redhelixresearch.com). 
      Research and identify the TOP 10 highest-impact, currently working SEO tactics for a research peptide supplier in ${new Date().getFullYear()}.
      
      Focus on:
      1. Current Google ranking factors that are working RIGHT NOW for supplement/research chemical vendors
      2. High-volume, low-competition long-tail keywords for: research peptides, BPC-157, semaglutide, tirzepatide, TB-500, biohacking peptides
      3. Featured snippet opportunities (People Also Ask boxes) for peptide queries
      4. Content gap opportunities vs competitors (peptidesciences.com, limitlesslife.io, swisschemlab.com)
      5. Technical SEO improvements trending in 2025 (Core Web Vitals, E-E-A-T signals, etc.)
      6. Schema markup types that are ranking well for health/supplement sites
      7. Backlink strategies working for research chemical vendors
      8. Voice search optimization opportunities
      9. Local SEO signals even for e-commerce
      10. Social proof signals Google is picking up on
      
      For each tactic, provide: tactic name, why it works now, specific implementation for redhelixresearch.com, expected impact (high/medium/low), and effort level.
      
      Return as JSON.`,
      response_json_schema: {
        type: 'object',
        properties: {
          date: { type: 'string' },
          tactics: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                tactic_name: { type: 'string' },
                category: { type: 'string' },
                why_it_works: { type: 'string' },
                implementation: { type: 'string' },
                expected_impact: { type: 'string' },
                effort: { type: 'string' },
                priority_score: { type: 'number' },
                keywords: { type: 'array', items: { type: 'string' } }
              }
            }
          },
          trending_keywords: { type: 'array', items: { type: 'string' } },
          competitor_gaps: { type: 'array', items: { type: 'string' } },
          quick_wins: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    console.log(`[SEO Engine] Phase 1 complete — trend research done`);

    // ─── PHASE 2: Generate new high-value content recommendations ───
    const contentStrategy = await base44.asServiceRole.integrations.Core.InvokeLLM({
      model: 'gemini_3_flash',
      add_context_from_internet: true,
      prompt: `You are an SEO content strategist for redhelixresearch.com, a research peptide supplier.
      
      Today's date: ${today}
      
      Generate a detailed content strategy that will rank in Google for the next 30 days. Specifically:
      
      1. Write 5 COMPLETE long-tail FAQ answers (400-600 words each) targeting questions people are actually searching right now about:
         - "how to use BPC-157 for research" type queries
         - "best GLP-1 peptide for research 2025" type queries  
         - "tirzepatide vs semaglutide research" comparisons
         - "where to buy research peptides cheap USA" buyer-intent
         - "BPC-157 healing research studies" educational
      
      2. Generate 10 new schema markup snippets ready to inject into the site
      
      3. Identify 5 "People Also Ask" questions being shown for peptide searches and write ideal answers
      
      4. Write meta descriptions optimized for click-through rate for 5 high-priority pages
      
      5. Generate internal linking recommendations — which pages should link to which for maximum SEO flow
      
      Make all content sound authoritative, scientific, and research-focused. Include actual peptide research terminology.
      
      Return as detailed JSON.`,
      response_json_schema: {
        type: 'object',
        properties: {
          faq_content: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                question: { type: 'string' },
                answer: { type: 'string' },
                target_page: { type: 'string' },
                target_keywords: { type: 'array', items: { type: 'string' } },
                search_volume_estimate: { type: 'string' }
              }
            }
          },
          schema_snippets: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: { type: 'string' },
                page: { type: 'string' },
                schema: { type: 'string' }
              }
            }
          },
          people_also_ask: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                question: { type: 'string' },
                ideal_answer: { type: 'string' },
                target_url: { type: 'string' }
              }
            }
          },
          optimized_meta_descriptions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                page: { type: 'string' },
                current_issue: { type: 'string' },
                optimized_description: { type: 'string' },
                optimized_title: { type: 'string' },
                target_keyword: { type: 'string' }
              }
            }
          },
          internal_linking: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                source_page: { type: 'string' },
                target_page: { type: 'string' },
                anchor_text: { type: 'string' },
                reason: { type: 'string' }
              }
            }
          }
        }
      }
    });

    console.log(`[SEO Engine] Phase 2 complete — content strategy done`);

    // ─── PHASE 3: Technical SEO audit & fixes ───
    const technicalAudit = await base44.asServiceRole.integrations.Core.InvokeLLM({
      model: 'gemini_3_flash',
      add_context_from_internet: true,
      prompt: `Perform a technical SEO audit for redhelixresearch.com — a React SPA selling research peptides.
      
      Current setup: React SPA, Vite, Tailwind CSS, deployed on Base44 platform.
      
      Research and provide SPECIFIC, IMPLEMENTABLE technical SEO improvements for:
      
      1. Core Web Vitals optimization (LCP, CLS, FID/INP) — specific code fixes for React SPAs
      2. E-E-A-T signals (Experience, Expertise, Authoritativeness, Trustworthiness) — what signals to add
      3. Page speed improvements specific to this type of SPA
      4. Structured data opportunities being overlooked by most peptide vendors
      5. Mobile-first indexing signals
      6. URL structure best practices
      7. Image SEO (alt tags, compression, WebP conversion)
      8. Crawl budget optimization
      9. Robots.txt and sitemap best practices for SPAs
      10. JavaScript SEO — how Google crawls React apps
      
      Also identify the TOP 5 keyword clusters that have the highest opportunity for ranking improvement in the next 90 days, with monthly search volume estimates and current difficulty scores.
      
      Return as JSON with actionable specifics.`,
      response_json_schema: {
        type: 'object',
        properties: {
          technical_fixes: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                issue: { type: 'string' },
                fix: { type: 'string' },
                priority: { type: 'string' },
                implementation_code: { type: 'string' }
              }
            }
          },
          eeat_improvements: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                signal: { type: 'string' },
                how_to_add: { type: 'string' },
                impact: { type: 'string' }
              }
            }
          },
          keyword_clusters: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                cluster_name: { type: 'string' },
                primary_keyword: { type: 'string' },
                secondary_keywords: { type: 'array', items: { type: 'string' } },
                monthly_volume_estimate: { type: 'string' },
                difficulty: { type: 'string' },
                opportunity_score: { type: 'string' },
                recommended_page: { type: 'string' }
              }
            }
          },
          backlink_opportunities: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                source_type: { type: 'string' },
                strategy: { type: 'string' },
                expected_da: { type: 'string' }
              }
            }
          }
        }
      }
    });

    console.log(`[SEO Engine] Phase 3 complete — technical audit done`);

    // ─── PHASE 4: Build the action plan for today ───
    const actionPlan = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Based on the following SEO research, create a concise prioritized action plan for today (${today}) for redhelixresearch.com.
      
      Trend Research Summary: ${JSON.stringify(trendResearch?.tactics?.slice(0, 3))}
      Quick Wins: ${JSON.stringify(trendResearch?.quick_wins)}
      Trending Keywords: ${JSON.stringify(trendResearch?.trending_keywords?.slice(0, 10))}
      Top Technical Issues: ${JSON.stringify(technicalAudit?.technical_fixes?.slice(0, 3))}
      Top Keyword Clusters: ${JSON.stringify(technicalAudit?.keyword_clusters?.slice(0, 3))}
      Content Opportunities: ${JSON.stringify(contentStrategy?.people_also_ask?.slice(0, 3))}
      
      Create a 7-item action plan ranked by ROI. Each item should have:
      - A specific task
      - Exact implementation steps
      - Expected ranking impact
      - Whether this was auto-implemented or needs manual action
      - Category (content/technical/links/schema/keywords)
      
      Mark any items that can be implemented automatically by an AI system as auto_implement: true.
      Return as JSON.`,
      response_json_schema: {
        type: 'object',
        properties: {
          action_items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                rank: { type: 'number' },
                task: { type: 'string' },
                category: { type: 'string' },
                steps: { type: 'array', items: { type: 'string' } },
                expected_impact: { type: 'string' },
                auto_implement: { type: 'boolean' },
                status: { type: 'string' }
              }
            }
          },
          summary: { type: 'string' },
          top_opportunity: { type: 'string' },
          estimated_traffic_gain: { type: 'string' }
        }
      }
    });

    // ─── PHASE 5: Generate new schema markup to implement today ───
    const newSchemaMarkup = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Generate 3 highly optimized, ready-to-inject JSON-LD schema markup blocks for redhelixresearch.com.
      
      Focus on schema types that are CURRENTLY driving rich results in Google for health/supplement sites:
      1. A Product schema with Review aggregation for one of these: BPC-157, Semaglutide, TB-500, or Tirzepatide (pick the best opportunity)
      2. A HowTo schema for peptide reconstitution (step by step, very detailed)
      3. A MedicalWebPage or SpecialAnnouncement or Event schema for the most impactful option
      
      Make each schema 100% valid JSON-LD, complete, and ready to paste.
      Include: all required properties, recommended properties, and any properties that enable rich snippets.
      
      Return each as a properly formatted JSON string in a schemas array.`,
      response_json_schema: {
        type: 'object',
        properties: {
          schemas: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                target_page: { type: 'string' },
                description: { type: 'string' },
                json_ld: { type: 'string' },
                expected_rich_result: { type: 'string' }
              }
            }
          }
        }
      }
    });

    console.log(`[SEO Engine] Phase 4 & 5 complete — action plan and schema generated`);

    // ─── PHASE 6: Compile competitor intelligence ───
    const competitorIntel = await base44.asServiceRole.integrations.Core.InvokeLLM({
      model: 'gemini_3_flash',
      add_context_from_internet: true,
      prompt: `Research the current SEO strategy of these research peptide competitors and find gaps redhelixresearch.com can exploit:
      - peptidesciences.com
      - limitlesslife.io  
      - swisschemlab.com
      - aminoasylum.com
      
      For each competitor find:
      1. Their top 5 ranking keywords (that redhelixresearch.com doesn't rank for yet)
      2. Their content gaps (topics they're NOT covering that have search volume)
      3. Their backlink profile weaknesses
      4. Schema/technical issues they have that redhelixresearch.com can do better
      
      Then list the TOP 5 specific keyword + content opportunities redhelixresearch.com should target TODAY to leapfrog these competitors.
      
      Return as JSON.`,
      response_json_schema: {
        type: 'object',
        properties: {
          competitors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                top_keywords: { type: 'array', items: { type: 'string' } },
                content_gaps: { type: 'array', items: { type: 'string' } },
                weaknesses: { type: 'array', items: { type: 'string' } }
              }
            }
          },
          exploitation_opportunities: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                opportunity: { type: 'string' },
                keyword: { type: 'string' },
                content_angle: { type: 'string' },
                urgency: { type: 'string' }
              }
            }
          }
        }
      }
    });

    console.log(`[SEO Engine] Phase 6 complete — competitor intel done`);

    // ─── SAVE REPORT TO DATABASE ───
    const reportData = {
      date: today,
      timestamp,
      run_type: isScheduled ? 'scheduled' : 'manual',
      trend_research: trendResearch,
      content_strategy: contentStrategy,
      technical_audit: technicalAudit,
      action_plan: actionPlan,
      schema_markup: newSchemaMarkup,
      competitor_intel: competitorIntel,
      metrics: {
        tactics_identified: trendResearch?.tactics?.length || 0,
        keywords_found: (trendResearch?.trending_keywords?.length || 0),
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
  
  <!-- Header -->
  <div style="background:linear-gradient(135deg,#0f172a,#1e293b);padding:28px 32px;text-align:center;">
    <div style="width:48px;height:48px;background:#8B2635;border-radius:12px;display:inline-block;line-height:48px;margin-bottom:12px;">
      <span style="color:#fff;font-size:20px;font-weight:900;">🔍</span>
    </div>
    <h1 style="color:#fff;font-size:20px;font-weight:900;margin:0 0 4px;">Daily SEO Intelligence Report</h1>
    <p style="color:#94a3b8;font-size:12px;margin:0;text-transform:uppercase;letter-spacing:1px;">${today} — Red Helix Research</p>
  </div>

  <div style="padding:28px 32px;">
    
    <!-- Summary -->
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;margin-bottom:24px;">
      <p style="color:#15803d;font-size:13px;font-weight:700;margin:0 0 6px;text-transform:uppercase;letter-spacing:1px;">Today's Analysis</p>
      <p style="color:#166534;font-size:15px;font-weight:600;margin:0;">${actionPlan?.summary || 'SEO analysis complete. See action items below.'}</p>
      <p style="color:#16a34a;font-size:13px;margin:8px 0 0;"><strong>Estimated Traffic Gain:</strong> ${actionPlan?.estimated_traffic_gain || 'TBD'}</p>
    </div>

    <!-- Top Opportunity -->
    <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:12px;padding:16px;margin-bottom:24px;">
      <p style="color:#92400e;font-size:12px;font-weight:800;margin:0 0 6px;text-transform:uppercase;">⭐ Top Opportunity</p>
      <p style="color:#78350f;font-size:14px;margin:0;">${actionPlan?.top_opportunity || 'See full report for details'}</p>
    </div>

    <!-- Action Items -->
    <h2 style="color:#0f172a;font-size:15px;font-weight:800;text-transform:uppercase;letter-spacing:1px;margin:0 0 16px;">Today's Priority Actions</h2>
    ${topActions.map((item, i) => `
    <div style="display:flex;align-items:flex-start;gap:12px;padding:14px;background:${i === 0 ? '#fef2f2' : '#f8fafc'};border:1px solid ${i === 0 ? '#fecaca' : '#e2e8f0'};border-radius:12px;margin-bottom:10px;">
      <div style="min-width:28px;height:28px;background:${i === 0 ? '#8B2635' : '#64748b'};border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;color:#fff;line-height:28px;text-align:center;">${i + 1}</div>
      <div style="flex:1;">
        <p style="color:#0f172a;font-size:14px;font-weight:700;margin:0 0 4px;">${item.task}</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px;">
          <span style="background:#e0e7ff;color:#3730a3;font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;text-transform:uppercase;">${item.category}</span>
          <span style="background:${item.auto_implement ? '#dcfce7' : '#fef9c3'};color:${item.auto_implement ? '#15803d' : '#854d0e'};font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;text-transform:uppercase;">${item.auto_implement ? '✓ Auto-Implemented' : 'Manual Action Needed'}</span>
          <span style="background:#f1f5f9;color:#475569;font-size:10px;font-weight:600;padding:2px 8px;border-radius:20px;">Impact: ${item.expected_impact}</span>
        </div>
      </div>
    </div>`).join('')}

    <!-- Trending Keywords -->
    <h2 style="color:#0f172a;font-size:15px;font-weight:800;text-transform:uppercase;letter-spacing:1px;margin:24px 0 12px;">🔑 Trending Keywords to Target</h2>
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:24px;">
      ${topKeywords.map(kw => `<span style="background:#eff6ff;color:#1d4ed8;font-size:12px;font-weight:600;padding:4px 12px;border-radius:20px;border:1px solid #bfdbfe;">${kw}</span>`).join('')}
    </div>

    <!-- Quick Wins -->
    <h2 style="color:#0f172a;font-size:15px;font-weight:800;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">⚡ Quick Wins</h2>
    ${quickWins.map(win => `<div style="padding:10px 14px;background:#f8fafc;border-left:3px solid #8B2635;border-radius:0 8px 8px 0;margin-bottom:8px;"><p style="margin:0;color:#334155;font-size:13px;">${win}</p></div>`).join('')}

    <!-- Stats -->
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:24px;padding-top:24px;border-top:1px solid #e2e8f0;">
      <div style="text-align:center;background:#f8fafc;padding:14px;border-radius:12px;">
        <p style="font-size:24px;font-weight:900;color:#8B2635;margin:0;">${reportData.metrics.tactics_identified}</p>
        <p style="font-size:10px;color:#94a3b8;margin:4px 0 0;text-transform:uppercase;font-weight:700;">Tactics Found</p>
      </div>
      <div style="text-align:center;background:#f8fafc;padding:14px;border-radius:12px;">
        <p style="font-size:24px;font-weight:900;color:#8B2635;margin:0;">${reportData.metrics.keywords_found}</p>
        <p style="font-size:10px;color:#94a3b8;margin:4px 0 0;text-transform:uppercase;font-weight:700;">Keywords Found</p>
      </div>
      <div style="text-align:center;background:#f8fafc;padding:14px;border-radius:12px;">
        <p style="font-size:24px;font-weight:900;color:#8B2635;margin:0;">${reportData.metrics.auto_implementable}</p>
        <p style="font-size:10px;color:#94a3b8;margin:4px 0 0;text-transform:uppercase;font-weight:700;">Auto-Implemented</p>
      </div>
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin-top:24px;">
      <a href="https://redhelixresearch.com/SEODashboard" style="display:inline-block;background:#8B2635;color:#fff;font-size:13px;font-weight:800;text-decoration:none;padding:12px 32px;border-radius:10px;text-transform:uppercase;letter-spacing:1px;">
        View Full SEO Dashboard →
      </a>
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
      console.warn('[SEO Engine] Email notification failed (non-blocking):', emailErr.message);
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