import React, { useState, useEffect } from 'react';
import { ShoppingCart, Menu, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { getCartCount } from '@/components/utils/cart';
      import { Link } from 'react-router-dom';
      import { createPageUrl } from '@/utils';
      import { base44 } from '@/api/base44Client';
      import MolecularBackground from '@/components/MolecularBackground';
import FloatingMolecularFormulas from '@/components/FloatingMolecularFormulas';

const navLinks = [
                    { label: "Peptides", href: "#products" },
                    { label: "Peptide Blends", href: "#goals" },
                    { label: "Peptide Calculator", href: createPageUrl('PeptideCalculator'), isPage: true },
                    { label: "LEARN MORE", href: createPageUrl('LearnMore'), isPage: true },
                    { label: "COAs", href: "#certificates" },
                  ];

      export default function Layout({ children }) {
        const [scrolled, setScrolled] = useState(false);
        const [cartCount, setCartCount] = useState(0);
        const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
        const [logoOpacity, setLogoOpacity] = useState(1);
        const [logoOffset, setLogoOffset] = useState({ x: 0, y: 0 });
        const [logoScale, setLogoScale] = useState(1);
        const [lastScrollY, setLastScrollY] = useState(0);
        const [headerVisible, setHeaderVisible] = useState(true);
        const [isAuthenticated, setIsAuthenticated] = useState(false);

        useEffect(() => {
          const checkAuth = async () => {
            try {
              const isAuth = await base44.auth.isAuthenticated();
              setIsAuthenticated(isAuth);
            } catch (error) {
              setIsAuthenticated(false);
            }
          };
          checkAuth();
        }, []);

        useEffect(() => {
          const handleScroll = () => {
            setScrolled(window.scrollY > 50);

            // Hide/show header based on scroll direction
            setHeaderVisible(window.scrollY < 50 || window.scrollY < lastScrollY);

            // Calculate scroll speed and update magnifying glass
            const scrollSpeed = Math.abs(window.scrollY - lastScrollY);
            setLastScrollY(window.scrollY);



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
        }, [lastScrollY]);

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

          const telegramLink = 'https://t.me/rdrjake';

          const scrollTo = (id) => {
    const element = document.getElementById(id.replace('#', ''));
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      // If element doesn't exist on current page, navigate to home with section param
      window.location.href = `${createPageUrl('Home')}?section=${id.replace('#', '')}`;
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 relative">
        <MolecularBackground />
        <FloatingMolecularFormulas />
      
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-stone-950/80 backdrop-blur-md border-b border-stone-800/50 py-3 transition-transform duration-300 shadow-lg" style={{ transform: headerVisible ? 'translateY(0)' : 'translateY(-100%)' }}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          {/* Logo */}
          <Link to={createPageUrl('Home')} className="flex items-center relative group">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6972f2b59e2787f045b7ae0d/8aa5e41e9_image-Picsart-BackgroundRemover1.png"
              alt="Red Dirt Research"
              className="h-40 w-auto object-contain"
              style={{ 
                opacity: logoOpacity,
                transform: `translate(${logoOffset.x}px, ${logoOffset.y}px) scale(${logoScale})`,
              }}
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link to={createPageUrl('Home')} className="text-sm font-semibold text-stone-300 hover:text-amber-50 px-4 py-2 transition-all rounded-lg hover:bg-stone-800/50 backdrop-blur-sm">
              Home
            </Link>
            <Link to={createPageUrl('About')} className="text-sm font-semibold text-stone-300 hover:text-amber-50 px-4 py-2 transition-all rounded-lg hover:bg-stone-800/50 backdrop-blur-sm">
              About
            </Link>
            <Link to={createPageUrl('Contact')} className="text-sm font-semibold text-stone-300 hover:text-amber-50 px-4 py-2 transition-all rounded-lg hover:bg-stone-800/50 backdrop-blur-sm">
              Contact
            </Link>
            {isAuthenticated && (
              <Link to={createPageUrl('Account')} className="text-sm font-semibold text-stone-300 hover:text-amber-50 px-4 py-2 transition-all rounded-lg hover:bg-stone-800/50 backdrop-blur-sm">
                Account
              </Link>
            )}
            {navLinks.map((link) => 
              link.isPage ? (
                <Link
                  key={link.label}
                  to={link.href}
                  className="text-sm font-semibold text-stone-300 hover:text-amber-50 px-4 py-2 transition-all rounded-lg hover:bg-stone-800/50 backdrop-blur-sm"
                >
                  {link.label}
                </Link>
              ) : (
                <button
                  key={link.label}
                  onClick={() => scrollTo(link.href)}
                  className="text-sm font-semibold text-stone-300 hover:text-amber-50 px-4 py-2 transition-all rounded-lg hover:bg-stone-800/50 backdrop-blur-sm"
                >
                  {link.label}
                </button>
              )
            )}
          </nav>
          
          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link to={createPageUrl('Cart')}>
              <button className="relative p-2.5 rounded-lg bg-stone-900/50 border border-red-600/30 text-amber-50 hover:bg-red-600/10 hover:border-red-600/70 hover:text-red-400 transition-all duration-300 group">
                <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-br from-red-600 to-red-700 text-amber-50 text-xs font-bold rounded-full flex items-center justify-center shadow-lg border border-red-500">
                    {cartCount}
                  </span>
                )}
              </button>
            </Link>

            {/* User Menu */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-stone-300 hover:text-amber-50">
                    <Menu className="w-6 h-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-stone-950 border-stone-700 w-72">
                  <nav className="flex flex-col gap-4 mt-8">
                    {isAuthenticated && (
                      <>
                        <Link to={createPageUrl('Account')} className="text-left text-lg font-semibold text-amber-50 hover:text-red-600 px-4 py-2 transition-all block rounded-lg hover:bg-stone-800/50">
                          My Account
                        </Link>
                        <Link to={createPageUrl('Account')} className="text-left text-lg font-semibold text-amber-50 hover:text-red-600 px-4 py-2 transition-all block rounded-lg hover:bg-stone-800/50">
                          Orders
                        </Link>
                        <button
                          onClick={() => {
                            localStorage.clear();
                            sessionStorage.clear();
                            document.cookie.split(";").forEach((c) => {
                              document.cookie = c
                                .replace(/^ +/, "")
                                .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
                            });
                            base44.auth.logout();
                            window.location.href = createPageUrl('Home') + '?logout=true';
                          }}
                          className="text-left text-lg font-semibold text-amber-50 hover:text-red-600 px-4 py-2 transition-all rounded-lg hover:bg-stone-800/50 w-full"
                        >
                          Sign Out
                        </button>
                      </>
                    )}
                    {!isAuthenticated && (
                      <button
                        onClick={() => base44.auth.redirectToLogin(createPageUrl('Account'))}
                        className="text-left text-lg font-semibold text-amber-50 hover:text-red-600 px-4 py-2 transition-all rounded-lg hover:bg-stone-800/50 w-full"
                      >
                        Sign In
                      </button>
                    )}
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

      {/* Telegram Chat Button */}
      <a
        href={telegramLink}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 p-4 bg-blue-500 rounded-full shadow-lg hover:bg-blue-600 transition-all hover:scale-110"
        style={{ opacity: 0.2 }}
        title="Chat with us on Telegram"
      >
        <Send className="w-6 h-6 text-white" />
      </a>
      </div>
      );
      }