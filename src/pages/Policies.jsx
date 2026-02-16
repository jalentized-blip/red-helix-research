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
    <div className="min-h-screen bg-white pt-32 pb-20">
      <SEO
        title="Policies & Disclaimer - Red Helix Research"
        description="Red Helix Research policies, terms of use, and disclaimers. For research use only. Lab-tested peptides with COA verification."
        keywords="peptide policies, research chemical disclaimer, terms of service, return policy"
      />

      <div className="max-w-4xl mx-auto px-4">
        {/* Navigation */}
        <Link to={createPageUrl('Home')}>
          <Button variant="outline" className="border-slate-200 text-slate-500 hover:text-[#dc2626] hover:border-[#dc2626] mb-8 rounded-2xl font-black uppercase tracking-widest text-[10px]">
            ← Back to Home
          </Button>
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tighter uppercase leading-none">Policies & <span className="text-[#dc2626]">Terms</span></h1>
          <p className="text-xl text-slate-500 font-medium">Important information about using Red Helix Research products</p>
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
              className="bg-slate-50 border border-slate-100 rounded-[32px] p-10 shadow-xl shadow-slate-200/50"
            >
              <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tighter uppercase">{section.title}</h2>
              <div className="text-slate-500 space-y-3 whitespace-pre-wrap text-sm leading-relaxed font-medium">
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
          className="mt-12 bg-white border border-red-100 rounded-[40px] p-12 text-center shadow-xl shadow-[#dc2626]/5 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-[#dc2626]" />
          <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter uppercase">Questions about our policies?</h3>
          <p className="text-slate-500 mb-8 font-medium max-w-xl mx-auto">
            Contact us through our support channels for clarification on any terms or policies.
          </p>
          <Link to={createPageUrl('Contact')}>
            <Button className="bg-[#dc2626] hover:bg-red-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs px-10 py-6">Contact Support</Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}