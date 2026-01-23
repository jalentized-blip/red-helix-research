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
    answer: "Shipping costs vary based on your location. US domestic orders typically cost $15-25, while international shipping ranges from $25-45. Exact costs will be calculated at checkout."
  },
  {
    question: "How fast will my order arrive?",
    answer: "US domestic orders typically arrive within 3-5 business days. International orders take 7-14 business days depending on your location and customs processing times."
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
    answer: "We ship to most countries worldwide. However, some regions have restrictions. Contact our support team to verify if we can ship to your specific location."
  }
];

export default function FAQ() {
  return (
    <section className="py-20 px-4 bg-neutral-950/50">
      <div className="max-w-3xl mx-auto">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
              Common Questions
            </span>
          </h2>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-neutral-900/60 border border-neutral-800 rounded-xl px-6 data-[state=open]:border-yellow-500/40"
              >
                <AccordionTrigger className="text-left text-white hover:text-yellow-400 py-5 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-neutral-400 pb-5">
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