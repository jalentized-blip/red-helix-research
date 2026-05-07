import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const GLP1_FORMULAS = [
  'C257H386N64O78S6',
  'C301H460N72O87S6',
  'C248H382N62O75S5',
  'C256H384N63O77S6',
  'C287H418N70O82S6',
];

// Single mouse listener at the container level — not per element
const FloatingFormula = React.memo(({ formula, startX, delay, duration, isRed }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{
      opacity: [0, 0.2, 0.3, 0],
      y: typeof window !== 'undefined' ? window.innerHeight + 50 : 900,
    }}
    transition={{
      duration,
      delay,
      ease: 'linear',
      opacity: { duration, times: [0, 0.1, 0.8, 1] },
    }}
    className={`fixed text-[11px] font-black pointer-events-none whitespace-nowrap select-none uppercase tracking-widest ${
      isRed ? 'text-[#dc2626]' : 'text-slate-200'
    }`}
    style={{ left: startX, top: '-20px' }}
  >
    {formula}
  </motion.div>
));

export default function FloatingMolecularFormulas() {
  const [formulas, setFormulas] = useState([]);
  const [isMobile, setIsMobile] = useState(true); // default true to avoid flash on mobile

  useEffect(() => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    if (mobile) return; // skip entirely on mobile

    const generateFormulas = () => {
      const newFormulas = Array.from({ length: 8 }, (_, i) => ({
        id: Math.random(),
        formula: GLP1_FORMULAS[i % GLP1_FORMULAS.length],
        startX: Math.random() * window.innerWidth,
        delay: Math.random() * 5,
        duration: 12 + Math.random() * 8,
        isRed: i % 5 === 0,
      }));
      setFormulas(newFormulas);
    };

    generateFormulas();
    const interval = setInterval(generateFormulas, 20000);
    return () => clearInterval(interval);
  }, []);

  if (isMobile || formulas.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {formulas.map((f) => (
        <FloatingFormula
          key={f.id}
          formula={f.formula}
          startX={f.startX}
          delay={f.delay}
          duration={f.duration}
          isRed={f.isRed}
        />
      ))}
    </div>
  );
}