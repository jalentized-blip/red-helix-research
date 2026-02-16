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
    title: "Order Ships",
    description: "Ships within 24–48h after payment confirms",
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
    <section className="py-24 px-4 bg-slate-50 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-1/4 h-full bg-[#dc2626]/5 -skew-x-12 translate-x-1/2" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#dc2626]/5 border border-[#dc2626]/10 rounded-full mb-6">
            <span className="text-[10px] font-black text-[#dc2626] uppercase tracking-widest">Efficiency Protocol</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none mb-6">
            ACQUISITION <br />
            <span className="text-[#dc2626]">WORKFLOW</span>
          </h2>
          <p className="text-slate-500 font-medium max-w-xl mx-auto">
            Our streamlined procurement process ensures maximum security and clinical-grade logistics handling.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 h-full flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-8 group-hover:border-[#dc2626]/30 transition-colors">
                  <step.icon className="w-8 h-8 text-[#dc2626]" />
                </div>
                
                <div className="absolute top-6 left-6 w-8 h-8 rounded-full bg-[#dc2626] text-white text-xs font-black flex items-center justify-center shadow-lg">
                  {step.number}
                </div>

                <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{step.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{step.description}</p>
              </div>
              
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-6 w-12 h-px bg-slate-200 z-0" />
              )}
            </motion.div>
          ))}
        </div>

        {/* Guarantees */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap items-center justify-center gap-12 py-10 bg-white rounded-[32px] border border-slate-100 shadow-sm"
          >
          {guarantees.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#dc2626]/5 flex items-center justify-center">
                <item.icon className="w-4 h-4 text-[#dc2626]" />
              </div>
              <span className="text-xs font-black text-slate-900 uppercase tracking-widest">{item.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}