import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Shield, Lock, AlertCircle } from 'lucide-react';
import SEO from '@/components/SEO';

export default function PaymentSecurity() {
  const paymentMethods = [
    {
      method: 'Credit Card (Stripe)',
      setup: 'Integrated via Stripe for PCI compliance',
      security: 'Level 3A PCI DSS certified processor',
      fees: '2.9% + $0.30 per transaction',
      payout: '2 business days',
      status: 'ACTIVE',
      advantages: ['Most popular', 'Instant processing', 'Dispute protection']
    },
    {
      method: 'Cryptocurrency (Bitcoin/Ethereum)',
      setup: 'Accept via Coinbase Commerce',
      security: 'Immutable blockchain transactions',
      fees: '1% flat fee',
      payout: 'Instant or daily settlement',
      status: 'ACTIVE',
      advantages: ['No chargebacks', 'Lower fees', 'Privacy option']
    },
    {
      method: 'ACH Bank Transfer',
      setup: 'Setup via Stripe Connect',
      security: 'Bank-level encryption',
      fees: '$0.25 per transaction',
      payout: '5-7 business days',
      status: 'RECOMMENDED',
      advantages: ['Cheapest option', 'Direct bank', 'No fraud']
    }
  ];

  const securityMeasures = [
    {
      category: 'Payment Processing',
      measures: [
        'PCI DSS Level 3A Compliance (Stripe)',
        'SSL/TLS encryption on all transactions',
        'Tokenization of card data (no storage)',
        'Fraud detection algorithms',
        'Real-time transaction monitoring'
      ]
    },
    {
      category: 'Data Protection',
      measures: [
        'AES-256 encryption of sensitive data',
        'Secure customer database',
        'Regular security audits',
        'No storage of full card numbers',
        'GDPR/CCPA compliant practices'
      ]
    },
    {
      category: 'Account Security',
      measures: [
        'Two-factor authentication available',
        'Secure password hashing (bcrypt)',
        'Session timeouts',
        'IP address verification',
        'Suspicious activity alerts'
      ]
    },
    {
      category: 'Operational Security',
      measures: [
        'Employee background checks',
        'NDA/confidentiality agreements',
        'Secure admin access controls',
        'Data breach insurance',
        'Incident response plan'
      ]
    }
  ];

  const processingSteps = [
    {
      step: 1,
      title: 'Customer Initiates Payment',
      details: 'Customer enters payment information at checkout',
      security: 'HTTPS encrypted transmission'
    },
    {
      step: 2,
      title: 'Payment Validation',
      details: 'Stripe validates card/wallet and runs fraud checks',
      security: 'Tokenization, no card data stored'
    },
    {
      step: 3,
      title: 'Authorization Request',
      details: 'Request sent to customer\'s bank for approval',
      security: 'Encrypted bank communication'
    },
    {
      step: 4,
      title: 'Authorization Response',
      details: 'Bank approves or declines transaction',
      security: 'Secure response handling'
    },
    {
      step: 5,
      title: 'Order Processing',
      details: 'Approved payment triggers order fulfillment',
      security: 'Tokenized payment linked to order'
    },
    {
      step: 6,
      title: 'Payout to Business',
      details: 'Funds transferred to Red Helix bank account',
      security: 'Bank-level encryption'
    }
  ];

  const complianceChecklist = [
    { item: 'PCI DSS Level 3A Certification', status: '✅ Active' },
    { item: 'SSL Certificate (HTTPS)', status: '✅ Active' },
    { item: 'Privacy Policy', status: '✅ Published' },
    { item: 'Terms of Service', status: '✅ Published' },
    { item: 'Data Processing Agreement', status: '✅ Ready' },
    { item: 'GDPR Compliance', status: '✅ Compliant' },
    { item: 'CCPA Compliance', status: '✅ Compliant' },
    { item: 'Age Verification System', status: '✅ Implemented' },
    { item: 'Fraud Detection', status: '✅ Active' },
    { item: 'Security Audit Log', status: '✅ Enabled' }
  ];

  return (
    <div className="min-h-screen bg-stone-950 pt-32 pb-20">
      <SEO
        title="Payment Security & Compliance | Red Helix Research Admin"
        description="Payment processing security, PCI compliance, and fraud prevention systems."
        keywords="payment security, PCI compliance, fraud prevention, payment processing"
      />

      <div className="max-w-5xl mx-auto px-4">
        <Link to={createPageUrl('Home')}>
          <Button variant="outline" className="border-stone-600 text-stone-400 hover:text-red-600 hover:border-red-600 mb-8">
            ← Back to Home
          </Button>
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-5xl md:text-6xl font-black text-amber-50 mb-4">Payment Security</h1>
          <p className="text-xl text-stone-300">Enterprise-grade payment processing & fraud prevention</p>
        </motion.div>

        {/* Quick Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-900/20 to-green-800/10 border border-green-700/30 rounded-lg p-6 mb-12 flex items-center justify-between"
        >
          <div>
            <h2 className="text-2xl font-bold text-amber-50">Payment Processing Status</h2>
            <p className="text-stone-300 mt-1">All systems operational and compliant</p>
          </div>
          <Shield className="w-12 h-12 text-green-600" />
        </motion.div>

        {/* Payment Methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-amber-50 mb-6">Supported Payment Methods</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {paymentMethods.map((method, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-stone-900/60 border border-stone-700 rounded-lg p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-bold text-amber-50">{method.method}</h3>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    method.status === 'ACTIVE' ? 'bg-green-700/30 text-green-400' : 'bg-blue-700/30 text-blue-400'
                  }`}>
                    {method.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-stone-300 mb-4">
                  <p><strong>Setup:</strong> {method.setup}</p>
                  <p><strong>Security:</strong> {method.security}</p>
                  <p><strong>Fees:</strong> {method.fees}</p>
                  <p><strong>Payout:</strong> {method.payout}</p>
                </div>

                <div className="pt-4 border-t border-stone-700">
                  <p className="text-xs text-stone-400 font-semibold mb-2">Advantages:</p>
                  <ul className="space-y-1">
                    {method.advantages.map((adv, i) => (
                      <li key={i} className="text-xs text-stone-400">✓ {adv}</li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Security Measures */}
        <div className="space-y-6 mb-12">
          {securityMeasures.map((category, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              viewport={{ once: true }}
              className="bg-stone-900/60 border border-stone-700 rounded-lg p-8"
            >
              <h3 className="text-xl font-bold text-amber-50 mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-red-600" />
                {category.category}
              </h3>
              <ul className="space-y-2">
                {category.measures.map((measure, i) => (
                  <li key={i} className="text-stone-300 flex items-start gap-3">
                    <span className="text-green-600 font-bold mt-1">✓</span>
                    <span>{measure}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Payment Processing Flow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-stone-900/60 border border-stone-700 rounded-lg p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-amber-50 mb-6">Payment Processing Flow</h2>
          <div className="space-y-4">
            {processingSteps.map((item, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-red-700 text-amber-50 font-bold">
                    {item.step}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-amber-50 mb-1">{item.title}</h3>
                  <p className="text-sm text-stone-300 mb-2">{item.details}</p>
                  <p className="text-xs text-green-600 font-semibold">🔒 {item.security}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Compliance Checklist */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-stone-900/60 border border-stone-700 rounded-lg p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-amber-50 mb-6">Compliance Checklist</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {complianceChecklist.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-stone-800/30 rounded-lg">
                <span className="text-stone-300">{item.item}</span>
                <span className="text-green-500 font-bold">{item.status}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Fraud Prevention */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-red-900/20 to-red-800/10 border border-red-700/30 rounded-lg p-8"
        >
          <h2 className="text-2xl font-bold text-amber-50 mb-4 flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-red-600" />
            Fraud Prevention Systems
          </h2>
          <ul className="space-y-3 text-stone-300">
            <li className="flex items-start gap-3">
              <span className="text-red-600 font-bold">•</span>
              <span><strong>Real-time monitoring:</strong> All transactions scanned for suspicious patterns</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-600 font-bold">•</span>
              <span><strong>Velocity checks:</strong> Multiple rapid transactions from same account flagged</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-600 font-bold">•</span>
              <span><strong>Geolocation verification:</strong> IP address vs billing address checked</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-600 font-bold">•</span>
              <span><strong>3D Secure/CVV verification:</strong> Enhanced card verification</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-600 font-bold">•</span>
              <span><strong>Chargeback protection:</strong> Stripe handles disputes and fraud claims</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-600 font-bold">•</span>
              <span><strong>Manual review triggers:</strong> High-risk transactions manually reviewed</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}