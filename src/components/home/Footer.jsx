import React from 'react';
import { AlertTriangle, Mail, MessageCircle, Send, Globe, ShieldCheck, Microscope, FlaskConical } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Footer() {
  return (
    <footer role="contentinfo" aria-label="Site footer" className="bg-white border-t border-slate-100 pt-10 md:pt-24 pb-10 px-4 relative overflow-hidden below-fold-section">
      {/* Background Subtle Elements - Modern Medical Gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-[#dc2626]/20 to-transparent" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-16 mb-8 lg:mb-20">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-8">
            <div className="flex items-center gap-4">
              <img 
                src="https://i.imgur.com/8MOtTE2.png" 
                alt="Red Helix Research" 
                className="h-16 w-auto object-contain"
                width="200"
                height="64"
                loading="lazy"
                decoding="async"
              />
            </div>
            <p className="text-slate-500 text-sm leading-relaxed font-medium max-w-xs">
              Setting the industry benchmark for analytical precision and batch traceability in research peptide synthesis.
            </p>
            <div className="flex items-center gap-4">
              <a href="mailto:jake@redhelixresearch.com" className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#8B2635] hover:border-[#8B2635]/30 hover:bg-white transition-all shadow-sm">
                <Mail className="w-5 h-5" />
              </a>
              <a href="https://discord.gg/BwQHufvmQ8" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#8B2635] hover:border-[#8B2635]/30 hover:bg-white transition-all shadow-sm">
                <MessageCircle className="w-5 h-5" />
              </a>
              <a href="https://t.me/Redhelixresearch" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#8B2635] hover:border-[#8B2635]/30 hover:bg-white transition-all shadow-sm">
                <Send className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links / Protocols */}
          <div className="lg:col-span-2 space-y-6">
            <h4 className="text-[10px] font-black text-black uppercase tracking-[0.3em]">Scientific Resources</h4>
            <nav aria-label="Footer scientific resources">
              <ul className="space-y-4">
                <li><Link to={createPageUrl('COAReports')} className="text-sm text-slate-500 hover:text-[#8B2635] transition-colors font-bold flex items-center gap-2 group"><div className="w-1 h-1 rounded-full bg-[#8B2635] opacity-0 group-hover:opacity-100 transition-opacity" />Lab Archives (COA)</Link></li>
                <li><Link to={createPageUrl('PeptideCalculator')} className="text-sm text-slate-500 hover:text-[#8B2635] transition-colors font-bold flex items-center gap-2 group"><div className="w-1 h-1 rounded-full bg-[#8B2635] opacity-0 group-hover:opacity-100 transition-opacity" />Peptide Calculator</Link></li>
                <li><Link to={createPageUrl('PeptideAcademy')} className="text-sm text-slate-500 hover:text-[#8B2635] transition-colors font-bold flex items-center gap-2 group"><div className="w-1 h-1 rounded-full bg-[#8B2635] opacity-0 group-hover:opacity-100 transition-opacity" />Research Academy</Link></li>
                <li><Link to={createPageUrl('PeptideComparison')} className="text-sm text-slate-500 hover:text-[#8B2635] transition-colors font-bold flex items-center gap-2 group"><div className="w-1 h-1 rounded-full bg-[#8B2635] opacity-0 group-hover:opacity-100 transition-opacity" />Peptide Comparison</Link></li>
                <li><Link to={createPageUrl('PeptideReconstitutionGuide')} className="text-sm text-slate-500 hover:text-[#8B2635] transition-colors font-bold flex items-center gap-2 group"><div className="w-1 h-1 rounded-full bg-[#8B2635] opacity-0 group-hover:opacity-100 transition-opacity" />Reconstitution Guide</Link></li>
                <li><Link to={createPageUrl('BlogGuide')} className="text-sm text-slate-500 hover:text-[#8B2635] transition-colors font-bold flex items-center gap-2 group"><div className="w-1 h-1 rounded-full bg-[#8B2635] opacity-0 group-hover:opacity-100 transition-opacity" />Research Guides</Link></li>
              </ul>
            </nav>
          </div>

          {/* Compliance Column - Bright Clinical Box */}
          <div className="lg:col-span-6">
          <div className="bg-slate-50 border border-slate-100 rounded-2xl md:rounded-[40px] p-5 md:p-10 relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 p-6 opacity-[0.03]">
                <ShieldCheck className="w-32 h-32 text-[#8B2635]" />
              </div>
              
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-full bg-[#8B2635] flex items-center justify-center shadow-lg shadow-[#dc2626]/20">
                  <AlertTriangle className="w-4 h-4 text-white" />
                </div>
                <h4 className="text-[10px] font-black text-black uppercase tracking-[0.3em]">Regulatory Compliance Protocol</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-black text-[#8B2635] uppercase tracking-widest mb-2">⚠ Research Use Only — Not For Human Use</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                      All products are exclusively for in-vitro laboratory research. Not for human consumption. Not for veterinary use. Not evaluated or approved by the FDA. Not intended to diagnose, treat, cure, or prevent any disease. Misuse is strictly prohibited and will result in immediate account termination.
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-black uppercase tracking-widest mb-2">Age Requirement</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                      Strict 21+ policy enforced. Identity verification required for all acquisitions. No exceptions.
                    </p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-black text-black uppercase tracking-widest mb-2">Handling Protocol</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                      Must be handled exclusively by qualified researchers in an approved laboratory setting with proper PPE. Buyer is solely responsible for compliance with all applicable federal, state, and local laws.
                    </p>
                  </div>
                  <div className="pt-2">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#8B2635] text-white rounded-full shadow-lg shadow-[#dc2626]/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      <span className="text-[9px] font-black uppercase tracking-widest">High-Risk Verified Vendor</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compliance Strip */}
        <div className="mb-8 p-4 bg-slate-900 rounded-2xl text-center">
          <p className="text-[10px] text-slate-300 font-bold leading-relaxed">
            <span className="text-[#8B2635] font-black uppercase tracking-widest">⚠ FOR IN-VITRO LABORATORY RESEARCH USE ONLY</span> — All products sold by Red Helix Research are strictly for scientific research in controlled laboratory environments. NOT for human consumption. NOT for veterinary use. NOT evaluated or approved by the FDA, DEA, or any regulatory authority for human or animal use. NOT intended to diagnose, treat, cure, or prevent any disease or medical condition. Researchers are solely responsible for compliance with all federal, state, and local laws applicable to research chemicals in their jurisdiction. By accessing this website you confirm you are a licensed researcher and agree to use all products exclusively for lawful in-vitro research.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              © 2026 Red Helix Research
            </p>
            <div className="flex items-center gap-4 md:gap-6">
              <div className="flex items-center gap-2">
                <Microscope className="w-3.5 h-3.5 text-[#8B2635]/40" />
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Analytical Purity Focus</span>
              </div>
              <div className="flex items-center gap-2">
                <FlaskConical className="w-3.5 h-3.5 text-[#8B2635]/40" />
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Global Research Logistics</span>
              </div>
            </div>
          </div>
          
          <nav aria-label="Footer legal links" className="flex flex-wrap items-center gap-4 md:gap-8 justify-center">
            <Link to={createPageUrl('Policies')} className="text-[10px] text-slate-400 hover:text-[#8B2635] font-bold uppercase tracking-widest transition-colors">Terms & Policies</Link>
            <Link to={createPageUrl('ExpandedFAQ')} className="text-[10px] text-slate-400 hover:text-[#8B2635] font-bold uppercase tracking-widest transition-colors">FAQ</Link>
            <Link to={createPageUrl('About')} className="text-[10px] text-slate-400 hover:text-[#8B2635] font-bold uppercase tracking-widest transition-colors">About</Link>
            <Link to={createPageUrl('Contact')} className="text-[10px] text-slate-400 hover:text-[#8B2635] font-bold uppercase tracking-widest transition-colors">Contact</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}