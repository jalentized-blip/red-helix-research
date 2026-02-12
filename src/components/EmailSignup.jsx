import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function EmailSignup({ variant = 'default' }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address');
        setLoading(false);
        return;
      }

      // Track event
      base44.analytics.track({
        eventName: 'newsletter_signup_submitted',
        properties: { email_domain: email.split('@')[1] }
      });

      // TODO: Integrate with email service (Resend, SendGrid, etc.)
      // For now, just show success
      setSuccess(true);
      setEmail('');

      // Reset after 5 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (err) {
      setError('Failed to sign up. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'minimal') {
    return (
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-2"
      >
        <Input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading || success}
          className="bg-stone-900/50 border-stone-600 text-amber-50 placeholder:text-stone-500"
        />
        <Button
          type="submit"
          disabled={loading || success}
          className="bg-red-700 hover:bg-[#dc2626] whitespace-nowrap"
        >
          {success ? <Check className="w-4 h-4" /> : 'Subscribe'}
        </Button>
      </motion.form>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-gradient-to-r from-red-900/20 to-red-800/10 border border-red-700/30 rounded-lg p-8"
    >
      <div className="max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <Mail className="w-6 h-6 text-[#dc2626]" />
          <h3 className="text-2xl font-bold text-amber-50">Get Research Updates</h3>
        </div>

        <p className="text-stone-300 mb-6">
          Subscribe to our newsletter for the latest peptide research insights, new products, and exclusive updates.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading || success}
              className="bg-stone-900 border-stone-600 text-amber-50"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          {success && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-green-400 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Thank you! Check your email for confirmation.
            </motion.p>
          )}

          <Button
            type="submit"
            disabled={loading || success}
            className="w-full bg-red-700 hover:bg-[#dc2626]"
          >
            {loading ? 'Subscribing...' : success ? 'Subscribed!' : 'Subscribe'}
          </Button>
        </form>

        <p className="text-xs text-stone-400 mt-4">
          We respect your privacy. Unsubscribe at any time. No spam, only research-focused content.
        </p>
      </div>
    </motion.div>
  );
}