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
import { ClipboardList, User, Settings2, Users } from 'lucide-react';
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

      // Meta Pixel: ViewContent on home page load
      if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'ViewContent', {
          content_name: 'Home Page',
          content_type: 'product_group',
        });
      }

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
    const refCode = params.get('ref');

    // Capture referral code from URL and store it
    if (refCode) {
      localStorage.setItem('rdr_referral_code', refCode);
    }

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

  // Age gate is now fully handled by ResearchDisclaimerGate in Layout

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
        title="Cheap Research Peptides USA — GLP-1, Semaglutide, BPC-157 | Red Helix Research"
        description="Best prices on research-grade GLP-1 peptides — Semaglutide, Tirzepatide, BPC-157, TB-500. HPLC-verified, COA certified. Affordable USA peptide supplier. For research use only."
        keywords="cheap research peptides, affordable research peptides, buy research peptides USA, GLP-1 research peptide, cheap GLP-1 peptide, semaglutide research peptide, tirzepatide research peptide, best price peptides USA, discount research peptides, low cost peptides, weight loss research peptide, BPC-157 cheap, TB-500 research, peptide supplier USA, COA verified peptides, HPLC tested peptides, research grade peptides, peptide vendor, research chemicals, GLP-1 agonist research, ozempic research peptide, wegovy research"
        canonical="https://redhelixresearch.com/"
        schema={schemas}
      />
      
      {/* Background Effects */}
      <RedHelixBackground />
      
      {/* Light version of effects or remove if too dark */}
      <QuickShop />
      {/* Age gate handled at Layout level */}

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
          <Link to={createPageUrl('AdminOrderManagement')}>
            <button className="fixed top-24 right-6 z-40 p-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-600/50 rounded-xl shadow-lg hover:shadow-blue-600/10 transition-all hover:scale-110 group">
              <ClipboardList className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
            </button>
          </Link>
          <Link to={createPageUrl('AdminInventoryManager')}>
            <button className="fixed top-24 right-20 z-40 p-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-purple-600/50 rounded-xl shadow-lg hover:shadow-purple-600/10 transition-all hover:scale-110 group">
              <Settings2 className="w-5 h-5 text-slate-400 group-hover:text-purple-600" />
            </button>
          </Link>
          <Link to={createPageUrl('AdminAffiliateManager')}>
            <button className="fixed top-24 z-40 p-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-amber-600/50 rounded-xl shadow-lg hover:shadow-amber-600/10 transition-all hover:scale-110 group" style={{ right: '8.5rem' }}>
              <Users className="w-5 h-5 text-slate-400 group-hover:text-amber-600" />
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