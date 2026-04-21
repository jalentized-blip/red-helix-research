import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Star } from 'lucide-react';

const PROOF_EVENTS = [
  { name: "Marcus T.", location: "Austin, TX", product: "Semaglutide 5mg", time: "2 min ago", type: "purchase" },
  { name: "Dr. R. Chen", location: "San Diego, CA", product: "BPC-157 5mg", time: "4 min ago", type: "purchase" },
  { name: "Jordan K.", location: "Denver, CO", product: "TB-500 5mg", time: "7 min ago", type: "purchase" },
  { name: "Alex M.", location: "New York, NY", product: "Tirzepatide 10mg", time: "11 min ago", type: "purchase" },
  { name: "Sarah L.", location: "Seattle, WA", product: "BPC-157 10mg Kit", time: "15 min ago", type: "purchase" },
  { name: "Chris D.", location: "Miami, FL", product: "Semaglutide 10mg", time: "19 min ago", type: "purchase" },
  { name: "Taylor B.", location: "Chicago, IL", product: "TB-500 10mg", time: "3 min ago", type: "purchase" },
  { name: "Ryan P.", location: "Phoenix, AZ", product: "CJC-1295 2mg", time: "6 min ago", type: "purchase" },
  { name: "Morgan W.", location: "Portland, OR", product: "BPC-157 5mg", time: "9 min ago", type: "review", stars: 5, text: "Fastest shipping I've seen." },
  { name: "Jamie S.", location: "Dallas, TX", product: "Tirzepatide 5mg", time: "22 min ago", type: "purchase" },
];

const MIN_INTERVAL = 35000;
const MAX_INTERVAL = 80000;
const SHOW_DURATION = 5000;

export default function SocialProofPopup() {
  const [current, setCurrent] = useState(null);
  const [visible, setVisible] = useState(false);
  const indexRef = React.useRef(Math.floor(Math.random() * PROOF_EVENTS.length));

  const showNext = useCallback(() => {
    const event = PROOF_EVENTS[indexRef.current % PROOF_EVENTS.length];
    indexRef.current++;
    setCurrent(event);
    setVisible(true);
    setTimeout(() => setVisible(false), SHOW_DURATION);
  }, []);

  useEffect(() => {
    // First popup after 12 seconds
    const first = setTimeout(showNext, 12000);

    const schedule = () => {
      const delay = MIN_INTERVAL + Math.random() * (MAX_INTERVAL - MIN_INTERVAL);
      return setTimeout(() => {
        showNext();
        timerRef.current = schedule();
      }, delay);
    };

    const timerRef = { current: null };
    const afterFirst = setTimeout(() => {
      timerRef.current = schedule();
    }, 12000 + SHOW_DURATION);

    return () => {
      clearTimeout(first);
      clearTimeout(afterFirst);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [showNext]);

  return (
    <AnimatePresence>
      {visible && current && (
        <motion.div
          initial={{ opacity: 0, x: -80, y: 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: -80 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="fixed bottom-32 left-4 z-[150] max-w-[280px] bg-white rounded-2xl shadow-2xl border border-slate-100 p-3.5 flex items-start gap-3"
        >
          {/* Icon */}
          <div className="w-10 h-10 rounded-xl bg-[#8B2635]/10 flex items-center justify-center flex-shrink-0">
            {current.type === 'review'
              ? <Star className="w-5 h-5 text-[#8B2635]" />
              : <ShoppingBag className="w-5 h-5 text-[#8B2635]" />
            }
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black text-slate-900 leading-tight">
              {current.name} <span className="font-medium text-slate-500">from {current.location}</span>
            </p>
            {current.type === 'review' ? (
              <>
                <div className="flex gap-0.5 my-0.5">
                  {Array(current.stars).fill(0).map((_, i) => (
                    <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 italic">"{current.text}"</p>
              </>
            ) : (
              <p className="text-[11px] text-slate-600 mt-0.5">
                just ordered <span className="font-bold text-slate-800">{current.product}</span>
              </p>
            )}
            <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-wider">{current.time}</p>
          </div>
          <button
            onClick={() => setVisible(false)}
            className="absolute top-2 right-2 text-slate-300 hover:text-slate-500 text-xs leading-none"
          >
            ×
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}