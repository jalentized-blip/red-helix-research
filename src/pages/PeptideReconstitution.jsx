import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { ArrowLeft, Beaker, Calculator, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function PeptideReconstitution() {
  const [peptideMass, setPeptideMass] = useState('');
  const [bacWaterVolume, setBacWaterVolume] = useState('');
  const [concentration, setConcentration] = useState('');
  const [doseAmount, setDoseAmount] = useState('');
  const [injectionVolume, setInjectionVolume] = useState('');

  // Calculate concentration when mass or volume changes
  useEffect(() => {
    if (peptideMass && bacWaterVolume) {
      const mass = parseFloat(peptideMass);
      const volume = parseFloat(bacWaterVolume);
      if (mass > 0 && volume > 0) {
        const conc = (mass / volume).toFixed(2);
        setConcentration(conc);
      }
    }
  }, [peptideMass, bacWaterVolume]);

  // Calculate injection volume when dose and concentration change
  useEffect(() => {
    if (doseAmount && concentration) {
      const dose = parseFloat(doseAmount);
      const conc = parseFloat(concentration);
      if (dose > 0 && conc > 0) {
        const volume = (dose / conc).toFixed(2);
        setInjectionVolume(volume);
      }
    }
  }, [doseAmount, concentration]);

  const resetCalculator = () => {
    setPeptideMass('');
    setBacWaterVolume('');
    setConcentration('');
    setDoseAmount('');
    setInjectionVolume('');
  };

  return (
    <div className="min-h-screen bg-stone-950 pt-32 pb-20">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-barn-brown hover:text-barn-tan mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-5xl font-black text-amber-50 mb-4">Peptide Reconstitution & Dosage Guide</h1>
          <p className="text-xl text-amber-100">Accurate calculations for research peptide preparation and dosing</p>
        </motion.div>

        <Tabs defaultValue="calculator" className="space-y-8">
          <TabsList className="bg-stone-900/50 border border-stone-700">
            <TabsTrigger value="calculator" className="gap-2">
              <Calculator className="w-4 h-4" />
              Calculator
            </TabsTrigger>
            <TabsTrigger value="guide" className="gap-2">
              <Beaker className="w-4 h-4" />
              Step-by-Step Guide
            </TabsTrigger>
            <TabsTrigger value="storage" className="gap-2">
              <Info className="w-4 h-4" />
              Storage & Stability
            </TabsTrigger>
          </TabsList>

          {/* Calculator Tab */}
          <TabsContent value="calculator" className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Reconstitution Calculator */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="bg-stone-900/50 border-stone-700 p-8">
                  <h3 className="text-2xl font-bold text-amber-50 mb-6">Step 1: Reconstitution</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-amber-100 font-semibold mb-2">
                        Peptide Mass (mg)
                      </label>
                      <Input
                        type="number"
                        placeholder="Enter peptide weight"
                        value={peptideMass}
                        onChange={(e) => setPeptideMass(e.target.value)}
                        className="bg-stone-800 border-stone-600 text-amber-50 placeholder:text-stone-400"
                      />
                    </div>

                    <div>
                      <label className="block text-amber-100 font-semibold mb-2">
                        BAC Water Volume (mL)
                      </label>
                      <Input
                        type="number"
                        placeholder="Enter reconstitution volume"
                        value={bacWaterVolume}
                        onChange={(e) => setBacWaterVolume(e.target.value)}
                        className="bg-stone-800 border-stone-600 text-amber-50 placeholder:text-stone-400"
                      />
                      <p className="text-xs text-stone-400 mt-2">Standard: 1mL BAC water per 1mg peptide</p>
                    </div>

                    <div className="bg-barn-brown/20 border border-barn-brown/30 rounded-lg p-4">
                      <p className="text-sm text-stone-400 mb-2">Final Concentration</p>
                      <p className="text-3xl font-bold text-barn-tan">{concentration || '0'} mg/mL</p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Dosage Calculator */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Card className="bg-stone-900/50 border-stone-700 p-8">
                  <h3 className="text-2xl font-bold text-amber-50 mb-6">Step 2: Dosage Calculation</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-amber-100 font-semibold mb-2">
                        Desired Dose (mcg)
                      </label>
                      <Input
                        type="number"
                        placeholder="Enter dose amount"
                        value={doseAmount}
                        onChange={(e) => setDoseAmount(e.target.value)}
                        className="bg-stone-800 border-stone-600 text-amber-50 placeholder:text-stone-400"
                      />
                    </div>

                    <div>
                      <label className="block text-amber-100 font-semibold mb-2">
                        Concentration (mg/mL)
                      </label>
                      <Input
                        type="number"
                        placeholder="Auto-calculated above"
                        value={concentration}
                        disabled
                        className="bg-stone-800 border-stone-600 text-amber-50 placeholder:text-stone-400 opacity-60"
                      />
                    </div>

                    <div className="bg-barn-brown/20 border border-barn-brown/30 rounded-lg p-4">
                      <p className="text-sm text-stone-400 mb-2">Injection Volume</p>
                      <p className="text-3xl font-bold text-barn-tan">{injectionVolume || '0'} mL</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Button 
                onClick={resetCalculator}
                variant="outline"
                className="w-full border-barn-brown/30 text-barn-tan hover:bg-barn-brown/10"
              >
                Reset Calculator
              </Button>
            </motion.div>
          </TabsContent>

          {/* Guide Tab */}
          <TabsContent value="guide" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              {[
                {
                  step: 1,
                  title: 'Gather Materials',
                  description: 'Collect your peptide powder, bacteriostatic water (BAC water), sterile syringes (3mL and 1mL), insulin needles, sterile vials, and alcohol wipes.'
                },
                {
                  step: 2,
                  title: 'Prepare the Vial',
                  description: 'Remove the peptide vial from storage. Wipe the rubber stopper with an alcohol wipe. Let it air dry for 30 seconds. Do the same for your BAC water vial.'
                },
                {
                  step: 3,
                  title: 'Draw BAC Water',
                  description: 'Using a 3mL syringe, draw the calculated volume of bacteriostatic water (based on your peptide weight). Standard ratio is 1mL per 1mg of peptide.'
                },
                {
                  step: 4,
                  title: 'Inject into Peptide Vial',
                  description: 'Slowly inject the BAC water into the peptide vial at an angle to avoid foaming. This reduces pressure and keeps the solution stable.'
                },
                {
                  step: 5,
                  title: 'Let it Dissolve',
                  description: 'Allow the solution to sit for 5-15 minutes at room temperature. Do NOT shake vigorously—gentle swirling is fine. Some peptides dissolve faster than others.'
                },
                {
                  step: 6,
                  title: 'Calculate Your Dose',
                  description: 'Use the calculator above to determine how much of your solution to inject for your desired dose. Document your calculations clearly.'
                },
                {
                  step: 7,
                  title: 'Store Properly',
                  description: 'Keep unused reconstituted peptides in the refrigerator (2-8°C) for short-term use. For longer storage, freeze at -80°C.'
                }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-stone-900/50 border border-stone-700 rounded-lg p-6"
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-barn-brown/20 border border-barn-brown/30">
                        <span className="text-barn-tan font-bold">{item.step}</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-amber-50 mb-2">{item.title}</h4>
                      <p className="text-amber-100">{item.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>

          {/* Storage Tab */}
          <TabsContent value="storage" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <Card className="bg-gradient-to-r from-barn-brown/20 to-barn-tan/10 border border-barn-brown/30 p-8">
                <h3 className="text-2xl font-bold text-amber-50 mb-4">Lyophilized (Powder) Peptides</h3>
                <div className="space-y-3 text-amber-100">
                  <p><strong>Short-term:</strong> Room temperature in a cool, dry, dark place (up to 3 months)</p>
                  <p><strong>Long-term:</strong> -20°C freezer (1-2 years) or -80°C freezer (multiple years)</p>
                  <p><strong>Key tip:</strong> Avoid repeated freezing and thawing. Consider dividing into smaller aliquots before freezing.</p>
                </div>
              </Card>

              <Card className="bg-gradient-to-r from-barn-brown/20 to-barn-tan/10 border border-barn-brown/30 p-8">
                <h3 className="text-2xl font-bold text-amber-50 mb-4">Reconstituted Peptides</h3>
                <div className="space-y-3 text-amber-100">
                  <p><strong>Short-term (2-7 days):</strong> Refrigerator at 2-8°C in a sterile vial</p>
                  <p><strong>Medium-term (1-2 months):</strong> -20°C freezer with proper labeling</p>
                  <p><strong>Long-term (6+ months):</strong> -80°C freezer for maximum stability</p>
                  <p><strong>Key tip:</strong> Bacteriostatic water contains preservatives that help extend shelf life. Avoid exposure to light.</p>
                </div>
              </Card>

              <Card className="bg-stone-900/50 border border-stone-700 p-8">
                <h3 className="text-2xl font-bold text-amber-50 mb-4">Stability Factors</h3>
                <div className="space-y-3 text-amber-100">
                  <p>✓ <strong>Temperature:</strong> Cooler = longer stability. Freeze when not using.</p>
                  <p>✓ <strong>Light Exposure:</strong> Keep vials in dark containers or wrapped in foil.</p>
                  <p>✓ <strong>Moisture:</strong> Store in dry conditions. Moisture degrades peptides quickly.</p>
                  <p>✓ <strong>Solvent Quality:</strong> Always use bacteriostatic water, never sterile water.</p>
                  <p>✓ <strong>Contamination:</strong> Use sterile technique when drawing peptides to avoid bacterial growth.</p>
                </div>
              </Card>

              <Card className="bg-red-900/20 border border-red-700/30 p-8">
                <h3 className="text-xl font-bold text-amber-50 mb-3">⚠️ Signs of Degradation</h3>
                <ul className="space-y-2 text-amber-100 text-sm">
                  <li>• Discoloration or cloudiness in solution</li>
                  <li>• Unusual odor</li>
                  <li>• Formation of crystals or precipitate</li>
                  <li>• Unexplained loss of potency</li>
                </ul>
                <p className="mt-4 text-amber-50 font-semibold">If degradation is suspected, discard the peptide and start fresh with a new vial.</p>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 bg-stone-900/30 border border-stone-700 rounded-lg p-8 text-center"
        >
          <p className="text-amber-100 mb-4">
            For Research and Laboratory Use Only
          </p>
          <p className="text-stone-400 text-sm">
            Always follow proper safety protocols and local regulations when working with research peptides. When in doubt, consult official COAs and safety data sheets.
          </p>
        </motion.div>
      </div>
    </div>
  );
}