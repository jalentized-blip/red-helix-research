import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import SEO from '@/components/SEO';
import { generateBreadcrumbSchema, generateHowToSchema } from '@/components/utils/advancedSchemaHelpers';

export default function PeptideReconstitutionGuide() {
  return (
    <div className="min-h-screen bg-white pt-32 pb-20">
      <SEO
        title="Peptide Reconstitution Guide — Laboratory Research Use Only"
        description="Complete in-vitro laboratory guide to reconstituting research peptides. Covers sterile technique, bacteriostatic water ratios, and storage for laboratory researchers. For in-vitro research use only — not for human use."
        keywords="peptide reconstitution guide, laboratory peptide reconstitution, how to reconstitute research peptides, bacteriostatic water reconstitution, lyophilized peptide lab guide, in-vitro peptide preparation, research peptide handling"
        canonical="https://redhelixresearch.com/PeptideReconstitutionGuide"
        schema={[
          generateBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Peptide Calculator', url: '/PeptideCalculator' },
            { name: 'Reconstitution Guide', url: '/PeptideReconstitutionGuide' }
          ]),
          generateHowToSchema(
            'How to Reconstitute Research Peptides',
            'Step-by-step guide for proper peptide reconstitution with bacteriostatic water',
            [
              { title: 'Gather Materials', description: 'Prepare peptide vial, bacteriostatic water, insulin syringe, alcohol pads, and sterile needle.' },
              { title: 'Clean Vial Tops', description: 'Wipe the tops of both the peptide vial and bacteriostatic water with alcohol pads.' },
              { title: 'Draw Bacteriostatic Water', description: 'Using a syringe, draw the appropriate amount of bacteriostatic water.' },
              { title: 'Add Water to Peptide', description: 'Slowly inject the water along the inside wall of the peptide vial.' },
              { title: 'Gently Swirl', description: 'Gently swirl the vial until the peptide is fully dissolved. Do not shake.' },
              { title: 'Store Properly', description: 'Store reconstituted peptide in a refrigerator at 2-8°C.' }
            ],
            'PT15M'
          )
        ]}
      />
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 mb-12">
        <Link to={createPageUrl('PeptideCalculator')}>
          <Button variant="outline" className="border-slate-200 text-slate-500 hover:text-[#dc2626] hover:border-[#dc2626] mb-6 rounded-full">
            ← Back to Calculator
          </Button>
        </Link>
        <h1 className="text-5xl font-black text-slate-900 mb-3 uppercase tracking-tight">Peptide Reconstitution Guide</h1>
        <p className="text-slate-500 text-lg font-medium">Step-by-step instructions for proper peptide reconstitution</p>
      </div>

      {/* Disclaimer */}
      <div className="max-w-4xl mx-auto px-4 mb-12">
        <div className="bg-[#8B2635] rounded-2xl p-6">
          <p className="text-white text-sm font-medium leading-relaxed">
            <span className="font-black uppercase tracking-widest block mb-2">⚠ MANDATORY RESEARCH DISCLAIMER</span>
            This guide is exclusively for licensed laboratory researchers performing <strong>in-vitro research only</strong>. These procedures describe laboratory reconstitution techniques for handling research-grade peptide compounds. <strong>This is NOT a guide for human self-administration.</strong> Red Helix Research products are sold strictly for scientific research and are <strong>NOT approved by the FDA for human or animal use</strong>. Not intended to diagnose, treat, cure, or prevent any disease. Users must comply with all applicable federal, state, and local laws regarding research chemicals.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* Section 1 */}
        <div className="bg-white border border-slate-200 rounded-[24px] p-8 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
            <span className="bg-[#dc2626] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
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
            <span className="bg-[#dc2626] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
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
            <span className="bg-[#dc2626] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
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
            <span className="bg-[#dc2626] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">4</span>
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
            <span className="bg-[#dc2626] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">5</span>
            Withdrawing Your Research Aliquot
          </h2>
          <div className="text-slate-600 space-y-3 font-medium leading-relaxed">
            <p>After reconstitution is complete, withdraw your laboratory aliquot:</p>
            <ol className="list-decimal list-inside space-y-2 text-slate-500 pl-4">
              <li>Clean the rubber septum again with an alcohol prep pad</li>
              <li>Let it dry completely</li>
              <li>Using a new sterile syringe, carefully withdraw the calculated aliquot volume</li>
              <li>Use the syringe markings and visual guide for accuracy</li>
              <li>Double-check your drawn aliquot volume</li>
            </ol>
            <p className="text-[11px] font-black text-[#8B2635] uppercase tracking-wider pt-2">⚠ These are laboratory aliquot volumes for in-vitro research only — not human dosing instructions.</p>
          </div>
        </div>

        {/* Section 6 */}
        <div className="bg-white border border-slate-200 rounded-[24px] p-8 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
            <span className="bg-[#dc2626] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">6</span>
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
        <div className="bg-[#dc2626] border border-red-500 rounded-[24px] p-8 shadow-sm">
          <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
            ⚠️ Important Safety Notes
          </h2>
          <ul className="space-y-4 text-white font-medium">
            <li className="flex gap-3 items-start">
              <span className="text-white font-bold">✓</span>
              <span><span className="font-bold text-white">Always use sterile equipment</span> - Contamination can render your peptide unusable</span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="text-white font-bold">✓</span>
              <span><span className="font-bold text-white">Use bacteriostatic water only</span> - Never use regular water</span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="text-white font-bold">✓</span>
              <span><span className="font-bold text-white">Be gentle with the vial</span> - Excessive shaking can denature peptides</span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="text-white font-bold">✓</span>
              <span><span className="font-bold text-white">Maintain proper temperature</span> - Keep reconstituted peptides refrigerated</span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="text-white font-bold">✓</span>
              <span><span className="font-bold text-white">Use fresh needles</span> - Each withdrawal should use a new sterile needle</span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="text-white font-bold">✓</span>
              <span><span className="font-bold text-white">Follow calculations</span> - Use the peptide calculator to ensure accurate laboratory aliquot measurements (not human dosing)</span>
            </li>
          </ul>
        </div>

        {/* Back to Calculator */}
        <div className="text-center pt-8">
          <Link to={createPageUrl('PeptideCalculator')}>
            <Button className="bg-[#dc2626] hover:bg-red-700 text-white rounded-full px-8 py-6 font-bold uppercase tracking-wider shadow-lg shadow-red-200 text-lg">
              Return to Calculator
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}