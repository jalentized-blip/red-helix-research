import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Network, CheckCircle } from 'lucide-react';
import SEO from '@/components/SEO';

export default function InternalLinkingStrategy() {
  const linkingStructure = [
    {
      page: 'Home',
      purpose: 'Hub - distributes authority to all other pages',
      internalLinks: [
        'ProductBPC157 (2-3 links)',
        'ProductTB500 (2-3 links)',
        'ProductSemaglutide (2-3 links)',
        'ProductTirzepatide (2-3 links)',
        'BlogGuide (1 link)',
        'PeptideCalculator (1 link)',
        'PeptideComparison (1 link)',
        'LearnMore (1 link)',
        'About (1 link)'
      ],
      anchorText: [
        'Buy BPC-157 peptide',
        'Shop research peptides',
        'Lab-tested TB-500',
        'Premium semaglutide research',
        'Research peptide guides',
        'Peptide calculator tool',
        'Compare research peptides'
      ]
    },
    {
      page: 'BlogGuide',
      purpose: 'Content hub - drives traffic to product pages',
      internalLinks: [
        'ProductBPC157 (at end of BPC-157 guide)',
        'ProductTB500 (at end of TB-500 guide)',
        'ProductSemaglutide (in reconstitution guide)',
        'Home (navigation)',
        'PeptideCalculator (in how-to sections)'
      ],
      anchorText: [
        'Buy verified BPC-157',
        'Order lab-tested TB-500',
        'Premium semaglutide',
        'Use our calculator'
      ]
    },
    {
      page: 'ProductBPC157',
      purpose: 'Product landing - converts traffic',
      internalLinks: [
        'Home (breadcrumb + back button)',
        'PeptideComparison (similar products)',
        'BlogGuide (BPC-157 guide link)',
        'PeptideCalculator (dosing tool)',
        'Cart (add to cart button)',
        'ProductTB500 (related products)'
      ],
      anchorText: [
        'View all products',
        'Compare with TB-500',
        'Read complete guide',
        'Calculate dosing',
        'Browse other peptides'
      ]
    },
    {
      page: 'ProductTB500',
      purpose: 'Product landing - converts traffic',
      internalLinks: [
        'Home (breadcrumb + back button)',
        'PeptideComparison (similar products)',
        'BlogGuide (TB-500 guide link)',
        'PeptideCalculator (dosing tool)',
        'ProductBPC157 (related products)',
        'ProductSemaglutide (related products)'
      ],
      anchorText: [
        'View all products',
        'Compare with other peptides',
        'Read TB-500 research guide',
        'Calculate reconstitution'
      ]
    },
    {
      page: 'PeptideComparison',
      purpose: 'Comparison hub - distributes to products',
      internalLinks: [
        'ProductBPC157 (specification details)',
        'ProductTB500 (specification details)',
        'ProductSemaglutide (specification details)',
        'ProductTirzepatide (specification details)',
        'BlogGuide (research guides)',
        'Home (back button)'
      ],
      anchorText: [
        'BPC-157 product page',
        'TB-500 peptide',
        'Shop semaglutide',
        'Buy tirzepatide',
        'Research guides'
      ]
    },
    {
      page: 'PeptideCalculator',
      purpose: 'Tool page - drives product knowledge',
      internalLinks: [
        'BlogGuide (reconstitution guide)',
        'Home (navigation)',
        'ProductBPC157 (example products)',
        'ProductTB500 (example products)',
        'ProductSemaglutide (example products)'
      ],
      anchorText: [
        'View detailed guide',
        'Calculate for BPC-157',
        'Calculate for TB-500',
        'More research resources'
      ]
    },
    {
      page: 'ProductSemaglutide',
      purpose: 'Product landing - converts traffic',
      internalLinks: [
        'Home (breadcrumb)',
        'PeptideComparison (compare peptides)',
        'BlogGuide (semaglutide info)',
        'PeptideCalculator (dosing)',
        'ProductTirzepatide (related products)'
      ],
      anchorText: [
        'Compare with TB-500',
        'View research guides',
        'Calculate your dose'
      ]
    },
    {
      page: 'ProductTirzepatide',
      purpose: 'Product landing - converts traffic',
      internalLinks: [
        'Home (breadcrumb)',
        'PeptideComparison (compare peptides)',
        'BlogGuide (metabolic research)',
        'PeptideCalculator (dosing)',
        'ProductSemaglutide (related products)'
      ],
      anchorText: [
        'Compare GLP-1 peptides',
        'View metabolic research',
        'Calculate reconstitution'
      ]
    }
  ];

  const bestPractices = [
    {
      title: 'Use Descriptive Anchor Text',
      description: 'Instead of "click here," use specific terms like "Buy lab-tested BPC-157" or "TB-500 research guide." This helps both users and search engines understand link context.',
      example: '❌ "Click here for peptides" → ✓ "Buy verified BPC-157 peptide"'
    },
    {
      title: 'Link to Relevant Content',
      description: 'Only link pages that are contextually related. From a TB-500 guide, link to TB-500 product page and similar peptides, not unrelated content.',
      example: 'From ProductBPC157 → Link to TB-500 (similar peptides) NOT to Cart directly'
    },
    {
      title: 'Create a Hierarchical Structure',
      description: 'Home → Category Hub (BlogGuide, PeptideComparison) → Specific Product Pages. This creates a logical flow that distributes authority effectively.',
      example: 'Home (distributes) → BlogGuide (secondary hub) → ProductBPC157 (product landing)'
    },
    {
      title: 'Use 2-3 Links Per Page Max',
      description: 'Too many internal links dilute authority. Focus on quality over quantity. Each link should serve a purpose.',
      example: 'Product page: 1 to related product, 1 to guide, 1 to calculator'
    },
    {
      title: 'Link from High-Authority Pages First',
      description: 'Home page (highest authority) should link heavily to target pages. BlogGuide (content hub) should link to products.',
      example: 'Home (5-8 internal links) → BlogGuide (4-6 links) → Product pages (2-3 links each)'
    },
    {
      title: 'Keep URLs SEO-Friendly',
      description: 'Use descriptive URLs with target keywords. Avoid numbers, dates, or parameters when possible.',
      example: '/ProductBPC157 is better than /product-123 or /p?id=bpc157'
    }
  ];

  return (
    <div className="min-h-screen bg-stone-950 pt-32 pb-20">
      <SEO
        title="Internal Linking Strategy for SEO | Red Helix Research Site Architecture"
        description="Comprehensive internal linking strategy to distribute authority across product pages and content hubs for maximum SEO impact."
        keywords="internal linking SEO, site architecture, link structure, anchor text optimization"
      />

      <div className="max-w-5xl mx-auto px-4">
        <Link to={createPageUrl('Home')}>
          <Button variant="outline" className="border-stone-600 text-stone-400 hover:text-[#dc2626] hover:border-[#dc2626] mb-8">
            ← Back to Home
          </Button>
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-5xl md:text-6xl font-black text-amber-50 mb-4">Internal Linking Strategy</h1>
          <p className="text-xl text-stone-300">Maximize SEO authority distribution across all pages</p>
        </motion.div>

        {/* Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-stone-900/60 border border-stone-700 rounded-lg p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-amber-50 mb-4 flex items-center gap-2">
            <Network className="w-6 h-6 text-[#dc2626]" />
            Why Internal Linking Matters
          </h2>
          <p className="text-stone-300 mb-4">
            Internal linking is one of the most underutilized SEO tactics. It allows you to:
          </p>
          <ul className="space-y-2 text-stone-300">
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-[#dc2626] flex-shrink-0 mt-0.5" />
              <span><strong>Distribute Authority:</strong> Pass "link juice" from high-authority pages to important product/content pages</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-[#dc2626] flex-shrink-0 mt-0.5" />
              <span><strong>Establish Site Hierarchy:</strong> Show Google which pages are most important</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-[#dc2626] flex-shrink-0 mt-0.5" />
              <span><strong>Improve Crawlability:</strong> Help Google discover and index all pages faster</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-[#dc2626] flex-shrink-0 mt-0.5" />
              <span><strong>Increase Relevance:</strong> Context from surrounding content boosts page rankings</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-[#dc2626] flex-shrink-0 mt-0.5" />
              <span><strong>Improve User Experience:</strong> Guide visitors to related, valuable content</span>
            </li>
          </ul>
        </motion.div>

        {/* Linking Structure */}
        <div className="space-y-8 mb-16">
          {linkingStructure.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              viewport={{ once: true }}
              className="bg-stone-900/60 border border-stone-700 rounded-lg p-8"
            >
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-amber-50 mb-2">{item.page}</h3>
                <p className="text-stone-400">{item.purpose}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <p className="text-xs text-stone-400 uppercase font-semibold mb-4">Internal Links To Include</p>
                  <ul className="space-y-2">
                    {item.internalLinks.map((link, i) => (
                      <li key={i} className="text-stone-300 text-sm flex items-start gap-2">
                        <span className="text-[#dc2626] font-bold mt-0.5">→</span>
                        <span>{link}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-xs text-stone-400 uppercase font-semibold mb-4">Recommended Anchor Text</p>
                  <ul className="space-y-2">
                    {item.anchorText.map((text, i) => (
                      <li key={i} className="text-amber-50 text-sm bg-red-700/20 border border-red-700/30 rounded px-3 py-2 font-semibold">
                        "{text}"
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Best Practices */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-3xl font-black text-amber-50 mb-8">Best Practices</h2>
          <div className="space-y-6">
            {bestPractices.map((practice, idx) => (
              <div key={idx} className="bg-stone-900/60 border border-stone-700 rounded-lg p-6">
                <h3 className="text-xl font-bold text-amber-50 mb-3 flex items-center gap-2">
                  <span className="text-[#dc2626] font-bold">#{idx + 1}</span>
                  {practice.title}
                </h3>
                <p className="text-stone-300 mb-3">{practice.description}</p>
                <div className="bg-stone-950 rounded px-3 py-2 text-sm font-mono text-stone-400">
                  {practice.example}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Authority Flow Diagram */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-stone-900/60 border border-stone-700 rounded-lg p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-amber-50 mb-6">Authority Flow Diagram</h2>
          <div className="space-y-4">
            <div className="text-center">
              <div className="bg-red-700 text-amber-50 font-bold py-4 px-6 rounded-lg inline-block">
                Home Page (Authority 100%)
              </div>
            </div>
            <div className="text-center text-stone-400">↓ Internal Links ↓</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-red-700/30 border border-red-700 text-amber-50 font-bold py-3 px-4 rounded-lg text-center">
                BlogGuide (40%)
              </div>
              <div className="bg-red-700/30 border border-red-700 text-amber-50 font-bold py-3 px-4 rounded-lg text-center">
                PeptideComparison (30%)
              </div>
              <div className="bg-red-700/30 border border-red-700 text-amber-50 font-bold py-3 px-4 rounded-lg text-center">
                LearnMore (30%)
              </div>
            </div>
            <div className="text-center text-stone-400">↓ Secondary Links ↓</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-red-700/20 border border-red-700/50 text-amber-50 py-2 px-3 rounded text-sm text-center">
                ProductBPC157
              </div>
              <div className="bg-red-700/20 border border-red-700/50 text-amber-50 py-2 px-3 rounded text-sm text-center">
                ProductTB500
              </div>
              <div className="bg-red-700/20 border border-red-700/50 text-amber-50 py-2 px-3 rounded text-sm text-center">
                ProductSemaglutide
              </div>
              <div className="bg-red-700/20 border border-red-700/50 text-amber-50 py-2 px-3 rounded text-sm text-center">
                ProductTirzepatide
              </div>
            </div>
          </div>
        </motion.div>

        {/* Implementation Checklist */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-red-900/20 to-red-800/10 border border-red-700/30 rounded-lg p-8"
        >
          <h2 className="text-2xl font-bold text-amber-50 mb-6">Implementation Checklist</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-[#dc2626] flex-shrink-0 mt-0.5" />
              <span className="text-stone-300">Home page links to all 5 main product pages</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-[#dc2626] flex-shrink-0 mt-0.5" />
              <span className="text-stone-300">BlogGuide links to 4 product pages at end of guides</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-[#dc2626] flex-shrink-0 mt-0.5" />
              <span className="text-stone-300">PeptideComparison links to all 4 product pages</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-[#dc2626] flex-shrink-0 mt-0.5" />
              <span className="text-stone-300">Each product page links to 2-3 related products</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-[#dc2626] flex-shrink-0 mt-0.5" />
              <span className="text-stone-300">All anchor text is descriptive and keyword-rich</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-[#dc2626] flex-shrink-0 mt-0.5" />
              <span className="text-stone-300">No link to external pages unless necessary</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-[#dc2626] flex-shrink-0 mt-0.5" />
              <span className="text-stone-300">Monitor internal link performance in Google Search Console</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}