import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { base44 } from '@/api/base44Client';
import { MessageCircle, Send, Loader2, Mail, Phone, MapPin, Globe, Sparkles } from "lucide-react";
import SEO from '@/components/SEO';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await base44.integrations.Core.SendEmail({
        to: 'jake@redhelixresearch.com',
        subject: `New Contact Form Submission from ${formData.name}`,
        body: `Name: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}\n\nMessage:\n${formData.description}`
      });

      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', description: '' });
      
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error('Failed to send email:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-32 pb-20 px-4 relative overflow-hidden">
      <SEO 
        title="Contact Red Helix Research - Customer Support & Inquiries"
        description="Get in touch with Red Helix Research for product questions, order support, and research inquiries. Fast response times via Discord, Telegram, or WhatsApp."
        keywords="contact red helix research, peptide supplier contact, research peptide support, customer service, peptide questions"
      />

      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-50/50 -skew-x-12 translate-x-1/4 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          
          {/* Left Column: Info */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-12"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-100 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-[#dc2626]" />
                <span className="text-[10px] font-black text-[#dc2626] uppercase tracking-widest">Researcher Support</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-black text-slate-900 mb-8 uppercase tracking-tighter leading-none">
                Get In <span className="text-[#dc2626]">Touch</span>
              </h1>
              <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-lg mb-12">
                Have technical questions about our research reagents or need assistance with your laboratory supply order? 
                Our team of specialists is ready to assist.
              </p>

              <div className="space-y-6">
                <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[32px] border border-slate-100 group hover:border-[#dc2626]/30 transition-all">
                  <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Mail className="w-6 h-6 text-[#dc2626]" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email Support</div>
                    <div className="text-lg font-black text-slate-900">support@redhelixresearch.com</div>
                  </div>
                </div>

                <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[32px] border border-slate-100 group hover:border-[#dc2626]/30 transition-all cursor-pointer" onClick={() => window.open('https://discord.gg/s78Jeajp', '_blank')}>
                  <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-6 h-6 text-[#dc2626]" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Discord Community</div>
                    <div className="text-lg font-black text-slate-900 group-hover:text-[#dc2626] transition-colors">
                      Join Official Server
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white border border-slate-200 rounded-[40px] p-8 md:p-12 shadow-2xl shadow-slate-200/50"
          >
            <h2 className="text-3xl font-black text-slate-900 mb-8 uppercase tracking-tight">
              Send <span className="text-[#dc2626]">Message</span>
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Researcher Name</label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Full Name"
                    required
                    className="bg-slate-50 border-slate-100 rounded-2xl px-6 py-7 text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-[#dc2626]/30 transition-all font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Email Address</label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@institution.com"
                    required
                    className="bg-slate-50 border-slate-100 rounded-2xl px-6 py-7 text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-[#dc2626]/30 transition-all font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Phone Number (Optional)</label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  className="bg-slate-50 border-slate-100 rounded-2xl px-6 py-7 text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-[#dc2626]/30 transition-all font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Inquiry Details</label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Please describe your research inquiry or support request..."
                  required
                  rows={6}
                  className="bg-slate-50 border-slate-100 rounded-[24px] px-6 py-5 text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-[#dc2626]/30 transition-all font-bold resize-none"
                />
              </div>

              {submitted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-50 border border-green-100 text-green-600 px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-widest text-center"
                >
                  ✓ Message sent successfully
                </motion.div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#dc2626] hover:bg-red-700 text-white font-black py-8 rounded-2xl text-lg uppercase tracking-widest shadow-xl shadow-[#dc2626]/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-3" />
                    Transmit Message
                  </>
                )}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Compliance Footer */}
      <div className="max-w-4xl mx-auto px-4 mt-32 text-center opacity-50 relative z-10">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Support Protocols</p>
        <p className="text-xs text-slate-500 leading-relaxed font-medium">
          All technical support is provided for educational and research purposes related to the handling 
          and storage of laboratory reagents. We do not provide clinical advice or guidance on human application.
        </p>
      </div>
    </div>
  );
}
