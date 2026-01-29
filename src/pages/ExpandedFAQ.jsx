import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, ChevronDown, Search } from 'lucide-react';
import SEO from '@/components/SEO';

export default function ExpandedFAQ() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState({});

  const faqCategories = [
    {
      category: 'Products & Ordering',
      icon: '🧪',
      questions: [
        {
          id: 'product-purity',
          question: 'How pure are your peptides?',
          answer: 'All Red Helix peptides are ≥98% pure as verified by third-party HPLC analysis. Each batch includes a complete Certificate of Analysis with detailed purity, molecular weight, and identity verification.'
        },
        {
          id: 'product-testing',
          question: 'What testing does every peptide undergo?',
          answer: 'Every peptide batch undergoes: HPLC purity analysis, mass spectrometry verification, identity confirmation, and sterility testing. All results are published in our COAs.'
        },
        {
          id: 'product-strength',
          question: 'What do the strength numbers mean (mg, IU)?',
          answer: 'Strength indicates the concentration or dosage per vial. For example, BPC-157 5mg means 5 milligrams of active peptide. Higher strength = more potent per unit, requiring smaller injection volumes.'
        },
        {
          id: 'order-processing',
          question: 'How long does order processing take?',
          answer: 'Orders are prepared within 1-2 business days. Shipping takes 2-5 business days depending on location. You\'ll receive tracking information via email once shipped.'
        },
        {
          id: 'order-shipping',
          question: 'Where do you ship? International orders?',
          answer: 'We ship within the USA. International orders are not currently available. All packages are discreetly packaged with no identifying marks.'
        },
        {
          id: 'order-cost',
          question: 'Why is pricing higher than some competitors?',
          answer: 'Our pricing reflects superior quality: 98%+ purity (vs 80-90% at cheaper vendors), 100% third-party testing (vs self-reported), and expert support. Cost per mg of pure peptide is actually lower.'
        }
      ]
    },
    {
      category: 'Reconstitution & Use',
      icon: '💧',
      questions: [
        {
          id: 'reconstitute-basics',
          question: 'How do I reconstitute my peptides?',
          answer: 'Mix the powder with bacteriostatic water (included) in a sterile vial. Use our Peptide Calculator tool for exact measurements. Always use sterile technique to prevent contamination.'
        },
        {
          id: 'reconstitute-water',
          question: 'What type of water should I use?',
          answer: 'Always use Bacteriostatic Water for Injection (BWFI). This contains benzyl alcohol to prevent bacterial growth. Distilled water or tap water can introduce contamination.'
        },
        {
          id: 'reconstitute-storage',
          question: 'How long can reconstituted peptides be stored?',
          answer: 'Properly reconstituted peptides stored in the fridge (2-8°C) remain viable for 2-4 weeks. Once opened for use, use within 3-5 days. Never freeze after reconstitution.'
        },
        {
          id: 'reconstitute-accuracy',
          question: 'How do I measure accurate doses?',
          answer: 'Use our Peptide Calculator to determine exact mL per dose. Use insulin syringes (0.5mL or 1mL) for precision. Mark syringe markings based on your specific concentration.'
        },
        {
          id: 'reconstitute-injection',
          question: 'What\'s the best injection site and technique?',
          answer: 'Most peptides are injected subcutaneously (under skin) in stomach, thigh, or arm areas. Use sterile injection technique. See our Reconstitution Guide for detailed instructions. Consult medical literature for specific protocols.'
        },
        {
          id: 'reconstitute-sterility',
          question: 'How do I maintain sterile technique?',
          answer: 'Always: disinfect vials with alcohol swabs, use sterile syringes, maintain clean environment, avoid touching injection sites, dispose of needles safely. Our guides include detailed sterile technique instructions.'
        }
      ]
    },
    {
      category: 'Shipping & Delivery',
      icon: '📦',
      questions: [
        {
          id: 'shipping-tracking',
          question: 'How do I track my order?',
          answer: 'You\'ll receive a tracking number via email once your order ships. Use our Order Tracking page to monitor delivery status in real-time.'
        },
        {
          id: 'shipping-lost',
          question: 'What if my package is lost or damaged?',
          answer: 'Contact us immediately with photos of damage or delivery proof. We\'ll file a claim or resend your order. We guarantee safe delivery of all products.'
        },
        {
          id: 'shipping-customs',
          question: 'Will my package go through customs or inspection?',
          answer: 'All USA domestic orders are shipped via standard carriers. No customs issues for USA orders. Packages are discreetly labeled.'
        },
        {
          id: 'shipping-discrete',
          question: 'Are packages discreet/private?',
          answer: 'Yes. All packages are plain wrapped with no identifying marks. Return address is generic business name only. No packing materials reference peptides or research chemicals.'
        }
      ]
    },
    {
      category: 'Quality & Testing',
      icon: '✅',
      questions: [
        {
          id: 'quality-coa',
          question: 'What is included in the Certificate of Analysis?',
          answer: 'Each COA includes: HPLC purity percentage, molecular weight verification, identity confirmation via mass spec, batch number, testing date, and third-party lab details. Full reports available for review.'
        },
        {
          id: 'quality-verification',
          question: 'Can I verify the COA is legitimate?',
          answer: 'Yes. All COAs are from accredited third-party labs (HPLC certified). You can contact the lab directly to verify reports. We never fake or misrepresent testing.'
        },
        {
          id: 'quality-batch-consistency',
          question: 'Are all batches consistent?',
          answer: 'Yes. We source from the same suppliers and require ≥98% purity for every batch. Minor variation (98-99.5%) is normal for research chemistry, but all exceed minimum standards.'
        },
        {
          id: 'quality-retest',
          question: 'Can I have a peptide retested?',
          answer: 'Yes. If you have concerns about a batch, contact us. We can arrange retesting through our lab partners. We stand behind the quality of every peptide we sell.'
        }
      ]
    },
    {
      category: 'Account & Payments',
      icon: '💳',
      questions: [
        {
          id: 'account-create',
          question: 'Why should I create an account?',
          answer: 'Accounts let you: save favorite peptides, track order history, receive personalized recommendations, access exclusive deals, and manage your profile securely.'
        },
        {
          id: 'account-privacy',
          question: 'Is my information secure?',
          answer: 'Yes. We use SSL encryption, secure payment processing, and never share customer data. Read our Privacy Policy for complete details.'
        },
        {
          id: 'payment-methods',
          question: 'What payment methods do you accept?',
          answer: 'We accept credit cards (Visa, Mastercard, American Express), cryptocurrency (Bitcoin, Ethereum), and bank transfers. All payments are secure and encrypted.'
        },
        {
          id: 'payment-receipt',
          question: 'Do you send receipts?',
          answer: 'Yes. You\'ll receive an order confirmation email immediately after purchase, and a detailed receipt once the order ships.'
        },
        {
          id: 'payment-refund',
          question: 'What\'s your refund policy?',
          answer: 'Refunds are available within 7 days if the product is unopened and in original condition. Opened/used products cannot be refunded due to safety/sterility concerns. See Policies for details.'
        }
      ]
    },
    {
      category: 'Legal & Research Use',
      icon: '⚖️',
      questions: [
        {
          id: 'legal-use',
          question: 'Are these peptides legal?',
          answer: 'Our peptides are sold for research purposes only and are not approved for human consumption. Legality varies by location. Users are responsible for compliance with local laws.'
        },
        {
          id: 'legal-fda',
          question: 'Are these FDA approved?',
          answer: 'No. Research peptides are not FDA approved for human use. They are sold strictly for laboratory research and scientific study. Not for human consumption.'
        },
        {
          id: 'legal-liability',
          question: 'What is your liability if something goes wrong?',
          answer: 'Users assume all responsibility for use of research peptides. Red Helix Research is not liable for any consequences of misuse, improper handling, or non-research applications.'
        },
        {
          id: 'legal-age',
          question: 'What\'s the minimum age to order?',
          answer: 'You must be 18+ to order. We verify age at checkout. By purchasing, you confirm you\'re 18+, understand research use only, and accept all liability.'
        }
      ]
    },
    {
      category: 'Support & Contact',
      icon: '💬',
      questions: [
        {
          id: 'support-contact',
          question: 'How can I contact customer support?',
          answer: 'Email: jake@redhelixresearch.com | Discord: [invite link] | Telegram: @RedHelixResearch. We respond to emails within 4-8 hours during business days.'
        },
        {
          id: 'support-response',
          question: 'How fast do you respond to inquiries?',
          answer: 'Email responses: 4-8 hours (business days). Discord/Telegram: real-time when online. We prioritize urgent issues and research-related questions.'
        },
        {
          id: 'support-technical',
          question: 'Can you help with technical reconstitution questions?',
          answer: 'Yes. Our team can answer questions about calculations, storage, sterile technique, and general protocols. We cannot provide medical advice.'
        },
        {
          id: 'support-research',
          question: 'Do you provide research recommendations?',
          answer: 'We can discuss general research information but cannot recommend specific protocols or uses. See our Research Database for peer-reviewed information.'
        }
      ]
    }
  ];

  const toggleItem = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(q =>
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  const totalResults = filteredCategories.reduce((sum, cat) => sum + cat.questions.length, 0);

  return (
    <div className="min-h-screen bg-stone-950 pt-32 pb-20">
      <SEO
        title="Frequently Asked Questions | Red Helix Research"
        description="Complete FAQ about Red Helix Research peptides, ordering, reconstitution, shipping, quality, and customer support."
        keywords="FAQ, frequently asked questions, help, support, peptides, ordering, shipping"
      />

      <div className="max-w-4xl mx-auto px-4">
        <Link to={createPageUrl('Home')}>
          <Button variant="outline" className="border-stone-600 text-stone-400 hover:text-red-600 hover:border-red-600 mb-8">
            ← Back to Home
          </Button>
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-5xl md:text-6xl font-black text-amber-50 mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-stone-300">Find answers to common questions about our peptides and services</p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 relative"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
          <Input
            type="text"
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-stone-900/60 border-stone-700 text-amber-50"
          />
          {searchQuery && (
            <p className="text-xs text-stone-400 mt-2">
              Found {totalResults} result{totalResults !== 1 ? 's' : ''} in {filteredCategories.length} categor{filteredCategories.length !== 1 ? 'ies' : 'y'}
            </p>
          )}
        </motion.div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {filteredCategories.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-stone-900/60 border border-stone-700 rounded-lg p-8 text-center"
            >
              <p className="text-stone-400">No results found for "{searchQuery}". Try a different search term.</p>
            </motion.div>
          ) : (
            filteredCategories.map((category, catIdx) => (
              <motion.div
                key={catIdx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: catIdx * 0.05 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{category.icon}</span>
                  <h2 className="text-2xl font-bold text-amber-50">{category.category}</h2>
                </div>

                <div className="space-y-3">
                  {category.questions.map((question) => (
                    <motion.div
                      key={question.id}
                      initial={false}
                      className="bg-stone-900/60 border border-stone-700 rounded-lg overflow-hidden hover:border-red-700/30 transition"
                    >
                      <button
                        onClick={() => toggleItem(question.id)}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-stone-800/30 transition text-left"
                      >
                        <h3 className="font-semibold text-amber-50 pr-4">{question.question}</h3>
                        <ChevronDown
                          className={`w-5 h-5 text-red-600 flex-shrink-0 transition-transform ${
                            expandedItems[question.id] ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      <AnimatePresence>
                        {expandedItems[question.id] && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="border-t border-stone-700"
                          >
                            <p className="px-6 py-4 text-stone-300 leading-relaxed">
                              {question.answer}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Still Need Help */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-red-900/20 to-red-800/10 border border-red-700/30 rounded-lg p-8 mt-16 text-center"
        >
          <h3 className="text-2xl font-bold text-amber-50 mb-3">Still need help?</h3>
          <p className="text-stone-300 mb-6">Our support team is here to answer any questions</p>
          <Link to={createPageUrl('Contact')}>
            <Button className="bg-red-700 hover:bg-red-600">Contact Support</Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}