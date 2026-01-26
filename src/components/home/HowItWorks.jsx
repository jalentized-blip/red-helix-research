import React from 'react';
import { motion } from "framer-motion";
import { ShoppingCart, Mail, Truck, Package, MapPin, RefreshCw } from "lucide-react";
import EditableText from '@/components/EditableText';

const steps = [
  {
    number: "1",
    title: "Add to Cart",
    description: "Select your peptides and quantities",
    icon: ShoppingCart,
    key: "step_1"
  },
  {
    number: "2",
    title: "Receive Payment Details",
    description: "We'll email you the crypto wallet address",
    icon: Mail,
    key: "step_2"
  },
  {
    number: "3",
    title: "Order Ships",
    description: "Ships within 24–48h after payment confirms",
    icon: Truck,
    key: "step_3"
  }
];

const guarantees = [
  { icon: Package, label: "Plain packaging" },
  { icon: MapPin, label: "Tracking included" },
  { icon: RefreshCw, label: "Reship policy available" }
];

export default function HowItWorks() {
  return (
    <section className="py-20 px-4 bg-stone-950/50">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
              <EditableText textKey="how_it_works_heading" defaultValue="How It Works" />
            </span>
          </h2>
          <p className="text-stone-300 text-lg">
            <EditableText textKey="how_it_works_subtitle" defaultValue="Simple, secure, and discreet" />
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
              viewport={{ once: true }}
              className="relative text-center"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-px bg-gradient-to-r from-red-700/50 to-transparent" />
              )}

              <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-red-700/20 to-red-800/10 border border-red-700/30">
                <span className="text-3xl font-black text-red-600">{step.number}</span>
              </div>

              <h3 className="text-xl font-bold text-amber-50 mb-2">
                <EditableText textKey={`${step.key}_title`} defaultValue={step.title} />
              </h3>
              <p className="text-stone-300">
                <EditableText textKey={`${step.key}_desc`} defaultValue={step.description} />
              </p>
            </motion.div>
          ))}
        </div>

        {/* Guarantees */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap items-center justify-center gap-6 pt-8 border-t border-stone-700"
          >
          {guarantees.map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-stone-300">
              <item.icon className="w-4 h-4 text-red-600" />
              <span className="text-sm">{item.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}