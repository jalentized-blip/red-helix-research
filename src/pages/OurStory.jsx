import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Eye, Zap, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import SEO from '@/components/SEO';

const Section = ({ icon: Icon, title, children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6 }}
    viewport={{ once: true }}
    className="mb-16"
  >
    <div className="flex items-start gap-4 mb-6">
      <div className="p-3 bg-red-600/20 rounded-lg flex-shrink-0">
        <Icon className="w-6 h-6 text-red-600" />
      </div>
      <h2 className="text-3xl lg:text-4xl font-bold text-amber-50">{title}</h2>
    </div>
    <div className="text-stone-300 text-lg leading-relaxed space-y-4">
      {children}
    </div>
  </motion.div>
);

export default function OurStory() {
  return (
    <div className="min-h-screen bg-stone-950 pt-32 pb-20">
      <SEO
        title="Our Story - Red Helix Research | Building a Transparent Peptide Community"
        description="Learn how Red Helix Research is building a transparent, community-driven peptide marketplace. We're focused on fair pricing, vendor accountability, and accessible research peptides for everyone."
        keywords="peptide community, transparent vendors, fair pricing peptides, gray market transparency, peptide ethics, research community, vendor accountability"
      />

      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <Link to={createPageUrl('Home')}>
          <Button variant="outline" className="border-stone-600 text-stone-400 hover:text-red-600 hover:border-red-600 mb-8">
            ← Back to Home
          </Button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <h1 className="text-5xl lg:text-6xl font-black text-amber-50 mb-6">Our Story</h1>
          <p className="text-xl text-stone-300 leading-relaxed">
            Red Helix Research wasn't built to maximize profit margins. We were built to solve a problem in the gray market that has plagued researchers, athletes, and health-conscious individuals for years: <span className="text-red-400 font-semibold">lack of transparency, vendor accountability, and fair pricing.</span>
          </p>
        </motion.div>

        {/* The Problem */}
        <Section icon={Eye} title="The Problem We Saw" delay={0.1}>
          <p>
            The peptide gray market is the wild west. Vendors operate with minimal accountability. Manufacturers price their products at costs far below what American resellers charge, yet customers have no way to verify quality, purity, or authenticity. Worse, there's no unified voice calling out bad actors.
          </p>
          <p>
            Customers are left guessing. Some get legitimate products. Others get underdosed vials, contaminated batches, or nothing at all. There's no community vetting system. No transparency about where products actually come from. No pressure on vendors to be honest about their pricing structure.
          </p>
          <p>
            We realized that the biggest barrier to the gray market improving wasn't regulations—it was <span className="font-semibold text-amber-100">community standards and collective accountability.</span>
          </p>
        </Section>

        {/* Our Vision */}
        <Section icon={Heart} title="What We Actually Want to Build" delay={0.2}>
          <p>
            Our primary mission isn't to become the biggest peptide vendor. It's to create a <span className="font-semibold text-amber-100">transparent, trustworthy community</span> where researchers, athletes, and health-conscious people feel confident in their purchases and supported by their peers.
          </p>
          <p>
            We want to be the vendor that proves the gray market can operate with integrity. We publish our COAs publicly. We share our margins openly. We listen to community feedback and actually change based on it. We're not hiding behind anonymity—we're building in the open.
          </p>
          <p>
            More importantly, we're investing in creating systems where the community itself vets vendors, shares real experiences, and calls out bad actors. A rising tide lifts all boats—when the gray market as a whole becomes more trustworthy, everyone wins.
          </p>
        </Section>

        {/* Pricing Philosophy */}
        <Section icon={Zap} title="Pricing That Actually Makes Sense" delay={0.3}>
          <p>
            Here's the reality: as a US-based vendor, we can get close to manufacturer costs on bulk orders. Some vendors charge 300-500% markups. We've decided our model is different.
          </p>
          <p>
            We price aggressively to pass savings directly to our customers. Not because we're altruistic—but because we believe <span className="font-semibold text-amber-100">if prices are fair, people will trust us, stay loyal, and help us build something bigger.</span>
          </p>
          <p>
            We'd rather have 1,000 satisfied customers buying consistently at fair prices than 100 customers paying premium markups. Sustainable business built on trust beats short-term profit extraction every single time. Our margins are tight, but our growth is strong because our customers believe in what we're doing.
          </p>
          <p>
            That said, we're not a charity. We need to cover our costs and stay viable. But we're transparent about our margins. If you ask us, we'll tell you roughly where our pricing sits relative to what we pay. That's the level of honesty the gray market needs.
          </p>
        </Section>

        {/* Community Vetting */}
        <Section icon={Users} title="Vetting Vendors Together" delay={0.4}>
          <p>
            We're building systems for the community to vet vendors collaboratively. This means creating spaces where people can share real experiences, COA verification, and honest feedback. It means celebrating vendors who do things right and calling out those who cut corners.
          </p>
          <p>
            We're working with researchers and community leaders to establish baseline standards. What should a vendor disclose? How should COAs be presented? What's a reasonable markup? By answering these questions as a collective, we create pressure on the entire market to step up.
          </p>
          <p>
            This isn't about protecting us from competition. It's about raising the bar for everyone. When your competitors are operating with integrity, you have to too.
          </p>
        </Section>

        {/* Forcing Transparency */}
        <Section icon={Eye} title="Forcing Transparency Into a Gray Market" delay={0.5}>
          <p>
            The gray market thrives on opacity. We're trying to change that by being radically transparent ourselves. Every COA we receive gets published. We share feedback and criticism. We admit when we make mistakes. We publish our sourcing information where we can.
          </p>
          <p>
            We're not naive—we understand there are legal and practical limits to transparency in the gray market. But within those constraints, we're pushing as hard as we can.
          </p>
          <p>
            When customers see a vendor being honest about what they don't know, how they source, and what guarantees they can and can't make—that builds trust faster than any marketing campaign ever could.
          </p>
        </Section>

        {/* Equal Access */}
        <Section icon={Heart} title="Equal and Fair Access" delay={0.6}>
          <p>
            We believe that access to affordable, quality peptides shouldn't be restricted to wealthy individuals or those with insider connections. Price should never be the barrier to fair access.
          </p>
          <p>
            Our goal is to make sure that whether you're a researcher in the US or someone with limited resources, you can access the same quality products at a fair price. We're exploring group buys, loyalty programs, and community pricing structures to make that real.
          </p>
          <p>
            We're also committed to keeping our products in stock and maintaining consistent pricing. Nothing kills trust faster than price gouging when supply is tight.
          </p>
        </Section>

        {/* The Reality Check */}
        <Section icon={Zap} title="The Reality Check" delay={0.7}>
          <p>
            We're not perfect. We don't have all the answers. There will be times when we make mistakes, face supply issues, or need to raise prices. But when that happens, we'll tell you why. We'll be honest about the tradeoffs.
          </p>
          <p>
            We're building this with the understanding that the gray market is temporary. Peptides will eventually be regulated differently. When that happens, we want to be remembered as the vendor that tried to do things right, that built community over profit, and that helped raise the bar for the entire industry.
          </p>
          <p>
            That's our story. We're not here just to sell peptides. We're here to build something that lasts—a community where everyone gets a fair shot.
          </p>
        </Section>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <p className="text-stone-400 mb-6">Ready to be part of this community?</p>
          <Link to={createPageUrl('Home')}>
            <Button className="bg-red-600 hover:bg-red-700 text-amber-50 px-8 py-6 text-lg">
              Shop With Us
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}