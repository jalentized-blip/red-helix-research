import React from 'react';
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How do I pay?",
    answer: "We accept cryptocurrency payments including Bitcoin (BTC), USDT, and USDC. After placing your order, you'll receive an email with the wallet address and payment instructions."
  },
  {
    question: "What does shipping cost?",
    answer: "Shipping is a flat rate of $15."
  },
  {
    question: "How fast will my order arrive?",
    answer: "Standard single-vial orders typically arrive within 3-5 business days. Kit orders (10-vial wholesale bundles) are our bulk wholesale option where we pass the savings directly to you — because of this, kit fulfillment may take up to 36 hours before shipping, with delivery typically 3-7 business days. Kit orders ship separately from any single-vial items and will arrive under a separate tracking number."
  },
  {
    question: "What are kit orders and why do they take longer?",
    answer: "Kit orders are our 10-vial wholesale bundles — we pass bulk pricing savings directly onto you. Because kits are fulfilled separately through our wholesale channel, they take a bit longer: up to 36 hours to process before shipping. Kit vials arrive unlabeled (standard for wholesale). You can identify your peptides by matching the batch number on the kit's box or the colored vial caps to the corresponding Certificate of Analysis posted at redhelixresearch.com/COAReports."
  },
  {
    question: "My lyophilized powder puck is broken/crumbled — is it damaged?",
    answer: "No — this is completely normal and does not affect the product in any way. Lyophilized (freeze-dried) peptide pucks are fragile by nature and frequently break or crumble during transit due to vibration and handling. The peptide is still 100% intact and fully usable. The active compound is distributed evenly throughout the powder regardless of physical form — whether it's one solid puck or a fine powder, you have the same amount of peptide. Simply proceed with your normal reconstitution protocol."
  },
  {
    question: "Is my order discreet?",
    answer: "Yes, all orders are shipped in plain, unmarked packaging with no indication of the contents. The sender name on the package will be a generic business name."
  },
  {
    question: "Can I cancel or change my order?",
    answer: "Orders can be modified or cancelled within 2 hours of placement, before payment is confirmed. Contact our support team immediately if you need to make changes."
  },
  {
    question: "Do you ship to my country?",
    answer: "Unfortunately, we currently only ship to customers within the United States."
  }
];

export default function FAQ() {
  return (
    <section className="py-24 px-4 bg-white relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-[#8B2635]/5 rounded-full blur-3xl -translate-x-1/2" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#8B2635] border border-[#8B2635] rounded-full mb-6">
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Protocol Intelligence</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-black tracking-tighter leading-none mb-6">
            KNOWLEDGE <br />
            <span className="text-[#8B2635]">BASE</span>
          </h2>
          <p className="text-slate-500 font-medium max-w-xl mx-auto">
            Essential information regarding acquisition protocols, logistics, and research safety standards.
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-slate-50 border border-slate-100 rounded-[32px] px-8 data-[state=open]:border-[#8B2635]/30 data-[state=open]:bg-white transition-all duration-300 shadow-sm"
              >
                <AccordionTrigger className="text-left text-black hover:text-[#8B2635] py-6 hover:no-underline font-black text-lg tracking-tight">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-500 font-medium pb-8 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}