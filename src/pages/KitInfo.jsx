import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Package, Truck, FlaskConical, FileCheck, Clock, AlertTriangle, CheckCircle, ArrowRight, ExternalLink } from 'lucide-react';

export default function KitInfo() {
  return (
    <div className="min-h-screen bg-white pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-amber-100 border border-amber-300 text-amber-800 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full mb-6">
            <Package className="w-4 h-4" />
            Kit Orders — Everything You Need to Know
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-black tracking-tighter leading-none mb-4">
            Your Kit Order Guide
          </h1>
          <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-xl mx-auto">
            Kits are our best-value wholesale option. Before you order — or after yours ships — here's exactly what to expect from start to finish.
          </p>
        </div>

        {/* Section 1: Why Kits Are Different */}
        <div className="mb-10 p-8 bg-slate-50 border border-slate-200 rounded-3xl">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-[#8B2635] rounded-2xl flex items-center justify-center flex-shrink-0">
              <FlaskConical className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-black text-black tracking-tight">What Makes a Kit Different?</h2>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed mb-4">
            Our kits are our <strong className="text-black">wholesale option</strong> — 10-vial bundles at significantly reduced per-vial pricing. To keep costs low and pass maximum savings to you, kits are fulfilled through a dedicated fulfillment center separate from our main warehouse where individual vials ship from.
          </p>
          <p className="text-slate-600 text-sm leading-relaxed">
            This means your order may involve <strong className="text-black">two separate shipments</strong> with <strong className="text-black">two different tracking numbers</strong> — one for your single vials (if any) and one for your kit. Both are on their way; they simply originate from different locations.
          </p>
        </div>

        {/* Section 2: Two Shipments */}
        <div className="mb-10 p-8 bg-amber-50 border border-amber-200 rounded-3xl">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-black text-black tracking-tight">Two Packages, Two Tracking Numbers</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-4 bg-white border border-amber-100 rounded-2xl p-4">
              <div className="w-8 h-8 bg-[#8B2635] rounded-xl flex items-center justify-center flex-shrink-0 text-white font-black text-sm">1</div>
              <div>
                <p className="font-black text-black text-sm mb-1">Single Vial Package</p>
                <p className="text-slate-500 text-sm leading-relaxed">Ships directly from Red Helix Research. You'll receive this tracking number first in most cases. Typically ships within <strong>24–48 hours</strong> of your order.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 bg-white border border-amber-100 rounded-2xl p-4">
              <div className="w-8 h-8 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-black text-sm">2</div>
              <div>
                <p className="font-black text-black text-sm mb-1">Kit Package</p>
                <p className="text-slate-500 text-sm leading-relaxed">Ships from our dedicated kit fulfillment center. Processing can take <strong>up to 36 hours</strong> before it leaves the facility. Arrives separately — don't be alarmed if one package arrives before the other.</p>
              </div>
            </div>
          </div>
          <div className="mt-5 flex items-start gap-3 bg-amber-100 border border-amber-300 rounded-2xl p-4">
            <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
            <p className="text-amber-800 text-xs font-semibold leading-relaxed">
              <strong>Don't panic if your tracking number shows no updates right away.</strong> It's normal for tracking to take up to 24 hours to reflect the first scan after a label is created. Your order is in the system and on its way.
            </p>
          </div>
        </div>

        {/* Section 3: Unlabeled Vials */}
        <div className="mb-10 p-8 bg-green-50 border border-green-200 rounded-3xl">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-green-600 rounded-2xl flex items-center justify-center flex-shrink-0">
              <FileCheck className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-black text-black tracking-tight">Unlabeled Vials — Here's Why & How to Identify Them</h2>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed mb-5">
            Kit vials arrive <strong className="text-black">without individual labels</strong>. This is intentional — by skipping per-vial labeling at the fulfillment stage, we eliminate additional handling costs and pass those savings directly to you. Your kit's <strong className="text-black">product identity and purity are fully verifiable</strong> through our public COA system.
          </p>

          <h3 className="text-sm font-black text-black uppercase tracking-wider mb-4">Two Ways to Identify Your Vials:</h3>

          <div className="space-y-4 mb-5">
            <div className="flex items-start gap-4 bg-white border border-green-100 rounded-2xl p-4">
              <div className="w-8 h-8 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-black text-sm">A</div>
              <div>
                <p className="font-black text-black text-sm mb-1">Batch Number on the Kit Box</p>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Your kit's outer box will have a <strong>batch number printed on the label</strong>. Take that batch number and look it up on our{' '}
                  <a href="https://redhelixresearch.com/COAReports" target="_blank" rel="noopener noreferrer" className="text-green-700 underline font-bold">COA Reports page</a>.
                  {' '}The matching COA will confirm the exact peptide, concentration, purity percentage, and test date for that batch.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 bg-white border border-green-100 rounded-2xl p-4">
              <div className="w-8 h-8 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-black text-sm">B</div>
              <div>
                <p className="font-black text-black text-sm mb-1">Colored Vial Caps</p>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Each peptide type uses a <strong>distinct cap color</strong>. Match the color of your vial's cap to the corresponding product on our COA Reports page. Each product listing includes the cap color used for that batch so you can cross-reference instantly.
                </p>
              </div>
            </div>
          </div>

          <Link
            to={createPageUrl('COAReports')}
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-black text-sm px-6 py-3 rounded-2xl transition-colors"
          >
            <FileCheck className="w-4 h-4" />
            View COA Reports
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Section 4: Delivery Timeline */}
        <div className="mb-10 p-8 bg-blue-50 border border-blue-200 rounded-3xl">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-black text-black tracking-tight">Delivery Timeline</h2>
          </div>
          <div className="space-y-3 mb-5">
            {[
              { step: 'Order Placed', detail: 'You receive an order confirmation email immediately.' },
              { step: 'Kit Processing (up to 36 hrs)', detail: 'Your kit is picked and packed at our fulfillment center. A tracking number is generated and emailed to you.' },
              { step: 'In Transit', detail: 'Tracking updates begin appearing once the carrier scans your package. Allow up to 24 hours after receiving a tracking number for the first scan to appear.' },
              { step: 'Delivered (within ~1 week)', detail: 'We always aim to have your kit delivered within one week of your order date.' },
            ].map(({ step, detail }, i) => (
              <div key={i} className="flex items-start gap-4 bg-white border border-blue-100 rounded-2xl p-4">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-black text-[10px]">{i + 1}</div>
                <div>
                  <p className="font-black text-black text-sm">{step}</p>
                  <p className="text-slate-500 text-sm leading-relaxed">{detail}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-start gap-3 bg-blue-100 border border-blue-200 rounded-2xl p-4">
            <CheckCircle className="w-4 h-4 text-blue-700 flex-shrink-0 mt-0.5" />
            <p className="text-blue-800 text-xs font-semibold leading-relaxed">
              <strong>Pro tip:</strong> Sign up for{' '}
              <a href="https://informeddelivery.usps.com" target="_blank" rel="noopener noreferrer" className="underline text-blue-700">USPS Informed Delivery</a>
              {' '}for real-time visibility on all incoming mail pieces — especially helpful while tracking a kit shipment.
            </p>
          </div>
        </div>

        {/* Section 5: Summary Checklist */}
        <div className="mb-10 p-8 bg-[#0f172a] rounded-3xl">
          <h2 className="text-xl font-black text-white tracking-tight mb-6">Quick Reference Checklist</h2>
          <div className="space-y-3">
            {[
              'Kits ship from a separate fulfillment center — expect two packages if you also ordered single vials.',
              'You will receive two different tracking numbers.',
              'Kit processing takes up to 36 hours before shipping.',
              'Tracking may take up to 24 hours after label creation to show the first scan.',
              'Kit vials are unlabeled — this is how we keep prices low.',
              'Identify vials using the batch number on the kit box OR the colored vial cap.',
              'Match batch numbers and cap colors to COAs at redhelixresearch.com/COAReports.',
              'Full delivery expected within one week of your order date.',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-slate-300 text-sm leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-4">
          <p className="text-slate-500 text-sm">Still have questions? We're happy to help.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to={createPageUrl('Contact')}
              className="inline-flex items-center justify-center gap-2 bg-[#8B2635] hover:bg-[#6B1827] text-white font-black text-sm px-8 py-4 rounded-2xl transition-colors"
            >
              Contact Us
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to={createPageUrl('COAReports')}
              className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-black font-black text-sm px-8 py-4 rounded-2xl transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              View All COA Reports
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}