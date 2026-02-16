import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ProductModal from '@/components/product/ProductModal';
import AgeVerificationBot from '@/components/AgeVerificationBot';
import {
  generateOrganizationSchema,
  generateWebsiteSchema,
  generateLocalBusinessSchema,
  generateSiteNavigationSchema,
  generateBreadcrumbSchema
} from '@/components/utils/advancedSchemaHelpers';
import TechGrid from '@/components/effects/TechGrid';
import ParticleField from '@/components/effects/ParticleField';
import RedHelixBackground from '@/components/effects/RedHelixBackground';
import { Package, ClipboardList, DollarSign, User, Settings2 } from 'lucide-react';
import SEO from '@/components/SEO';
import QuickShop from '@/components/QuickShop';

import Hero from '@/components/home/Hero';
import TrustBar from '@/components/home/TrustBar';
import ValueProposition from '@/components/home/ValueProposition';
import NumberedFeatures from '@/components/home/NumberedFeatures';
import AboutSection from '@/components/home/AboutSection';
import ProtocolEngine from '@/components/home/ProtocolEngine';
import BestSellers from '@/components/home/BestSellers';
import ShopByGoal from '@/components/home/ShopByGoal';
import AllProducts from '@/components/home/AllProducts';
import WhyTrustUs from '@/components/home/WhyTrustUs';
import Certificates from '@/components/home/Certificates';
import HowItWorks from '@/components/home/HowItWorks';
import Reviews from '@/components/home/Reviews';
import FAQ from '@/components/home/FAQ';
import Contact from '@/components/home/Contact';
import Footer from '@/components/home/Footer';

export default function Home({ adminViewAsUser = false }) {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showAgeVerification, setShowAgeVerification] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [ageVerified, setAgeVerified] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const navigate = useNavigate();

    const { data: products = [], isLoading } = useQuery({
      queryKey: ['products'],
      queryFn: () => base44.entities.Product.list(),
    });

    useEffect(() => {
      const checkAuth = async () => {
        try {
          const verified = localStorage.getItem('ageVerified') === 'true';
          setAgeVerified(verified);

          const isAuth = await base44.auth.isAuthenticated();
          setIsAuthenticated(isAuth);

          if (isAuth) {
            const user = await base44.auth.me();
            setIsAdmin(user?.role === 'admin');
          }

          if (!verified) {
            setShowAgeVerification(true);
          }
        } catch (error) {
          const verified = localStorage.getItem('ageVerified') === 'true';
          setAgeVerified(verified);
          if (!verified) {
            setShowAgeVerification(true);
          }
        }
      };
      checkAuth();

      const handleOpenProduct = (event) => {
        const product = event.detail;
        if (product) {
          setSelectedProduct(product);
          setIsModalOpen(true);
        }
      };

      window.addEventListener('openProductModal', handleOpenProduct);
      return () => window.removeEventListener('openProductModal', handleOpenProduct);
    }, []);

  const handleSelectStrength = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const section = params.get('section');

    if (section) {
      setTimeout(() => {
        const element = document.getElementById(section);
        element?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, []);

  const handleAgeVerification = () => {
    setShowAgeVerification(false);
    setAgeVerified(true);
  };

  if (showAgeVerification && !ageVerified) {
    return (
      <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center">
        <AgeVerificationBot 
          isOpen={true} 
          onVerify={handleAgeVerification} 
        />
      </div>
    );
  }

  const schemas = [
    generateOrganizationSchema(),
    generateWebsiteSchema(),
    generateLocalBusinessSchema(),
    generateSiteNavigationSchema(),
    generateBreadcrumbSchema([
      { name: 'Home', url: '/' }
    ])
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 relative">
      <SEO
        title="Buy Research Peptides USA — HPLC Verified, COA Certified | Red Helix Research"
        description="Premium research-grade peptides with third-party COA verification. BPC-157, TB-500, Semaglutide, Tirzepatide — 99%+ HPLC purity. USA-based peptide supplier. For research use only."
        keywords="buy research peptides USA, research peptides, peptide supplier USA, BPC-157, TB-500, semaglutide research, tirzepatide research, COA verified peptides, HPLC tested peptides, research grade peptides, peptide vendor, research chemicals, lab-tested peptides, high purity peptides"
        canonical="https://redhelixresearch.com/"
        schema={schemas}
      />
      
      {/* Background Effects */}
      <RedHelixBackground />
      
      {/* Light version of effects or remove if too dark */}
      <QuickShop />
      <AgeVerificationBot 
        isOpen={showAgeVerification} 
        onVerify={handleAgeVerification} 
      />

      {/* User Auth Button - Updated for Light Theme */}
      {!isAuthenticated && (
        <button
          onClick={() => base44.auth.redirectToLogin(createPageUrl('Home'))}
          className="fixed top-24 right-6 z-40 p-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-[#dc2626]/50 rounded-xl shadow-lg hover:shadow-[#dc2626]/10 transition-all hover:scale-110 group"
          title="Sign In"
        >
          <User className="w-5 h-5 text-slate-400 group-hover:text-[#dc2626]" />
        </button>
      )}

      {/* Admin Buttons - Updated for Light Theme */}
      {isAdmin && (
        <>
          <Link to={createPageUrl('AdminStockManagement')}>
            <button className="fixed top-24 right-6 z-40 p-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-[#dc2626]/50 rounded-xl shadow-lg hover:shadow-[#dc2626]/10 transition-all hover:scale-110 group">
              <Package className="w-5 h-5 text-slate-400 group-hover:text-[#dc2626]" />
            </button>
          </Link>
          <Link to={createPageUrl('AdminOrderManagement')}>
            <button className="fixed top-24 right-20 z-40 p-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-600/50 rounded-xl shadow-lg hover:shadow-blue-600/10 transition-all hover:scale-110 group">
              <ClipboardList className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
            </button>
          </Link>
          <Link to={createPageUrl('AdminPriceManagement')}>
            <button className="fixed top-24 right-34 z-40 p-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-green-600/50 rounded-xl shadow-lg hover:shadow-green-600/10 transition-all hover:scale-110 group" style={{ right: '8.5rem' }}>
              <DollarSign className="w-5 h-5 text-slate-400 group-hover:text-green-600" />
            </button>
          </Link>
          <Link to={createPageUrl('AdminInventoryManager')}>
            <button className="fixed top-24 z-40 p-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-purple-600/50 rounded-xl shadow-lg hover:shadow-purple-600/10 transition-all hover:scale-110 group" style={{ right: '12rem' }}>
              <Settings2 className="w-5 h-5 text-slate-400 group-hover:text-purple-600" />
            </button>
          </Link>
        </>
      )}
      
      <Hero />
      <TrustBar />
      <section aria-label="Value Proposition">
        <ValueProposition />
      </section>
      <section aria-label="Key Features">
        <NumberedFeatures />
      </section>
      <section aria-label="About Red Helix Research">
        <AboutSection />
      </section>
      <section aria-label="Research Protocol Engine">
        <ProtocolEngine />
      </section>
      <section id="best-sellers" aria-label="Best Selling Research Peptides">
        <BestSellers products={products} onSelectStrength={handleSelectStrength} isAuthenticated={isAuthenticated} isAdmin={isAdmin && !adminViewAsUser} />
      </section>
      <section id="shop-by-goal" aria-label="Shop Peptides by Research Goal">
        <ShopByGoal products={products} onSelectStrength={handleSelectStrength} isAuthenticated={isAuthenticated} isAdmin={isAdmin && !adminViewAsUser} />
      </section>
      <section id="products" aria-label="All Research Peptides">
        <AllProducts products={products} onSelectStrength={handleSelectStrength} isAuthenticated={isAuthenticated} isAdmin={isAdmin && !adminViewAsUser} />
      </section>
      <section aria-label="Why Trust Red Helix Research">
        <WhyTrustUs />
      </section>
      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isAuthenticated={isAuthenticated}
      />
      <section id="certificates" aria-label="Certificates of Analysis">
        <Certificates />
      </section>
      <section aria-label="How It Works">
        <HowItWorks />
      </section>
      <section aria-label="Customer Reviews">
        <Reviews />
      </section>
      <section aria-label="Frequently Asked Questions">
        <FAQ />
      </section>
      <section aria-label="Contact Us">
        <Contact />
      </section>
      <Footer />
    </div>
  );
}