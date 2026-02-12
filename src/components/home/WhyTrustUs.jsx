import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { FlaskConical, Truck, Building2, ShieldCheck, Microscope, Database, ClipboardCheck } from "lucide-react";

const trustPoints = [
  {
    icon: Microscope,
    title: "ISO-Certified Analytics",
    subtitle: "Validated Purity",
    description: "Every compound batch undergoes rigorous HPLC and Mass Spectrometry analysis at independent ISO-certified facilities to ensure >99% purity."
  },
  {
    icon: Database,
    title: "Batch Traceability",
    subtitle: "Complete Transparency",
    description: "Full chain-of-custody documentation for every research compound. Access batch-specific Certificates of Analysis (COA) directly from our database."
  },
  {
    icon: Building2,
    title: "cGMP Standard Synthesis",
    subtitle: "Clinical Grade Facilities",
    description: "Our peptides are synthesized and lyophilized in state-of-the-art, FDA-inspected laboratories adhering to strict Current Good Manufacturing Practices."
  }
];

export default function WhyTrustUs() {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-32 px-4 bg-white relative overflow-hidden">
      {/* Background Decorative Elements - Subtle Medical Cleanliness */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(239,68,68,0.03),transparent_70%)]" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row items-end justify-between gap-8 mb-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600/5 border border-red-600/10 rounded-full mb-6">
              <ShieldCheck className="w-3 h-3 text-red-600" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600">Quality Assurance Protocol</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 leading-[0.9]">
              FOUNDATION OF <br />
              <span className="text-red-600">SCIENTIFIC TRUST</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:text-right"
          >
            <p className="text-slate-500 text-lg font-medium max-w-sm lg:ml-auto leading-relaxed mb-6">
              Red Helix Research establishes the industry benchmark for purity, transparency, and clinical-grade sourcing.
            </p>
            <Button 
              onClick={() => scrollTo('products')}
              className="bg-[#dc2626] hover:bg-[#b91c1c] text-white font-black px-10 py-8 text-sm uppercase tracking-[0.2em] rounded-2xl shadow-[0_10px_30px_-5px_rgba(220,38,38,0.2)] transition-all"
            >
              Enter Research Catalog
            </Button>
          </motion.div>
        </div>

        {/* Trust Cards Grid - Bright Clinical Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {trustPoints.map((point, index) => (
            <motion.div
              key={point.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="h-full bg-slate-50 border-slate-100 hover:border-red-600/30 transition-all duration-500 p-10 rounded-[40px] group relative overflow-hidden shadow-sm hover:shadow-xl">
                <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
                  <point.icon size={120} />
                </div>
                
                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center mb-8 group-hover:border-red-600/30 transition-colors shadow-sm">
                  <point.icon className="w-7 h-7 text-red-600" />
                </div>

                <div className="mb-6">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-red-600 transition-colors">
                    {point.subtitle}
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
                    {point.title}
                  </h3>
                </div>

                <p className="text-slate-500 text-sm leading-relaxed font-medium">
                  {point.description}
                </p>

                <div className="mt-8 pt-8 border-t border-slate-200/50 flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4 text-green-600/50" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protocol Verified</span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Scientific Compliance Footer - Brighter Design */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-20 p-8 bg-slate-50 border border-slate-100 rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-sm">
              <FlaskConical className="w-6 h-6 text-slate-400" />
            </div>
            <div>
              <p className="text-slate-900 text-sm font-bold uppercase tracking-wider">RUO Compliance</p>
              <p className="text-slate-500 text-xs font-medium">Research Use Only. Not for Human Consumption.</p>
            </div>
          </div>
          <div className="h-[1px] md:h-8 w-full md:w-[1px] bg-slate-200" />
          <div className="flex gap-12">
            <div className="text-center">
              <p className="text-slate-900 text-2xl font-black">99.8%</p>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Avg Purity</p>
            </div>
            <div className="text-center">
              <p className="text-slate-900 text-2xl font-black">4,500+</p>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Verified Batches</p>
            </div>
            <div className="text-center">
              <p className="text-slate-900 text-2xl font-black">24h</p>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Lab Response</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}