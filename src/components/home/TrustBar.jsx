import React from 'react';
import { FlaskConical, ShieldCheck, Headphones, CheckCircle, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

const BouncingVial = () => (
  <motion.svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    animate={{ y: [0, -8, 0] }}
    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
  >
    <path d="M7 6h10v2H7z" />
    <path d="M9 8v8c0 1.1.9 2 2 2s2-.9 2-2V8" />
    <path d="M8 8h8" />
    <path d="M10 16h4" />
    <circle cx="12" cy="6" r="1" fill="currentColor" />
  </motion.svg>
);

export default function TrustBar() {
  const features = [
    { icon: FlaskConical, label: "Lab Tested Batches" },
    { icon: Package, label: "United States Shipping Only" },
    { icon: ShieldCheck, label: "Secure Crypto Payments" },
    { icon: Headphones, label: "24h Support" },
  ];

  const payments = ["BTC", "USDT", "USDC"];

  return (
    <section className="bg-stone-900/80 border-y border-stone-700 py-6">
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
              className="flex items-center gap-2 text-stone-300"
            >
              <feature.icon className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium">{feature.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Payment & Guarantees */}
        <div className="flex flex-wrap items-center justify-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-sm text-stone-400">We accept:</span>
            {payments.map((payment) => (
              <span
                key={payment}
                className="px-3 py-1.5 bg-stone-800 rounded-lg text-xs font-semibold text-red-600 border border-stone-700"
              >
                {payment}
              </span>
            ))}
          </div>
          
          <div className="hidden md:block w-px h-6 bg-neutral-700" />
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-stone-300">
              <CheckCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm">100% Secure Checkout</span>
            </div>
            <div className="flex items-center gap-1.5 text-stone-300">
              <RefreshCw className="w-4 h-4 text-red-600" />
              <span className="text-sm">Reship Guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}