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
import { Package, ClipboardList, DollarSign } from 'lucide-react';
import SEO from '@/components/SEO';

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
        <AgeVerification 
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
        title="Red Helix Research - Buy Research Peptides USA | Lab-Tested Supplier"
        description="Premium research peptides USA with verified COA. High purity lab-tested semaglutide, tirzepatide, BPC-157, TB-500. For research use only. Transparent third-party testing."
        keywords="research peptides USA, buy research peptides, peptide supplier USA, high purity peptides, lab tested peptides, research grade peptides, BPC-157, TB-500, semaglutide for research, tirzepatide research, research chemicals USA"
        schema={schemas}
      />
      <TechGrid />
      <ParticleField />
      <AgeVerificationBot 
        isOpen={showAgeVerification} 
        onVerify={handleAgeVerification} 
      />

      {/* Admin Buttons */}
      {isAdmin && (
        <>
          <Link to={createPageUrl('AdminStockManagement')}>
            <button className="fixed top-24 right-6 z-40 p-3 bg-red-600/20 hover:bg-red-600/40 border border-red-600/50 rounded-lg shadow-lg transition-all hover:scale-110">
              <Package className="w-5 h-5 text-red-400" />
            </button>
          </Link>
          <Link to={createPageUrl('AdminOrderManagement')}>
            <button className="fixed top-24 right-20 z-40 p-3 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-600/50 rounded-lg shadow-lg transition-all hover:scale-110">
              <ClipboardList className="w-5 h-5 text-blue-400" />
            </button>
          </Link>
          <Link to={createPageUrl('AdminPriceManagement')}>
            <button className="fixed top-24 right-34 z-40 p-3 bg-green-600/20 hover:bg-green-600/40 border border-green-600/50 rounded-lg shadow-lg transition-all hover:scale-110" style={{ right: '8.5rem' }}>
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