import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowRight, Beaker, FlaskConical, Brain, Heart, Flame, Shield, Zap } from 'lucide-react';

// Internal linking component for SEO cross-linking between peptide pages
const PEPTIDE_LINKS = {
  'BPC-157': {
    url: '/ProductBPC157',
    page: 'ProductBPC157',
    category: 'Recovery & Healing',
    icon: Heart,
    shortDesc: 'Gastric pentadecapeptide for tissue repair research',
    priceFrom: 49.99
  },
  'TB-500': {
    url: '/ProductTB500',
    page: 'ProductTB500',
    category: 'Recovery & Healing',
    icon: Shield,
    shortDesc: 'Thymosin Beta-4 fragment for wound healing studies',
    priceFrom: 59.99
  },
  'Semaglutide': {
    url: '/ProductSemaglutide',
    page: 'ProductSemaglutide',
    category: 'Weight Loss',
    icon: Flame,
    shortDesc: 'GLP-1 receptor agonist for metabolic research',
    priceFrom: 89.99
  },
  'Tirzepatide': {
    url: '/ProductTirzepatide',
    page: 'ProductTirzepatide',
    category: 'Weight Loss',
    icon: Zap,
    shortDesc: 'Dual GLP-1/GIP agonist for endocrine studies',
    priceFrom: 119.99
  }
};

const RESOURCE_LINKS = [
  { name: 'Research Guides', page: 'BlogGuide', desc: 'In-depth peptide research articles' },
  { name: 'Peptide Calculator', page: 'PeptideCalculator', desc: 'Reconstitution dosage calculator' },
  { name: 'COA Reports', page: 'COAReports', desc: 'Third-party lab test results' },
  { name: 'Peptide Academy', page: 'PeptideAcademy', desc: 'Free learning modules' },
  { name: 'Reconstitution Guide', page: 'PeptideReconstitutionGuide', desc: 'Step-by-step mixing instructions' },
  { name: 'FAQ', page: 'ExpandedFAQ', desc: 'Common questions answered' },
  { name: 'Peptide Comparison', page: 'PeptideComparison', desc: 'Compare peptides side-by-side' },
  { name: 'All Products', page: 'Products', desc: 'Browse full catalog' }
];

export function RelatedPeptides({ currentPeptide, maxItems = 3 }) {
  const related = Object.entries(PEPTIDE_LINKS)
    .filter(([name]) => name !== currentPeptide)
    .slice(0, maxItems);

  return (
    <div className="mt-12 md:mt-20">
      <h2 className="text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tighter mb-6 md:mb-8">
        Related <span className="text-[#dc2626]">Research Compounds</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {related.map(([name, data]) => {
          const Icon = data.icon;
          return (
            <Link key={name} to={createPageUrl(data.page)}>
              <div className="bg-white border border-slate-200 rounded-[24px] p-6 hover:border-[#dc2626]/30 hover:shadow-lg transition-all group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-[#dc2626]/10 rounded-xl">
                    <Icon className="w-5 h-5 text-[#dc2626]" />
                  </div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{data.category}</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-1 group-hover:text-[#dc2626] transition-colors">{name}</h3>
                <p className="text-slate-500 text-xs font-medium mb-3">{data.shortDesc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-slate-900">From ${data.priceFrom}</span>
                  <ArrowRight className="w-4 h-4 text-[#dc2626] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function ResourceLinks({ maxItems = 4 }) {
  return (
    <div className="mt-8 md:mt-12">
      <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter mb-4">
        Research <span className="text-[#dc2626]">Resources</span>
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {RESOURCE_LINKS.slice(0, maxItems).map((link) => (
          <Link key={link.page} to={createPageUrl(link.page)}>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 hover:border-[#dc2626]/20 hover:bg-white transition-all group">
              <p className="text-xs font-black text-slate-900 uppercase tracking-tight group-hover:text-[#dc2626] transition-colors">{link.name}</p>
              <p className="text-[10px] text-slate-400 font-medium mt-1">{link.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function InternalLinkFooter() {
  return (
    <div className="mt-16 md:mt-24 border-t border-slate-100 pt-8 md:pt-12">
      <div className="max-w-7xl mx-auto">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Explore Red Helix Research</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-3">
          {/* Product Links */}
          <div>
            <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-3">Products</p>
            {Object.entries(PEPTIDE_LINKS).map(([name, data]) => (
              <Link key={name} to={createPageUrl(data.page)} className="block text-xs text-slate-500 hover:text-[#dc2626] font-medium py-1 transition-colors">
                Buy {name} Peptide
              </Link>
            ))}
            <Link to={createPageUrl('Products')} className="block text-xs text-slate-500 hover:text-[#dc2626] font-medium py-1 transition-colors">
              All Research Peptides
            </Link>
            <Link to={createPageUrl('GroupBuy')} className="block text-xs text-slate-500 hover:text-[#dc2626] font-medium py-1 transition-colors">
              Group Buy Discounts
            </Link>
          </div>
          {/* Research Links */}
          <div>
            <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-3">Research</p>
            <Link to={createPageUrl('BlogGuide')} className="block text-xs text-slate-500 hover:text-[#dc2626] font-medium py-1 transition-colors">
              Peptide Research Guides
            </Link>
            <Link to={createPageUrl('PeptideAcademy')} className="block text-xs text-slate-500 hover:text-[#dc2626] font-medium py-1 transition-colors">
              Peptide Academy
            </Link>
            <Link to={createPageUrl('LearnMore')} className="block text-xs text-slate-500 hover:text-[#dc2626] font-medium py-1 transition-colors">
              Learn More
            </Link>
            <Link to={createPageUrl('PeptideComparison')} className="block text-xs text-slate-500 hover:text-[#dc2626] font-medium py-1 transition-colors">
              Compare Peptides
            </Link>
            <Link to={createPageUrl('PeptideGlossary')} className="block text-xs text-slate-500 hover:text-[#dc2626] font-medium py-1 transition-colors">
              Peptide Glossary
            </Link>
          </div>
          {/* Tools & Resources */}
          <div>
            <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-3">Tools</p>
            <Link to={createPageUrl('PeptideCalculator')} className="block text-xs text-slate-500 hover:text-[#dc2626] font-medium py-1 transition-colors">
              Peptide Calculator
            </Link>
            <Link to={createPageUrl('PeptideReconstitutionGuide')} className="block text-xs text-slate-500 hover:text-[#dc2626] font-medium py-1 transition-colors">
              Reconstitution Guide
            </Link>
            <Link to={createPageUrl('COAReports')} className="block text-xs text-slate-500 hover:text-[#dc2626] font-medium py-1 transition-colors">
              COA Reports
            </Link>
            <Link to={createPageUrl('ResourceHub')} className="block text-xs text-slate-500 hover:text-[#dc2626] font-medium py-1 transition-colors">
              Resource Hub
            </Link>
          </div>
          {/* Company */}
          <div>
            <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-3">Company</p>
            <Link to={createPageUrl('About')} className="block text-xs text-slate-500 hover:text-[#dc2626] font-medium py-1 transition-colors">
              About Us
            </Link>
            <Link to={createPageUrl('OurStory')} className="block text-xs text-slate-500 hover:text-[#dc2626] font-medium py-1 transition-colors">
              Our Story
            </Link>
            <Link to={createPageUrl('Contact')} className="block text-xs text-slate-500 hover:text-[#dc2626] font-medium py-1 transition-colors">
              Contact Us
            </Link>
            <Link to={createPageUrl('CustomerTestimonials')} className="block text-xs text-slate-500 hover:text-[#dc2626] font-medium py-1 transition-colors">
              Customer Reviews
            </Link>
            <Link to={createPageUrl('ExpandedFAQ')} className="block text-xs text-slate-500 hover:text-[#dc2626] font-medium py-1 transition-colors">
              FAQ
            </Link>
            <Link to={createPageUrl('Policies')} className="block text-xs text-slate-500 hover:text-[#dc2626] font-medium py-1 transition-colors">
              Policies & Terms
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default { RelatedPeptides, ResourceLinks, InternalLinkFooter };
