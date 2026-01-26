import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TelegramChatWindow({ isOpen, onClose }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;

    setLoading(true);
    try {
      const response = await base44.functions.invoke('sendTelegramMessage', {
        message: message.trim()
      });

      if (response.data.success) {
        setSent(true);
        setMessage('');
        setTimeout(() => setSent(false), 3000);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-24 right-6 z-50 w-96 bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-red-700 to-red-600 p-4 text-amber-50">
            <h3 className="font-bold text-lg">Message us on Telegram</h3>
            <p className="text-xs text-amber-50/80">We'll respond in your DMs</p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {sent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-8 text-center"
              >
                <CheckCircle2 className="w-12 h-12 text-green-500 mb-3" />
                <p className="text-amber-50 font-semibold">Message sent!</p>
                <p className="text-stone-400 text-sm mt-1">Check your Telegram for a response</p>
              </motion.div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-stone-300 mb-2">
                    Your Message
                  </label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message here..."
                    rows={4}
                    className="bg-stone-800 border-stone-700 text-amber-50 placeholder:text-stone-500 resize-none"
                    disabled={loading}
                  />
                </div>

                <Button
                  onClick={handleSend}
                  disabled={loading || !message.trim()}
                  className="w-full bg-red-700 hover:bg-red-600 text-amber-50 font-semibold py-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send
                    </>
                  )}
                </Button>

                <p className="text-xs text-stone-400 text-center">
                  Messages are sent to our Telegram account. Add @rdrjake as a contact for direct messaging.
                </p>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}