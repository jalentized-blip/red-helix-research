import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Info, RotateCcw } from 'lucide-react';

export default function PeptideCalculator() {
  const [dose, setDose] = useState('1');
  const [doseCustom, setDoseCustom] = useState('');
  const [strength, setStrength] = useState('10');
  const [strengthCustom, setStrengthCustom] = useState('');
  const [water, setWater] = useState('1.0');
  const [waterCustom, setWaterCustom] = useState('');

  // Fetch products
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const doseOptions = ['0.1', '0.25', '0.5', '1', '2.5', '5', '7.5', '10', '12.5', '15', '50'];
  const strengthOptions = ['1', '5', '10', '15', '20', '30', '50', '1000'];
  const waterOptions = ['1.0', '2.0', '3.0', '5.0', '10.0'];

  const currentDose = dose === 'other' ? parseFloat(doseCustom) || 0 : parseFloat(dose);
  const currentStrength = strength === 'other' ? parseFloat(strengthCustom) || 0 : parseFloat(strength);
  const currentWater = water === 'other' ? parseFloat(waterCustom) || 0 : parseFloat(water);

  const concentration = currentWater > 0 ? currentStrength / currentWater : 0;
  const drawAmount = concentration > 0 ? (currentDose / concentration).toFixed(2) : 0;
  const drawUnits = concentration > 0 ? (currentDose / concentration * 100).toFixed(0) : 0;
  const dosesInVial = concentration > 0 && currentDose > 0 ? Math.floor(currentStrength / currentDose) : 0;

  const isValid = currentDose > 0 && currentStrength > 0 && currentWater > 0;

  const handleReset = () => {
    setDose('1');
    setDoseCustom('');
    setStrength('10');
    setStrengthCustom('');
    setWater('1.0');
    setWaterCustom('');
  };

  return (
    <div className="min-h-screen bg-stone-950 pt-32 pb-20">
      {/* Header */}
            <div className="max-w-6xl mx-auto px-4 mb-12">
              <div className="text-center mb-8">
                <h1 className="text-5xl font-black text-amber-50 mb-3">Peptide Reconstitution Calculator</h1>
                <p className="text-stone-400 text-lg">Calculate your peptide dosage with precision</p>
              </div>

              {/* Disclaimer */}
              <div className="bg-yellow-950/30 border border-yellow-700/50 rounded-lg p-4 mb-8">
                <p className="text-yellow-100 text-sm text-center">
                  <span className="font-semibold">⚠️ Disclaimer:</span> This calculator is strictly for research purposes only. All peptides are sold for research use only and are not intended for human consumption. Always follow local laws and regulations.
                </p>
              </div>
            </div>

      {/* Main Calculator Grid */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT SIDE - INPUTS */}
          <div className="space-y-6">
            {/* Dose */}
            <div className="bg-stone-900/50 border border-stone-700 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-3">
                <label className="text-amber-50 font-semibold">Dose</label>
                <Info className="w-4 h-4 text-stone-500" />
              </div>
              {dose !== 'other' ? (
                <>
                  <Select value={dose} onValueChange={setDose}>
                    <SelectTrigger className="bg-stone-800 border-stone-600 text-amber-50 mb-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-stone-800 border-stone-600">
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
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-stone-600 text-stone-400 hover:text-red-600 hover:border-red-600 w-full"
                    onClick={() => setDose('other')}
                  >
                    Custom
                  </Button>
                </>
              ) : (
                <>
                  <input
                    type="number"
                    value={doseCustom}
                    onChange={(e) => setDoseCustom(e.target.value)}
                    placeholder="Enter dose"
                    className="w-full bg-stone-800 border border-stone-600 rounded px-3 py-2 text-amber-50 placeholder-stone-500 focus:outline-none focus:border-red-600 mb-3"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-stone-600 text-stone-400 hover:text-red-600 hover:border-red-600 w-full"
                    onClick={() => {
                      setDose('1');
                      setDoseCustom('');
                    }}
                  >
                    Use Preset
                  </Button>
                </>
              )}
            </div>

            {/* Peptide Strength */}
            <div className="bg-stone-900/50 border border-stone-700 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-3">
                <label className="text-amber-50 font-semibold">Peptide Strength (Vial)</label>
                <Info className="w-4 h-4 text-stone-500" />
              </div>
              {strength !== 'other' ? (
                <>
                  <Select value={strength} onValueChange={setStrength}>
                    <SelectTrigger className="bg-stone-800 border-stone-600 text-amber-50 mb-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-stone-800 border-stone-600">
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
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-stone-600 text-stone-400 hover:text-red-600 hover:border-red-600 w-full"
                    onClick={() => setStrength('other')}
                  >
                    Custom
                  </Button>
                </>
              ) : (
                <>
                  <input
                    type="number"
                    value={strengthCustom}
                    onChange={(e) => setStrengthCustom(e.target.value)}
                    placeholder="Enter strength"
                    className="w-full bg-stone-800 border border-stone-600 rounded px-3 py-2 text-amber-50 placeholder-stone-500 focus:outline-none focus:border-red-600 mb-3"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-stone-600 text-stone-400 hover:text-red-600 hover:border-red-600 w-full"
                    onClick={() => {
                      setStrength('10');
                      setStrengthCustom('');
                    }}
                  >
                    Use Preset
                  </Button>
                </>
              )}
            </div>

            {/* Water Volume */}
            <div className="bg-stone-900/50 border border-stone-700 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-3">
                <label className="text-amber-50 font-semibold">Bacteriostatic Water</label>
                <Info className="w-4 h-4 text-stone-500" />
              </div>
              {water !== 'other' ? (
                <>
                  <Select value={water} onValueChange={setWater}>
                    <SelectTrigger className="bg-stone-800 border-stone-600 text-amber-50 mb-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-stone-800 border-stone-600">
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
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-stone-600 text-stone-400 hover:text-red-600 hover:border-red-600 w-full"
                    onClick={() => setWater('other')}
                  >
                    Custom
                  </Button>
                </>
              ) : (
                <>
                  <input
                    type="number"
                    value={waterCustom}
                    onChange={(e) => setWaterCustom(e.target.value)}
                    placeholder="Enter volume"
                    className="w-full bg-stone-800 border border-stone-600 rounded px-3 py-2 text-amber-50 placeholder-stone-500 focus:outline-none focus:border-red-600 mb-3"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-stone-600 text-stone-400 hover:text-red-600 hover:border-red-600 w-full"
                    onClick={() => {
                      setWater('1.0');
                      setWaterCustom('');
                    }}
                  >
                    Use Preset
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* RIGHT SIDE - RESULTS */}
          <div className="bg-stone-900/50 border border-stone-700 rounded-lg p-8 sticky top-32 h-fit">
            <h2 className="text-2xl font-bold text-amber-50 mb-8">Results</h2>

            {!isValid ? (
              <div className="text-stone-400 text-center py-12">
                <p>Enter values to calculate</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Results Cards */}
                <div className="space-y-5">
                {/* Draw Amount */}
                <div className="bg-stone-800/50 rounded-lg p-5 border border-stone-700">
                  <p className="text-stone-400 text-sm mb-2">Draw to</p>
                  <p className="text-3xl font-bold text-red-600">{drawAmount} mL</p>
                </div>

                {/* Draw Units */}
                <div className="bg-stone-800/50 rounded-lg p-5 border border-stone-700">
                  <p className="text-stone-400 text-sm mb-2">Or draw to</p>
                  <p className="text-3xl font-bold text-red-600">{drawUnits} units</p>
                </div>

                {/* Concentration */}
                <div className="bg-stone-800/50 rounded-lg p-5 border border-stone-700">
                  <p className="text-stone-400 text-sm mb-2">Concentration</p>
                  <p className="text-3xl font-bold text-red-600">{concentration.toFixed(2)}</p>
                  <p className="text-stone-500 text-sm mt-1">mg/mL</p>
                </div>

                {/* Doses in Vial */}
                <div className="bg-stone-800/50 rounded-lg p-5 border border-stone-700">
                  <p className="text-stone-400 text-sm mb-2">Doses in vial</p>
                  <p className="text-3xl font-bold text-red-600">{dosesInVial}</p>
                </div>

                {drawAmount > currentWater && (
                  <div className="bg-red-600/20 border border-red-600/50 rounded-lg p-4 text-red-400 text-sm mt-6">
                    ⚠️ Draw amount exceeds available volume. Adjust dose or water.
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 mt-8 pt-6 border-t border-stone-700">
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="flex-1 border-stone-600 text-stone-400 hover:text-red-600 hover:border-red-600"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                  <Button className="flex-1 bg-red-600 hover:bg-red-700 text-amber-50">
                    Copy Results
                  </Button>
                </div>
                </div>
                </div>
                )}
                </div>
                </div>
                </div>

                {/* Syringe Visualization */}
                {isValid && (
                <div className="max-w-6xl mx-auto px-4 mt-12">
                  <div className="bg-stone-800/50 rounded-lg p-6 border border-stone-700 overflow-x-auto">
                    <p className="text-stone-400 text-sm mb-4 font-semibold">Syringe Markings (1mL)</p>
                    <svg viewBox="0 0 1100 120" className="w-full h-40" style={{ minWidth: '900px' }}>
                      {/* Syringe barrel */}
                      <rect x="50" y="30" width="1000" height="60" rx="8" fill="none" stroke="currentColor" strokeWidth="3" className="text-red-600" />

                      {/* Syringe plunger */}
                      <rect
                        x="50"
                        y="30"
                        width={Math.min(1000, (drawUnits / 100) * 1000)}
                        height="60"
                        rx="8"
                        fill="currentColor"
                        opacity="0.25"
                        className="text-red-600"
                      />

                      {/* Major markings (every 10 units) */}
                      {Array.from({ length: 11 }, (_, i) => i * 10).map((units) => (
                        <g key={units}>
                          <line
                            x1={50 + (units / 100) * 1000}
                            y1="10"
                            x2={50 + (units / 100) * 1000}
                            y2="25"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-red-600"
                          />
                          <text
                            x={50 + (units / 100) * 1000}
                            y="8"
                            textAnchor="middle"
                            fontSize="16"
                            fontWeight="700"
                            fill="currentColor"
                            className="text-red-600"
                          >
                            {units}
                          </text>
                        </g>
                      ))}

                      {/* Minor markings (every 5 units) */}
                      {Array.from({ length: 20 }, (_, i) => (i * 5)).filter(u => u % 10 !== 0).map((units) => (
                        <line
                          key={`minor-${units}`}
                          x1={50 + (units / 100) * 1000}
                          y1="15"
                          x2={50 + (units / 100) * 1000}
                          y2="25"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          className="text-red-600"
                        />
                      ))}

                      {/* Current draw indicator */}
                      <line
                        x1={50 + (drawUnits / 100) * 1000}
                        y1="30"
                        x2={50 + (drawUnits / 100) * 1000}
                        y2="90"
                        stroke="currentColor"
                        strokeWidth="3"
                        className="text-amber-400"
                        strokeDasharray="5,5"
                      />
                    </svg>
                    <p className="text-center text-red-600 font-bold text-lg mt-4">Draw to <span className="text-2xl">{drawUnits}</span> units ({drawAmount} mL)</p>
                  </div>
                </div>
                )}

                {/* Footer Info */}
      <div className="max-w-6xl mx-auto px-4 mt-16">
        <div className="bg-stone-900/30 border border-stone-700 rounded-lg p-8">
          <h3 className="text-xl font-bold text-amber-50 mb-4">How to use</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-stone-400 text-sm">
            <div>
              <p className="font-semibold text-amber-50 mb-2">1. Set your dose</p>
              <p>The amount of peptide you want to administer in milligrams.</p>
            </div>
            <div>
              <p className="font-semibold text-amber-50 mb-2">2. Enter peptide strength</p>
              <p>Total milligrams in your vial from the manufacturer.</p>
            </div>
            <div>
              <p className="font-semibold text-amber-50 mb-2">3. Choose water volume</p>
              <p>The mL of bacteriostatic water you're using for reconstitution.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}