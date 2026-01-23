import React, { useState, useEffect } from 'react';
import { ShoppingCart, Menu, X, Search, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { getCartCount } from '@/components/utils/cart';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const navLinks = [
        { label: "Peptides", href: "#products" },
        { label: "Peptide Blends", href: "#goals" },
        { label: "Certificates", href: "#certificates" },
        { label: "FAQ", href: "#faq" },
      ];

      export default function Layout({ children }) {
        const [scrolled, setScrolled] = useState(false);
        const [cartCount, setCartCount] = useState(0);
        const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
        const [logoOpacity, setLogoOpacity] = useState(1);
        const [logoOffset, setLogoOffset] = useState({ x: 0, y: 0 });
        const [logoScale, setLogoScale] = useState(1);
        const [logoModalOpen, setLogoModalOpen] = useState(false);

        useEffect(() => {
          const handleScroll = () => {
            setScrolled(window.scrollY > 50);
            
            // Find the DollarSign icons in ValueProposition
            const dollarSigns = document.querySelectorAll('[data-testid="dollar-icon"]');
            if (dollarSigns.length > 0) {
              const firstDollar = dollarSigns[0];
              const rect = firstDollar.getBoundingClientRect();
              const dollarTop = window.scrollY + rect.top;
              
              if (window.scrollY > dollarTop) {
                // Past the dollar signs - minimize and fade
                setLogoScale(0.3);
                setLogoOpacity(0);
              } else {
                // Before dollar signs - normal
                setLogoScale(1);
                setLogoOpacity(1);
              }
            }
          };
          window.addEventListener('scroll', handleScroll);
          return () => window.removeEventListener('scroll', handleScroll);
        }, []);

        useEffect(() => {
          setCartCount(getCartCount());
          const handleCartUpdate = () => setCartCount(getCartCount());
          window.addEventListener('cartUpdated', handleCartUpdate);
          return () => window.removeEventListener('cartUpdated', handleCartUpdate);
        }, []);

        useEffect(() => {
          const handleMouseMove = (e) => {
            setMousePos({ x: e.clientX, y: e.clientY });

            // Calculate distance from logo (approximate center position)
            const logoX = 100;
            const logoY = 60;
            const distance = Math.sqrt(
              Math.pow(e.clientX - logoX, 2) + Math.pow(e.clientY - logoY, 2)
            );

            // Opacity decreases as mouse gets closer
            const opacity = Math.min(1, Math.max(0, distance / 150));
            setLogoOpacity(opacity);

            // Calculate repulsion - logo moves away from cursor
            if (distance < 250) {
              const angle = Math.atan2(logoY - e.clientY, logoX - e.clientX);
              const force = Math.max(0, 100 - distance) * 0.3;
              setLogoOffset({
                x: Math.cos(angle) * force,
                y: Math.sin(angle) * force
              });
            } else {
              setLogoOffset({ x: 0, y: 0 });
            }
          };

          window.addEventListener('mousemove', handleMouseMove);
          return () => window.removeEventListener('mousemove', handleMouseMove);
        }, []);

  const scrollTo = (id) => {
    const element = document.getElementById(id.replace('#', ''));
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-stone-950">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-transparent py-3">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 relative">
            <div className="relative">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6972f2b59e2787f045b7ae0d/e486eaa24_thisisitbuddy.png" 
                alt="Red Dirt Research" 
                className="h-40 w-auto object-contain transition-all duration-300"
                style={{ 
                  opacity: logoOpacity,
                  transform: `translate(${logoOffset.x}px, ${logoOffset.y}px) scale(${logoScale})`,
                }}
              />
              <button
                onClick={() => setLogoModalOpen(true)}
                className="absolute bottom-0 right-0 p-1 bg-red-700 rounded-full hover:bg-red-600 transition-colors"
              >
                <ZoomIn className="w-4 h-4 text-amber-50" />
              </button>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link to={createPageUrl('Home')} className="text-sm font-medium text-stone-300 hover:text-red-600 transition-colors uppercase tracking-wide">
              Home
            </Link>
            <Link to={createPageUrl('About')} className="text-sm font-medium text-stone-300 hover:text-red-600 transition-colors uppercase tracking-wide">
              About
            </Link>
            <Link to={createPageUrl('Contact')} className="text-sm font-medium text-stone-300 hover:text-red-600 transition-colors uppercase tracking-wide">
              Contact
            </Link>
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => scrollTo(link.href)}
                className="text-sm font-medium text-stone-300 hover:text-red-600 transition-colors uppercase tracking-wide"
              >
                {link.label}
              </button>
            ))}
          </nav>
          
          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-stone-300 hover:text-red-600 hover:bg-red-600/10"
            >
              <Search className="w-5 h-5" />
            </Button>

            <Link to={createPageUrl('Cart')}>
              <Button 
                variant="outline" 
                size="icon" 
                className="border-stone-700 text-stone-300 hover:text-red-600 hover:border-red-600/50 hover:bg-red-600/10 relative"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-700 text-amber-50 text-xs font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="text-stone-300">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-stone-950 border-stone-700 w-72">
                <nav className="flex flex-col gap-4 mt-8">
                  <Link to={createPageUrl('Home')} className="text-left text-lg font-medium text-amber-50 hover:text-red-600 transition-colors py-2 border-b border-stone-700 block">
                    Home
                  </Link>
                  <Link to={createPageUrl('About')} className="text-left text-lg font-medium text-amber-50 hover:text-red-600 transition-colors py-2 border-b border-stone-700 block">
                    About
                  </Link>
                  <Link to={createPageUrl('Contact')} className="text-left text-lg font-medium text-amber-50 hover:text-red-600 transition-colors py-2 border-b border-stone-700 block">
                    Contact
                  </Link>
                  {navLinks.map((link) => (
                    <button
                      key={link.label}
                      onClick={() => scrollTo(link.href)}
                      className="text-left text-lg font-medium text-amber-50 hover:text-red-600 transition-colors py-2 border-b border-stone-700"
                    >
                      {link.label}
                    </button>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      
      {/* Logo Zoom Modal */}
      <Dialog open={logoModalOpen} onOpenChange={setLogoModalOpen}>
        <DialogContent className="w-11/12 max-w-4xl bg-transparent border-0 shadow-none backdrop-blur-none" style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}>
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6972f2b59e2787f045b7ae0d/e486eaa24_thisisitbuddy.png" 
            alt="Red Dirt Research" 
            className="w-full h-auto object-contain"
          />
        </DialogContent>
      </Dialog>
      
      {/* Main Content */}
      <main>
        {children}
      </main>
    </div>
  );
}