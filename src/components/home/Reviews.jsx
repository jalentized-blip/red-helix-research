import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, ExternalLink, Send, CheckCircle2 } from "lucide-react";
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function Reviews() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ author_name: '', author_email: '', text: '', badge: '' });
  const [submitted, setSubmitted] = useState(false);
  const queryClient = useQueryClient();

  const { data: testimonials = [] } = useQuery({
    queryKey: ['approvedTestimonials'],
    queryFn: async () => {
      const data = await base44.entities.Testimonial.list('-created_date');
      return data.filter(t => t.approved === true);
    },
  });

  const submitMutation = useMutation({
    mutationFn: (data) => base44.entities.Testimonial.create(data),
    onSuccess: () => {
      setSubmitted(true);
      setFormData({ author_name: '', author_email: '', text: '', badge: '' });
      setTimeout(() => {
        setSubmitted(false);
        setShowForm(false);
      }, 3000);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    submitMutation.mutate(formData);
  };
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

        {/* Submit Review CTA */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          {!showForm && (
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-[#dc2626] hover:bg-red-700 text-white px-10 py-8 rounded-2xl font-black uppercase tracking-widest text-lg shadow-lg hover:shadow-[#dc2626]/20 transition-all hover:-translate-y-1"
            >
              <Send className="w-6 h-6 mr-3" />
              SHARE YOUR EXPERIENCE
            </Button>
          )}
        </motion.div>

        {/* Review Submission Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-16 overflow-hidden"
            >
              <Card className="max-w-2xl mx-auto bg-white border-slate-100 p-10 rounded-[40px] shadow-xl">
                {submitted ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center py-12"
                  >
                    <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-black text-slate-900 mb-2">Thank You!</h3>
                    <p className="text-slate-500">Your review is pending approval and will appear soon.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="text-center mb-8">
                      <h3 className="text-3xl font-black text-slate-900 mb-2">Share Your Experience</h3>
                      <p className="text-slate-500">Help others by sharing your research journey</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Your Name</label>
                        <Input
                          required
                          value={formData.author_name}
                          onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                          placeholder="John D."
                          className="rounded-2xl border-slate-200"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Email</label>
                        <Input
                          required
                          type="email"
                          value={formData.author_email}
                          onChange={(e) => setFormData({ ...formData, author_email: e.target.value })}
                          placeholder="john@example.com"
                          className="rounded-2xl border-slate-200"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Badge (Optional)</label>
                      <Input
                        value={formData.badge}
                        onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                        placeholder="e.g., Fast Shipping, Repeat Customer"
                        className="rounded-2xl border-slate-200"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Your Review</label>
                      <Textarea
                        required
                        value={formData.text}
                        onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                        placeholder="Share your experience with our products and service..."
                        className="rounded-2xl border-slate-200 min-h-[120px]"
                      />
                    </div>

                    <div className="flex gap-4 justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowForm(false)}
                        className="rounded-2xl"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={submitMutation.isPending}
                        className="bg-[#dc2626] hover:bg-red-700 rounded-2xl"
                      >
                        {submitMutation.isPending ? 'Submitting...' : 'Submit Review'}
                      </Button>
                    </div>
                  </form>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reviews Grid */}
        {testimonials.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {testimonials.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full bg-white border-slate-100 p-8 relative rounded-[40px] shadow-sm hover:shadow-xl transition-all duration-500 group">
                  <Quote className="absolute top-8 right-8 w-12 h-12 text-[#dc2626]/5 group-hover:text-[#dc2626]/10 transition-colors" />
                  
                  {review.badge && (
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-2 h-2 rounded-full bg-[#dc2626]" />
                      <span className="text-[10px] font-black text-[#dc2626] uppercase tracking-widest">{review.badge}</span>
                    </div>
                  )}

                  <blockquote className="text-slate-600 text-base leading-relaxed mb-8 font-medium">
                    "{review.text}"
                  </blockquote>

                  <div className="mt-auto pt-6 border-t border-slate-100">
                    <p className="font-black text-slate-900 uppercase tracking-tight text-lg">{review.author_name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Verified Customer • {new Date(review.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {testimonials.length === 0 && !showForm && (
          <div className="text-center py-16 mb-16">
            <p className="text-slate-400 text-lg font-medium">Be the first to share your experience!</p>
          </div>
        )}

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
            onClick={() => window.open('https://discord.gg/BwQHufvmQ8', '_blank')}
          >
            <ExternalLink className="w-6 h-6 mr-3" />
            JOIN DISCORD REPOSITORY
          </Button>
        </motion.div>
      </div>
    </section>
  );
}