import React from 'react';
import { AlertTriangle, Mail, MessageCircle, Send, Globe, ShieldCheck, Microscope, FlaskConical } from "lucide-react";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 pt-24 pb-12 px-4 relative overflow-hidden">
      {/* Background Subtle Elements - Modern Medical Gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-red-600/30 to-transparent" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-8">
            <div className="flex items-center gap-4">
              <img 
                src="https://i.ibb.co/M5CYvjkG/websitelogo.png" 
                alt="Red Helix Research" 
                className="h-16 w-auto object-contain brightness-0"
              />
            </div>
            <p className="text-slate-500 text-sm leading-relaxed font-medium max-w-xs">
              Setting the industry benchmark for analytical precision and batch traceability in research peptide synthesis.
            </p>
            <div className="flex items-center gap-4">
              <a href="mailto:jake@redhelixresearch.com" className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-600 hover:border-red-600/50 transition-all shadow-sm">
                <Mail className="w-4 h-4" />
              </a>
              <a href="https://discord.gg/zdn52v73" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-600 hover:border-red-600/50 transition-all shadow-sm">
                <MessageCircle className="w-4 h-4" />
              </a>
              <a href="https://t.me/Redhelixresearch" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-600 hover:border-red-600/50 transition-all shadow-sm">
                <Send className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links / Protocols */}
          <div className="lg:col-span-2 space-y-6">
            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em]">Scientific Resources</h4>
            <ul className="space-y-4">
              <li><a href="#certificates" className="text-sm text-slate-500 hover:text-red-600 transition-colors font-bold">Lab Archives (COA)</a></li>
              <li><a href="/calculator" className="text-sm text-slate-500 hover:text-red-600 transition-colors font-bold">Peptide Calculator</a></li>
              <li><a href="/academy" className="text-sm text-slate-500 hover:text-red-600 transition-colors font-bold">Research Academy</a></li>
            </ul>
          </div>

          {/* Compliance Column - Bright Clinical Box */}
          <div className="lg:col-span-6">
            <div className="bg-white border border-slate-200 rounded-[32px] p-8 relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 p-4 opacity-[0.05]">
                <ShieldCheck className="w-24 h-24 text-red-600" />
              </div>
              
              <div className="flex items-center gap-3 mb-6">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h4 className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em]">Regulatory & Legal Compliance</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-1">Research Use Only</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                      All products are strictly for laboratory research. Not for human or veterinary use.
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-1">Age Requirement</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                      Strict 21+ policy enforced. Identity verification required for all acquisitions.
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-1">Handling Protocol</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                      Must be handled by qualified professionals in an appropriate laboratory setting.
                    </p>
                  </div>
                  <div className="pt-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600/5 border border-red-600/10 rounded-full">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                      <span className="text-[9px] font-black text-red-600 uppercase tracking-widest">High-Risk Verified Vendor</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-8">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              © 2026 Red Helix Research
            </p>
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Microscope className="w-3 h-3 text-slate-300" />
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Analytical Purity Focus</span>
              </div>
              <div className="flex items-center gap-2">
                <FlaskConical className="w-3 h-3 text-slate-300" />
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Global Research Logistics</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <a href="/terms" className="text-[10px] text-slate-400 hover:text-slate-900 font-bold uppercase tracking-widest transition-colors">Terms of Service</a>
            <a href="/privacy" className="text-[10px] text-slate-400 hover:text-slate-900 font-bold uppercase tracking-widest transition-colors">Privacy Protocol</a>
          </div>
        </div>
      </div>
    </footer>
  );
}