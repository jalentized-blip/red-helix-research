import React, { useEffect, useState } from 'react';
import { CheckCircle, Droplet, Syringe, Clock, Thermometer } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import SEO from '@/components/SEO';

export default function Instructions() {
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
    <div className="min-h-screen bg-stone-950 pt-24 pb-12 px-4">
      <SEO
        title="Peptide Reconstitution Instructions - Step by Step Guide"
        description="Mobile-friendly peptide reconstitution instructions generated from your calculator inputs."
      />

      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-amber-50 mb-2">
            Your Reconstitution Guide
          </h1>
          <p className="text-stone-400">Follow these steps for proper reconstitution</p>
        </div>

        <div className="bg-gradient-to-br from-red-600/20 to-red-700/10 border-2 border-red-600/50 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-amber-50 mb-4">Your Calculations</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-stone-400">Dose</p>
              <p className="text-2xl font-bold text-red-400">{dose} mg</p>
            </div>
            <div>
              <p className="text-stone-400">Vial Strength</p>
              <p className="text-2xl font-bold text-red-400">{strength} mg</p>
            </div>
            <div>
              <p className="text-stone-400">Water Volume</p>
              <p className="text-2xl font-bold text-red-400">{water} mL</p>
            </div>
            <div>
              <p className="text-stone-400">Syringe Size</p>
              <p className="text-2xl font-bold text-red-400">{syringeSize} mL</p>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-red-600/30">
            <p className="text-stone-400 text-sm mb-2">Draw Amount</p>
            <p className="text-4xl font-black text-amber-50">
              {drawUnits} <span className="text-xl text-stone-400">units</span>
            </p>
            <p className="text-stone-400 text-sm mt-1">({drawAmountML.toFixed(3)} mL)</p>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="bg-stone-900/50 border border-stone-700 rounded-xl p-5 flex gap-4"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-red-600/20 border border-red-600/50 rounded-full flex items-center justify-center">
                  <Icon className="w-6 h-6 text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-amber-50 mb-1">
                    {index + 1}. {step.title}
                  </h3>
                  <p className="text-stone-400 text-sm">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-yellow-950/30 border border-yellow-700/50 rounded-xl p-5 mb-8">
          <h3 className="text-lg font-bold text-yellow-100 mb-3">⚠️ Important Notes</h3>
          <ul className="space-y-2 text-yellow-100/80 text-sm">
            <li>• Always use sterile equipment and fresh needles</li>
            <li>• This vial will give you approximately {dosesInVial} doses</li>
            <li>• Store in refrigerator (2-8°C) after reconstitution</li>
            <li>• Use within 30 days of reconstitution</li>
            <li>• For research purposes only - not for human consumption</li>
          </ul>
        </div>

        <Link to={createPageUrl('PeptideCalculator')}>
          <Button className="w-full bg-red-600 hover:bg-red-700 text-lg py-6">
            Back to Calculator
          </Button>
        </Link>

        <p className="text-center text-stone-500 text-xs mt-6">
          This calculator is for research purposes only. All peptides are sold for research use only 
          and are not intended for human consumption.
        </p>
      </div>
    </div>
  );
}