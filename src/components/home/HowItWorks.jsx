import React from 'react';
import { motion } from "framer-motion";
import { ShoppingCart, Mail, Truck, Package, MapPin, RefreshCw } from "lucide-react";

const steps = [
  {
    number: "1",
    title: "Add to Cart",
    description: "Select your peptides and quantities",
    icon: ShoppingCart
  },
  {
    number: "2",
    title: "Receive Payment Details",
    description: "We'll email you the crypto wallet address",
    icon: Mail
  },
  {
    number: "3",
    title: "Await Confirmation",
    description: "You will receive detailed instructions via email",
    icon: Truck
  }
];

const guarantees = [
  { icon: Package, label: "Plain packaging" },
  { icon: MapPin, label: "Tracking included" },
  { icon: RefreshCw, label: "Reship policy available" }
];

export default function HowItWorks() {
  return (
    <section className="py-20 px-4 bg-neutral-950/50">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
              How It Works
            </span>
          </h2>
          <p className="text-neutral-400 text-lg">
            Simple, secure, and discreet
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
                <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-px bg-gradient-to-r from-yellow-500/50 to-transparent" />
              )}
              
              <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30">
                <span className="text-3xl font-black text-yellow-400">{step.number}</span>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
              <p className="text-neutral-400">{step.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Guarantees */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap items-center justify-center gap-6 pt-8 border-t border-neutral-800"
        >
          {guarantees.map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-neutral-400">
              <item.icon className="w-4 h-4 text-green-500" />
              <span className="text-sm">{item.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}