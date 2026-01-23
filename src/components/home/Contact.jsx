import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Mail, MessageCircle, Send } from "lucide-react";

const contactMethods = [
  {
    icon: Mail,
    label: "Email",
    value: "support@chimerapeptides.com",
    color: "bg-red-500/20 text-red-400 hover:bg-red-500/30"
  },
  {
    icon: MessageCircle,
    label: "Discord",
    value: "Join our server",
    color: "bg-[#5865F2]/20 text-[#5865F2] hover:bg-[#5865F2]/30"
  },
  {
    icon: Send,
    label: "Telegram",
    value: "Message us",
    color: "bg-[#0088cc]/20 text-[#0088cc] hover:bg-[#0088cc]/30"
  }
];

export default function Contact() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
              Need Help?
            </span>
          </h2>
          <p className="text-neutral-400 text-lg">
            Our team responds within 24 hours
          </p>
        </motion.div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {contactMethods.map((method, index) => (
            <motion.div
              key={method.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="bg-neutral-900/60 border-neutral-800 hover:border-yellow-500/40 transition-all duration-300 p-6 text-center cursor-pointer">
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${method.color} mb-4 transition-colors`}>
                  <method.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{method.label}</h3>
                <p className="text-sm text-neutral-400">{method.value}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}