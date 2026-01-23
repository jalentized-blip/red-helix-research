import React from 'react';
import { AlertTriangle, Mail, MessageCircle, Send, Globe } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-neutral-950 border-t border-neutral-800 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Disclaimer */}
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-6 mb-10">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white mb-3">Important Disclaimer</h4>
              <div className="space-y-2 text-sm text-neutral-400">
                <p>
                  <span className="font-semibold text-neutral-300">Research Use Only:</span> All products are intended for research purposes only. Not for human or animal consumption, diagnostic, or therapeutic use.
                </p>
                <p>
                  <span className="font-semibold text-neutral-300">Legal Responsibility:</span> By placing an order, you acknowledge that you are responsible for ensuring compliance with all applicable laws and regulations in your country regarding the purchase, possession, and use of research peptides.
                </p>
                <p>
                  <span className="font-semibold text-neutral-300">Age Requirement:</span> You must be 18 years or older to place an order. All products should be handled by qualified researchers in appropriate laboratory settings.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Content */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6972f2b59e2787f045b7ae0d/153069f59_officialogo.png" 
              alt="Red Dirt Research" 
              className="h-12 w-auto object-contain"
            />
          </div>

          {/* Contact Links */}
          <div className="flex items-center gap-4">
            <a href="#" className="p-2 rounded-lg bg-neutral-800/50 text-neutral-400 hover:text-yellow-400 hover:bg-neutral-800 transition-colors">
              <Mail className="w-5 h-5" />
            </a>
            <a href="#" className="p-2 rounded-lg bg-neutral-800/50 text-neutral-400 hover:text-yellow-400 hover:bg-neutral-800 transition-colors">
              <MessageCircle className="w-5 h-5" />
            </a>
            <a href="#" className="p-2 rounded-lg bg-neutral-800/50 text-neutral-400 hover:text-yellow-400 hover:bg-neutral-800 transition-colors">
              <Send className="w-5 h-5" />
            </a>
            <a href="#" className="p-2 rounded-lg bg-neutral-800/50 text-neutral-400 hover:text-yellow-400 hover:bg-neutral-800 transition-colors">
              <Globe className="w-5 h-5" />
            </a>
          </div>

          {/* Copyright */}
          <p className="text-sm text-neutral-500">
            © 2024 Red Dirt Research. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}