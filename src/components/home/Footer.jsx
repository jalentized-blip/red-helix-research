import React from 'react';
import { AlertTriangle, Mail, MessageCircle, Send, Globe, ShieldCheck, Microscope, FlaskConical } from "lucide-react";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-100 pt-24 pb-12 px-4 relative overflow-hidden">
      {/* Background Subtle Elements - Modern Medical Gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-red-600/20 to-transparent" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-8">
            <div className="flex items-center gap-4">
              <img 
                src="https://i.imgur.com/8MOtTE2.png" 
                alt="Red Helix Research" 
                className="h-16 w-auto object-contain"
              />
            </div>
            <p className="text-slate-500 text-sm leading-relaxed font-medium max-w-xs">
              Setting the industry benchmark for analytical precision and batch traceability in research peptide synthesis.
            </p>
            <div className="flex items-center gap-4">
              <a href="mailto:jake@redhelixresearch.com" className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-600 hover:border-red-600/30 hover:bg-white transition-all shadow-sm">
                <Mail className="w-5 h-5" />
              </a>
              <a href="https://discord.gg/zdn52v73" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-600 hover:border-red-600/30 hover:bg-white transition-all shadow-sm">
                <MessageCircle className="w-5 h-5" />
              </a>
              <a href="https://t.me/Redhelixresearch" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-600 hover:border-red-600/30 hover:bg-white transition-all shadow-sm">
                <Send className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links / Protocols */}
          <div className="lg:col-span-2 space-y-6">
            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em]">Scientific Resources</h4>
            <ul className="space-y-4">
              <li><a href="#certificates" className="text-sm text-slate-500 hover:text-red-600 transition-colors font-bold flex items-center gap-2 group"><div className="w-1 h-1 rounded-full bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />Lab Archives (COA)</a></li>
              <li><a href="/calculator" className="text-sm text-slate-500 hover:text-red-600 transition-colors font-bold flex items-center gap-2 group"><div className="w-1 h-1 rounded-full bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />Peptide Calculator</a></li>
              <li><a href="/academy" className="text-sm text-slate-500 hover:text-red-600 transition-colors font-bold flex items-center gap-2 group"><div className="w-1 h-1 rounded-full bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />Research Academy</a></li>
            </ul>
          </div>

          {/* Compliance Column - Bright Clinical Box */}
          <div className="lg:col-span-6">
            <div className="bg-slate-50 border border-slate-100 rounded-[40px] p-10 relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 p-6 opacity-[0.03]">
                <ShieldCheck className="w-32 h-32 text-red-600" />
              </div>
              
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-full bg-[#dc2626] flex items-center justify-center shadow-lg shadow-red-600/20">
                  <AlertTriangle className="w-4 h-4 text-white" />
                </div>
                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em]">Regulatory Compliance Protocol</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-black text-[#dc2626] uppercase tracking-widest mb-2">Research Use Only</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                      All products are strictly for laboratory research. Not for human or veterinary use. Any misuse will result in account termination.
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-2">Age Requirement</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                      Strict 21+ policy enforced. Identity verification required for all acquisitions. No exceptions.
                    </p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-2">Handling Protocol</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                      Must be handled by qualified professionals in an appropriate laboratory setting. PPE required.
                    </p>
                  </div>
                  <div className="pt-2">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#dc2626] text-white rounded-full shadow-lg shadow-red-600/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      <span className="text-[9px] font-black uppercase tracking-widest">High-Risk Verified Vendor</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-8">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              © 2026 Red Helix Research
            </p>
            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Microscope className="w-3.5 h-3.5 text-red-600/40" />
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Analytical Purity Focus</span>
              </div>
              <div className="flex items-center gap-2">
                <FlaskConical className="w-3.5 h-3.5 text-red-600/40" />
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Global Research Logistics</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <a href="/terms" className="text-[10px] text-slate-400 hover:text-red-600 font-bold uppercase tracking-widest transition-colors">Terms</a>
            <a href="/privacy" className="text-[10px] text-slate-400 hover:text-red-600 font-bold uppercase tracking-widest transition-colors">Privacy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}