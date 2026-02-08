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
    <div className="min-h-screen bg-white pt-32 pb-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-slate-50/50 pointer-events-none" />
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        {/* Header */}
        <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-slate-400 hover:text-red-600 mb-12 transition-colors group">
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="text-[10px] font-black uppercase tracking-widest">Return to Command Center</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600/5 border border-red-600/10 rounded-full mb-6">
            <Calculator className="w-3 h-3 text-red-600" />
            <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Precision Protocol</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tighter leading-none">
            RECONSTITUTION <br />
            <span className="text-red-600">CALCULATOR</span>
          </h1>
          <p className="text-xl text-slate-500 font-medium max-w-2xl">
            Mathematical modeling for precise research peptide preparation and analytical deployment.
          </p>
        </motion.div>

        <Tabs defaultValue="calculator" className="space-y-12">
          <TabsList className="bg-slate-50 border border-slate-200 p-1 rounded-2xl h-14 shadow-sm">
            <TabsTrigger value="calculator" className="h-11 px-8 data-[state=active]:bg-red-600 data-[state=active]:text-white text-slate-500 font-black uppercase tracking-widest text-[10px] rounded-xl transition-all gap-2">
              <Calculator className="w-4 h-4" />
              Calculator
            </TabsTrigger>
            <TabsTrigger value="guide" className="h-11 px-8 data-[state=active]:bg-red-600 data-[state=active]:text-white text-slate-500 font-black uppercase tracking-widest text-[10px] rounded-xl transition-all gap-2">
              <Beaker className="w-4 h-4" />
              Protocol Guide
            </TabsTrigger>
            <TabsTrigger value="storage" className="h-11 px-8 data-[state=active]:bg-red-600 data-[state=active]:text-white text-slate-500 font-black uppercase tracking-widest text-[10px] rounded-xl transition-all gap-2">
              <Info className="w-4 h-4" />
              Stability Matrix
            </TabsTrigger>
          </TabsList>

          {/* Calculator Tab */}
          <TabsContent value="calculator" className="space-y-10">
            <div className="grid md:grid-cols-2 gap-10">
              {/* Reconstitution Calculator */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="bg-white border-slate-100 p-10 rounded-[40px] shadow-sm hover:shadow-xl transition-all">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8">Phase I: Dilution</h3>
                  
                  <div className="space-y-8">
                    <div>
                      <label className="block text-[10px] font-black text-slate-900 uppercase tracking-widest mb-3">
                        Peptide Mass (mg)
                      </label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={peptideMass}
                        onChange={(e) => setPeptideMass(e.target.value)}
                        className="h-14 bg-slate-50 border-slate-100 text-slate-900 placeholder:text-slate-400 focus:border-red-600/30 rounded-2xl transition-all text-lg font-black"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-900 uppercase tracking-widest mb-3">
                        BAC Water Volume (mL)
                      </label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={bacWaterVolume}
                        onChange={(e) => setBacWaterVolume(e.target.value)}
                        className="h-14 bg-slate-50 border-slate-100 text-slate-900 placeholder:text-slate-400 focus:border-red-600/30 rounded-2xl transition-all text-lg font-black"
                      />
                      <p className="text-[10px] font-bold text-slate-400 mt-3 uppercase tracking-tighter">Analytical Std: 1.0mL / 1.0mg</p>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-[32px] p-8">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Resolved Concentration</p>
                      <p className="text-4xl font-black text-red-600 tracking-tighter">{concentration || '0.00'} <span className="text-sm uppercase text-slate-400">mg/mL</span></p>
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
                <Card className="bg-white border-slate-100 p-10 rounded-[40px] shadow-sm hover:shadow-xl transition-all">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8">Phase II: Quantitation</h3>
                  
                  <div className="space-y-8">
                    <div>
                      <label className="block text-[10px] font-black text-slate-900 uppercase tracking-widest mb-3">
                        Target Dose (mcg)
                      </label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={doseAmount}
                        onChange={(e) => setDoseAmount(e.target.value)}
                        className="h-14 bg-slate-50 border-slate-100 text-slate-900 placeholder:text-slate-400 focus:border-red-600/30 rounded-2xl transition-all text-lg font-black"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-900 uppercase tracking-widest mb-3">
                        Locked Concentration (mg/mL)
                      </label>
                      <Input
                        type="number"
                        placeholder="Dilution required"
                        value={concentration}
                        disabled
                        className="h-14 bg-slate-50/50 border-slate-100 text-slate-400 focus:border-red-600/30 rounded-2xl transition-all text-lg font-black cursor-not-allowed"
                      />
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-[32px] p-8">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Extraction Volume</p>
                      <p className="text-4xl font-black text-red-600 tracking-tighter">{injectionVolume || '0.00'} <span className="text-sm uppercase text-slate-400">mL</span></p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex justify-center"
            >
              <Button 
                onClick={resetCalculator}
                variant="outline"
                className="px-12 h-14 border-2 border-slate-200 text-slate-900 hover:border-red-600 hover:text-red-600 font-black uppercase tracking-widest rounded-2xl transition-all shadow-sm"
              >
                Reset Computation
              </Button>
            </motion.div>
          </TabsContent>

          {/* Guide Tab */}
          <TabsContent value="guide" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {[
                {
                  step: 1,
                  title: 'Material Inventory',
                  description: 'Audit peptide lyophilized powder, bacteriostatic water (BAC), sterile instrumentation, and sanitization wipes.'
                },
                {
                  step: 2,
                  title: 'Stopper Sanitization',
                  description: 'Apply 70% isopropyl alcohol to vial interfaces. Allow 30 seconds for complete evaporative sterilization.'
                },
                {
                  step: 3,
                  title: 'Aqueous Extraction',
                  description: 'Using clinical-grade instrumentation, extract the calculated volume of bacteriostatic solvent.'
                },
                {
                  step: 4,
                  title: 'Solvent Introduction',
                  description: 'Introduce solvent into the peptide vial at an oblique angle to prevent structural foaming.'
                },
                {
                  step: 5,
                  title: 'Molecular Integration',
                  description: 'Allow 10-15 minutes for passive dissolution. Avoid mechanical agitation or vigorous shaking.'
                },
                {
                  step: 6,
                  title: 'Dosage Verification',
                  description: 'Utilize Phase II computation to verify extraction volume for target research specifications.'
                },
                {
                  step: 7,
                  title: 'Thermal Storage',
                  description: 'Archive reconstituted units within refrigerated environments (2-8°C) to maintain structural integrity.'
                }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex gap-6">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 text-red-600 font-black">
                        {item.step}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-900 mb-2 uppercase tracking-tight">{item.title}</h4>
                      <p className="text-slate-500 font-medium leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>

          {/* Storage Tab */}
          <TabsContent value="storage" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-10"
            >
              <Card className="bg-white border-slate-100 p-10 rounded-[40px] shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-red-600" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Lyophilized Archive</h3>
                </div>
                <div className="space-y-6 text-slate-600">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ambient Stability</p>
                    <p className="font-bold text-slate-900">Up to 90 Days (Cool/Dark)</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Standard Cryogenic</p>
                    <p className="font-bold text-slate-900">-20°C (12-24 Months)</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Deep Cryogenic</p>
                    <p className="font-bold text-slate-900">-80°C (Multi-Year Preservation)</p>
                  </div>
                </div>
              </Card>

              <Card className="bg-white border-slate-100 p-10 rounded-[40px] shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                    <Beaker className="w-5 h-5 text-red-600" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Aqueous Stability</h3>
                </div>
                <div className="space-y-6 text-slate-600">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Standard Refrigeration</p>
                    <p className="font-bold text-slate-900">2-8°C (7-30 Days)</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cryogenic Reconstitution</p>
                    <p className="font-bold text-slate-900">-20°C (30-60 Days)</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Preservation Strategy</p>
                    <p className="font-bold text-slate-900">Minimize UV Exposure & Agitation</p>
                  </div>
                </div>
              </Card>

              <Card className="lg:col-span-2 bg-red-600/5 border-2 border-red-600/10 p-10 rounded-[40px]">
                <h3 className="text-xl font-black text-red-600 tracking-tight uppercase mb-6 flex items-center gap-3">
                  <Info className="w-6 h-6" />
                  Critical Degradation Indicators
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    'Opalescence / Turbidity',
                    'Atmospheric Discoloration',
                    'Crystalline Precipitation',
                    'Potency Attenuation'
                  ].map((warning) => (
                    <div key={warning} className="p-4 bg-white/50 border border-red-600/10 rounded-2xl text-xs font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                      {warning}
                    </div>
                  ))}
                </div>
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
          className="mt-20 p-10 bg-slate-50 border border-slate-100 rounded-[40px] text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
            <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em]">
              Regulatory Compliance: Research Use Only
            </p>
          </div>
          <p className="text-slate-400 text-xs font-medium max-w-2xl mx-auto leading-relaxed uppercase tracking-tighter">
            Analytical procedures must adhere to established laboratory safety protocols. Consult official certificates of analysis (COA) and safety data sheets for specific molecular characteristics.
          </p>
        </motion.div>
      </div>
    </div>
  );
}