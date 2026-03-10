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
      title: '⚠️ CRITICAL LEGAL DISCLAIMER - RESEARCH USE ONLY',
      content: `ALL PRODUCTS SOLD ARE STRICTLY FOR IN-VITRO LABORATORY RESEARCH AND EDUCATIONAL PURPOSES ONLY.

❌ NOT FOR HUMAN CONSUMPTION, USE, OR INJECTION
❌ NOT APPROVED BY FDA FOR HUMAN OR VETERINARY USE  
❌ NOT INTENDED TO DIAGNOSE, TREAT, CURE, OR PREVENT ANY DISEASE

By purchasing, you LEGALLY CERTIFY that you are:
• 21+ years of age
• A qualified researcher or research institution
• Using products SOLELY for controlled laboratory research
• In compliance with all applicable federal, state, and local laws

LEGAL WARNING: Misuse of these research materials may violate the Federal Food, Drug, and Cosmetic Act and other regulations. Buyer assumes ALL liability and responsibility for proper handling, storage, and lawful use. We make NO medical claims and provide NO medical advice.`
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
      title: 'Returns, Refunds & Exchanges — ALL SALES FINAL',
      content: `ALL SALES ARE FINAL. NO RETURNS. NO REFUNDS. NO EXCHANGES.

Due to the inherently sensitive nature of lyophilized research peptides and biologics, Red Helix Research maintains a strict no-return, no-refund, no-exchange policy on all orders without exception. This policy exists for the following reasons:

PRODUCT INTEGRITY & DEGRADATION RISK
Research-grade peptides are highly sensitive biological compounds. Once a shipment leaves our facility, we cannot verify or guarantee that products have been stored at correct temperatures (−20°C frozen or 2–8°C refrigerated), protected from light and moisture, handled with proper sterile technique, or maintained in unopened, unaltered condition. Even brief exposure to improper conditions can degrade peptide purity and render them unsuitable for research. Because we cannot confirm the storage history of any returned product, we are unable to restock, resell, or vouch for the integrity of any returned item.

NO RETURNS ACCEPTED
We do not accept physical returns of any products under any circumstances — including but not limited to: unwanted orders, incorrect size or specification ordered, change of mind, or product not meeting personal expectations. Do not ship products back to us; they will not be accepted and no refund will be issued.

NO REFUNDS
Payments for all orders are final at the time of purchase. We do not issue full or partial refunds for any reason, including but not limited to: dissatisfaction with a product, delayed shipment, or incorrect order placed by the customer.

NO EXCHANGES
We do not offer product exchanges for any reason, including incorrect specifications ordered, preference for a different peptide, or dissatisfaction with concentration or format.

DAMAGED OR MISSING SHIPMENTS
The only exception to our policy applies strictly to orders that arrive physically damaged in transit or are confirmed lost by the carrier. In such cases:
• You must contact us at jake@redhelixresearch.com within 48 hours of the delivery date (or expected delivery date for lost packages)
• You must provide clear photographic evidence of the damaged product and packaging
• You must retain all original packaging and shipping materials
• A carrier claim will be filed on your behalf

If a carrier damage or loss claim is approved, we may, at our sole discretion, issue a store credit or replacement for the same item and quantity originally ordered. This is not a guarantee and is subject to carrier claim outcomes.

CHARGEBACKS & DISPUTES
By completing a purchase, you explicitly agree to this no-refund, no-return policy and acknowledge that initiating a chargeback for a legitimately placed order constitutes fraudulent activity. We retain detailed records of all transactions including order confirmations, IP addresses, device fingerprints, delivery confirmations, and consent timestamps for dispute resolution purposes.

By placing an order with Red Helix Research, you confirm that you have read, understood, and agreed to this policy in its entirety.`
    },
    {
      title: 'Payment Disputes & Chargebacks',
      content: `If you have any questions or concerns about a charge on your account, please contact us directly at jake@redhelixresearch.com BEFORE filing a dispute with your bank or credit card company. We are committed to resolving any issue quickly and fairly.

By placing an order, you agree that:
• You will contact Red Helix Research support before initiating any payment dispute or chargeback
• All orders are subject to our refund policy above
• Fraudulent chargebacks (disputing a legitimate charge you authorized) may result in account suspension and collection efforts
• We retain evidence of all transactions including consent timestamps, IP addresses, shipping confirmations, and order details for dispute resolution

If you do not recognize a charge from RED HELIX RESEARCH on your statement, please reach out to us first — we can provide order details and resolve confusion quickly.

We ship all orders with tracking and delivery confirmation. For orders over $150, signature confirmation may be required.`
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
• Card payments are processed through Square's secure, PCI-compliant platform
• Customer billing information is encrypted using industry-standard SSL/TLS
• All card transactions support 3D Secure (3DS) authentication for fraud prevention

For cryptocurrency payments:
- Transactions are processed directly on blockchain networks
- No payment card data ever touches our systems
- Your wallet maintains full custody of funds
- We only receive the necessary transaction hash for order verification

Card statement descriptor: Charges will appear as "RED HELIX RESEARCH" on your bank or credit card statement.

We audit our security practices regularly and maintain strict data protection protocols.`
    },
    {
      title: 'Age Verification',
      content: `Red Helix Research requires age verification (18+) for all customers. This is a legal requirement for research chemical vendors.

Age verification is performed via cookie-based system that respects your privacy while ensuring regulatory compliance.`
    },
    {
      title: 'Comprehensive Liability Waiver & Legal Agreement',
      content: `BY PURCHASING FROM RED HELIX RESEARCH, YOU ACKNOWLEDGE AND LEGALLY AGREE:

(1) You assume ALL RISKS associated with purchase, possession, handling, storage, and use of research materials.

(2) These products are RESEARCH CHEMICALS for laboratory use only and carry inherent risks if misused.

(3) Red Helix Research, its owners, officers, directors, employees, agents, and affiliates shall NOT be held liable for ANY damages, injuries, death, health complications, legal consequences, regulatory violations, criminal charges, civil penalties, or any other adverse effects resulting from misuse, human consumption, improper handling, unauthorized use, or violation of research-only designation.

(4) You INDEMNIFY and HOLD HARMLESS Red Helix Research from any and all claims, lawsuits, damages, losses, liabilities, costs, and expenses (including attorney fees) arising from your use, misuse, or possession of our products.

(5) You acknowledge that misuse may violate federal and state laws and that you are solely responsible for compliance with all applicable laws and regulations.

(6) Products are sold AS-IS for research purposes only with NO WARRANTIES of any kind, express or implied, including merchantability or fitness for any particular purpose.

(7) You are solely responsible for:
- Safe storage and handling of research chemicals
- Compliance with local, state, and federal laws
- Proper disposal of unused products  
- Any harm resulting from product misuse

This waiver survives any termination of purchase and represents a binding legal agreement.`
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
          <Button variant="outline" className="border-slate-200 text-slate-500 hover:text-[#8B2635] hover:border-[#8B2635] mb-8 rounded-2xl font-black uppercase tracking-widest text-[10px]">
            ← Back to Home
          </Button>
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-5xl md:text-7xl font-black text-black mb-6 tracking-tighter uppercase leading-none">Policies & <span className="text-[#8B2635]">Terms</span></h1>
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
              <h2 className="text-2xl font-black text-black mb-6 tracking-tighter uppercase">{section.title}</h2>
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
          className="mt-12 bg-white border border-red-100 rounded-[40px] p-12 text-center shadow-xl shadow-[#8B2635]/5 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-[#8B2635]" />
          <h3 className="text-3xl font-black text-black mb-4 tracking-tighter uppercase">Questions about our policies?</h3>
          <p className="text-slate-500 mb-8 font-medium max-w-xl mx-auto">
            Contact us through our support channels for clarification on any terms or policies.
          </p>
          <Link to={createPageUrl('Contact')}>
            <Button className="bg-[#8B2635] hover:bg-[#6B1827] text-white rounded-2xl font-black uppercase tracking-widest text-xs px-10 py-6">Contact Support</Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}