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
      <div className="min-h-screen bg-stone-950 text-amber-50 flex items-center justify-center">
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
    <div className="min-h-screen bg-stone-950 text-amber-50 relative">
      <SEO 
        title="Buy Lab-Tested Research Peptides USA | Red Helix Research | BPC-157, TB-500, Semaglutide"
        description="Premium research-grade peptides with verified third-party COA. BPC-157, TB-500, semaglutide, tirzepatide. USA-based supplier. High purity, discreet shipping. For research use only."
        keywords="buy research peptides USA, BPC-157 peptide, TB-500 research peptide, semaglutide research, tirzepatide peptide, lab-tested peptides, high purity peptides, research chemical supplier USA, peptide supplier, certified peptides"
        schema={schemas}
      />
      <TechGrid />
      <ParticleField />
      <QuickShop />
      <AgeVerificationBot 
        isOpen={showAgeVerification} 
        onVerify={handleAgeVerification} 
      />

      {/* User Auth Button */}
      {!isAuthenticated && (
        <button
          onClick={() => base44.auth.redirectToLogin(createPageUrl('Home'))}
          className="fixed top-24 right-6 z-40 p-3 bg-gradient-to-br from-red-600/20 to-red-700/10 hover:from-red-600/30 hover:to-red-700/20 border border-red-600/50 hover:border-red-500 rounded-xl shadow-lg hover:shadow-red-600/20 transition-all hover:scale-110"
          title="Sign In"
        >
          <User className="w-5 h-5 text-red-400" />
        </button>
      )}

      {/* Admin Buttons */}
      {isAdmin && (
        <>
          <Link to={createPageUrl('AdminStockManagement')}>
            <button className="fixed top-24 right-6 z-40 p-3 bg-gradient-to-br from-red-600/20 to-red-700/10 hover:from-red-600/30 hover:to-red-700/20 border border-red-600/50 hover:border-red-500 rounded-xl shadow-lg hover:shadow-red-600/20 transition-all hover:scale-110">
              <Package className="w-5 h-5 text-red-400" />
            </button>
          </Link>
          <Link to={createPageUrl('AdminOrderManagement')}>
            <button className="fixed top-24 right-20 z-40 p-3 bg-gradient-to-br from-blue-600/20 to-blue-700/10 hover:from-blue-600/30 hover:to-blue-700/20 border border-blue-600/50 hover:border-blue-500 rounded-xl shadow-lg hover:shadow-blue-600/20 transition-all hover:scale-110">
              <ClipboardList className="w-5 h-5 text-blue-400" />
            </button>
          </Link>
          <Link to={createPageUrl('AdminPriceManagement')}>
            <button className="fixed top-24 right-34 z-40 p-3 bg-gradient-to-br from-green-600/20 to-green-700/10 hover:from-green-600/30 hover:to-green-700/20 border border-green-600/50 hover:border-green-500 rounded-xl shadow-lg hover:shadow-green-600/20 transition-all hover:scale-110" style={{ right: '8.5rem' }}>
              <DollarSign className="w-5 h-5 text-green-400" />
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