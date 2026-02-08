import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { ShoppingCart, Menu, X, Send, Search, Eye, Mail, Package, User, ToggleLeft, ToggleRight } from 'lucide-react';
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
import AbandonedCartTracker from '@/components/AbandonedCartTracker';
import { Shield } from 'lucide-react';
import { ZeroTrustProvider } from '@/components/security/ZeroTrustProvider';
import SecurityMonitor from '@/components/security/SecurityMonitor';
import { MFAProvider } from '@/components/security/MFAProvider';





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
    <div className="relative">
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
        className="relative"
      >
        {/* Magnifying Glass Icon */}
        <motion.div
          animate={{
            opacity: isExpanded ? 0 : 1,
          }}
          transition={{
            opacity: { duration: 0.3 }
          }}
          className="absolute left-0 top-1/2 -translate-y-1/2"
        >
          <Search className="w-5 h-5 text-slate-400" />
        </motion.div>

        {/* Expanded Search Bar */}
        <motion.div
          initial={false}
          animate={{
            width: isExpanded ? '320px' : '40px',
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
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowResults(true);
                }}
                className="w-full pl-10 pr-10 py-2 bg-white backdrop-blur-md border border-slate-200 rounded-full text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-red-600/50"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setShowResults(false);
                    setIsExpanded(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-600 transition-colors"
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
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onMouseEnter={() => setIsExpanded(true)}
              className="absolute top-full mt-3 w-[400px] -right-4 max-h-[70vh] overflow-y-auto bg-white/98 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl z-50 p-2"
            >
              {!hasResults ? (
                <div className="p-8 text-center text-slate-400 text-sm italic">
                  No matches found for "{searchQuery}"
                </div>
              ) : (
                <div className="space-y-4 p-2">
                  {/* Pages Section */}
                  {filteredPages.length > 0 && (
                    <div>
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-3">
                        Quick Links
                      </h3>
                      <div className="grid grid-cols-1 gap-1">
                        {filteredPages.map((page) => (
                          <a
                            key={page.name}
                            href={page.url}
                            className="group flex flex-col px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-all duration-200 border border-transparent hover:border-slate-100"
                            onClick={() => {
                              setSearchQuery('');
                              setShowResults(false);
                              setIsExpanded(false);
                            }}
                          >
                            <div className="font-bold text-slate-900 text-sm group-hover:text-red-600 transition-colors">{page.name}</div>
                            <div className="text-[11px] text-slate-500 group-hover:text-slate-400 transition-colors">{page.description}</div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Products Section */}
                  {filteredProducts.length > 0 && (
                    <div>
                      <div className="h-px bg-slate-100 my-3 mx-2" />
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-3">
                        Products
                      </h3>
                      <div className="grid grid-cols-1 gap-1">
                        {filteredProducts.slice(0, 8).map((product) => (
                          <button
                            key={product.id}
                            className="group flex items-center justify-between w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-all duration-200 border border-transparent hover:border-slate-100"
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
                            <div className="flex-1">
                              <div className="font-bold text-slate-900 text-sm group-hover:text-red-600 transition-colors">{product.name}</div>
                              {product.description && (
                                <div className="text-[11px] text-slate-500 group-hover:text-slate-400 line-clamp-1">{product.description}</div>
                              )}
                            </div>
                            <div className="text-xs font-black text-red-600 ml-4">
                              ${product.price_from}
                            </div>
                          </button>
                        ))}
                        {filteredProducts.length > 8 && (
                          <div className="px-3 py-2 text-[10px] text-slate-400 font-bold italic">
                            +{filteredProducts.length - 8} additional products
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
                               const [viewAsUser, setViewAsUser] = useState(false);
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
                // Double-check admin role from backend
                setIsAdmin(userData?.role === 'admin');
              } else {
                setUser(null);
                setIsAdmin(false);
              }
            } catch (error) {
              setIsAuthenticated(false);
              setIsAdmin(false);
              setUser(null);
            }
          };
          checkAuth();

          // Re-check auth periodically
          const interval = setInterval(checkAuth, 300000); // Every 5 minutes
          return () => clearInterval(interval);
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

          const scrollTo = React.useCallback((id) => {
          const element = document.getElementById(id.replace('#', ''));
          if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          } else {
          window.location.href = `${createPageUrl('Home')}?section=${id.replace('#', '')}`;
          }
          }, []);

  return (
    <ZeroTrustProvider>
    <MFAProvider>
    <div className="min-h-screen bg-white relative">
        <Helmet>
          <script async src="https://www.googletagmanager.com/gtag/js?id=AW-17926557903"></script>
          <script>
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'AW-17926557903');
            `}
          </script>
        </Helmet>
        <style>{`
          :root {
            --red-dirt-red: #8B2635;
            --red-dirt-dark: #6B1827;
            --red-dirt-gold: #C4955B;
            --red-dirt-slate: #0f172a; /* Slate 900 */
          }

          /* Override ALL red and crimson colors with Red Dirt red */
          [class*="bg-red"], [class*="bg-crimson"],
          .hover\\:bg-red-600:hover, .hover\\:bg-red-700:hover, .hover\\:bg-red-800:hover {
            background-color: var(--red-dirt-red) !important;
          }

          [class*="text-red"], [class*="text-crimson"],
          .hover\\:text-red-400:hover, .hover\\:text-red-500:hover, .hover\\:text-red-600:hover, .hover\\:text-red-700:hover {
            color: var(--red-dirt-red) !important;
          }

          [class*="border-red"], [class*="border-crimson"],
          .focus\\:border-red-700\\/50:focus, .focus\\:border-red-600:focus {
            border-color: var(--red-dirt-red) !important;
          }

          /* Red/Crimson with opacity overrides */
          [class*="bg-red-"][class*="\\/"], [class*="bg-crimson-"][class*="\\/"] {
            background-color: rgba(139, 38, 53, 0.1) !important;
          }
          [class*="text-red-"][class*="\\/"], [class*="text-crimson-"][class*="\\/"] {
            color: rgba(139, 38, 53, 0.8) !important;
          }
          [class*="border-red-"][class*="\\/"], [class*="border-crimson-"][class*="\\/"] {
            border-color: rgba(139, 38, 53, 0.3) !important;
          }

          /* Shadow colors */
          [class*="shadow-red"], [class*="shadow-crimson"] {
            --tw-shadow-color: rgba(139, 38, 53, 0.5) !important;
          }

          /* Gradients */
          [class*="from-red"], [class*="to-red"], [class*="via-red"],
          [class*="from-crimson"], [class*="to-crimson"], [class*="via-crimson"] {
            --tw-gradient-from: var(--red-dirt-red) !important;
            --tw-gradient-to: var(--red-dirt-dark) !important;
            --tw-gradient-via: var(--red-dirt-red) !important;
          }

          /* Update amber/cream text to Red Dirt slate for visibility on white */
          .text-amber-50, [class*="text-amber-50"], .text-red-dirt-cream, [class*="text-red-dirt-cream"] {
            color: var(--red-dirt-slate) !important;
            opacity: 1 !important;
          }

          /* Handle hover/active states where background turns red: make text white */
          .group:hover .group-hover\:text-slate-400,
          .group:hover .group-hover\:text-slate-500,
          .group:hover .group-hover\:text-slate-600,
          .group:hover .group-hover\:text-slate-900,
          .group:hover .group-hover\:text-red-600,
          .group:hover h3,
          .group:hover p {
            color: white !important;
          }

          /* Ensure white text on red buttons and badges */
          .bg-red-600, .bg-red-700, .hover\:bg-red-600:hover, .hover\:bg-red-700:hover {
            color: white !important;
          }
          
          .bg-red-600 svg, .bg-red-700 svg {
            color: white !important;
          }

          /* SVG and icon colors */
          svg[class*="text-red"], svg[class*="text-crimson"],
          [class*="text-red"] svg, [class*="text-crimson"] svg {
            color: var(--red-dirt-red) !important;
          }

          /* Ring colors for focus states */
          [class*="ring-red"], [class*="ring-crimson"] {
            --tw-ring-color: var(--red-dirt-red) !important;
          }

          /* Accent colors */
          [class*="accent-red"], [class*="accent-crimson"] {
            accent-color: var(--red-dirt-red) !important;
          }

          /* Custom scrollbar styling */
          ::-webkit-scrollbar {
            width: 8px;
          }
          ::-webkit-scrollbar-track {
            background: rgba(248, 250, 252, 0.5); /* slate-50 */
            border-radius: 4px;
          }
          ::-webkit-scrollbar-thumb {
            background: var(--red-dirt-red);
            border-radius: 4px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: var(--red-dirt-dark);
          }
        `}</style>
        <MolecularBackground />
        <FloatingMolecularFormulas />

        {/* Mobile Header Toggle (when collapsed on home page) */}
        {isHomePage && mobileHeaderCollapsed && (
          <div 
            onClick={() => setMobileHeaderCollapsed(false)}
            className="lg:hidden fixed top-0 left-0 right-0 z-50 h-12 bg-white/60 backdrop-blur-sm border-b border-slate-200/30 flex items-center justify-center cursor-pointer active:bg-slate-50/60 transition-colors"
          >
            <div className="w-12 h-1 bg-slate-300 rounded-full" />
          </div>
        )}

        {/* Fixed Header */}
          <header 
              onClick={() => {
                if (isHomePage && window.innerWidth < 1024) {
                  setMobileHeaderCollapsed(true);
                }
              }}
              className="fixed top-0 left-0 right-0 z-[70] bg-white/95 backdrop-blur-xl border-b border-slate-100 transition-transform duration-300 shadow-sm" 
              style={{ transform: (isHomePage ? (mobileHeaderCollapsed && window.innerWidth < 1024 ? false : headerVisible) : mouseNearTop) ? 'translateY(0)' : 'translateY(-100%)' }}
            >
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link to={createPageUrl('Home')} className="flex items-center relative group">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center rotate-45 group-hover:rotate-90 transition-transform duration-500 shadow-lg shadow-red-600/20">
                  <div className="w-5 h-5 border-2 border-white rounded-full -rotate-45 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
              <div className="flex flex-col" style={{ 
                opacity: logoOpacity,
                transform: `translate(${logoOffset.x}px, ${logoOffset.y}px) scale(${logoScale})`,
              }}>
                <span className="text-xl font-black text-slate-900 tracking-tighter leading-none">RED HELIX</span>
                <span className="text-[10px] font-black text-red-600 tracking-[0.3em] leading-none mt-1">RESEARCH</span>
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6 flex-1 justify-center">
            <div className="flex items-center gap-1">
              <Link to={createPageUrl('Home')} className="group relative text-[13px] font-bold tracking-tight text-slate-500 hover:text-red-600 px-3 py-2 transition-all duration-300">
                <span className="relative z-10">HOME</span>
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </Link>

              <Link to={createPageUrl('Products')} className="group relative text-[13px] font-bold tracking-tight text-slate-500 hover:text-red-600 px-3 py-2 transition-all duration-300">
                <span className="relative z-10">SHOP</span>
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </Link>

              <Link to={createPageUrl('About')} className="group relative text-[13px] font-bold tracking-tight text-slate-500 hover:text-red-600 px-3 py-2 transition-all duration-300">
                <span className="relative z-10">ABOUT</span>
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </Link>
              
              <Link to={createPageUrl('Contact')} className="group relative text-[13px] font-bold tracking-tight text-slate-500 hover:text-red-600 px-3 py-2 transition-all duration-300">
                <span className="relative z-10">CONTACT</span>
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </Link>
            </div>

            <div className="h-4 w-px bg-slate-200" />

            <div className="flex items-center gap-1">
              <Link to={createPageUrl('PeptideCalculator')} className="group relative text-[13px] font-bold tracking-tight text-slate-500 hover:text-red-600 px-3 py-2 transition-all duration-300">
                <span className="relative z-10">CALCULATOR</span>
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </Link>
              <Link to={createPageUrl('LearnMore')} className="group relative text-[13px] font-bold tracking-tight text-slate-500 hover:text-red-600 px-3 py-2 transition-all duration-300">
                <span className="relative z-10">RESEARCH</span>
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </Link>
              <button onClick={() => scrollTo('#certificates')} className="group relative text-[13px] font-bold tracking-tight text-slate-500 hover:text-red-600 px-3 py-2 transition-all duration-300">
                <span className="relative z-10">COAs</span>
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </button>
            </div>

            {isAuthenticated && (
              <>
                <div className="h-4 w-px bg-slate-200" />
                <Link to={createPageUrl('Account')} className="group relative text-[13px] font-bold tracking-tight text-slate-500 hover:text-red-600 px-3 py-2 transition-all duration-300">
                  <span className="relative z-10">ACCOUNT</span>
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </Link>
              </>
            )}

            {isAdmin && !viewAsUser && (
              <>
                <div className="h-4 w-px bg-slate-200" />
                <Link to={createPageUrl('GrayMarketInsights')} className="group relative text-[13px] font-bold tracking-tight text-slate-500 hover:text-red-600 px-3 py-2 transition-all duration-300 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  <span className="relative z-10 uppercase">Market Intel</span>
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </Link>
              </>
            )}
          </nav>

          {/* Desktop Search */}
          <div className="hidden lg:block flex-shrink-0 mx-4">
            <HeaderSearch />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {isAuthenticated && isAdmin && !viewAsUser && (
              <NotificationCenter userEmail={user?.email} />
            )}

            {isAuthenticated && !viewAsUser && (
              <AlertsDropdown />
            )}

            {isAdmin && (
              <button
                onClick={() => setViewAsUser(!viewAsUser)}
                className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-md border transition-all duration-300 ${
                  viewAsUser 
                    ? 'bg-blue-600/10 border-blue-600/40 text-blue-600 hover:bg-blue-600/20 hover:border-blue-500' 
                    : 'bg-red-600/10 border-red-600/40 text-red-600 hover:bg-red-600/20 hover:border-red-500'
                }`}
                title={viewAsUser ? 'Viewing as User' : 'Viewing as Admin'}
              >
                <div className={`w-2 h-2 rounded-full animate-pulse ${viewAsUser ? 'bg-blue-600' : 'bg-red-600'}`} />
                <span className="text-[11px] font-bold tracking-widest uppercase">
                  {viewAsUser ? 'USER' : 'ADMIN'}
                </span>
              </button>
            )}

            <Link to={createPageUrl('Cart')} className="relative group">
              <div className="p-2.5 rounded-lg border border-slate-200 bg-white hover:border-red-600/50 transition-all duration-300">
                <ShoppingCart className="w-5 h-5 text-slate-500 group-hover:text-red-600 transition-colors" strokeWidth={2} />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-4.5 px-1 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg shadow-red-900/20 border border-white">
                    {cartCount}
                  </span>
                )}
              </div>
            </Link>

            {/* User Menu */}
              <Sheet onOpenChange={(open) => {
                if (open) {
                  setHeaderVisible(false);
                } else {
                  setHeaderVisible(true);
                }
              }}>
                <SheetTrigger asChild>
                  <button className="p-2.5 rounded-lg border border-slate-200 bg-white hover:border-red-600 text-slate-500 hover:text-red-600 transition-all duration-300">
                    <Menu className="w-5 h-5" />
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-white border-slate-200 w-80">
                  <div className="h-full flex flex-col">
                    <div className="border-b border-slate-100 pb-6 mb-8">
                      <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Menu</h2>
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Research & Education</p>
                    </div>
                    
                    <nav className="flex flex-col gap-2 flex-1 overflow-y-auto overflow-x-hidden">
                      <Link to={createPageUrl('Home')} className="text-left text-sm font-black text-slate-900 uppercase tracking-widest hover:text-red-600 px-4 py-3 transition-all rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100">
                        Home
                      </Link>
                      <Link to={createPageUrl('Products')} className="text-left text-sm font-black text-slate-900 uppercase tracking-widest hover:text-red-600 px-4 py-3 transition-all rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100">
                        Shop Products
                      </Link>
                      <Link to={createPageUrl('OurStory')} className="text-left text-sm font-black text-slate-900 uppercase tracking-widest hover:text-red-600 px-4 py-3 transition-all rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100">
                        Our Story
                      </Link>

                      <div className="border-t border-slate-100 my-2 pt-2" />

                      <Link to={createPageUrl('GroupBuy')} className="text-left text-sm font-black text-slate-900 uppercase tracking-widest hover:text-red-600 px-4 py-3 transition-all rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100">
                        Group Buy
                      </Link>
                      
                      <div className="border-t border-slate-100 my-2 pt-2" />
                      
                      <button
                        onClick={() => setShowUploadModal(true)}
                        className="text-left text-sm font-black text-slate-900 uppercase tracking-widest hover:text-red-600 px-4 py-3 transition-all rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 w-full"
                      >
                        Upload Your COA
                      </button>
                      <Link to={createPageUrl('COAReports')} className="text-left text-sm font-black text-slate-900 uppercase tracking-widest hover:text-red-600 px-4 py-3 transition-all rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100">
                        COA Reports
                      </Link>
                      
                      <div className="border-t border-slate-100 my-2 pt-2" />
                      
                      <Link to={createPageUrl('PeppyBot')} className="text-left text-sm font-black text-slate-900 uppercase tracking-widest hover:text-red-600 px-4 py-3 transition-all rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100">
                        PeppyBot
                      </Link>
                      <Link to={createPageUrl('PeptideCalculator')} className="text-left text-sm font-black text-slate-900 uppercase tracking-widest hover:text-red-600 px-4 py-3 transition-all rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100">
                        Peptide Calculator
                      </Link>
                      <Link to={createPageUrl('PeptideAcademy')} className="text-left text-sm font-black text-slate-900 uppercase tracking-widest hover:text-red-600 px-4 py-3 transition-all rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100">
                        Peptide Academy
                      </Link>
                      <Link to={createPageUrl('LearnMore')} className="text-left text-sm font-black text-slate-900 uppercase tracking-widest hover:text-red-600 px-4 py-3 transition-all rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100">
                        Research & Education
                      </Link>

                      <Link to={createPageUrl('BlogGuide')} className="text-left text-sm font-black text-slate-900 uppercase tracking-widest hover:text-red-600 px-4 py-3 transition-all rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100">
                        Research Guides
                      </Link>

                      <Link to={createPageUrl('PeptideComparison')} className="text-left text-sm font-black text-slate-900 uppercase tracking-widest hover:text-red-600 px-4 py-3 transition-all rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100">
                        Compare Peptides
                      </Link>

                      <button onClick={() => scrollTo('#certificates')} className="text-left text-sm font-black text-slate-900 uppercase tracking-widest hover:text-red-600 px-4 py-3 transition-all rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 w-full">
                        Certificates of Analysis
                      </button>
                      
                      <div className="border-t border-slate-100 my-4 pt-4" />
                      
                      {isAuthenticated && (
                        <>
                          <Link to={createPageUrl('Account')} className="text-left text-sm font-black text-slate-900 uppercase tracking-widest hover:text-red-600 px-4 py-3 transition-all rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100">
                            Account Profile
                          </Link>
                          <Link to={createPageUrl('Account')} className="text-left text-sm font-black text-slate-900 uppercase tracking-widest hover:text-red-600 px-4 py-3 transition-all rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100">
                            Order History
                          </Link>
                        </>
                      )}

                      {isAdmin && (
                        <>
                          <div className="border-t border-slate-100 my-2 pt-2" />
                          <button
                            onClick={() => setViewAsUser(!viewAsUser)}
                            className={`w-full text-left text-sm font-black uppercase tracking-widest px-4 py-3 transition-all rounded-lg border flex items-center gap-2 ${
                              viewAsUser 
                                ? 'bg-blue-600/10 border-blue-600/30 text-blue-600 hover:bg-blue-600/20' 
                                : 'bg-red-600/10 border-red-600/30 text-red-600 hover:bg-red-600/20'
                            }`}
                          >
                            {viewAsUser ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                            {viewAsUser ? 'User View (ON)' : 'Admin View'}
                          </button>

                          {!viewAsUser && (
                            <>
                              <Link to={createPageUrl('GrayMarketInsights')} className="text-left text-sm font-black text-slate-900 uppercase tracking-widest hover:text-red-600 px-4 py-3 transition-all rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 flex items-center gap-2">
                                <Eye className="w-4 h-4" />
                                Market Intelligence
                              </Link>
                              <Link to={createPageUrl('AdminPriceManagement')} className="text-left text-sm font-black text-slate-900 uppercase tracking-widest hover:text-red-600 px-4 py-3 transition-all rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                Price Management
                              </Link>
                              <Link to={createPageUrl('AdminStockManagement')} className="text-left text-sm font-black text-slate-900 uppercase tracking-widest hover:text-red-600 px-4 py-3 transition-all rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 flex items-center gap-2">
                                <Package className="w-4 h-4" />
                                Stock Management
                              </Link>
                              <Link to={createPageUrl('AdminManualOrders')} className="text-left text-sm font-black text-slate-900 uppercase tracking-widest hover:text-red-600 px-4 py-3 transition-all rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 flex items-center gap-2">
                                <Package className="w-4 h-4" />
                                Manual Orders
                              </Link>
                              <Link to={createPageUrl('AdminCustomerManagement')} className="text-left text-sm font-black text-slate-900 uppercase tracking-widest hover:text-red-600 px-4 py-3 transition-all rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Customer Management
                              </Link>
                              <Link to={createPageUrl('AdminSupport')} className="text-left text-sm font-black text-slate-900 uppercase tracking-widest hover:text-red-600 px-4 py-3 transition-all rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100">
                                Customer Support
                              </Link>

                              <div className="border-t border-slate-100 my-2 pt-2" />

                              <Link to={createPageUrl('SEOMonitoring')} className="text-left text-sm font-black text-slate-900 uppercase tracking-widest hover:text-red-600 px-4 py-3 transition-all rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100">
                                SEO Monitoring
                              </Link>
                              <Link to={createPageUrl('BacklinkStrategy')} className="text-left text-sm font-black text-slate-900 uppercase tracking-widest hover:text-red-600 px-4 py-3 transition-all rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100">
                                Backlink Strategy
                              </Link>
                              <Link to={createPageUrl('EmailAutomationStrategy')} className="text-left text-sm font-black text-slate-900 uppercase tracking-widest hover:text-red-600 px-4 py-3 transition-all rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100">
                                Email Automation
                              </Link>

                              <div className="border-t border-slate-100 my-2 pt-2" />

                              <Link to={createPageUrl('LaunchChecklist')} className="text-left text-sm font-black text-slate-900 uppercase tracking-widest hover:text-red-600 px-4 py-3 transition-all rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100">
                                Launch Checklist
                              </Link>
                              <Link to={createPageUrl('CompetitivePositioning')} className="text-left text-base font-semibold text-amber-50 hover:text-red-400 px-4 py-3 transition-all rounded-lg hover:bg-stone-800/70 border border-transparent hover:border-red-600/30">
                                Competitive Positioning
                              </Link>

                              <div className="border-t border-stone-800/30 my-2 pt-2" />

                              <Link to={createPageUrl('PaymentSecurity')} className="text-left text-base font-semibold text-amber-50 hover:text-red-400 px-4 py-3 transition-all rounded-lg hover:bg-stone-800/70 border border-transparent hover:border-red-600/30">
                                Payment Security
                              </Link>
                              <Link to={createPageUrl('SecurityCompliance')} className="text-left text-base font-semibold text-amber-50 hover:text-red-400 px-4 py-3 transition-all rounded-lg hover:bg-stone-800/70 border border-transparent hover:border-red-600/30">
                                Security Audit
                              </Link>

                              <div className="border-t border-stone-800/30 my-2 pt-2" />

                              <Link to={createPageUrl('ProductionChecklist')} className="text-left text-base font-semibold text-amber-50 hover:text-red-400 px-4 py-3 transition-all rounded-lg hover:bg-stone-800/70 border border-transparent hover:border-red-600/30">
                                Production Checklist
                              </Link>
                              <Link to={createPageUrl('DeploymentGuide')} className="text-left text-base font-semibold text-amber-50 hover:text-red-400 px-4 py-3 transition-all rounded-lg hover:bg-stone-800/70 border border-transparent hover:border-red-600/30">
                                Deployment Guide
                              </Link>
                              <Link to={createPageUrl('MonitoringSetup')} className="text-left text-base font-semibold text-amber-50 hover:text-red-400 px-4 py-3 transition-all rounded-lg hover:bg-stone-800/70 border border-transparent hover:border-red-600/30">
                              Monitoring Setup
                              </Link>
                              <Link to={createPageUrl('SecurityDashboard')} className="text-left text-base font-semibold text-amber-50 hover:text-red-400 px-4 py-3 transition-all rounded-lg hover:bg-stone-800/70 border border-transparent hover:border-red-600/30 flex items-center gap-2">
                              <Shield className="w-4 h-4" />
                              Zero Trust Security
                              </Link>
                              <Link to={createPageUrl('PlaidPrivacy')} className="text-left text-base font-semibold text-amber-50 hover:text-red-400 px-4 py-3 transition-all rounded-lg hover:bg-stone-800/70 border border-transparent hover:border-red-600/30">
                              Financial Privacy
                              </Link>
                              <Link to={createPageUrl('DataRetentionPolicy')} className="text-left text-base font-semibold text-amber-50 hover:text-red-400 px-4 py-3 transition-all rounded-lg hover:bg-stone-800/70 border border-transparent hover:border-red-600/30">
                              Data Retention
                              </Link>
                              <Link to={createPageUrl('PlaidCompliance')} className="text-left text-base font-semibold text-amber-50 hover:text-red-400 px-4 py-3 transition-all rounded-lg hover:bg-stone-800/70 border border-transparent hover:border-red-600/30">
                              Plaid Compliance
                              </Link>
                              <Link to={createPageUrl('PlaidDataRetention')} className="text-left text-base font-semibold text-amber-50 hover:text-red-400 px-4 py-3 transition-all rounded-lg hover:bg-stone-800/70 border border-transparent hover:border-red-600/30">
                              Plaid Data Disposal
                              </Link>
                              <Link to={createPageUrl('PlaidAdminDashboard')} className="text-left text-base font-semibold text-amber-50 hover:text-red-400 px-4 py-3 transition-all rounded-lg hover:bg-stone-800/70 border border-transparent hover:border-red-600/30">
                              Plaid Admin Dashboard
                              </Link>
                              </>
                              )}
                              </>
                              )}

                              <div className="border-t border-stone-800/30 my-4 pt-4" />

                      <Link to={createPageUrl('CustomerTestimonials')} className="text-left text-base font-semibold text-amber-50 hover:text-red-400 px-4 py-3 transition-all rounded-lg hover:bg-stone-800/70 border border-transparent hover:border-red-600/30">
                        Customer Testimonials
                      </Link>

                      {isAdmin && !viewAsUser && (
                        <Link to={createPageUrl('ConversionTracking')} className="text-left text-base font-semibold text-amber-50 hover:text-red-400 px-4 py-3 transition-all rounded-lg hover:bg-stone-800/70 border border-transparent hover:border-red-600/30">
                          Conversion Tracking
                        </Link>
                      )}

                      <Link to={createPageUrl('ResourceHub')} className="text-left text-base font-semibold text-amber-50 hover:text-red-400 px-4 py-3 transition-all rounded-lg hover:bg-stone-800/70 border border-transparent hover:border-red-600/30">
                        Resource Hub
                      </Link>

                      <Link to={createPageUrl('ExpandedFAQ')} className="text-left text-base font-semibold text-amber-50 hover:text-red-400 px-4 py-3 transition-all rounded-lg hover:bg-stone-800/70 border border-transparent hover:border-red-600/30">
                        FAQ
                      </Link>

                      <Link to={createPageUrl('Policies')} className="text-left text-base font-semibold text-amber-50 hover:text-red-400 px-4 py-3 transition-all rounded-lg hover:bg-stone-800/70 border border-transparent hover:border-red-600/30">
                        Policies & Terms
                      </Link>
                    </nav>
                    
                    <div className="border-t border-stone-800/50 pt-4 mt-auto">
                      {isAuthenticated && (
                        <button
                          onClick={() => {
                            // Let Base44 SDK handle logout properly
                            base44.auth.logout(createPageUrl('Home'));
                          }}
                          className="w-full text-center text-base font-semibold text-amber-50 hover:text-red-400 px-4 py-3 transition-all rounded-lg hover:bg-stone-800/70 border border-red-600/30"
                        >
                          Sign Out
                        </button>
                      )}
                      {!isAuthenticated && (
                        <Link
                          to={createPageUrl('Login')}
                          className="w-full text-center text-base font-semibold text-amber-50 hover:text-red-400 px-4 py-3 transition-all rounded-lg hover:bg-stone-800/70 border border-red-600/30 block"
                        >
                          Sign In
                        </Link>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              </div>
              </div>
              </header>
      

      
      {/* Main Content */}
      <main>
        {React.cloneElement(children, { adminViewAsUser: viewAsUser })}
      </main>



      <UploadCOAModal
      isOpen={showUploadModal}
      onClose={() => setShowUploadModal(false)}
      onSuccess={() => {
      setShowUploadModal(false);
      window.location.href = createPageUrl('COAReports');
      }}
      />
      <AbandonedCartTracker />
      <SecurityMonitor />
      </div>
      </MFAProvider>
      </ZeroTrustProvider>
      );
      }