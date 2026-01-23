import React, { useState, useEffect } from 'react';
import { ShoppingCart, Menu, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
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

  const scrollTo = (id) => {
    const element = document.getElementById(id.replace('#', ''));
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-stone-950">
      {/* Fixed Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-stone-950/95 backdrop-blur-xl border-b border-stone-700/50 py-2' 
          : 'bg-transparent py-3'
      }`}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6972f2b59e2787f045b7ae0d/e486eaa24_thisisitbuddy.png" 
              alt="Red Dirt Research" 
              className="h-16 w-auto object-contain"
            />
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
      
      {/* Main Content */}
      <main>
        {children}
      </main>
    </div>
  );
}