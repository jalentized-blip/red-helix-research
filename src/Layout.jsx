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
import FloatingChatButton from '@/components/chat/FloatingChatButton';
import TelegramChatWindow from '@/components/chat/TelegramChatWindow';
import InboxMessages from '@/components/chat/InboxMessages';
import CustomerInfoModal from '@/components/chat/CustomerInfoModal';

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
                    setIsExpanded(false);
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
                          <a
                            key={page.name}
                            href={page.url}
                            className="block px-3 py-2 rounded-lg hover:bg-stone-800/50 transition-colors"
                            onClick={() => {
                              setSearchQuery('');
                              setShowResults(false);
                              setIsExpanded(false);
                            }}
                          >
                            <div className="font-semibold text-amber-50 text-sm">{page.name}</div>
                            <div className="text-xs text-stone-400">{page.description}</div>
                          </a>
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
                          <button
                            key={product.id}
                            className="block w-full text-left px-3 py-2 rounded-lg hover:bg-stone-800/50 transition-colors"
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
                            <div className="font-semibold text-amber-50 text-sm">{product.name}</div>
                            {product.description && (
                              <div className="text-xs text-stone-400 line-clamp-1">{product.description}</div>
                            )}
                            <div className="text-xs text-red-600 mt-1">From ${product.price_from}</div>
                          </button>
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
                               const [isAdmin, setIsAdmin] = useState(false);
                               const [showUploadModal, setShowUploadModal] = useState(false);
                               const [mouseNearTop, setMouseNearTop] = useState(false);
                               const [mobileHeaderCollapsed, setMobileHeaderCollapsed] = useState(false);
                               const isHomePage = window.location.pathname === '/' || window.location.pathname === '/Home';
                               const [chatOpen, setChatOpen] = useState(false);
                               const [user, setUser] = useState(null);
                               const [showCustomerInfo, setShowCustomerInfo] = useState(false);
                               const [selectedConvId, setSelectedConvId] = useState(null);
                               const [customerInfo, setCustomerInfo] = useState(null);
                               const [isMinimized, setIsMinimized] = useState(false);

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
    <div className="min-h-screen bg-stone-950 relative">
        <style>{`
          :root {
            --red-dirt-red: #8B2635;
            --red-dirt-dark: #6B1827;
            --red-dirt-gold: #C4955B;
            --red-dirt-cream: #F5E6D3;
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

          /* Update amber text to Red Dirt cream */
          .text-amber-50, [class*="text-amber-50"] {
            color: var(--red-dirt-cream) !important;
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
            background: rgba(28, 25, 23, 0.5);
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
            className="lg:hidden fixed top-0 left-0 right-0 z-50 h-12 bg-stone-950/60 backdrop-blur-sm border-b border-stone-800/30 flex items-center justify-center cursor-pointer active:bg-stone-900/60 transition-colors"
          >
            <div className="w-12 h-1 bg-stone-600 rounded-full" />
          </div>
        )}

        {/* Fixed Header */}
          <header 
            onClick={() => {
              if (isHomePage && window.innerWidth < 1024) {
                setMobileHeaderCollapsed(true);
              }
            }}
            className="fixed top-0 left-0 right-0 z-50 bg-stone-950/80 backdrop-blur-md border-b border-stone-800/50 transition-transform duration-300 shadow-lg" 
            style={{ transform: (isHomePage ? (mobileHeaderCollapsed && window.innerWidth < 1024 ? false : headerVisible) : mouseNearTop) ? 'translateY(0)' : 'translateY(-100%)' }}
          >
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link to={createPageUrl('Home')} className="flex items-center relative group">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6972f2b59e2787f045b7ae0d/cb22c6063_thisonerighthere.png"
              alt="Red Dirt Research"
              className="h-40 w-auto object-contain"
              style={{ 
                opacity: logoOpacity,
                transform: `translate(${logoOffset.x}px, ${logoOffset.y}px) scale(${logoScale})`,
              }}
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-3 flex-1 justify-center">
            <div className="flex items-center gap-2">
              <Link to={createPageUrl('Home')} className="text-sm font-semibold text-stone-300 hover:text-amber-50 px-3 py-2 transition-all rounded-lg hover:bg-stone-800/70 border border-transparent hover:border-red-600/30 backdrop-blur-sm">
                Home
              </Link>
              <Link to={createPageUrl('About')} className="text-sm font-semibold text-stone-300 hover:text-amber-50 px-3 py-2 transition-all rounded-lg hover:bg-stone-800/70 border border-transparent hover:border-red-600/30 backdrop-blur-sm">
                About
              </Link>
              <Link to={createPageUrl('Contact')} className="text-sm font-semibold text-stone-300 hover:text-amber-50 px-3 py-2 transition-all rounded-lg hover:bg-stone-800/70 border border-transparent hover:border-red-600/30 backdrop-blur-sm">
                Contact
              </Link>
            </div>

            <div className="h-6 w-px bg-stone-700/50" />

            <div className="flex items-center gap-2">
              <Link to={createPageUrl('PeptideCalculator')} className="text-sm font-semibold text-stone-300 hover:text-amber-50 px-3 py-2 transition-all rounded-lg hover:bg-stone-800/70 border border-transparent hover:border-red-600/30 backdrop-blur-sm">
                Calculator
              </Link>
              <Link to={createPageUrl('LearnMore')} className="text-sm font-semibold text-stone-300 hover:text-amber-50 px-3 py-2 transition-all rounded-lg hover:bg-stone-800/70 border border-transparent hover:border-red-600/30 backdrop-blur-sm">
                Research
              </Link>
              <button onClick={() => scrollTo('#certificates')} className="text-sm font-semibold text-stone-300 hover:text-amber-50 px-3 py-2 transition-all rounded-lg hover:bg-stone-800/70 border border-transparent hover:border-red-600/30 backdrop-blur-sm">
                COAs
              </button>
            </div>

            {isAuthenticated && (
              <>
                <div className="h-6 w-px bg-stone-700/50" />
                <Link to={createPageUrl('Account')} className="text-sm font-semibold text-stone-300 hover:text-amber-50 px-3 py-2 transition-all rounded-lg hover:bg-stone-800/70 border border-transparent hover:border-red-600/30 backdrop-blur-sm">
                  Account
                </Link>
              </>
            )}

            {isAdmin && (
              <>
                <div className="h-6 w-px bg-stone-700/50" />
                <Link to={createPageUrl('GrayMarketInsights')} className="text-sm font-semibold text-stone-300 hover:text-amber-50 px-3 py-2 transition-all rounded-lg hover:bg-stone-800/70 border border-transparent hover:border-red-600/30 backdrop-blur-sm flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  Market Intel
                </Link>
              </>
            )}
          </nav>
          
          {/* Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated && isAdmin && (
              <NotificationCenter userEmail={user?.email} />
            )}

            {isAuthenticated && (
              <AlertsDropdown />
            )}

            <Link to={createPageUrl('Cart')}>
              <button className="relative p-2.5 rounded-lg bg-stone-900/50 border border-red-600/30 text-amber-50 hover:bg-red-600/10 hover:border-red-600/70 hover:text-red-400 transition-all duration-300 group">
                <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-br from-red-600 to-red-700 text-amber-50 text-xs font-bold rounded-full flex items-center justify-center shadow-lg border border-red-600">
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
                <SheetContent side="right" className="bg-stone-950 border-stone-700 w-80">
                  <div className="h-full flex flex-col">
                    <div className="border-b border-stone-800/50 pb-6 mb-8">
                      <h2 className="text-2xl font-bold text-amber-50">Menu</h2>
                      <p className="text-stone-400 text-sm mt-1">Research & Education</p>
                    </div>
                    
                    <nav className="flex flex-col gap-2 flex-1 overflow-y-auto overflow-x-hidden">
                      <Link to={createPageUrl('Home')} className="text-left text-base font-semibold text-amber-50 hover:text-red-400 px-4 py-3 transition-all rounded-lg hover:bg-stone-800/70 border border-transparent hover:border-red-600/30">
                        Home
                      </Link>

                      <div className="border-t border-stone-800/30 my-2 pt-2" />

                      <Link to={createPageUrl('GroupBuy')} className="text-left text-base font-semibold text-amber-50 hover:text-red-400 px-4 py-3 transition-all rounded-lg hover:bg-stone-800/70 border border-transparent hover:border-red-600/30">
                        Group Buy
                      </Link>
                      
                      <div className="border-t border-stone-800/30 my-2 pt-2" />
                      
                      <button
                        onClick={() => setShowUploadModal(true)}
                        className="text-left text-base font-semibold text-amber-50 hover:text-red-400 px-4 py-3 transition-all rounded-lg hover:bg-stone-800/70 border border-transparent hover:border-red-600/30 w-full"
                      >
                        Upload Your COA
                      </button>
                      <Link to={createPageUrl('COAReports')} className="text-left text-base font-semibold text-amber-50 hover:text-red-400 px-4 py-3 transition-all rounded-lg hover:bg-stone-800/70 border border-transparent hover:border-red-600/30">
                        COA Reports
                      </Link>
                      
                      <div className="border-t border-stone-800/30 my-2 pt-2" />
                      
                      <Link to={createPageUrl('PeppyBot')} className="text-left text-base font-semibold text-amber-50 hover:text-red-400 px-4 py-3 transition-all rounded-lg hover:bg-stone-800/70 border border-transparent hover:border-red-600/30">
                        PeppyBot
                      </Link>
                      <Link to={createPageUrl('PeptideCalculator')} className="text-left text-base font-semibold text-amber-50 hover:text-red-400 px-4 py-3 transition-all rounded-lg hover:bg-stone-800/70 border border-transparent hover:border-red-600/30">
                        Peptide Calculator
                      </Link>
                      <Link to={createPageUrl('LearnMore')} className="text-left text-base font-semibold text-amber-50 hover:text-red-400 px-4 py-3 transition-all rounded-lg hover:bg-stone-800/70 border border-transparent hover:border-red-600/30">
                        Research & Education
                      </Link>
                      <button onClick={() => scrollTo('#certificates')} className="text-left text-base font-semibold text-amber-50 hover:text-red-400 px-4 py-3 transition-all rounded-lg hover:bg-stone-800/70 border border-transparent hover:border-red-600/30 w-full">
                        Certificates of Analysis
                      </button>
                      
                      <div className="border-t border-stone-800/30 my-4 pt-4" />
                      
                      {isAuthenticated && (
                        <>
                          <Link to={createPageUrl('Account')} className="text-left text-base font-semibold text-amber-50 hover:text-red-400 px-4 py-3 transition-all rounded-lg hover:bg-stone-800/70 border border-transparent hover:border-red-600/30">
                            Account Profile
                          </Link>
                          <Link to={createPageUrl('Account')} className="text-left text-base font-semibold text-amber-50 hover:text-red-400 px-4 py-3 transition-all rounded-lg hover:bg-stone-800/70 border border-transparent hover:border-red-600/30">
                            Order History
                          </Link>
                        </>
                      )}

                      {isAdmin && (
                        <>
                          <div className="border-t border-stone-800/30 my-2 pt-2" />
                          <Link to={createPageUrl('GrayMarketInsights')} className="text-left text-base font-semibold text-amber-50 hover:text-red-400 px-4 py-3 transition-all rounded-lg hover:bg-stone-800/70 border border-transparent hover:border-red-600/30 flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            Market Intelligence
                          </Link>
                          <Link to={createPageUrl('AdminSupport')} className="text-left text-base font-semibold text-amber-50 hover:text-red-400 px-4 py-3 transition-all rounded-lg hover:bg-stone-800/70 border border-transparent hover:border-red-600/30">
                            Customer Support
                          </Link>
                        </>
                      )}
                    </nav>
                    
                    <div className="border-t border-stone-800/50 pt-4 mt-auto">
                      {isAuthenticated && (
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
                          className="w-full text-center text-base font-semibold text-amber-50 hover:text-red-400 px-4 py-3 transition-all rounded-lg hover:bg-stone-800/70 border border-red-600/30"
                        >
                          Sign Out
                        </button>
                      )}
                      {!isAuthenticated && (
                        <button
                          onClick={() => base44.auth.redirectToLogin(createPageUrl('Account'))}
                          className="w-full text-center text-base font-semibold text-amber-50 hover:text-red-400 px-4 py-3 transition-all rounded-lg hover:bg-stone-800/70 border border-red-600/30"
                        >
                          Sign In
                        </button>
                      )}
                    </div>
                  </div>
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

      <FloatingChatButton 
        onClick={() => {
          if (chatOpen && isMinimized) {
            setIsMinimized(false);
          } else {
            setSelectedConvId(null);
            setShowCustomerInfo(!isAdmin);
            setChatOpen(true);
            setIsMinimized(false);
          }
        }}
        isOpen={chatOpen}
      />

      {!isAdmin && (
        <InboxMessages 
          onSelectConversation={(conv) => {
            setSelectedConvId(conv.id);
            setChatOpen(true);
          }}
        />
      )}

      <CustomerInfoModal 
        isOpen={showCustomerInfo && !chatOpen}
        onClose={() => setShowCustomerInfo(false)}
        onSubmit={(info) => {
          setCustomerInfo(info);
          setShowCustomerInfo(false);
          setChatOpen(true);
        }}
      />

      <TelegramChatWindow 
        isOpen={chatOpen}
        onClose={() => {
          setChatOpen(false);
          setSelectedConvId(null);
          setCustomerInfo(null);
        }}
        customerInfo={customerInfo}
        conversationId={selectedConvId}
        isAdmin={isAdmin}
        isMinimized={isMinimized}
        setIsMinimized={setIsMinimized}
      />

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