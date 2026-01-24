import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { MessageCircle, Send, ArrowRight } from "lucide-react";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const contactMethods = [
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "Message us",
    color: "bg-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/30",
    link: "https://wa.me/"
  },
  {
    icon: MessageCircle,
    label: "Discord",
    value: "Join our server",
    color: "bg-[#5865F2]/20 text-[#5865F2] hover:bg-[#5865F2]/30",
    link: "https://discord.gg/Nee8Ydev"
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
            <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
              Need Help?
            </span>
          </h2>
          <p className="text-stone-300 text-lg">
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
              <Card 
                className="bg-stone-900/60 border-stone-700 hover:border-red-700/40 transition-all duration-300 p-6 text-center cursor-pointer"
                onClick={() => method.link && window.open(method.link, '_blank')}
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${method.color} mb-4 transition-colors`}>
                  <method.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-amber-50 mb-1">{method.label}</h3>
                <p className="text-sm text-stone-300">{method.value}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA to Contact Page */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link to={createPageUrl('Contact')}>
            <Button className="bg-red-700 hover:bg-red-600 text-amber-50 font-semibold px-6">
              Go to Contact Form
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}