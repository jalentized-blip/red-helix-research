import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft } from 'lucide-react';
import SEO from '@/components/SEO';
import ResearchDisclaimer from '@/components/ResearchDisclaimer';

export default function Policies() {
  const sections = [
    {
      title: 'Disclaimer & Terms of Use',
      content: `Red Helix Research supplies research-grade peptides and compounds for laboratory research and educational purposes only. These products are NOT intended for human consumption, injection, or use in food or cosmetics.

Users of our products assume full responsibility for compliance with all applicable laws and regulations in their jurisdiction. We do not provide medical advice or recommendations for use beyond research applications.`
    },
    {
      title: 'Product Quality & Testing',
      content: `All Red Helix Research products undergo rigorous third-party laboratory testing. Each product includes a Certificate of Analysis (COA) documenting purity, identity, and composition. 

Testing is performed by independent accredited laboratories to ensure accuracy and transparency. COAs are available for download and verification through our website.`
    },
    {
      title: 'Shipping & Delivery',
      content: `We ship within the United States only. All orders include tracking and are carefully packaged to ensure product integrity during transit. Delivery times typically range from 2-7 business days depending on your location.

We do not ship internationally at this time.`
    },
    {
      title: 'Returns & Refunds',
      content: `Products must be returned unopened in original packaging for refunds. Return requests must be made within 14 days of purchase.

Items damaged during shipping are replaced at no cost. Please contact us immediately with photos of damage for processing.`
    },
    {
      title: 'Privacy & Data Protection',
      content: `We protect customer privacy and comply with applicable data protection regulations. Personal information is used only for order fulfillment and customer support.

We never share customer information with third parties without consent. All data is encrypted and securely stored.`
    },
    {
      title: 'Payment Security & PCI Compliance',
      content: `Red Helix Research maintains PCI-DSS compliance for secure payment processing:

• NO credit card data is stored on our servers
• All payment transactions use cryptocurrency blockchain technology
• Customer billing information is encrypted using industry-standard SSL/TLS
• We never have access to your wallet private keys or seed phrases
• Transaction data is securely transmitted and verified on-chain

For cryptocurrency payments:
- Transactions are processed directly on blockchain networks
- No payment card data ever touches our systems
- Your wallet maintains full custody of funds
- We only receive the necessary transaction hash for order verification

We audit our security practices regularly and maintain strict data protection protocols.`
    },
    {
      title: 'Age Verification',
      content: `Red Helix Research requires age verification (18+) for all customers. This is a legal requirement for research chemical vendors.

Age verification is performed via cookie-based system that respects your privacy while ensuring regulatory compliance.`
    },
    {
      title: 'Liability Waiver',
      content: `Red Helix Research disclaims all liability for misuse, improper handling, or unauthorized use of products. Users are solely responsible for:
      
- Safe storage and handling of research chemicals
- Compliance with local, state, and federal laws
- Proper disposal of unused products
- Any harm resulting from product misuse

By purchasing from Red Helix Research, you acknowledge full understanding and acceptance of these terms.`
    }
  ];

  return (
    <div className="min-h-screen bg-stone-950 pt-32 pb-20">
      <SEO
        title="Policies & Disclaimer - Red Helix Research"
        description="Red Helix Research policies, terms of use, and disclaimers. For research use only. Lab-tested peptides with COA verification."
        keywords="peptide policies, research chemical disclaimer, terms of service, return policy"
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
          <h1 className="text-5xl md:text-6xl font-black text-amber-50 mb-4">Policies & Terms</h1>
          <p className="text-xl text-stone-300">Important information about using Red Helix Research products</p>
        </motion.div>

        {/* Research Disclaimer */}
        <ResearchDisclaimer />

        {/* Policy Sections */}
        <div className="space-y-8">
          {sections.map((section, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="bg-stone-900/60 border border-stone-700 rounded-lg p-8"
            >
              <h2 className="text-2xl font-bold text-amber-50 mb-4">{section.title}</h2>
              <div className="text-stone-300 space-y-3 whitespace-pre-wrap text-sm leading-relaxed">
                {section.content}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 bg-gradient-to-r from-red-900/20 to-red-800/10 border border-red-700/30 rounded-lg p-8 text-center"
        >
          <h3 className="text-2xl font-bold text-amber-50 mb-3">Questions about our policies?</h3>
          <p className="text-stone-300 mb-6">
            Contact us through our support channels for clarification on any terms or policies.
          </p>
          <Link to={createPageUrl('Contact')}>
            <Button className="bg-red-600 hover:bg-red-700">Contact Support</Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}