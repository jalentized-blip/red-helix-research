import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import SEO from '@/components/SEO';

export default function BacklinkStrategy() {
  const strategies = [
    {
      title: 'Guest Post Outreach',
      description: 'Write high-quality guest posts on peptide research, biohacking, and fitness blogs.',
      targets: [
        'Science-focused blogs (2,000+ DA)',
        'Biohacking & longevity websites',
        'Fitness research communities',
        'Academic blog networks'
      ],
      effort: 'High',
      timeline: '4-8 weeks per link',
      expectedLinks: '3-5 links per month',
      topics: [
        'The Complete Guide to Peptide Research Safety',
        'Understanding Third-Party Testing in Peptide Quality',
        'Peptide Reconstitution Science: Best Practices',
        'Why Transparency Matters in Research Peptides'
      ]
    },
    {
      title: 'HARO (Help A Reporter Out)',
      description: 'Respond to journalist inquiries about peptide research and gray market trends.',
      targets: [
        'News outlets',
        'Science publications',
        'Research journals',
        'Industry magazines'
      ],
      effort: 'Medium',
      timeline: '1-3 weeks per link',
      expectedLinks: '2-4 links per month',
      topics: [
        'Gray market peptide quality concerns',
        'Importance of third-party testing',
        'Research peptide industry trends'
      ]
    },
    {
      title: 'Research Paper Citations',
      description: 'Get mentioned in academic papers and research publications.',
      targets: [
        'Academic journals',
        'Research institutes',
        'University studies',
        'Peer-reviewed publications'
      ],
      effort: 'Very High',
      timeline: '2-6 months per link',
      expectedLinks: '1-2 links per month',
      topics: [
        'Peptide purity and testing standards',
        'Third-party verification importance',
        'Market transparency in research chemicals'
      ]
    },
    {
      title: 'Industry Partnerships & Mentions',
      description: 'Partner with complementary research companies and get mutual mentions.',
      targets: [
        'Research equipment suppliers',
        'Lab testing companies',
        'Scientific association websites',
        'Industry directories'
      ],
      effort: 'Medium',
      timeline: '2-4 weeks per link',
      expectedLinks: '2-3 links per month',
      topics: [
        'Partnerships with testing labs',
        'Industry association memberships',
        'Supplier relationships'
      ]
    },
    {
      title: 'Resource Page Placement',
      description: 'Get listed on curated resource pages in the peptide research niche.',
      targets: [
        'Research resource hubs',
        'Peptide supplier directories',
        'Scientific resource collections',
        'Educational websites'
      ],
      effort: 'Low',
      timeline: '1-2 weeks per link',
      expectedLinks: '5-8 links per month',
      topics: [
        'Best peptide suppliers',
        'Trusted testing resources',
        'Research peptide directories'
      ]
    },
    {
      title: 'Broken Link Building',
      description: 'Find broken links on authority sites and suggest Red Helix content as replacement.',
      targets: [
        'Science blogs',
        'Research repositories',
        'Educational resources',
        'Industry guides'
      ],
      effort: 'Medium',
      timeline: '1-3 weeks per link',
      expectedLinks: '2-3 links per month',
      topics: [
        'Peptide research guides',
        'Testing standards pages',
        'Supplier directory updates'
      ]
    }
  ];

  const timeline = [
    {
      phase: 'Month 1',
      goals: [
        'Set up Google Search Console & Analytics 4',
        'Reach out to 20 potential guest post sites',
        'Apply to 5-10 high-DA resource pages',
        'Join 3 industry directories'
      ]
    },
    {
      phase: 'Month 2',
      goals: [
        'Publish 2-3 guest posts',
        'Secure 5-8 resource page placements',
        'Begin HARO responses',
        'Establish lab testing partnerships'
      ]
    },
    {
      phase: 'Month 3',
      goals: [
        'Publish 2-3 more guest posts',
        'Reach out for broken link opportunities',
        'Secure 2-3 partnership mentions',
        'Achieve 20-30 total backlinks'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-stone-950 pt-32 pb-20">
      <SEO
        title="SEO Backlink & Authority Strategy | Red Helix Research"
        description="Comprehensive backlink building strategy for research peptide e-commerce. Guest posts, HARO, partnerships, and authority building."
        keywords="backlink strategy, SEO outreach, authority building, guest posting"
      />

      <div className="max-w-5xl mx-auto px-4">
        <Link to={createPageUrl('Home')}>
          <Button variant="outline" className="border-stone-600 text-stone-400 hover:text-[#dc2626] hover:border-[#dc2626] mb-8">
            ← Back to Home
          </Button>
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-5xl md:text-6xl font-black text-amber-50 mb-4">Backlink & Authority Strategy</h1>
          <p className="text-xl text-stone-300">Build domain authority and organic search rankings through strategic partnerships and content placement</p>
        </motion.div>

        {/* Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-stone-900/60 border border-stone-700 rounded-lg p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-amber-50 mb-4">Why Backlinks Matter</h2>
          <p className="text-stone-300 mb-4">
            Google treats backlinks as "votes of confidence" from other websites. For a new site like Red Helix Research (launched Jan 26, 2026), backlinks are critical for:
          </p>
          <ul className="space-y-2 text-stone-300">
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-[#dc2626] flex-shrink-0 mt-0.5" />
              <span>Domain Authority growth (helps all pages rank)</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-[#dc2626] flex-shrink-0 mt-0.5" />
              <span>Page Authority for individual product pages</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-[#dc2626] flex-shrink-0 mt-0.5" />
              <span>Referral traffic from high-quality sources</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-[#dc2626] flex-shrink-0 mt-0.5" />
              <span>Google crawl budget increase and faster indexing</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-[#dc2626] flex-shrink-0 mt-0.5" />
              <span>Competitive advantage in peptide supplier niche</span>
            </li>
          </ul>
        </motion.div>

        {/* Strategies */}
        <div className="space-y-8 mb-16">
          {strategies.map((strategy, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              viewport={{ once: true }}
              className="bg-stone-900/60 border border-stone-700 rounded-lg p-8"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-amber-50 mb-2">{strategy.title}</h3>
                  <p className="text-stone-300">{strategy.description}</p>
                </div>
                <div className="flex gap-4 ml-4">
                  <div className="text-right">
                    <p className="text-xs text-stone-400 uppercase">Effort</p>
                    <p className="text-sm font-bold text-[#dc2626]">{strategy.effort}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-stone-400 uppercase">Links/Month</p>
                    <p className="text-sm font-bold text-[#dc2626]">{strategy.expectedLinks}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-stone-400 uppercase font-semibold mb-3">Target Sites</p>
                  <ul className="space-y-2">
                    {strategy.targets.map((target, i) => (
                      <li key={i} className="text-stone-300 text-sm flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#dc2626]"></span>
                        {target}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-xs text-stone-400 uppercase font-semibold mb-3">Content Topics</p>
                  <ul className="space-y-2">
                    {strategy.topics.map((topic, i) => (
                      <li key={i} className="text-stone-300 text-sm flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#dc2626]"></span>
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-stone-700">
                <p className="text-xs text-stone-400 uppercase font-semibold mb-2">Timeline: {strategy.timeline}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 3-Month Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-stone-900/60 border border-stone-700 rounded-lg p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-amber-50 mb-8">3-Month Backlink Roadmap</h2>
          <div className="space-y-6">
            {timeline.map((item, idx) => (
              <div key={idx} className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-700 text-amber-50 font-bold">
                    {idx + 1}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-amber-50 mb-4">{item.phase}</h3>
                  <ul className="space-y-2">
                    {item.goals.map((goal, i) => (
                      <li key={i} className="text-stone-300 flex items-start gap-3">
                        <CheckCircle className="w-4 h-4 text-[#dc2626] flex-shrink-0 mt-0.5" />
                        {goal}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Tools & Resources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-stone-900/60 border border-stone-700 rounded-lg p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-amber-50 mb-6">Recommended SEO Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-amber-50 mb-4">Backlink Analysis</h3>
              <ul className="space-y-2 text-stone-300 text-sm">
                <li>• Ahrefs – Comprehensive backlink database</li>
                <li>• SEMrush – Domain authority tracking</li>
                <li>• Moz – Page authority metrics</li>
                <li>• Google Search Console – Free official tool</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-amber-50 mb-4">Outreach & Prospecting</h3>
              <ul className="space-y-2 text-stone-300 text-sm">
                <li>• HARO (Help A Reporter Out) – Free</li>
                <li>• Clearbit – Prospect research</li>
                <li>• Hunter.io – Email finding</li>
                <li>• Pitchbox – Outreach automation</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Outreach Template */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-stone-900/60 border border-stone-700 rounded-lg p-8"
        >
          <h2 className="text-2xl font-bold text-amber-50 mb-6">Guest Post Outreach Template</h2>
          <div className="bg-stone-950 rounded-lg p-6 text-stone-300 text-sm font-mono">
            <p className="mb-4">Subject: Guest Post Opportunity – Research Peptide Industry Transparency</p>
            <p className="mb-4">Hi [Editor Name],</p>
            <p className="mb-4">
              I noticed your excellent coverage of peptide research and industry standards. I'd like to contribute a guest post on "[Topic]" that would resonate with your audience.
            </p>
            <p className="mb-4">
              The post would cover [3 key points], backed by peer-reviewed research and industry insights. At Red Helix Research, we're focused on transparency and third-party testing in the peptide market.
            </p>
            <p className="mb-4">
              Would this interest your readers? I can provide the full 2,000-word article within [X days].
            </p>
            <p>
              Best regards,<br />
              Red Helix Research Team
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}