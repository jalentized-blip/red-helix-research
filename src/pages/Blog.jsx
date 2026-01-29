import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import SEO from '@/components/SEO';
import ResearchDisclaimer from '@/components/ResearchDisclaimer';

const blogPosts = [
  {
    id: 1,
    title: 'Understanding Peptide Purity: What COA Testing Reveals',
    excerpt: 'Learn what Certificate of Analysis testing tells you about peptide quality, purity levels, and how to interpret COA reports from third-party laboratories.',
    content: `Certificates of Analysis (COA) are fundamental documents in the research peptide industry. They provide third-party verification of product quality, purity, and composition.

## What Does COA Testing Include?

Professional COA testing examines:
- Molecular identity (confirming the compound is what it claims to be)
- Purity percentage (typically 98%+ for research grade)
- Impurity analysis (detecting contaminants)
- Moisture content
- Microbial testing

## Reading Your COA Report

When reviewing a COA, look for:
1. Testing laboratory name and accreditation
2. Batch number matching your product
3. Date of analysis
4. Specific compound tested
5. Methodology used (HPLC, GC-MS, etc.)

## Why Third-Party Verification Matters

Independent laboratory testing ensures objectivity. Red Helix Research uses accredited facilities to verify all products, providing transparency you can trust.`,
    date: '2026-01-20',
    author: 'Red Helix Research',
    category: 'Quality & Testing'
  },
  {
    id: 2,
    title: 'Proper Storage and Handling of Research Peptides',
    excerpt: 'Best practices for storing research peptides to maintain integrity and purity. Temperature, humidity, and container recommendations.',
    content: `Proper storage is critical for maintaining peptide quality and efficacy in research applications.

## Storage Temperature Guidelines

Most research peptides require:
- Room temperature (20-25°C) for short-term storage
- Refrigeration (2-8°C) for extended storage
- Freezer storage (-20°C or lower) for long-term preservation

## Container Requirements

Use sterile, airtight containers:
- Glass vials with rubber seals
- Nitrogen-flushed containers for sensitive compounds
- Avoid plastic containers that may interact with peptides
- Keep original packaging when possible

## Humidity Control

- Store in dry environments (below 60% humidity)
- Use desiccant packets in storage containers
- Avoid condensation by maintaining consistent temperatures
- Keep away from direct sunlight

## Handling Best Practices

- Use sterile techniques when accessing products
- Minimize exposure to air
- Avoid contamination from foreign materials
- Document storage conditions and dates`,
    date: '2026-01-15',
    author: 'Red Helix Research',
    category: 'Storage & Handling'
  },
  {
    id: 3,
    title: 'Introduction to Research Peptides: A Beginner\'s Guide',
    excerpt: 'New to research peptides? Learn the basics about what peptides are, how they\'re synthesized, and their role in scientific research.',
    content: `Research peptides are short chains of amino acids used in laboratory and academic research. Understanding the basics helps researchers select appropriate compounds for their studies.

## What Are Peptides?

Peptides are amino acid chains containing 2-50 amino acids. They differ from proteins by size and are fundamental building blocks in biological systems.

## Types of Research Peptides

Research peptides are categorized by:
- Intended research application
- Source (synthetic vs. natural)
- Purity level
- Modifications (acetylation, amidation, etc.)

## Common Research Applications

- Weight loss studies
- Recovery and healing research
- Cognitive enhancement investigations
- Performance optimization studies
- Anti-aging research

## Quality Standards

Research-grade peptides typically meet:
- 98% or higher purity
- Verified identity through COA
- Microbial contamination testing
- Proper storage documentation

## Getting Started

Begin with reputable suppliers who provide:
- Complete COA documentation
- Proper storage guidelines
- Research support materials
- Customer verification processes`,
    date: '2026-01-10',
    author: 'Red Helix Research',
    category: 'Education'
  }
];

export default function Blog() {
  const sortedPosts = useMemo(() => {
    return [...blogPosts].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, []);

  return (
    <div className="min-h-screen bg-stone-950 pt-32 pb-20">
      <SEO
        title="Research Peptides Blog - Education & Industry Insights"
        description="Learn about research peptides, COA testing, peptide storage, and best practices. Educational content for peptide researchers."
        keywords="peptide blog, research peptides education, COA testing guide, peptide storage, research chemistry"
      />

      <div className="max-w-4xl mx-auto px-4">
        {/* Navigation */}
        <Link to={createPageUrl('Home')}>
          <Button variant="outline" className="border-stone-600 text-stone-400 hover:text-red-600 hover:border-red-600 mb-8">
            ← Back to Home
          </Button>
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-5xl md:text-6xl font-black text-amber-50 mb-4">Research Peptides Blog</h1>
          <p className="text-xl text-stone-300">Educational content about research peptides, quality standards, and best practices</p>
        </motion.div>

        {/* Research Disclaimer */}
        <ResearchDisclaimer />

        {/* Blog Posts */}
        <div className="space-y-8">
          {sortedPosts.map((post, idx) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="bg-stone-900/60 border border-stone-700 rounded-lg p-8 hover:border-red-600/50 transition-all cursor-pointer group"
            >
              <div className="mb-4 flex gap-4 text-sm text-stone-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(post.date).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {post.author}
                </span>
                <span className="px-3 py-1 bg-red-600/10 text-red-600 rounded-full text-xs font-semibold">
                  {post.category}
                </span>
              </div>

              <h2 className="text-2xl font-bold text-amber-50 mb-3 group-hover:text-red-400 transition-colors">
                {post.title}
              </h2>

              <p className="text-stone-300 mb-4">{post.excerpt}</p>

              <Button className="bg-red-600 hover:bg-red-700">Read Full Article</Button>
            </motion.div>
          ))}
        </div>

        {/* Subscribe Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 bg-gradient-to-r from-red-900/20 to-red-800/10 border border-red-700/30 rounded-lg p-8 text-center"
        >
          <h3 className="text-2xl font-bold text-amber-50 mb-3">Stay Updated</h3>
          <p className="text-stone-300 mb-6">
            Follow us on Discord for latest research peptide updates, education, and community discussions.
          </p>
          <Button
            onClick={() => window.open('https://discord.gg/s78Jeajp', '_blank')}
            className="bg-red-600 hover:bg-red-700"
          >
            Join Our Discord Community
          </Button>
        </motion.div>
      </div>
    </div>
  );
}