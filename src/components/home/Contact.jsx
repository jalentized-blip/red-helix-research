import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { MessageCircle, Send, ArrowRight, Mail } from "lucide-react";

const DiscordIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const contactMethods = [
  {
    icon: Mail,
    label: "Email",
    value: "Email us",
    color: "bg-red-700/20 text-red-600 hover:bg-red-700/30",
    link: "mailto:jake@redhelixresearch.com"
  },
  {
    icon: DiscordIcon,
    label: "Discord",
    value: "Join our server",
    color: "bg-[#5865F2]/20 text-[#5865F2] hover:bg-[#5865F2]/30",
    link: "https://discord.gg/zdn52v73"
  },
  {
    icon: Send,
    label: "Telegram",
    value: "Message us",
    color: "bg-[#0088cc]/20 text-[#0088cc] hover:bg-[#0088cc]/30",
    link: "t.me/Redhelixresearch"
  }
];

export default function Contact() {
  return (
    <section className="py-24 px-4 bg-white relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-red-600/5 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-100 rounded-full mb-6">
            <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Support Protocol</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none mb-6 uppercase">
            Researcher <br />
            <span className="text-red-600">Assistance</span>
          </h2>
          <p className="text-slate-500 font-medium max-w-xl mx-auto">
            Direct communication channels for laboratory procurement inquiries and technical research support.
          </p>
        </motion.div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {contactMethods.map((method, index) => (
            <motion.div
              key={method.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card 
                className="bg-white border-slate-100 hover:border-red-600/30 transition-all duration-500 p-10 text-center cursor-pointer rounded-[40px] shadow-sm hover:shadow-xl group"
                onClick={() => method.link && window.open(method.link, '_blank')}
              >
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-[24px] ${method.color} mb-8 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-sm`}>
                  <method.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">{method.label}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{method.value}</p>
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
          className="text-center"
        >
          <Link to={createPageUrl('Contact')}>
            <Button className="bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest px-12 py-8 rounded-2xl text-lg shadow-lg hover:shadow-red-600/20 transition-all hover:-translate-y-1">
              OPEN FORMAL INQUIRY
              <ArrowRight className="w-6 h-6 ml-3" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}