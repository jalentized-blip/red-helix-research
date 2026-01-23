import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function PeptideCalculator() {
  const [selectedPeptide, setSelectedPeptide] = useState(null);
  const [dosingInfo, setDosingInfo] = useState(null);
  const [dosingLoading, setDosingLoading] = useState(false);
  const [dose, setDose] = useState('0.5');
  const [doseCustom, setDoseCustom] = useState('');
  const [strength, setStrength] = useState('10');
  const [strengthCustom, setStrengthCustom] = useState('');
  const [water, setWater] = useState('3.0');
  const [waterCustom, setWaterCustom] = useState('');

  // Fetch products from database
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  // Fetch dosing info when peptide is selected
  const fetchDosingInfo = async (peptideName) => {
    if (!peptideName) return;
    setDosingLoading(true);
    try {
      const info = await base44.integrations.Core.InvokeLLM({
        prompt: `Find detailed dosing information for ${peptideName} from peptidedosages.com. Include:
        1. Typical dosage range
        2. Reconstitution recommendations
        3. Common injection protocols
        4. Frequency of administration
        5. Any special notes or precautions
        
        Format the response in a clear, structured way suitable for a dosing guide.`,
        add_context_from_internet: true,
      });
      setDosingInfo(info);
    } catch (error) {
      console.error('Error fetching dosing info:', error);
    } finally {
      setDosingLoading(false);
    }
  };

  const handlePeptideSelect = (peptideName) => {
    setSelectedPeptide(peptideName);
    fetchDosingInfo(peptideName);
  };

  const doseOptions = ['0.1', '0.25', '0.5', '1', '2.5', '5', '7.5', '10', '12.5', '15', '50'];
  const strengthOptions = ['1', '5', '10', '15', '20', '30', '50', '1000'];
  const waterOptions = ['0.5', '1.0', '1.5', '2.0', '2.5', '3.0', '5.0'];

  const currentDose = dose === 'other' ? parseFloat(doseCustom) : parseFloat(dose);
  const currentStrength = strength === 'other' ? parseFloat(strengthCustom) : parseFloat(strength);
  const currentWater = water === 'other' ? parseFloat(waterCustom) : parseFloat(water);

  // Calculate results
  const concentration = currentWater > 0 ? currentStrength / currentWater : 0;
  const drawAmount = concentration > 0 ? (currentDose / concentration).toFixed(2) : 0;
  const drawUnits = concentration > 0 ? (currentDose / concentration * 100).toFixed(0) : 0;
  const dosesInVial = concentration > 0 ? Math.floor((currentStrength / currentDose)).toFixed(0) : 0;

  const isValidCalc = currentDose > 0 && currentStrength > 0 && currentWater > 0;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-stone-950 pt-32 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-amber-50 mb-4">Peptide Calculator</h1>
          <p className="text-stone-400 text-lg max-w-2xl mx-auto">
            Use our Peptide Reconstitution Calculator to accurately calculate dosages for administering peptides. Simply select your parameters and get instant results.
          </p>
        </motion.div>

        {/* Peptide Selector */}
        <motion.div variants={item} className="bg-stone-900/50 border border-stone-700 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-amber-50 mb-4">Select a Peptide</h2>
          <p className="text-stone-400 text-sm mb-4">Choose a peptide to view dosing information sourced from peptidedosages.com</p>
          <Select value={selectedPeptide || ''} onValueChange={handlePeptideSelect}>
            <SelectTrigger className="bg-stone-800 border border-stone-700 text-amber-50">
              <SelectValue placeholder="Select a peptide..." />
            </SelectTrigger>
            <SelectContent className="bg-stone-800 border border-stone-700 max-h-80">
              {products.map((product) => (
                <SelectItem key={product.id} value={product.name} className="text-amber-50">
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Dosing Info Section */}
        {selectedPeptide && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-stone-900/50 border border-stone-700 rounded-lg p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-amber-50 mb-6">{selectedPeptide} - Dosing Information</h2>
            {dosingLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-red-600 animate-spin mr-2" />
                <p className="text-stone-400">Loading dosing information...</p>
              </div>
            ) : dosingInfo ? (
              <div className="prose prose-invert max-w-none">
                <div className="text-stone-300 whitespace-pre-wrap text-sm leading-relaxed">{dosingInfo}</div>
              </div>
            ) : null}
          </motion.div>
        )}

        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calculator Section */}
          <motion.div variants={item} className="bg-stone-900/50 border border-stone-700 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-amber-50 mb-8">DRAW & DOSE CALCULATOR</h2>

            {/* Dose Input */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-amber-50 mb-3">Dose of Peptide</label>
              {dose !== 'other' ? (
                <Select value={dose} onValueChange={setDose}>
                  <SelectTrigger className="bg-stone-800 border border-stone-700 text-amber-50 mb-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-stone-800 border border-stone-700">
                    {doseOptions.map((opt) => (
                      <SelectItem key={opt} value={opt} className="text-amber-50">
                        {opt} mg
                      </SelectItem>
                    ))}
                    <SelectItem value="other" className="text-amber-50">
                      Other
                    </SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <input
                  type="number"
                  value={doseCustom}
                  onChange={(e) => setDoseCustom(e.target.value)}
                  placeholder="Enter custom dose"
                  className="w-full bg-stone-800 border border-stone-700 rounded px-4 py-2 text-amber-50 placeholder-stone-500 focus:outline-none focus:border-red-600 mb-3"
                />
              )}
              <Button
                variant="outline"
                className="border-stone-700 text-stone-400 hover:text-red-600 hover:border-red-600 w-full"
                onClick={() => {
                  setDose('other');
                  setDoseCustom('');
                }}
              >
                Use Custom Value
              </Button>
              <p className="text-xs text-stone-400 mt-2">0.1 mg = 100 mcg (μg)</p>
            </div>

            {/* Peptide Strength Input */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-amber-50 mb-3">Peptide Strength</label>
              {strength !== 'other' ? (
                <Select value={strength} onValueChange={setStrength}>
                  <SelectTrigger className="bg-stone-800 border border-stone-700 text-amber-50 mb-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-stone-800 border border-stone-700">
                    {strengthOptions.map((opt) => (
                      <SelectItem key={opt} value={opt} className="text-amber-50">
                        {opt} mg
                      </SelectItem>
                    ))}
                    <SelectItem value="other" className="text-amber-50">
                      Other
                    </SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <input
                  type="number"
                  value={strengthCustom}
                  onChange={(e) => setStrengthCustom(e.target.value)}
                  placeholder="Enter custom strength"
                  className="w-full bg-stone-800 border border-stone-700 rounded px-4 py-2 text-amber-50 placeholder-stone-500 focus:outline-none focus:border-red-600 mb-3"
                />
              )}
              <Button
                variant="outline"
                className="border-stone-700 text-stone-400 hover:text-red-600 hover:border-red-600 w-full"
                onClick={() => {
                  setStrength('other');
                  setStrengthCustom('');
                }}
              >
                Use Custom Value
              </Button>
              <p className="text-xs text-stone-400 mt-2">
                <strong>Common Strengths:</strong> BPC-157: 10mg, NAD+: 1000mg
              </p>
            </div>

            {/* Water Volume Input */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-amber-50 mb-3">Bacteriostatic Water</label>
              {water !== 'other' ? (
                <Select value={water} onValueChange={setWater}>
                  <SelectTrigger className="bg-stone-800 border border-stone-700 text-amber-50 mb-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-stone-800 border border-stone-700">
                    {waterOptions.map((opt) => (
                      <SelectItem key={opt} value={opt} className="text-amber-50">
                        {opt} mL
                      </SelectItem>
                    ))}
                    <SelectItem value="other" className="text-amber-50">
                      Other
                    </SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <input
                  type="number"
                  value={waterCustom}
                  onChange={(e) => setWaterCustom(e.target.value)}
                  placeholder="Enter custom water volume"
                  className="w-full bg-stone-800 border border-stone-700 rounded px-4 py-2 text-amber-50 placeholder-stone-500 focus:outline-none focus:border-red-600 mb-3"
                />
              )}
              <Button
                variant="outline"
                className="border-stone-700 text-stone-400 hover:text-red-600 hover:border-red-600 w-full"
                onClick={() => {
                  setWater('other');
                  setWaterCustom('');
                }}
              >
                Use Custom Value
              </Button>
              <p className="text-xs text-stone-400 mt-2">
                <strong>Common Amounts:</strong> GLP-1s: 2-3mL, Peptides: 3mL, NAD+: 5mL
              </p>
            </div>
          </motion.div>

          {/* Results Section */}
          <motion.div variants={item} className="bg-stone-900/50 border border-stone-700 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-amber-50 mb-8">Results</h2>

            {!isValidCalc ? (
              <div className="text-stone-400 text-center py-12">
                <p>Enter your parameters to calculate dosages</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Visual Meter */}
                <div className="bg-stone-800/50 rounded-lg p-8 mb-8">
                  <div className="text-center">
                    <svg viewBox="0 0 400 280" className="w-full h-auto max-w-2xl mx-auto" style={{ filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.5))' }}>
                      <defs>
                        <linearGradient id="barrelGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#e2e8f0" />
                          <stop offset="50%" stopColor="#cbd5e1" />
                          <stop offset="100%" stopColor="#94a3b8" />
                        </linearGradient>
                        <linearGradient id="plungerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#fbbf24" />
                          <stop offset="50%" stopColor="#f59e0b" />
                          <stop offset="100%" stopColor="#d97706" />
                        </linearGradient>
                        <linearGradient id="fillGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#ef4444" />
                          <stop offset="100%" stopColor="#dc2626" />
                        </linearGradient>
                      </defs>

                      {/* Syringe barrel - outer barrel */}
                      <rect
                        x="70"
                        y="90"
                        width="240"
                        height="70"
                        rx="35"
                        fill="url(#barrelGradient)"
                        stroke="#64748b"
                        strokeWidth="1.5"
                      />

                      {/* Barrel inner highlight */}
                      <rect
                        x="72"
                        y="92"
                        width="236"
                        height="20"
                        rx="10"
                        fill="white"
                        opacity="0.3"
                      />

                      {/* Liquid fill */}
                      <path
                        d={`M 75 105 L ${75 + Math.min(234, (drawUnits / 100) * 234)} 105 Q ${Math.min(310, 75 + (drawUnits / 100) * 234)} 105 ${Math.min(310, 75 + (drawUnits / 100) * 234)} 125 L ${Math.min(310, 75 + (drawUnits / 100) * 234)} 145 Q ${Math.min(310, 75 + (drawUnits / 100) * 234)} 155 ${75 + Math.min(234, (drawUnits / 100) * 234)} 155 L 75 155 Q 70 155 70 150 L 70 110 Q 70 105 75 105 Z`}
                        fill="url(#fillGradient)"
                        opacity="0.8"
                      />

                      {/* Measurement markings */}
                      {Array.from({ length: 21 }).map((_, i) => {
                        const x = 75 + (i * 234) / 20;
                        const isMainMark = i % 5 === 0;
                        return (
                          <g key={`mark-${i}`}>
                            <line
                              x1={x}
                              y1={isMainMark ? 80 : 85}
                              x2={x}
                              y2={isMainMark ? 85 : 86}
                              stroke="#64748b"
                              strokeWidth={isMainMark ? 2 : 1}
                            />
                            {isMainMark && (
                              <text
                                x={x}
                                y="75"
                                textAnchor="middle"
                                fontSize="13"
                                fontWeight="600"
                                fill="#cbd5e1"
                                fontFamily="monospace"
                              >
                                {i * 5}
                              </text>
                            )}
                          </g>
                        );
                      })}

                      {/* Plunger rod */}
                      <rect
                        x={20 + (drawUnits / 100) * 234}
                        y="110"
                        width="45"
                        height="50"
                        rx="4"
                        fill="url(#plungerGradient)"
                        stroke="#92400e"
                        strokeWidth="1.5"
                      />

                      {/* Plunger handle grooves */}
                      <rect
                        x={22 + (drawUnits / 100) * 234}
                        y="112"
                        width="41"
                        height="6"
                        rx="2"
                        fill="none"
                        stroke="#92400e"
                        strokeWidth="0.5"
                      />
                      <rect
                        x={22 + (drawUnits / 100) * 234}
                        y="125"
                        width="41"
                        height="6"
                        rx="2"
                        fill="none"
                        stroke="#92400e"
                        strokeWidth="0.5"
                      />
                      <rect
                        x={22 + (drawUnits / 100) * 234}
                        y="138"
                        width="41"
                        height="6"
                        rx="2"
                        fill="none"
                        stroke="#92400e"
                        strokeWidth="0.5"
                      />

                      {/* Needle hub */}
                      <ellipse cx="315" cy="130" rx="10" ry="14" fill="#e2e8f0" stroke="#64748b" strokeWidth="1.5" />

                      {/* Needle */}
                      <path
                        d="M 323 130 L 360 128 L 360 132 Z"
                        fill="#cbd5e1"
                        stroke="#64748b"
                        strokeWidth="1"
                      />

                      {/* Needle shadow */}
                      <line
                        x1="323"
                        y1="132"
                        x2="360"
                        y2="134"
                        stroke="#475569"
                        strokeWidth="1"
                        opacity="0.5"
                      />

                      {/* Target line (yellow dashed) */}
                      <line
                        x1={75 + (drawUnits / 100) * 234}
                        y1="60"
                        x2={75 + (drawUnits / 100) * 234}
                        y2="170"
                        stroke="#fbbf24"
                        strokeWidth="2.5"
                        strokeDasharray="4,4"
                        opacity="0.9"
                      />

                      {/* Target text */}
                      <text
                        x={75 + (drawUnits / 100) * 234}
                        y="50"
                        textAnchor="middle"
                        fontSize="14"
                        fontWeight="700"
                        fill="#fbbf24"
                      >
                        {drawUnits}U
                      </text>

                      {/* Bottom label */}
                      <text
                        x="200"
                        y="225"
                        textAnchor="middle"
                        fontSize="18"
                        fontWeight="700"
                        fill="#fed7aa"
                      >
                        Draw to {drawUnits} units ({drawAmount} mL)
                      </text>

                      {/* 1mL indicator */}
                      <text
                        x="200"
                        y="250"
                        textAnchor="middle"
                        fontSize="12"
                        fill="#94a3b8"
                      >
                        1mL Syringe
                      </text>
                    </svg>
                  </div>
                </div>

                {/* Result Cards */}
                <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-stone-800/50 rounded-lg p-4">
                  <p className="text-stone-400 text-sm mb-1">Peptide Dose</p>
                  <p className="text-2xl font-bold text-red-600">{currentDose.toFixed(2)} mg</p>
                </motion.div>

                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="bg-stone-800/50 rounded-lg p-4"
                >
                  <p className="text-stone-400 text-sm mb-1">Draw Syringe To</p>
                  <p className="text-2xl font-bold text-red-600">{drawUnits} units</p>
                  <p className="text-xs text-stone-400 mt-1">({drawAmount} mL)</p>
                </motion.div>

                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-stone-800/50 rounded-lg p-4"
                >
                  <p className="text-stone-400 text-sm mb-1">Doses in Vial</p>
                  <p className="text-2xl font-bold text-red-600">{dosesInVial}</p>
                </motion.div>

                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-stone-800/50 rounded-lg p-4"
                >
                  <p className="text-stone-400 text-sm mb-1">Concentration</p>
                  <p className="text-2xl font-bold text-red-600">{concentration.toFixed(2)} mg/mL</p>
                </motion.div>

                {drawAmount > currentWater && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-red-600/20 border border-red-600/50 rounded-lg p-4 text-red-400 text-sm"
                  >
                    ⚠️ Not enough peptide in solution. Increase water or reduce dose.
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>

        {/* Instructions Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-16 bg-stone-900/50 border border-stone-700 rounded-lg p-8"
        >
          <h2 className="text-2xl font-bold text-amber-50 mb-8">How to Use This Calculator</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-stone-800/50 rounded-lg p-4">
              <h3 className="text-red-600 font-bold mb-2">Step 1: Set Your Dose</h3>
              <p className="text-stone-400 text-sm">Choose your intended dose in milligrams (mg). This is the amount of peptide you plan to administer.</p>
            </div>

            <div className="bg-stone-800/50 rounded-lg p-4">
              <h3 className="text-red-600 font-bold mb-2">Step 2: Enter Peptide Strength</h3>
              <p className="text-stone-400 text-sm">Enter the total milligrams in your vial. This helps calculate the total amount available for dilution.</p>
            </div>

            <div className="bg-stone-800/50 rounded-lg p-4">
              <h3 className="text-red-600 font-bold mb-2">Step 3: Add Water Volume</h3>
              <p className="text-stone-400 text-sm">Decide on the volume of bacteriostatic water in milliliters (mL). This affects the concentration of your solution.</p>
            </div>

            <div className="bg-stone-800/50 rounded-lg p-4">
              <h3 className="text-red-600 font-bold mb-2">Step 4: Review Results</h3>
              <p className="text-stone-400 text-sm">Check how many units to draw, concentration, and total doses in your vial. Remember: 100 units = 1mL.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}