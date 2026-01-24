import React, { useState } from 'react';
import { ChevronDown, Zap, Shield, TrendingUp, Users, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ExpandableSection = ({ icon: Icon, title, content, examples }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-stone-900/50 border border-stone-700 rounded-lg overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-stone-800/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-barn-brown" />
          <h3 className="text-lg font-semibold text-amber-50">{title}</h3>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-stone-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-stone-700 px-4 py-4 bg-stone-950/50 space-y-4"
          >
            <p className="text-stone-300 leading-relaxed">{content}</p>

            {examples && examples.length > 0 && (
              <div className="space-y-3 mt-4">
                <p className="text-sm font-semibold text-barn-tan">Examples:</p>
                {examples.map((example, idx) => (
                  <div key={idx} className="bg-stone-900/80 border border-stone-800 rounded p-3">
                    <p className="text-xs text-stone-400 mb-1">{example.label}</p>
                    <p className="text-sm text-stone-300">{example.text}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function GrayMarketEducationModule() {
  return (
    <div className="bg-stone-950 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-amber-50 mb-3">
            Gray Market Innovation: Efficiency & Empowerment
          </h1>
          <p className="text-stone-400 text-lg">
            How decentralized research drives peptide science forward
          </p>
        </motion.div>

        {/* Main Content Sections */}
        <div className="space-y-4">
          <ExpandableSection
            icon={TrendingUp}
            title="Efficiency: Faster Innovation Cycles"
            content="The gray market operates with remarkable speed. Traditional pharma takes 10-15 years and billions to bring compounds to market. Gray market researchers can test, iterate, and document new formulations in months. This isn't reckless—it's agile research methodology. Smaller vendors can pivot quickly, source more efficiently, and pass savings to researchers. The barrier to entry being lower means more people can participate in peptide research, accelerating collective knowledge."
            examples={[
              {
                label: "Speed vs. Traditional Pharma",
                text: "New peptide variant identified → synthesized → tested → documented in 3-6 months vs. 10+ years in traditional channels"
              },
              {
                label: "Cost Efficiency",
                text: "Direct sourcing eliminates middlemen markups, making research accessible to independent scientists and institutions"
              },
              {
                label: "Rapid Feedback Loops",
                text: "Community documentation and COAs create real-time quality feedback, allowing vendors to improve batch consistency continuously"
              }
            ]}
          />

          <ExpandableSection
            icon={Users}
            title="Empowerment: Researcher Control & Transparency"
            content="Gray market peptides shift power to the researcher. You're not dependent on pharmaceutical companies deciding what compounds are worth developing. Independent researchers can explore compounds with genuine therapeutic potential that don't fit pharma's profit model. This democratization means serious scientists can conduct their own testing, maintain their own documentation, and build verifiable track records. Transparency becomes a competitive advantage—vendors who document honestly and consistently out-compete those who don't."
            examples={[
              {
                label: "Direct Sourcing Access",
                text: "Researchers can trace peptides from synthesis to testing, creating accountability at every step"
              },
              {
                label: "Community Verification",
                text: "Multiple independent COAs from the same batch create redundancy and confidence—better than relying on a single pharma-approved test"
              },
              {
                label: "Research Freedom",
                text: "Explore compounds that traditional pharma overlooks—compounds with real potential but smaller markets"
              }
            ]}
          />

          <ExpandableSection
            icon={Shield}
            title="Self-Testing Safety: Crowdsourced Quality Assurance"
            content="Here's where it gets interesting: independent testing through platforms like Janoshik actually creates a safety system. When researchers document their own COAs and share results, you get something pharma can't offer—transparent, real-time quality verification. One bad batch gets caught immediately and documented publicly. This crowdsourced accountability is theoretically safer than trusting a single corporate QA process. Researchers become participants in quality control, not passive consumers. Your due diligence becomes active research, not just blind faith."
            examples={[
              {
                label: "Decentralized Testing Model",
                text: "Multiple independent researchers test the same batch → results aggregated → inconsistencies detected faster than traditional single-lab testing"
              },
              {
                label: "Documentation Transparency",
                text: "Public COA records create a searchable history—you can see which batches passed, which failed, and why"
              },
              {
                label: "Researcher Accountability",
                text: "Bad actors get exposed quickly in tight research communities. Reputation is currency, creating strong incentives for honest sourcing"
              },
              {
                label: "Continuous Improvement",
                text: "Vendors who see test results in real-time can adjust protocols immediately, improving safety and consistency of future batches"
              }
            ]}
          />

          <ExpandableSection
            icon={Zap}
            title="Why This Matters for Peptide Research"
            content="The gray market has become the engine of peptide science innovation. It's where researchers who want to push boundaries can access compounds immediately, test them rigorously, and build knowledge. This isn't about shortcuts—it's about removing artificial barriers to research. When you have transparency, community verification, and rapid feedback loops, you actually get better safety outcomes than opacity would provide. The researchers winning in this space are the ones treating it seriously: proper documentation, multiple COAs, peer review, and honest communication."
            examples={[
              {
                label: "Real Impact",
                text: "Compounds discovered in gray market research are now being studied by mainstream researchers and institutions"
              },
              {
                label: "Knowledge Building",
                text: "Cumulative documentation creates an evidence base that didn't exist before—freely available to the research community"
              },
              {
                label: "Market Response",
                text: "Competition drives quality improvements—vendors competing on purity, consistency, and documentation win customer loyalty"
              }
            ]}
          />
        </div>

        {/* Disclaimers Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 20 }}
          className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-6 mt-12"
        >
          <div className="flex gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-yellow-400">Research & Educational Use Only</h3>
              <ul className="space-y-2 text-sm text-yellow-300">
                <li>✓ <strong>All peptides are for research purposes only.</strong> Not for human consumption, clinical use, or animal use.</li>
                <li>✓ <strong>Due diligence is essential.</strong> Verify COAs, check vendor history, and understand sourcing.</li>
                <li>✓ <strong>Personal responsibility.</strong> Any research activity is at your own discretion and risk.</li>
                <li>✓ <strong>Quality varies.</strong> Even in transparent markets, rigorous testing and documentation are your responsibility.</li>
                <li>✓ <strong>Know your regulations.</strong> Gray market research operates in legal gray areas—understand local laws before participation.</li>
                <li>✓ <strong>Peer review matters.</strong> Connect with other researchers, share findings responsibly, and contribute to collective knowledge.</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-barn-brown/10 to-barn-tan/10 border border-barn-brown/30 rounded-lg p-6 text-center mt-8"
        >
          <p className="text-stone-300 leading-relaxed">
            The future of peptide research isn't controlled by pharma timelines. It's driven by curious researchers who value transparency, rigor, and community. If you're serious about research, engage seriously with sources, documentation, and peer verification.
          </p>
        </motion.div>
      </div>
    </div>
  );
}