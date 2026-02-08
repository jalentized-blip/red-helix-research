import React, { useEffect, useState } from 'react';
import { CheckCircle, Droplet, Syringe, Clock, Thermometer } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import SEO from '@/components/SEO';

export default function PeptideInstructions() {
  const [params, setParams] = useState({
    dose: '0',
    strength: '0',
    water: '0',
    syringeSize: '1'
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setParams({
      dose: urlParams.get('dose') || '0',
      strength: urlParams.get('strength') || '0',
      water: urlParams.get('water') || '0',
      syringeSize: urlParams.get('syringeSize') || '1'
    });
  }, []);

  const dose = parseFloat(params.dose);
  const strength = parseFloat(params.strength);
  const water = parseFloat(params.water);
  const syringeSize = parseFloat(params.syringeSize);
  const totalUnits = syringeSize * 100;

  const concentration = water > 0 ? strength / water : 0;
  const drawAmountML = concentration > 0 ? dose / concentration : 0;
  const drawUnits = Math.round(drawAmountML * 100);
  const dosesInVial = concentration > 0 && dose > 0 ? Math.floor(strength / dose) : 0;

  const steps = [
    {
      icon: Droplet,
      title: `Draw ${water} mL of Bacteriostatic Water`,
      description: `Use a sterile syringe to draw exactly ${water} mL of bacteriostatic water.`
    },
    {
      icon: Syringe,
      title: 'Inject Into Vial',
      description: `Slowly inject the water into your ${strength} mg peptide vial along the glass wall, not directly onto the powder.`
    },
    {
      icon: Clock,
      title: 'Let Reconstitute',
      description: 'Gently swirl (do not shake) and let sit for 5-10 minutes until completely dissolved.'
    },
    {
      icon: CheckCircle,
      title: `Draw ${drawAmountML.toFixed(3)} mL (${drawUnits} units)`,
      description: `Using your ${syringeSize}mL syringe, draw to the ${drawUnits} unit mark for your ${dose} mg dose.`
    },
    {
      icon: Thermometer,
      title: 'Store Properly',
      description: 'Store reconstituted peptide in refrigerator (2-8°C). Use within 30 days.'
    }
  ];

  return (
    <div className="min-h-screen bg-white pt-24 pb-12 px-4">
      <SEO
        title="Peptide Reconstitution Instructions - Step by Step Guide"
        description="Mobile-friendly peptide reconstitution instructions generated from your calculator inputs."
      />

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tight">
            Your Reconstitution Guide
          </h1>
          <p className="text-slate-500 font-medium">Follow these steps for proper reconstitution</p>
        </div>

        {/* Summary Card */}
        <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-[32px] p-8 mb-8 shadow-xl shadow-red-200/50 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-xl font-bold text-white/90 mb-6 border-b border-white/20 pb-4">Your Calculations</h2>
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <p className="text-red-100/80 mb-1">Dose</p>
                <p className="text-2xl font-bold text-white">{dose} mg</p>
              </div>
              <div>
                <p className="text-red-100/80 mb-1">Vial Strength</p>
                <p className="text-2xl font-bold text-white">{strength} mg</p>
              </div>
              <div>
                <p className="text-red-100/80 mb-1">Water Volume</p>
                <p className="text-2xl font-bold text-white">{water} mL</p>
              </div>
              <div>
                <p className="text-red-100/80 mb-1">Syringe Size</p>
                <p className="text-2xl font-bold text-white">{syringeSize} mL</p>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-white/20">
              <p className="text-red-100/80 text-sm mb-2 font-medium uppercase tracking-wide">Draw Amount</p>
              <div className="flex items-baseline gap-3">
                <p className="text-5xl font-black text-white">
                  {drawUnits}
                </p>
                <span className="text-2xl text-red-100/80 font-medium">units</span>
              </div>
              <p className="text-white/60 text-sm mt-2 font-mono">({drawAmountML.toFixed(3)} mL)</p>
            </div>
          </div>
          
          {/* Decorative background element */}
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        </div>

        {/* Steps */}
        <div className="space-y-4 mb-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="bg-white border border-slate-200 rounded-2xl p-6 flex gap-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-red-50 border border-red-100 rounded-full flex items-center justify-center">
                  <Icon className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    <span className="text-red-600 mr-2">{index + 1}.</span> {step.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed font-medium">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Important Notes */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
            <span>⚠️</span> Important Notes
          </h3>
          <ul className="space-y-3 text-amber-800 text-sm font-medium">
            <li className="flex gap-2">
              <span className="text-amber-500">•</span>
              <span>Always use sterile equipment and fresh needles</span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber-500">•</span>
              <span>This vial will give you approximately {dosesInVial} doses</span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber-500">•</span>
              <span>Store in refrigerator (2-8°C) after reconstitution</span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber-500">•</span>
              <span>Use within 30 days of reconstitution</span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber-500">•</span>
              <span>For research purposes only - not for human consumption</span>
            </li>
          </ul>
        </div>

        {/* Action Button */}
        <Link to={createPageUrl('PeptideCalculator')}>
          <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white text-lg py-6 rounded-xl font-bold shadow-lg shadow-slate-200">
            Back to Calculator
          </Button>
        </Link>

        {/* Disclaimer */}
        <p className="text-center text-slate-400 text-xs mt-8 font-medium">
          This calculator is for research purposes only. All peptides are sold for research use only 
          and are not intended for human consumption.
        </p>
      </div>
    </div>
  );
}
