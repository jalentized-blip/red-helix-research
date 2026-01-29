import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, BookOpen, Calculator, BarChart3, Users, Zap, Shield } from 'lucide-react';
import SEO from '@/components/SEO';

export default function ResourceHub() {
  const resources = [
    {
      category: 'Educational Guides',
      icon: BookOpen,
      color: 'text-blue-600',
      items: [
        {
          title: 'Peptide Reconstitution Guide',
          description: 'Step-by-step guide to safely reconstitute research peptides',
          link: createPageUrl('BlogGuide')
        },
        {
          title: 'Peptide Comparison Tool',
          description: 'Compare different peptides and their effects',
          link: createPageUrl('PeptideComparison')
        },
        {
          title: 'Learn More - Research Database',
          description: 'Comprehensive research information on all available peptides',
          link: createPageUrl('LearnMore')
        },
        {
          title: 'Research Guides',
          description: 'In-depth guides for various research protocols',
          link: createPageUrl('BlogGuide')
        }
      ]
    },
    {
      category: 'Tools & Calculators',
      icon: Calculator,
      color: 'text-green-600',
      items: [
        {
          title: 'Peptide Calculator',
          description: 'Calculate dosing, reconstitution, and concentrations',
          link: createPageUrl('PeptideCalculator')
        },
        {
          title: 'Order Tracking',
          description: 'Track your order status and shipping information',
          link: createPageUrl('OrderTracking')
        },
        {
          title: 'COA Verification',
          description: 'View and verify Certificates of Analysis',
          link: createPageUrl('COAReports')
        }
      ]
    },
    {
      category: 'Analytics & Insights',
      icon: BarChart3,
      color: 'text-purple-600',
      items: [
        {
          title: 'SEO Monitoring',
          description: 'Track keyword rankings and search visibility',
          link: createPageUrl('SEOMonitoring')
        },
        {
          title: 'Conversion Tracking',
          description: 'Understand customer journey and conversion metrics',
          link: createPageUrl('ConversionTracking')
        },
        {
          title: 'Email Automation Strategy',
          description: 'Learn our customer retention email strategy',
          link: createPageUrl('EmailAutomationStrategy')
        }
      ]
    },
    {
      category: 'Community & Support',
      icon: Users,
      color: 'text-orange-600',
      items: [
        {
          title: 'Customer Testimonials',
          description: 'Read verified reviews from researchers',
          link: createPageUrl('CustomerTestimonials')
        },
        {
          title: 'Contact Support',
          description: 'Reach out with questions or feedback',
          link: createPageUrl('Contact')
        },
        {
          title: 'PeppyBot AI Assistant',
          description: 'Chat with our AI research assistant',
          link: createPageUrl('PeppyBot')
        }
      ]
    },
    {
      category: 'Company Information',
      icon: Shield,
      color: 'text-red-600',
      items: [
        {
          title: 'Our Story',
          description: 'Learn about Red Helix Research mission',
          link: createPageUrl('OurStory')
        },
        {
          title: 'About Us',
          description: 'Our values, team, and commitment to quality',
          link: createPageUrl('About')
        },
        {
          title: 'Policies & Terms',
          description: 'Privacy policy, terms of service, disclaimers',
          link: createPageUrl('Policies')
        },
        {
          title: 'Customer Testimonials',
          description: 'What verified researchers say about us',
          link: createPageUrl('CustomerTestimonials')
        }
      ]
    },
    {
      category: 'Business Strategy (Admin)',
      icon: Zap,
      color: 'text-yellow-600',
      items: [
        {
          title: 'Launch Checklist',
          description: 'Pre-launch verification checklist',
          link: createPageUrl('LaunchChecklist')
        },
        {
          title: 'Competitive Positioning',
          description: 'Market strategy and competitive analysis',
          link: createPageUrl('CompetitivePositioning')
        },
        {
          title: 'Backlink Strategy',
          description: 'SEO link building and authority strategy',
          link: createPageUrl('BacklinkStrategy')
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-stone-950 pt-32 pb-20">
      <SEO
        title="Resource Hub | Red Helix Research"
        description="Complete guide to all Red Helix Research tools, guides, and resources. Find calculators, education, support, and community."
        keywords="resources, guides, tools, education, support, research guides"
      />

      <div className="max-w-6xl mx-auto px-4">
        <Link to={createPageUrl('Home')}>
          <Button variant="outline" className="border-stone-600 text-stone-400 hover:text-red-600 hover:border-red-600 mb-8">
            ← Back to Home
          </Button>
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
          <h1 className="text-5xl md:text-6xl font-black text-amber-50 mb-4">Resource Hub</h1>
          <p className="text-xl text-stone-300">Everything you need for research, learning, and success</p>
        </motion.div>

        {/* Resource Categories */}
        <div className="space-y-12">
          {resources.map((category, categoryIdx) => {
            const IconComponent = category.icon;
            return (
              <motion.div
                key={categoryIdx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: categoryIdx * 0.05 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <IconComponent className={`w-8 h-8 ${category.color}`} />
                  <h2 className="text-3xl font-bold text-amber-50">{category.category}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {category.items.map((item, itemIdx) => (
                    <motion.a
                      key={itemIdx}
                      href={item.link}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: itemIdx * 0.05 }}
                      viewport={{ once: true }}
                      className="group bg-stone-900/60 border border-stone-700 rounded-lg p-6 hover:border-red-700/50 hover:bg-stone-800/60 transition-all"
                    >
                      <h3 className="font-bold text-amber-50 mb-2 group-hover:text-red-400 transition">
                        {item.title}
                      </h3>
                      <p className="text-sm text-stone-400 mb-4">{item.description}</p>
                      <span className="text-xs font-semibold text-red-600 flex items-center gap-1">
                        Access Resource →
                      </span>
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Start */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-red-900/20 to-red-800/10 border border-red-700/30 rounded-lg p-8 mt-16"
        >
          <h2 className="text-2xl font-bold text-amber-50 mb-6">Quick Start for New Researchers</h2>
          <ol className="space-y-4 text-stone-300">
            <li className="flex items-start gap-3">
              <span className="text-red-600 font-bold min-w-fit">1. Learn</span>
              <span>Start with our <Link to={createPageUrl('LearnMore')} className="text-red-600 hover:text-red-400 underline">Research Database</Link> to understand available peptides</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-600 font-bold min-w-fit">2. Calculate</span>
              <span>Use the <Link to={createPageUrl('PeptideCalculator')} className="text-red-600 hover:text-red-400 underline">Peptide Calculator</Link> to plan your protocol</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-600 font-bold min-w-fit">3. Choose</span>
              <span>Compare options using our <Link to={createPageUrl('PeptideComparison')} className="text-red-600 hover:text-red-400 underline">Comparison Tool</Link></span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-600 font-bold min-w-fit">4. Order</span>
              <span>Place your order knowing every batch is 100% third-party tested</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-600 font-bold min-w-fit">5. Execute</span>
              <span>Follow our <Link to={createPageUrl('BlogGuide')} className="text-red-600 hover:text-red-400 underline">Reconstitution Guides</Link> for perfect results</span>
            </li>
          </ol>
        </motion.div>
      </div>
    </div>
  );
}