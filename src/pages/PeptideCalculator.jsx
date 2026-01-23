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

  const currentDose = dose === 'other' ? parseFloat(doseCustom) : parseFloat(dose);
  const currentStrength = strength === 'other' ? parseFloat(strengthCustom) : parseFloat(strength);
  const vialVolume = 3.0; // Always 3ml vial
  const syringeCapacity = 1.0; // Always 1ml syringe

  // Calculate results
  const concentration = currentStrength / vialVolume;
  const drawAmount = concentration > 0 ? (currentDose / concentration).toFixed(2) : 0;
  const drawUnits = concentration > 0 ? (currentDose / concentration * 100).toFixed(0) : 0;
  const dosesInVial = concentration > 0 ? Math.floor((currentStrength / currentDose)).toFixed(0) : 0;

  const isValidCalc = currentDose > 0 && currentStrength > 0;

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
                <div className="bg-stone-800/50 rounded-lg p-6 mb-8 overflow-x-auto">
                  <div className="mb-4">
                    <svg
                      viewBox="0 0 1200 160"
                      className="w-full h-48 text-red-600 min-w-full"
                      style={{ filter: 'drop-shadow(0 0 10px rgba(220, 38, 38, 0.3))' }}
                    >
                      {/* Syringe barrel */}
                      <rect x="80" y="50" width="1050" height="70" rx="12" fill="none" stroke="currentColor" strokeWidth="2.5" />

                      {/* Syringe plunger */}
                      <rect
                        x="80"
                        y="50"
                        width={Math.min(1050, (drawAmount / currentWater) * 1050)}
                        height="70"
                        rx="12"
                        fill="currentColor"
                        opacity="0.3"
                      />

                      {/* Markings for 1ml syringe */}
                      {Array.from({ length: 11 }, (_, i) => i * 0.1).map((mark) => (
                        <g key={mark}>
                          <line x1={80 + mark * 1050} y1="35" x2={80 + mark * 1050} y2="50" stroke="currentColor" strokeWidth="2" />
                          <text
                            x={80 + mark * 1050}
                            y="25"
                            textAnchor="middle"
                            fontSize="18"
                            fontWeight="700"
                            fill="currentColor"
                            className="text-stone-400"
                          >
                            {(mark * syringeCapacity).toFixed(2)}mL
                          </text>
                        </g>
                      ))}
                    </svg>
                  </div>
                  <p className="text-stone-400 text-sm text-center">Draw {drawAmount} mL from 3mL vial using 1mL syringe</p>
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
                  <p className="text-stone-400 text-sm mb-1">Concentration (3mL Vial)</p>
                  <p className="text-2xl font-bold text-red-600">{concentration.toFixed(2)} mg/mL</p>
                </motion.div>

                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-stone-800/50 rounded-lg p-4"
                >
                  <p className="text-stone-400 text-sm mb-1">Doses in Vial</p>
                  <p className="text-2xl font-bold text-red-600">{dosesInVial}</p>
                </motion.div>

                {drawAmount > syringeCapacity && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-red-600/20 border border-red-600/50 rounded-lg p-4 text-red-400 text-sm"
                  >
                    ⚠️ Draw amount exceeds 1mL syringe capacity. Reduce dose.
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