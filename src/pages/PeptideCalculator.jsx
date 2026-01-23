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
                <div className="bg-stone-800/50 rounded-lg p-8 mb-8 flex justify-center">
                  <svg
                    viewBox="0 0 400 350"
                    className="w-full h-auto max-w-md"
                    style={{ filter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.4))' }}
                  >
                    {/* Plunger handle (large circle at top) */}
                    <circle cx="60" cy="50" r="22" fill="#d4d4d8" stroke="#a1a1a6" strokeWidth="1" />
                    <circle cx="60" cy="50" r="19" fill="#e4e4e7" />
                    <circle cx="55" cy="45" r="6" fill="#f4f4f5" opacity="0.6" />

                    {/* Plunger rod */}
                    <rect x="53" y="70" width="14" height="180" fill="#a1a1a6" rx="7" />
                    <rect x="55" y="72" width="10" height="176" fill="#d4d4d8" rx="5" />

                    {/* Plunger rod ridges */}
                    {[0, 20, 40, 60, 80, 100, 120, 140, 160].map((offset) => (
                      <line
                        key={`plunger-ridge-${offset}`}
                        x1="55"
                        y1={72 + offset}
                        x2="65"
                        y2={72 + offset}
                        stroke="#9ca3af"
                        strokeWidth="1"
                        opacity="0.5"
                      />
                    ))}

                    {/* Syringe barrel - outer */}
                    <path
                      d="M 75 80 L 280 180 L 280 220 L 75 120 Z"
                      fill="none"
                      stroke="#9ca3af"
                      strokeWidth="2"
                    />

                    {/* Barrel tip (cone shape) */}
                    <path
                      d="M 280 200 L 295 205 L 280 210 Z"
                      fill="#d4d4d8"
                      stroke="#9ca3af"
                      strokeWidth="1"
                    />

                    {/* Needle */}
                    <line x1="295" y1="205" x2="340" y2="215" stroke="#c0c0c0" strokeWidth="1.5" />

                    {/* Barrel interior highlight */}
                    <path
                      d="M 78 82 L 278 182 L 278 188 L 78 88 Z"
                      fill="#ffffff"
                      opacity="0.15"
                    />

                    {/* Liquid fill (orange) */}
                    <path
                      d={`M ${75 + (drawAmount / currentWater) * 205} ${80 + (drawAmount / currentWater) * 100}
                         L 280 180
                         L 280 200
                         L ${280 - (drawAmount / currentWater) * 205} ${200 - (drawAmount / currentWater) * 100}
                         Z`}
                      fill="#fb923c"
                      opacity="0.85"
                    />

                    {/* Measurement scale - markings and numbers */}
                    {Array.from({ length: 11 }).map((_, i) => {
                      const ratio = i / 10;
                      const x = 75 + ratio * 205;
                      const y = 80 + ratio * 100;
                      const markLength = i % 5 === 0 ? 12 : 6;

                      // Calculate angle for perpendicular marks
                      const angle = Math.atan2(100, 205);
                      const perpX = Math.cos(angle + Math.PI / 2) * markLength;
                      const perpY = Math.sin(angle + Math.PI / 2) * markLength;

                      return (
                        <g key={`mark-${i}`}>
                          {/* Measurement mark */}
                          <line
                            x1={x}
                            y1={y}
                            x2={x + perpX}
                            y2={y + perpY}
                            stroke="#4b5563"
                            strokeWidth={i % 5 === 0 ? 1.5 : 1}
                          />

                          {/* Numbers */}
                          {i % 5 === 0 && (
                            <text
                              x={x + perpX * 2}
                              y={y + perpY * 2 + 4}
                              textAnchor="middle"
                              fontSize="11"
                              fontWeight="600"
                              fill="#6b7280"
                            >
                              {i * 10}
                            </text>
                          )}
                        </g>
                      );
                    })}

                    {/* Target indicator line */}
                    <line
                      x1={75 + (drawAmount / currentWater) * 205}
                      y1={80 + (drawAmount / currentWater) * 100 - 15}
                      x2={75 + (drawAmount / currentWater) * 205}
                      y2={80 + (drawAmount / currentWater) * 100 + 15}
                      stroke="#fbbf24"
                      strokeWidth="2"
                      strokeDasharray="3,3"
                      opacity="0.9"
                    />
                  </svg>
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