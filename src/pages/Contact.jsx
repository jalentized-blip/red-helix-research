import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { base44 } from '@/api/base44Client';
import { MessageCircle, Send, Loader2 } from "lucide-react";

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
        to: 'jakehboen95@gmail.com',
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
    <div className="min-h-screen bg-stone-950 pt-32 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
              Get in Touch
            </span>
          </h1>
          <p className="text-stone-300 text-lg">
            Join our community and let's connect
          </p>
        </motion.div>

        {/* Discord Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12 text-center"
        >
          <Button 
            className="bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold px-8 py-6 text-lg"
            onClick={() => window.open('https://discord.gg/jH5s4dBr', '_blank')}
          >
            <MessageCircle className="w-5 h-5 mr-3" />
            Join Discord Server
          </Button>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-stone-900/60 border border-stone-700 rounded-2xl p-8"
        >
          <h2 className="text-2xl font-bold text-amber-50 mb-6">Send us a Message</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-2">Name</label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                  className="bg-stone-800 border-stone-700 text-amber-50 placeholder:text-stone-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-2">Email</label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                  className="bg-stone-800 border-stone-700 text-amber-50 placeholder:text-stone-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-300 mb-2">Phone Number</label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(123) 456-7890"
                className="bg-stone-800 border-stone-700 text-amber-50 placeholder:text-stone-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-300 mb-2">Description</label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Tell us how we can help..."
                required
                rows={6}
                className="bg-stone-800 border-stone-700 text-amber-50 placeholder:text-stone-500 resize-none"
              />
            </div>

            {submitted && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-green-900/20 border border-green-700/50 text-green-400 px-4 py-3 rounded-lg text-sm"
              >
                ✓ Message sent successfully! We'll be in touch soon.
              </motion.div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-red-700 hover:bg-red-600 text-amber-50 font-semibold py-6 text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}