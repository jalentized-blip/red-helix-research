import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { FlaskConical, Truck, Building2, ShieldCheck } from "lucide-react";

const trustPoints = [
  {
    icon: FlaskConical,
    title: "Tested By Leading American 3rd Party Labs",
    description: "Every compound batch is independently verified by industry-leading third-party labs; ensuring purity, consistency, and confidence in your research."
  },
  {
    icon: Truck,
    title: "Free Shipping For Orders Over $300",
    description: "We offer free FedEx Expedited Shipping for orders over $300 within the US, and international orders over $500."
  },
  {
    icon: Building2,
    title: "cGMP Certified Lyophilization",
    description: "Our compounds are produced in FDA-audited, cGMP-certified facilities to meet the highest standards for quality and safety."
  }
];

export default function WhyTrustUs() {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-stone-900/50 to-stone-950">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-6"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            <span className="text-amber-50">Why Researchers Trust</span>
            <br />
            <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
              Red Helix Research
            </span>
          </h2>
          <p className="text-stone-300 text-lg">
            Transparent. Tested. Trusted.
          </p>
          <p className="text-stone-400 text-sm mt-2">
            Premium Quality. Same Day Worldwide Shipping. Rigorously 3rd Party Tested.
          </p>
        </motion.div>

        {/* Shop Now Button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex justify-center mb-16"
        >
          <Button 
            onClick={() => scrollTo('products')}
            className="bg-red-700 hover:bg-red-600 text-amber-50 font-bold px-8 py-6 text-lg uppercase tracking-wide"
          >
            Shop Now!
          </Button>
        </motion.div>

        {/* Trust Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {trustPoints.map((point, index) => (
            <motion.div
              key={point.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
              viewport={{ once: true }}
            >
              <Card className="h-full bg-stone-900/60 border-stone-700 hover:border-red-700/40 transition-all duration-300 p-6 text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-700/10 border border-red-700/30 mb-6 group-hover:bg-red-700/20 transition-colors">
                  <point.icon className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-amber-50 mb-3 group-hover:text-red-600 transition-colors">
                  {point.title}
                </h3>
                <p className="text-stone-300 text-sm leading-relaxed">
                  {point.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}