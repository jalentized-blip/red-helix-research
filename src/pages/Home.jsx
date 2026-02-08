import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ProductModal from '@/components/product/ProductModal';
import AgeVerificationBot from '@/components/AgeVerificationBot';
import { generateOrganizationSchema, generateWebsiteSchema, generateProductSchema } from '@/components/utils/schemaHelpers';
import TechGrid from '@/components/effects/TechGrid';
import ParticleField from '@/components/effects/ParticleField';
import { Package, ClipboardList, DollarSign, User } from 'lucide-react';
import SEO from '@/components/SEO';
import QuickShop from '@/components/QuickShop';

import Hero from '@/components/home/Hero';
import TrustBar from '@/components/home/TrustBar';
import ValueProposition from '@/components/home/ValueProposition';
import NumberedFeatures from '@/components/home/NumberedFeatures';
import AboutSection from '@/components/home/AboutSection';
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
    generateWebsiteSchema()
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 relative">
      <SEO 
        title="Research Peptides for Laboratory Use | Red Helix Research"
        description="Research-grade peptides for laboratory and scientific research. BPC-157, TB-500, Semaglutide, Tirzepatide with verified COAs. For research use only. Not for human consumption."
        keywords="research peptides, laboratory peptides, peptide research chemicals, BPC-157 research, TB-500 research, research grade peptides, peptide supplier, in vitro research, scientific research peptides, COA certified research chemicals"
        schema={schemas}
      />
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
          className="fixed top-24 right-6 z-40 p-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-red-600/50 rounded-xl shadow-lg hover:shadow-red-600/10 transition-all hover:scale-110 group"
          title="Sign In"
        >
          <User className="w-5 h-5 text-slate-400 group-hover:text-red-600" />
        </button>
      )}

      {/* Admin Buttons - Updated for Light Theme */}
      {isAdmin && (
        <>
          <Link to={createPageUrl('AdminStockManagement')}>
            <button className="fixed top-24 right-6 z-40 p-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-red-600/50 rounded-xl shadow-lg hover:shadow-red-600/10 transition-all hover:scale-110 group">
              <Package className="w-5 h-5 text-slate-400 group-hover:text-red-600" />
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
        </>
      )}
      
      <Hero />
      <TrustBar />
      <ValueProposition />
      <NumberedFeatures />
      <AboutSection />
      <BestSellers products={products} onSelectStrength={handleSelectStrength} isAuthenticated={isAuthenticated} isAdmin={isAdmin && !adminViewAsUser} />
      <ShopByGoal products={products} onSelectStrength={handleSelectStrength} isAuthenticated={isAuthenticated} isAdmin={isAdmin && !adminViewAsUser} />
      <AllProducts products={products} onSelectStrength={handleSelectStrength} isAuthenticated={isAuthenticated} isAdmin={isAdmin && !adminViewAsUser} />
      <WhyTrustUs />
      <ProductModal 
        product={selectedProduct} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
      <Certificates />
      <HowItWorks />
      <Reviews />
      <FAQ />
      <Contact />
      <Footer />
    </div>
  );
}