import React from 'react';
import { FlaskConical, ShieldCheck, Headphones, CheckCircle, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

const USMapIcon = () => (
  <svg viewBox="0 0 960 600" className="w-5 h-5 text-red-600 fill-current">
    <path d="M160,200 L180,190 L190,200 L200,190 L220,200 L210,220 L230,240 L220,260 L200,270 L180,260 L160,270 L150,250 L140,240 Z M300,150 L350,140 L380,160 L370,190 L340,200 L310,180 Z M400,180 L450,170 L480,190 L470,220 L430,230 Z M500,160 L550,155 L580,180 L570,210 L530,215 Z M100,250 L140,240 L150,270 L130,290 Z M250,280 L300,270 L320,300 L280,310 Z M350,290 L400,280 L420,310 L380,320 Z M450,300 L500,290 L520,320 L480,330 Z" />
  </svg>
);

export default function TrustBar() {
  const features = [
    { icon: FlaskConical, label: "Lab Tested Batches" },
    { icon: USMapIcon, label: "United States Shipping Only" },
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