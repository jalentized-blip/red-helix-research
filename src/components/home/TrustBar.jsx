import React from 'react';
import { FlaskConical, Globe2, ShieldCheck, Headphones, CheckCircle, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

export default function TrustBar() {
  const features = [
    { icon: FlaskConical, label: "Lab Tested Batches" },
    { icon: Globe2, label: "Worldwide Shipping" },
    { icon: ShieldCheck, label: "Secure Crypto Payments" },
    { icon: Headphones, label: "24h Support" },
  ];

  const payments = ["BTC", "USDT", "USDC"];

  return (
    <section className="bg-neutral-900/80 border-y border-neutral-800 py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Features */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-10 mb-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="flex items-center gap-2 text-neutral-400"
            >
              <feature.icon className="w-5 h-5 text-yellow-500" />
              <span className="text-sm font-medium">{feature.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Payment & Guarantees */}
        <div className="flex flex-wrap items-center justify-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-sm text-neutral-500">We accept:</span>
            {payments.map((payment) => (
              <span
                key={payment}
                className="px-3 py-1.5 bg-neutral-800 rounded-lg text-xs font-semibold text-yellow-400 border border-neutral-700"
              >
                {payment}
              </span>
            ))}
          </div>
          
          <div className="hidden md:block w-px h-6 bg-neutral-700" />
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-neutral-400">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">100% Secure Checkout</span>
            </div>
            <div className="flex items-center gap-1.5 text-neutral-400">
              <RefreshCw className="w-4 h-4 text-green-500" />
              <span className="text-sm">Reship Guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}