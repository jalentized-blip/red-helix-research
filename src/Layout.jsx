import React, { useState, useEffect } from 'react';
import { ShoppingCart, Menu, X, Send, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { getCartCount } from '@/components/utils/cart';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import MolecularBackground from '@/components/MolecularBackground';
import FloatingMolecularFormulas from '@/components/FloatingMolecularFormulas';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';

const navLinks = [
  { label: "Peptides", href: "#products" },
  { label: "Peptide Blends", href: "#goals" },
  { label: "Peptide Calculator", href: createPageUrl('PeptideCalculator'), isPage: true },
  { label: "LEARN MORE", href: createPageUrl('LearnMore'), isPage: true },
  { label: "COAs", href: "#certificates" },
];

const HeaderSearch = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const pages = [
    { name: 'Home', url: createPageUrl('Home'), description: 'Main page with all products', keywords: ['home', 'main', 'shop', 'products', 'peptides'] },
    { name: 'About', url: createPageUrl('About'), description: 'Our story and mission', keywords: ['about', 'story', 'mission', 'transparency', 'who we are'] },
    { name: 'Contact', url: createPageUrl('Contact'), description: 'Get in touch with us', keywords: ['contact', 'support', 'help', 'discord', 'telegram', 'whatsapp'] },
    { name: 'Peptide Calculator', url: createPageUrl('PeptideCalculator'), description: 'Calculate dosing and reconstitution', keywords: ['calculator', 'dosing', 'dose', 'reconstitution', 'mixing', 'measure'] },
    { name: 'Learn More', url: createPageUrl('LearnMore'), description: 'Research and peptide information', keywords: ['learn', 'research', 'information', 'education', 'science'] },
    { name: 'Cart', url: createPageUrl('Cart'), description: 'Your shopping cart', keywords: ['cart', 'checkout', 'purchase', 'buy'] },
    { name: 'Account', url: createPageUrl('Account'), description: 'Manage your account and orders', keywords: ['account', 'orders', 'profile', 'settings'] },
  ];

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredPages = pages.filter(page =>
    page.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const hasResults = searchQuery.length > 0 && (filteredProducts.length > 0 || filteredPages.length > 0);

  return (
    <div className="flex justify-center pb-3 pt-2 border-t border-stone-800/30">
      <motion.div
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => {
          setTimeout(() => {
            setIsExpanded(false);
            setShowResults(false);
          }, 300);
        }}
        className="relative px-8 py-4 pb-8"
      >
        {/* Magnifying Glass Icon */}
        <motion.div
          animate={{
            y: [0, -3, 0],
            opacity: isExpanded ? 0 : 0.4,
          }}
          transition={{
            y: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: 0.3 }
          }}
          className="absolute left-0 top-0"
        >
          <Search className="w-6 h-6 text-amber-50" />
        </motion.div>

        {/* Expanded Search Bar */}
        <motion.div
          initial={false}
          animate={{
            width: isExpanded ? '400px' : '24px',
            opacity: isExpanded ? 1 : 0,
          }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="relative"
        >
          {isExpanded && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search products, pages..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowResults(true);
                }}
                className="w-full pl-10 pr-10 py-2 bg-stone-900/90 backdrop-blur-md border border-stone-700 rounded-full text-amber-50 text-sm placeholder:text-stone-400 focus:outline-none focus:border-red-700/50"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setShowResults(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-amber-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </motion.div>

        {/* Search Results Dropdown */}
        <AnimatePresence>
          {isExpanded && showResults && searchQuery && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              onMouseEnter={() => setIsExpanded(true)}
              className="absolute top-full mt-2 w-[400px] max-h-[60vh] overflow-y-auto bg-stone-900/95 backdrop-blur-md border border-stone-700 rounded-lg shadow-2xl"
            >
              {!hasResults ? (
                <div className="p-6 text-center text-stone-400 text-sm">
                  No results found for "{searchQuery}"
                </div>
              ) : (
                <div className="p-3">
                  {/* Pages Section */}
                  {filteredPages.length > 0 && (
                    <div className="mb-3">
                      <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2 px-2">
                        Pages
                      </h3>
                      <div className="space-y-1">
                        {filteredPages.map((page) => (
                          <Link
                            key={page.name}
                            to={page.url}
                            className="block px-3 py-2 rounded-lg hover:bg-stone-800/50 transition-colors"
                            onClick={() => {
                              setSearchQuery('');
                              setShowResults(false);
                              setIsExpanded(false);
                            }}
                          >
                            <div className="font-semibold text-amber-50 text-sm">{page.name}</div>
                            <div className="text-xs text-stone-400">{page.description}</div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Products Section */}
                  {filteredProducts.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2 px-2">
                        Products
                      </h3>
                      <div className="space-y-1">
                        {filteredProducts.slice(0, 8).map((product) => (
                          <Link
                            key={product.id}
                            to={createPageUrl('Home') + '#products'}
                            className="block px-3 py-2 rounded-lg hover:bg-stone-800/50 transition-colors"
                            onClick={() => {
                              setSearchQuery('');
                              setShowResults(false);
                              setIsExpanded(false);
                            }}
                          >
                            <div className="font-semibold text-amber-50 text-sm">{product.name}</div>
                            {product.description && (
                              <div className="text-xs text-stone-400 line-clamp-1">{product.description}</div>
                            )}
                            <div className="text-xs text-red-600 mt-1">From ${product.price_from}</div>
                          </Link>
                        ))}
                        {filteredProducts.length > 8 && (
                          <div className="px-3 py-2 text-xs text-stone-400">
                            +{filteredProducts.length - 8} more products
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

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
        <style>{`
          :root {
            --barn-brown: #7D4A2B;
            --barn-tan: #C4955B;
            --barn-cream: #F5E6D3;
            --barn-dark: #2B1810;
          }

          /* Override red colors with barn brown */
          .bg-red-600, .bg-red-700, .hover\\:bg-red-600:hover, .hover\\:bg-red-700:hover {
            background-color: var(--barn-brown) !important;
          }
          .text-red-600, .text-red-400, .hover\\:text-red-600:hover, .hover\\:text-red-400:hover, .hover\\:text-red-500:hover {
            color: var(--barn-brown) !important;
          }
          .border-red-600, .border-red-700, .border-red-500 {
            border-color: var(--barn-brown) !important;
          }
          .border-red-600\\/30, .border-red-600\\/70 {
            border-color: rgba(125, 74, 43, 0.3) !important;
          }
          .shadow-red-600\\/50, .shadow-red-700\\/50 {
            --tw-shadow-color: rgba(125, 74, 43, 0.5) !important;
          }

          /* Update amber text to barn cream/tan */
          .text-amber-50 {
            color: var(--barn-cream) !important;
          }

          /* Hover states for borders */
          .hover\\:border-red-700\\/40:hover {
            border-color: rgba(125, 74, 43, 0.4) !important;
          }

          /* Gradient from red */
          .from-red-600, .from-red-700, .to-red-700, .to-red-800 {
            --tw-gradient-from: var(--barn-brown) !important;
            --tw-gradient-to: var(--barn-dark) !important;
          }
          .from-red-700\\/20, .from-red-800\\/10 {
            --tw-gradient-from: rgba(125, 74, 43, 0.2) !important;
          }

          /* Red backgrounds with opacity */
          .bg-red-600\\/10, .bg-red-700\\/5 {
            background-color: rgba(125, 74, 43, 0.1) !important;
          }

          /* Text colors with opacity */
          .text-red-600\\/80 {
            color: rgba(125, 74, 43, 0.8) !important;
          }
        `}</style>
        <MolecularBackground />
        <FloatingMolecularFormulas />

        {/* Fixed Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-stone-950/80 backdrop-blur-md border-b border-stone-800/50 transition-transform duration-300 shadow-lg" style={{ transform: headerVisible ? 'translateY(0)' : 'translateY(-100%)' }}>
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link to={createPageUrl('Home')} className="flex items-center relative group">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6972f2b59e2787f045b7ae0d/8aa5e41e9_image-Picsart-BackgroundRemover1.png"
              alt="Barn"
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
                    <Link to={createPageUrl('GroupBuy')} className="text-left text-lg font-semibold text-amber-50 hover:text-red-600 px-4 py-2 transition-all block rounded-lg hover:bg-stone-800/50">
                      Group Buy
                    </Link>
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

              {/* Global Search - Centered Under Navigation */}
              <HeaderSearch />
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