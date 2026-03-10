import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';

const STORAGE_KEY = 'order_issue_form_submitted_linda';
const TARGET_EMAIL = 'lindaograce86@hotmail.com';

export default function OrderIssueNotification({ user }) {
  const isAdmin = user?.role === 'admin';
  const isTargetUser = user?.email === TARGET_EMAIL || isAdmin;
  // Admins always see the form regardless of localStorage (for testing)
  const alreadySubmitted = isAdmin ? false : localStorage.getItem(STORAGE_KEY) === 'true';

  const [dismissed, setDismissed] = useState(alreadySubmitted);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.full_name || '',
    email: user?.email || '',
    products: '',
    details: ''
  });

  return null;

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const body = `
ORDER ISSUE FORM SUBMISSION
===========================
Customer Name: ${formData.name}
Customer Email: ${formData.email}

Products / Specifications Ordered:
${formData.products}

Additional Details:
${formData.details || 'None provided'}

Submitted: ${new Date().toLocaleString()}
    `.trim();

    await Promise.all([
      base44.integrations.Core.SendEmail({
        to: 'jakehboen95@gmail.com',
        subject: `⚠️ Order Issue Form — ${formData.name} (${formData.email})`,
        body,
        from_name: 'RHR Order Alert'
      }),
      base44.integrations.Core.SendEmail({
        to: 'jake@redhelixresearch.com',
        subject: `⚠️ Order Issue Form — ${formData.name} (${formData.email})`,
        body,
        from_name: 'RHR Order Alert'
      })
    ]);

    setLoading(false);
    setSubmitted(true);
    localStorage.setItem(STORAGE_KEY, 'true');
    setTimeout(() => setDismissed(true), 3000);
  };

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          className="mb-6 bg-amber-50 border border-amber-200 rounded-[24px] p-6 shadow-sm relative"
        >
          {/* Dismiss button */}
          <button
            onClick={() => setDismissed(true)}
            className="absolute top-4 right-4 text-amber-400 hover:text-amber-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-black text-amber-900 uppercase tracking-tight mb-1">
                Action Required — Order System Issue
              </h3>
              <p className="text-xs text-amber-700 font-medium leading-relaxed mb-4">
                Our order management system was temporarily down when you placed your most recent order, which may have caused your order details to not be fully captured.
                Please fill out the short form below with the product names and specifications you ordered so we can ensure your order is processed correctly.
              </p>

              {!showForm && !submitted && (
                <Button
                  onClick={() => setShowForm(true)}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-black uppercase tracking-widest px-6 py-2.5 rounded-xl shadow-md shadow-amber-200"
                >
                  Fill Out Order Form
                </Button>
              )}

              <AnimatePresence>
                {showForm && !submitted && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-4 mt-4"
                  >
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-amber-700 uppercase tracking-widest block mb-1">Your Name</label>
                        <Input
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="Full name"
                          className="bg-white border-amber-200 rounded-xl text-sm font-medium focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-amber-700 uppercase tracking-widest block mb-1">Email</label>
                        <Input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="your@email.com"
                          className="bg-white border-amber-200 rounded-xl text-sm font-medium focus:border-amber-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-amber-700 uppercase tracking-widest block mb-1">
                        Products & Specifications Ordered <span className="text-amber-500">*</span>
                      </label>
                      <Textarea
                        name="products"
                        value={formData.products}
                        onChange={handleChange}
                        required
                        rows={4}
                        placeholder="e.g.&#10;BPC-157 — 5mg x 10 vials (qty: 2)&#10;TB-500 — 10mg (qty: 1)"
                        className="bg-white border-amber-200 rounded-xl text-sm font-medium focus:border-amber-400 resize-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-amber-700 uppercase tracking-widest block mb-1">Additional Details (Optional)</label>
                      <Textarea
                        name="details"
                        value={formData.details}
                        onChange={handleChange}
                        rows={2}
                        placeholder="Any other relevant info about your order..."
                        className="bg-white border-amber-200 rounded-xl text-sm font-medium focus:border-amber-400 resize-none"
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        type="submit"
                        disabled={loading}
                        className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-black uppercase tracking-widest px-6 rounded-xl shadow-md shadow-amber-200"
                      >
                        {loading ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
                        ) : (
                          <><Send className="w-4 h-4 mr-2" /> Submit Order Details</>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setShowForm(false)}
                        className="text-amber-600 hover:text-amber-800 text-xs font-black uppercase tracking-widest"
                      >
                        Cancel
                      </Button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {submitted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 mt-3 bg-green-50 border border-green-100 rounded-xl px-4 py-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <p className="text-xs font-black text-green-700 uppercase tracking-tight">
                    Order details submitted! We'll follow up shortly. This notification will now disappear.
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}