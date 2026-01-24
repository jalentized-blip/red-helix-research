import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function GlobalSearch() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const pages = [
    { name: 'Home', url: createPageUrl('Home'), description: 'Main page with all products' },
    { name: 'About', url: createPageUrl('About'), description: 'Our story and mission' },
    { name: 'Contact', url: createPageUrl('Contact'), description: 'Get in touch with us' },
    { name: 'Peptide Calculator', url: createPageUrl('PeptideCalculator'), description: 'Calculate dosing and reconstitution' },
    { name: 'Learn More', url: createPageUrl('LearnMore'), description: 'Research and peptide information' },
    { name: 'Cart', url: createPageUrl('Cart'), description: 'Your shopping cart' },
    { name: 'Account', url: createPageUrl('Account'), description: 'Manage your account and orders' },
  ];

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredPages = pages.filter(page =>
    page.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hasResults = searchQuery.length > 0 && (filteredProducts.length > 0 || filteredPages.length > 0);

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-40">
      <motion.div
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => {
          setIsExpanded(false);
          setShowResults(false);
        }}
        className="relative"
      >
        {/* Magnifying Glass Icon */}
        <motion.div
          animate={{
            y: [0, -5, 0],
            opacity: isExpanded ? 0 : 0.3,
          }}
          transition={{
            y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: 0.3 }
          }}
          className="absolute left-0 top-0"
        >
          <Search className="w-8 h-8 text-amber-50" />
        </motion.div>

        {/* Expanded Search Bar */}
        <motion.div
          initial={false}
          animate={{
            width: isExpanded ? '500px' : '32px',
            opacity: isExpanded ? 1 : 0,
          }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="relative"
        >
          {isExpanded && (
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input
                type="text"
                placeholder="Search products, pages..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowResults(true);
                }}
                className="w-full pl-12 pr-12 py-3 bg-stone-900/90 backdrop-blur-md border border-stone-700 rounded-full text-amber-50 placeholder:text-stone-400 focus:outline-none focus:border-red-700/50 shadow-lg"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setShowResults(false);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-amber-50 transition-colors"
                >
                  <X className="w-5 h-5" />
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
              className="absolute top-full mt-2 w-[500px] max-h-[70vh] overflow-y-auto bg-stone-900/95 backdrop-blur-md border border-stone-700 rounded-lg shadow-2xl"
            >
              {!hasResults ? (
                <div className="p-6 text-center text-stone-400">
                  No results found for "{searchQuery}"
                </div>
              ) : (
                <div className="p-4">
                  {/* Pages Section */}
                  {filteredPages.length > 0 && (
                    <div className="mb-4">
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
                            <div className="font-semibold text-amber-50">{page.name}</div>
                            <div className="text-sm text-stone-400">{page.description}</div>
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
                        {filteredProducts.slice(0, 10).map((product) => (
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
                            <div className="font-semibold text-amber-50">{product.name}</div>
                            {product.description && (
                              <div className="text-sm text-stone-400 line-clamp-1">{product.description}</div>
                            )}
                            <div className="text-xs text-red-600 mt-1">From ${product.price_from}</div>
                          </Link>
                        ))}
                        {filteredProducts.length > 10 && (
                          <div className="px-3 py-2 text-sm text-stone-400">
                            +{filteredProducts.length - 10} more products
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
}