import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function PeptideReconstitutionGuide() {
  return (
    <div className="min-h-screen bg-white pt-32 pb-20">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 mb-12">
        <Link to={createPageUrl('PeptideCalculator')}>
          <Button variant="outline" className="border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-600 mb-6 rounded-full">
            ← Back to Calculator
          </Button>
        </Link>
        <h1 className="text-5xl font-black text-slate-900 mb-3 uppercase tracking-tight">Peptide Reconstitution Guide</h1>
        <p className="text-slate-500 text-lg font-medium">Step-by-step instructions for proper peptide reconstitution</p>
      </div>

      {/* Disclaimer */}
      <div className="max-w-4xl mx-auto px-4 mb-12">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <p className="text-amber-900 text-sm font-medium">
            <span className="font-bold">⚠️ Disclaimer:</span> This guide is strictly for research purposes only. All peptides are sold for research use only and are not intended for human consumption. Always follow local laws and regulations.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* Section 1 */}
        <div className="bg-white border border-slate-200 rounded-[24px] p-8 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
            <span className="bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
            Preparation
          </h2>
          <div className="text-slate-600 space-y-3 font-medium leading-relaxed">
            <p>Before you begin the reconstitution process, gather all necessary materials:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-500 pl-4">
              <li>Your peptide vial</li>
              <li>Bacteriostatic water (sterile)</li>
              <li>Sterile syringes and needles</li>
              <li>Alcohol prep pads</li>
              <li>A clean, sterile workspace</li>
            </ul>
            <p className="pt-2 text-slate-700">Ensure all equipment is sterile and your workspace is clean to prevent contamination.</p>
          </div>
        </div>

        {/* Section 2 */}
        <div className="bg-white border border-slate-200 rounded-[24px] p-8 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
            <span className="bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
            Drawing the Water
          </h2>
          <div className="text-slate-600 space-y-3 font-medium leading-relaxed">
            <p>Using a sterile syringe:</p>
            <ol className="list-decimal list-inside space-y-2 text-slate-500 pl-4">
              <li>Draw the calculated amount of bacteriostatic water into your syringe</li>
              <li>Double-check the volume against your calculations</li>
              <li>Ensure there are no air bubbles in the syringe</li>
              <li>Keep the syringe sterile and ready</li>
            </ol>
          </div>
        </div>

        {/* Section 3 */}
        <div className="bg-white border border-slate-200 rounded-[24px] p-8 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
            <span className="bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
            Injecting the Water
          </h2>
          <div className="text-slate-600 space-y-3 font-medium leading-relaxed">
            <p>Now inject the water into the peptide vial:</p>
            <ol className="list-decimal list-inside space-y-2 text-slate-500 pl-4">
              <li>Clean the rubber septum of the peptide vial with an alcohol prep pad</li>
              <li>Allow the alcohol to dry completely</li>
              <li>Slowly and carefully inject the water into the vial</li>
              <li>Do not shake or agitate the vial during injection</li>
              <li>Remove the syringe and needle</li>
            </ol>
          </div>
        </div>

        {/* Section 4 */}
        <div className="bg-white border border-slate-200 rounded-[24px] p-8 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
            <span className="bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">4</span>
            Reconstitution Time
          </h2>
          <div className="text-slate-600 space-y-3 font-medium leading-relaxed">
            <p>Allow the peptide to reconstitute:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-500 pl-4">
              <li>Let the vial sit undisturbed for 5-10 minutes</li>
              <li>The peptide will naturally dissolve in the water</li>
              <li>Do not shake or mix during this time</li>
              <li>The solution should become clear</li>
            </ul>
          </div>
        </div>

        {/* Section 5 */}
        <div className="bg-white border border-slate-200 rounded-[24px] p-8 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
            <span className="bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">5</span>
            Drawing Your Dose
          </h2>
          <div className="text-slate-600 space-y-3 font-medium leading-relaxed">
            <p>After reconstitution is complete:</p>
            <ol className="list-decimal list-inside space-y-2 text-slate-500 pl-4">
              <li>Clean the rubber septum again with an alcohol prep pad</li>
              <li>Let it dry completely</li>
              <li>Using a new sterile syringe, carefully withdraw the calculated amount</li>
              <li>Use the syringe markings and visual guide for accuracy</li>
              <li>Double-check your drawn amount</li>
            </ol>
          </div>
        </div>

        {/* Section 6 */}
        <div className="bg-white border border-slate-200 rounded-[24px] p-8 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
            <span className="bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">6</span>
            Storage
          </h2>
          <div className="text-slate-600 space-y-3 font-medium leading-relaxed">
            <p>Proper storage ensures the longevity of your peptide solution:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-500 pl-4">
              <li>Store in a cool, dark place (2-8°C refrigerator is ideal)</li>
              <li>Keep the vial sealed with the rubber septum intact</li>
              <li>Reconstituted peptides typically remain stable for 30 days when properly stored</li>
              <li>Always use a sterile needle when withdrawing from the vial</li>
              <li>Mark the vial with the date of reconstitution</li>
            </ul>
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-red-50 border border-red-200 rounded-[24px] p-8 shadow-sm">
          <h2 className="text-2xl font-black text-red-700 mb-6 flex items-center gap-2">
            ⚠️ Important Safety Notes
          </h2>
          <ul className="space-y-4 text-slate-700 font-medium">
            <li className="flex gap-3 items-start">
              <span className="text-red-600 font-bold">✓</span>
              <span><span className="font-bold text-red-700">Always use sterile equipment</span> - Contamination can render your peptide unusable</span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="text-red-600 font-bold">✓</span>
              <span><span className="font-bold text-red-700">Use bacteriostatic water only</span> - Never use regular water</span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="text-red-600 font-bold">✓</span>
              <span><span className="font-bold text-red-700">Be gentle with the vial</span> - Excessive shaking can denature peptides</span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="text-red-600 font-bold">✓</span>
              <span><span className="font-bold text-red-700">Maintain proper temperature</span> - Keep reconstituted peptides refrigerated</span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="text-red-600 font-bold">✓</span>
              <span><span className="font-bold text-red-700">Use fresh needles</span> - Each withdrawal should use a new sterile needle</span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="text-red-600 font-bold">✓</span>
              <span><span className="font-bold text-red-700">Follow calculations</span> - Use the peptide calculator to ensure accurate dosing</span>
            </li>
          </ul>
        </div>

        {/* Back to Calculator */}
        <div className="text-center pt-8">
          <Link to={createPageUrl('PeptideCalculator')}>
            <Button className="bg-red-600 hover:bg-red-700 text-white rounded-full px-8 py-6 font-bold uppercase tracking-wider shadow-lg shadow-red-200 text-lg">
              Return to Calculator
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
