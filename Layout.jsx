import React, { useState, useEffect } from 'react';
import { ShoppingCart, Menu, X, Send, Search, Eye, Mail } from 'lucide-react';
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
import UploadCOAModal from '@/components/COA/UploadCOAModal';
import AlertsDropdown from '@/components/AlertsDropdown';
import NotificationCenter from '@/components/NotificationCenter';


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
    <div className="flex justify-center pb-3 pt-2 border-t border-slate-100">
      <motion.div
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => {
          if (!searchQuery) {
            setTimeout(() => {
              setIsExpanded(false);
              setShowResults(false);
            }, 300);
          }
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
          <Search className="w-6 h-6 text-slate-900" />
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search products, pages..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowResults(true);
                }}
                className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-full text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-red-600/50"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setShowResults(false);
                    setIsExpanded(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors"
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
              className="absolute top-full mt-2 w-[400px] max-h-[60vh] overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-2xl z-[100]"
            >
              {!hasResults ? (
                <div className="p-6 text-center text-slate-400 text-sm">
                  No results found for "{searchQuery}"
                </div>
              ) : (
                <div className="p-3">
                  {/* Pages Section */}
                  {filteredPages.length > 0 && (
                    <div className="mb-3">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-3">
                        Pages
                      </h3>
                      <div className="space-y-1">
                        {filteredPages.map((page) => (
                          <a
                            key={page.name}
                            href={page.url}
                            className="block px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors group"
                            onClick={() => {
                              setSearchQuery('');
                              setShowResults(false);
                              setIsExpanded(false);
                            }}
                          >
                            <div className="font-bold text-slate-900 text-sm group-hover:text-red-600">{page.name}</div>
                            <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{page.description}</div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Products Section */}
                  {filteredProducts.length > 0 && (
                    <div>
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-3">
                        Research Products
                      </h3>
                      <div className="space-y-1">
                        {filteredProducts.slice(0, 8).map((product) => (
                          <button
                            key={product.id}
                            className="block w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors group"
                            onClick={() => {
                              setSearchQuery('');
                              setShowResults(false);
                              setIsExpanded(false);
                              window.dispatchEvent(new CustomEvent('openProductModal', { detail: product }));
                              setTimeout(() => {
                                const element = document.getElementById('products');
                                if (element) {
                                  element.scrollIntoView({ behavior: 'smooth' });
                                }
                              }, 100);
                            }}
                          >
                            <div className="font-bold text-slate-900 text-sm group-hover:text-red-600">{product.name}</div>
                            {product.description && (
                              <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider line-clamp-1">{product.description}</div>
                            )}
                            <div className="text-[11px] font-black text-red-600 mt-1 uppercase tracking-widest">Available from ${product.price_from}</div>
                          </button>
                        ))}
                        {filteredProducts.length > 8 && (
                          <div className="px-3 py-2 text-[10px] text-slate-400 font-black uppercase tracking-widest">
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
                               const [isAdmin, setIsAdmin] = useState(false);
                               const [showUploadModal, setShowUploadModal] = useState(false);
                               const [mouseNearTop, setMouseNearTop] = useState(false);
                               const [mobileHeaderCollapsed, setMobileHeaderCollapsed] = useState(false);
                               const isHomePage = window.location.pathname === '/' || window.location.pathname === '/Home';
                               const [user, setUser] = useState(null);

        useEffect(() => {
          const checkAuth = async () => {
            try {
              const isAuth = await base44.auth.isAuthenticated();
              setIsAuthenticated(isAuth);
              if (isAuth) {
                const userData = await base44.auth.me();
                setUser(userData);
                setIsAdmin(userData?.role === 'admin');
              }
            } catch (error) {
              setIsAuthenticated(false);
              setIsAdmin(false);
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

            // Show/hide header based on mouse position on non-home pages
            if (!isHomePage) {
              setMouseNearTop(e.clientY < 100);
            }

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
                }, [isHomePage]);

          const telegramLink = 'https://t.me/+UYRVjzIFDy9iYzc9';

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
    <div className="min-h-screen bg-white relative">
        <style>{`
          :root {
            --medical-red: #dc2626;
            --medical-red-dark: #b91c1c;
            --clinical-slate: #64748b;
            --clinical-white: #ffffff;
            --clinical-bg: #f8fafc;
          }

          /* Modern Medical Scrollbar */
          ::-webkit-scrollbar {
            width: 8px;
          }
          ::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 4px;
          }
          ::-webkit-scrollbar-thumb {
            background: var(--medical-red);
            border-radius: 4px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: var(--medical-red-dark);
          }
        `}</style>
        <MolecularBackground />
        <FloatingMolecularFormulas />

        {/* Mobile Header Toggle (when collapsed on home page) */}
        {isHomePage && mobileHeaderCollapsed && (
          <div 
            onClick={() => setMobileHeaderCollapsed(false)}
            className="lg:hidden fixed top-0 left-0 right-0 z-50 h-12 bg-white/60 backdrop-blur-sm border-b border-slate-100 flex items-center justify-center cursor-pointer active:bg-slate-50/60 transition-colors"
          >
            <div className="w-12 h-1 bg-slate-300 rounded-full" />
          </div>
        )}

        {/* Fixed Header - Clean Medical Style */}
          <header 
            onClick={() => {
              if (isHomePage && window.innerWidth < 1024) {
                setMobileHeaderCollapsed(true);
              }
            }}
            className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 transition-transform duration-300 shadow-sm" 
            style={{ transform: (isHomePage ? (mobileHeaderCollapsed && window.innerWidth < 1024 ? false : headerVisible) : mouseNearTop) ? 'translateY(0)' : 'translateY(-100%)' }}
          >
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link to={createPageUrl('Home')} className="flex items-center relative group">
            <img 
              src="https://i.ibb.co/M5CYvjkG/websitelogo.png"
              alt="Red Helix Research"
              className="h-32 w-auto object-contain brightness-0"
              style={{ 
                opacity: logoOpacity,
                transform: `translate(${logoOffset.x}px, ${logoOffset.y}px) scale(${logoScale})`,
              }}
            />
          </Link>

          {/* Navigation - Bright Clinical Style */}
          <nav className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  if (!link.isPage) {
                    e.preventDefault();
                    scrollTo(link.href);
                  }
                }}
                className="text-[11px] font-black text-slate-400 hover:text-red-600 uppercase tracking-[0.2em] transition-all relative group"
              >
                {link.label}
                <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-red-600 transition-all group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center gap-4">
            <AlertsDropdown />
            <NotificationCenter />
            
            <Link to={createPageUrl('Cart')} className="relative group">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-red-600 group-hover:border-red-600/30 transition-all shadow-sm">
                <ShoppingCart className="w-5 h-5" />
              </div>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-lg ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </Link>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-600 hover:bg-slate-50 rounded-2xl">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-white border-slate-100 w-80 p-0">
                <div className="h-full flex flex-col p-8">
                  <div className="border-b border-slate-100 pb-8 mb-8">
                    <img 
                      src="https://i.ibb.co/M5CYvjkG/websitelogo.png" 
                      alt="Red Helix" 
                      className="h-12 w-auto brightness-0 mb-4"
                    />
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Research & Education Menu</p>
                  </div>
                  
                  <nav className="flex flex-col gap-3 flex-1">
                    <Link to={createPageUrl('Home')} className="flex items-center gap-4 px-5 py-4 text-sm font-black text-slate-900 uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                      Home
                    </Link>
                    <Link to={createPageUrl('Account')} className="flex items-center gap-4 px-5 py-4 text-sm font-black text-slate-900 uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                      My Laboratory
                    </Link>
                    <Link to={createPageUrl('About')} className="flex items-center gap-4 px-5 py-4 text-sm font-black text-slate-900 uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                      Our Mission
                    </Link>
                    <Link to={createPageUrl('Contact')} className="flex items-center gap-4 px-5 py-4 text-sm font-black text-slate-900 uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                      Support Center
                    </Link>
                  </nav>

                  <div className="mt-auto pt-8 border-t border-slate-100">
                    <div className="p-6 bg-red-50 rounded-[32px] border border-red-100">
                      <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-2">Researcher Support</p>
                      <p className="text-[11px] text-slate-500 font-bold mb-4 leading-relaxed">Need technical assistance with your order?</p>
                      <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-black text-[10px] uppercase tracking-widest rounded-xl">Contact Support</Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Global Search - Clean Style */}
        <HeaderSearch />
      </header>

      <main className="relative pt-16">
        {children}
      </main>



      <UploadCOAModal
      isOpen={showUploadModal}
      onClose={() => setShowUploadModal(false)}
      onSuccess={() => {
      setShowUploadModal(false);
      window.location.href = createPageUrl('COAReports');
      }}
      />
      </div>
      );
      }
