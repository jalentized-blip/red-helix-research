import React from 'react';
import { ArrowLeft, Eye, DollarSign, Beaker } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

const StorySection = ({ icon: Icon, title, description, highlight, highlightSecondary }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="bg-stone-900/50 border border-stone-700 rounded-lg p-8"
  >
    <div className="flex items-start gap-4">
      <Icon className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
      <div>
        <h3 className="text-2xl font-bold text-amber-50 mb-3">{title}</h3>
        <p className="text-stone-300 leading-relaxed mb-3">{description}</p>
        {highlight && (
          <div className="mt-4 space-y-0">
            <p className="text-3xl font-black text-amber-50">{highlight}</p>
            {highlightSecondary && (
              <p className="text-3xl font-black text-barn-tan">{highlightSecondary}</p>
            )}
            <p className="text-white font-semibold text-lg mt-6 mb-3">Every Batch Tested. Every Result Trusted.</p>
            <p className="text-barn-tan text-sm">FOR RESEARCH AND LABORATORY USE ONLY</p>
          </div>
        )}
      </div>
    </div>
  </motion.div>
);

export default function About() {
  return (
    <div className="min-h-screen bg-stone-950 pt-32 pb-20">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-4 mb-20">
        <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-red-600 hover:text-red-500 mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-black text-amber-50 mb-6">
            Our Story: A Journey to Radical Transparency
          </h1>
          <p className="text-xl text-stone-300 leading-relaxed">
            Barn was born from frustration, research, and a commitment to change an industry built on hidden margins and false claims.
          </p>
        </motion.div>
      </div>

      {/* Story Timeline */}
      <div className="max-w-4xl mx-auto px-4 space-y-8 mb-20">
        {/* Chapter 1 */}
        <StorySection
          icon={Beaker}
          title="The Wake-Up Call: Men's Health Clinic Visit"
          description="It started with a visit to a men's health clinic. The prices quoted were shocking—premium markups on peptides that I quickly realized were completely unjustifiable. This sparked a question: 'What are these actually costing at source?'"
          highlight="This is where the investigation began."
        />

        {/* Chapter 2 */}
        <StorySection
          icon={DollarSign}
          title="The Pricing Illusion"
          description="I started researching US vendors and found something troubling: their prices were suspiciously low compared to the clinic, but the margins were still massive. I dug deeper into sourcing costs and realized vendors were pricing based on China suppliers at $5-15 per vial while marking up 300-500%. The catch? They were hiding this reality. US vendors claimed 'premium quality' while sourcing from the same places they wouldn't admit to. They'd invest thousands in marketing to create an illusion of exclusivity, then pocket the difference."
          highlight="PREMIUM QUALITY,"
          highlightSecondary="LAB VERIFIED"
        />

        {/* Chapter 3 */}
        <StorySection
          icon={Eye}
          title="The Transparency Lie"
          description="What really opened my eyes was the number of vendors claiming complete transparency. Their websites talked about 'American sourcing,' 'premium origins,' and 'quality assurance'—yet when asked about sourcing, they'd dodge the question. The industry standard became clear: sell the dream, hide the sourcing."
          highlight="'Transparency' became a marketing buzzword while actual transparency didn't exist."
        />

        {/* Chapter 4 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-red-600/10 to-amber-600/10 border border-red-600/30 rounded-lg p-10"
        >
          <h3 className="text-3xl font-bold text-amber-50 mb-4">
            Building Barn
          </h3>
          <p className="text-stone-300 leading-relaxed mb-6">
            We decided to flip the script entirely. No more hidden margins. No more false sourcing claims. Instead, we built Barn on a foundation of actual transparency:
          </p>
          <ul className="space-y-3 text-stone-300">
            <li className="flex items-start gap-3">
              <span className="text-red-600 font-bold mt-1">✓</span>
              <span><strong>Show Our Profit Margins:</strong> We openly display what we pay for peptides and what we charge. You know exactly how much we make on every product.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-600 font-bold mt-1">✓</span>
              <span><strong>Full Sourcing Disclosure:</strong> We tell you where our peptides come from, who our suppliers are, and why we chose them—without the marketing spin.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-600 font-bold mt-1">✓</span>
              <span><strong>Live COA Process:</strong> Watch as we send off batches for Janoshik testing. See the entire process from synthesis to certification. You get the reports before we do.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-600 font-bold mt-1">✓</span>
              <span><strong>The Ins and Outs:</strong> We break down everything—storage, handling, testing protocols, even our supplier vetting. There are no black boxes here.</span>
            </li>
          </ul>
        </motion.div>

        {/* Chapter 5 */}
        <StorySection
          icon={Eye}
          title="Why This Matters"
          description="The peptide research space deserves better. You deserve to know what you're buying, where it comes from, and what it actually costs to produce. When you buy from Barn, you're not just getting a product—you're getting the truth."
          highlight="Transparency isn't a feature we offer. It's our foundation."
        />
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-amber-50 mb-4">
            Ready to Experience Real Transparency?
          </h2>
          <p className="text-stone-300 mb-8 text-lg">
            Explore our products and see exactly what you're getting.
          </p>
          <Link to={createPageUrl('Home')}>
            <Button className="bg-red-700 hover:bg-red-600 text-amber-50 px-8 py-6 text-lg font-semibold">
              Shop Now
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}