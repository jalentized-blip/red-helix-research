import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function PeptideReconstitutionGuide() {
  return (
    <div className="min-h-screen bg-stone-950 pt-32 pb-20">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 mb-12">
        <Link to={createPageUrl('PeptideCalculator')}>
          <Button variant="outline" className="border-stone-600 text-stone-400 hover:text-red-600 hover:border-red-600 mb-6">
            ← Back to Calculator
          </Button>
        </Link>
        <h1 className="text-5xl font-black text-amber-50 mb-3">Peptide Reconstitution Guide</h1>
        <p className="text-stone-400 text-lg">Step-by-step instructions for proper peptide reconstitution</p>
      </div>

      {/* Disclaimer */}
      <div className="max-w-4xl mx-auto px-4 mb-12">
        <div className="bg-yellow-950/30 border border-yellow-700/50 rounded-lg p-4">
          <p className="text-yellow-100 text-sm">
            <span className="font-semibold">⚠️ Disclaimer:</span> This guide is strictly for research purposes only. All peptides are sold for research use only and are not intended for human consumption. Always follow local laws and regulations.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* Section 1 */}
        <div className="bg-stone-900/50 border border-stone-700 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-amber-50 mb-4">1. Preparation</h2>
          <div className="text-stone-300 space-y-3">
            <p>Before you begin the reconstitution process, gather all necessary materials:</p>
            <ul className="list-disc list-inside space-y-2 text-stone-400">
              <li>Your peptide vial</li>
              <li>Bacteriostatic water (sterile)</li>
              <li>Sterile syringes and needles</li>
              <li>Alcohol prep pads</li>
              <li>A clean, sterile workspace</li>
            </ul>
            <p className="pt-2">Ensure all equipment is sterile and your workspace is clean to prevent contamination.</p>
          </div>
        </div>

        {/* Section 2 */}
        <div className="bg-stone-900/50 border border-stone-700 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-amber-50 mb-4">2. Drawing the Water</h2>
          <div className="text-stone-300 space-y-3">
            <p>Using a sterile syringe:</p>
            <ol className="list-decimal list-inside space-y-2 text-stone-400">
              <li>Draw the calculated amount of bacteriostatic water into your syringe</li>
              <li>Double-check the volume against your calculations</li>
              <li>Ensure there are no air bubbles in the syringe</li>
              <li>Keep the syringe sterile and ready</li>
            </ol>
          </div>
        </div>

        {/* Section 3 */}
        <div className="bg-stone-900/50 border border-stone-700 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-amber-50 mb-4">3. Injecting the Water</h2>
          <div className="text-stone-300 space-y-3">
            <p>Now inject the water into the peptide vial:</p>
            <ol className="list-decimal list-inside space-y-2 text-stone-400">
              <li>Clean the rubber septum of the peptide vial with an alcohol prep pad</li>
              <li>Allow the alcohol to dry completely</li>
              <li>Slowly and carefully inject the water into the vial</li>
              <li>Do not shake or agitate the vial during injection</li>
              <li>Remove the syringe and needle</li>
            </ol>
          </div>
        </div>

        {/* Section 4 */}
        <div className="bg-stone-900/50 border border-stone-700 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-amber-50 mb-4">4. Reconstitution Time</h2>
          <div className="text-stone-300 space-y-3">
            <p>Allow the peptide to reconstitute:</p>
            <ul className="list-disc list-inside space-y-2 text-stone-400">
              <li>Let the vial sit undisturbed for 5-10 minutes</li>
              <li>The peptide will naturally dissolve in the water</li>
              <li>Do not shake or mix during this time</li>
              <li>The solution should become clear</li>
            </ul>
          </div>
        </div>

        {/* Section 5 */}
        <div className="bg-stone-900/50 border border-stone-700 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-amber-50 mb-4">5. Drawing Your Dose</h2>
          <div className="text-stone-300 space-y-3">
            <p>After reconstitution is complete:</p>
            <ol className="list-decimal list-inside space-y-2 text-stone-400">
              <li>Clean the rubber septum again with an alcohol prep pad</li>
              <li>Let it dry completely</li>
              <li>Using a new sterile syringe, carefully withdraw the calculated amount</li>
              <li>Use the syringe markings and visual guide for accuracy</li>
              <li>Double-check your drawn amount</li>
            </ol>
          </div>
        </div>

        {/* Section 6 */}
        <div className="bg-stone-900/50 border border-stone-700 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-amber-50 mb-4">6. Storage</h2>
          <div className="text-stone-300 space-y-3">
            <p>Proper storage ensures the longevity of your peptide solution:</p>
            <ul className="list-disc list-inside space-y-2 text-stone-400">
              <li>Store in a cool, dark place (2-8°C refrigerator is ideal)</li>
              <li>Keep the vial sealed with the rubber septum intact</li>
              <li>Reconstituted peptides typically remain stable for 30 days when properly stored</li>
              <li>Always use a sterile needle when withdrawing from the vial</li>
              <li>Mark the vial with the date of reconstitution</li>
            </ul>
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-red-950/30 border border-red-700/50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Important Safety Notes</h2>
          <ul className="space-y-3 text-stone-300">
            <li><span className="font-semibold text-red-400">✓ Always use sterile equipment</span> - Contamination can render your peptide unusable</li>
            <li><span className="font-semibold text-red-400">✓ Use bacteriostatic water only</span> - Never use regular water</li>
            <li><span className="font-semibold text-red-400">✓ Be gentle with the vial</span> - Excessive shaking can denature peptides</li>
            <li><span className="font-semibold text-red-400">✓ Maintain proper temperature</span> - Keep reconstituted peptides refrigerated</li>
            <li><span className="font-semibold text-red-400">✓ Use fresh needles</span> - Each withdrawal should use a new sterile needle</li>
            <li><span className="font-semibold text-red-400">✓ Follow calculations</span> - Use the peptide calculator to ensure accurate dosing</li>
          </ul>
        </div>

        {/* Back to Calculator */}
        <div className="text-center">
          <Link to={createPageUrl('PeptideCalculator')}>
            <Button className="bg-red-600 hover:bg-red-700 text-amber-50">
              Return to Calculator
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}