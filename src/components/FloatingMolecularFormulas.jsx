import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const GLP1_FORMULAS = [
  { formula: 'C257H386N64O78S6', name: 'Semaglutide' },
  { formula: 'C301H460N72O87S6', name: 'Tirzepatide' },
  { formula: 'C248H382N62O75S5', name: 'Retatrutide' },
  { formula: 'C256H384N63O77S6', name: 'Liraglutide' },
  { formula: 'C287H418N70O82S6', name: 'Dulaglutide' },
];

const FloatingFormula = ({ formula, startX, delay, duration }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = e.clientX;
      const y = e.clientY;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Update offset based on mouse proximity
  useEffect(() => {
    const formulaElement = document.getElementById(`formula-${formula}-${startX}`);
    if (!formulaElement) return;

    const rect = formulaElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distX = centerX - mousePos.x;
    const distY = centerY - mousePos.y;
    const distance = Math.sqrt(distX * distX + distY * distY);

    if (distance < 200) {
      const angle = Math.atan2(distY, distX);
      const force = Math.max(0, 200 - distance) * 0.4;
      setOffset({
        x: Math.cos(angle) * force,
        y: Math.sin(angle) * force,
      });
    } else {
      setOffset({ x: 0, y: 0 });
    }
  }, [mousePos, formula, startX]);

  const isRed = Math.random() > 0.8;

  return (
    <motion.div
      id={`formula-${formula}-${startX}`}
      initial={{ opacity: 0, y: -20, x: startX }}
      animate={{
        opacity: [0, 0.2, 0.3, 0],
        y: window.innerHeight + 50,
        x: startX + offset.x,
      }}
      transition={{
        duration,
        delay,
        ease: 'linear',
        opacity: { duration: duration, times: [0, 0.1, 0.8, 1] },
      }}
      className={`fixed text-[11px] font-black pointer-events-none whitespace-nowrap select-none uppercase tracking-widest ${
        isRed ? 'text-[#dc2626]' : 'text-slate-200'
      }`}
      style={{
        left: startX,
        top: '-20px',
        opacity: 0.15 // Base opacity fallback
      }}
    >
      {formula}
    </motion.div>
  );
};

export default function FloatingMolecularFormulas() {
  const [formulas, setFormulas] = useState([]);

  useEffect(() => {
    const generateFormulas = () => {
      const newFormulas = Array.from({ length: 12 }, (_, i) => {
        const glp1 = GLP1_FORMULAS[i % GLP1_FORMULAS.length];
        return {
          id: Math.random(),
          formula: glp1.formula,
          startX: Math.random() * window.innerWidth,
          delay: Math.random() * 5,
          duration: 12 + Math.random() * 8,
        };
      });
      setFormulas(newFormulas);
    };

    generateFormulas();

    // Regenerate formulas every 15 seconds for a more relaxed clinical feel
    const interval = setInterval(generateFormulas, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {formulas.map((f) => (
        <FloatingFormula
          key={f.id}
          formula={f.formula}
          startX={f.startX}
          delay={f.delay}
          duration={f.duration}
        />
      ))}
    </div>
  );
}
