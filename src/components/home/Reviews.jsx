import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Quote, Zap, ExternalLink } from "lucide-react";

const reviews = [
  {
    text: "Got my tirz order today, everything went really smooth from communication, delivery and shipping time. Ordered December 26th and received January 6th. Fairly fast for international, very satisfied!",
    author: "Jake",
    role: "Discord Member",
    date: "Jan 6, 2025",
    badge: "10 days international"
  },
  {
    text: "Second order with Red Dirt, same excellent experience. Quality is top notch and their customer support actually responds. Will definitely be ordering again.",
    author: "Marcus R.",
    role: "Discord Member",
    date: "Dec 28, 2024",
    badge: "Repeat Customer"
  },
  {
    text: "Fast shipping to EU, discreet packaging. The BPC-157 arrived in perfect condition. Very impressed with the professionalism.",
    author: "Elena",
    role: "Discord Member",
    date: "Jan 3, 2025",
    badge: "EU Shipping"
  }
];

export default function Reviews() {
  return (
    <section className="py-24 px-4 bg-slate-50 relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-1/2 right-0 w-64 h-64 bg-[#dc2626]/5 rounded-full blur-3xl translate-x-1/2" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#dc2626] border border-[#dc2626] rounded-full mb-6">
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Community Verification</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none mb-6 uppercase">
            Researcher <br />
            <span className="text-[#dc2626]">Feedback</span>
          </h2>
          <p className="text-slate-500 font-medium max-w-xl mx-auto">
            Verified analytical experiences and delivery reports from our global network of research partners.
          </p>
        </motion.div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {reviews.map((review, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full bg-white border-slate-100 p-8 relative rounded-[40px] shadow-sm hover:shadow-xl transition-all duration-500 group">
                <Quote className="absolute top-8 right-8 w-12 h-12 text-[#dc2626]/5 group-hover:text-[#dc2626]/10 transition-colors" />
                
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-2 h-2 rounded-full bg-[#dc2626]" />
                  <span className="text-[10px] font-black text-[#dc2626] uppercase tracking-widest">{review.badge}</span>
                </div>

                <blockquote className="text-slate-600 text-base leading-relaxed mb-8 font-medium">
                  "{review.text}"
                </blockquote>

                <div className="mt-auto pt-6 border-t border-slate-100">
                  <p className="font-black text-slate-900 uppercase tracking-tight text-lg">{review.author}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{review.role} • {review.date}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-slate-500 font-medium mb-8">Access our complete research community and live tracking reports.</p>
          <Button 
            className="bg-[#5865F2] hover:bg-[#4752C4] text-white px-10 py-8 rounded-2xl font-black uppercase tracking-widest text-lg shadow-lg hover:shadow-[#5865F2]/20 transition-all hover:-translate-y-1"
            onClick={() => window.open('https://discord.gg/s78Jeajp', '_blank')}
          >
            <ExternalLink className="w-6 h-6 mr-3" />
            JOIN DISCORD REPOSITORY
          </Button>
        </motion.div>
      </div>
    </section>
  );
}