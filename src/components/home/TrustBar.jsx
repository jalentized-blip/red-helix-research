import React from 'react';
import { FlaskConical, ShieldCheck, Headphones, CheckCircle, RefreshCw, Package } from "lucide-react";
import { motion } from "framer-motion";

export default function TrustBar() {
  const features = [
    { icon: FlaskConical, label: "Lab Tested Batches" },
    { icon: Package, label: "United States Shipping Only" },
    { icon: ShieldCheck, label: "Secure Crypto Payments" },
    { icon: Headphones, label: "24h Support" },
  ];

  const payments = ["BTC", "USDT", "USDC"];

  return (
    <section className="bg-white border-y border-slate-100 py-10 relative overflow-hidden">
      <div className="absolute inset-0 bg-slate-50/50 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Features */}
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 mb-10">
          {features.map((feature, index) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 text-slate-600 group cursor-default"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:border-[#dc2626]/30 transition-colors shadow-sm">
                <feature.icon className="w-5 h-5 text-[#dc2626]" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest">{feature.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Payment & Guarantees */}
        <div className="flex flex-wrap items-center justify-center gap-10 pt-10 border-t border-slate-100">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Settlement:</span>
            <div className="flex gap-2">
              {payments.map((payment) => (
                <span
                  key={payment}
                  className="px-4 py-2 bg-white border border-slate-100 rounded-xl text-[10px] font-black text-slate-900 shadow-sm hover:border-[#dc2626]/30 transition-colors"
                >
                  {payment}
                </span>
              ))}
            </div>
          </div>
          
          <div className="hidden md:block w-px h-8 bg-slate-100" />
          
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 text-slate-600">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-[10px] font-black uppercase tracking-widest">Encrypted Checkout</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <RefreshCw className="w-4 h-4 text-[#dc2626]" />
              <span className="text-[10px] font-black uppercase tracking-widest">Delivery Assurance</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}