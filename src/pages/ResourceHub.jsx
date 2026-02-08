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
    <div className="min-h-screen bg-white pt-32 pb-20">
      <SEO
        title="Resource Hub | Red Helix Research"
        description="Complete guide to all Red Helix Research tools, guides, and resources. Find calculators, education, support, and community."
        keywords="resources, guides, tools, education, support, research guides"
      />

      <div className="max-w-6xl mx-auto px-4">
        <Link to={createPageUrl('Home')}>
          <Button variant="outline" className="border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-600 mb-8 rounded-full font-bold uppercase tracking-wider text-xs">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-4 uppercase tracking-tighter">Resource <span className="text-red-600">Hub</span></h1>
          <p className="text-xl text-slate-500 font-medium">Everything you need for research, learning, and success</p>
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
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <IconComponent className={`w-6 h-6 ${category.color}`} />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">{category.category}</h2>
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
                      className="group bg-white border border-slate-200 rounded-2xl p-6 hover:border-red-600 hover:shadow-xl transition-all shadow-sm"
                    >
                      <h3 className="font-black text-slate-900 mb-2 group-hover:text-red-600 transition uppercase tracking-tight text-lg">
                        {item.title}
                      </h3>
                      <p className="text-sm text-slate-500 mb-4 font-medium">{item.description}</p>
                      <span className="text-xs font-black text-red-600 flex items-center gap-1 uppercase tracking-widest">
                        Access Resource <ChevronRight className="w-3 h-3" />
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
          className="bg-slate-50 border border-slate-200 rounded-[32px] p-8 md:p-12 mt-16 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
            <Zap className="w-64 h-64 text-slate-900" />
          </div>
          
          <div className="relative z-10">
            <h2 className="text-3xl font-black text-slate-900 mb-8 uppercase tracking-tight">Quick Start for New Researchers</h2>
            <ol className="space-y-6">
              <li className="flex items-start gap-4">
                <span className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 shadow-lg shadow-red-200">1</span>
                <div>
                  <span className="text-slate-900 font-bold block mb-1">Learn Basics</span>
                  <span className="text-slate-500 font-medium">Start with our <Link to={createPageUrl('LearnMore')} className="text-red-600 hover:text-red-700 underline font-bold">Research Database</Link> to understand available peptides</span>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 shadow-lg shadow-slate-200">2</span>
                <div>
                  <span className="text-slate-900 font-bold block mb-1">Calculate Protocol</span>
                  <span className="text-slate-500 font-medium">Use the <Link to={createPageUrl('PeptideCalculator')} className="text-red-600 hover:text-red-700 underline font-bold">Peptide Calculator</Link> to plan your research</span>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 shadow-lg shadow-slate-200">3</span>
                <div>
                  <span className="text-slate-900 font-bold block mb-1">Compare Options</span>
                  <span className="text-slate-500 font-medium">Compare efficacy using our <Link to={createPageUrl('PeptideComparison')} className="text-red-600 hover:text-red-700 underline font-bold">Comparison Tool</Link></span>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 shadow-lg shadow-slate-200">4</span>
                <div>
                  <span className="text-slate-900 font-bold block mb-1">Verify Quality</span>
                  <span className="text-slate-500 font-medium">Review <Link to={createPageUrl('COAReports')} className="text-red-600 hover:text-red-700 underline font-bold">COA Reports</Link> to ensure batch purity</span>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 shadow-lg shadow-red-200">5</span>
                <div>
                  <span className="text-slate-900 font-bold block mb-1">Execute Research</span>
                  <span className="text-slate-500 font-medium">Follow our <Link to={createPageUrl('BlogGuide')} className="text-red-600 hover:text-red-700 underline font-bold">Reconstitution Guides</Link> for precise results</span>
                </div>
              </li>
            </ol>
          </div>
        </motion.div>
      </div>
    </div>
  );
}