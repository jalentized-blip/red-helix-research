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
    text: "Second order with Chimera, same excellent experience. Quality is top notch and their customer support actually responds. Will definitely be ordering again.",
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
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
              Real Reviews from Discord
            </span>
          </h2>
          <p className="text-neutral-400 text-lg">
            Verified testimonials from our community members
          </p>
        </motion.div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {reviews.map((review, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full bg-neutral-900/60 border-neutral-800 p-6 relative">
                <Quote className="absolute top-4 right-4 w-8 h-8 text-yellow-500/20" />
                
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs font-medium text-yellow-400">{review.badge}</span>
                </div>

                <blockquote className="text-neutral-300 text-sm leading-relaxed mb-6 italic">
                  "{review.text}"
                </blockquote>

                <div className="mt-auto pt-4 border-t border-neutral-800">
                  <p className="font-semibold text-white">{review.author}</p>
                  <p className="text-xs text-neutral-500">{review.role} • {review.date}</p>
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
          <p className="text-neutral-400 mb-4">Want to see more reviews? Join our community!</p>
          <Button className="bg-[#5865F2] hover:bg-[#4752C4] text-white">
            <ExternalLink className="w-4 h-4 mr-2" />
            Join Discord for 500+ Reviews
          </Button>
        </motion.div>
      </div>
    </section>
  );
}