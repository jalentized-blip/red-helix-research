import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-800/50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30 flex items-center justify-center">
              <span className="text-base font-black text-yellow-400">CP</span>
            </div>
            <span className="text-lg font-bold text-white hidden sm:block">Chimera Peptides</span>
          </div>
          
          <Button variant="outline" size="icon" className="border-neutral-700 text-neutral-400 hover:text-yellow-400 hover:border-yellow-500/50 hover:bg-yellow-500/5">
            <ShoppingCart className="w-5 h-5" />
          </Button>
        </div>
      </header>
      
      {/* Main Content */}
      <main>
        {children}
      </main>
    </div>
  );
}