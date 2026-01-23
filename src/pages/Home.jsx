import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ProductModal from '@/components/product/ProductModal';
import AgeVerification from '@/components/AgeVerification';

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

export default function Home() {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showAgeVerification, setShowAgeVerification] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [ageVerified, setAgeVerified] = useState(false);
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

          if (!isAuth || !verified) {
            setShowAgeVerification(true);
          }
        } catch (error) {
          setShowAgeVerification(true);
        }
      };
      checkAuth();
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

  if (showAgeVerification && (!isAuthenticated || !ageVerified)) {
    return (
      <div className="min-h-screen bg-stone-950 text-amber-50 flex items-center justify-center">
        <AgeVerification 
          isOpen={true} 
          onVerify={handleAgeVerification} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-amber-50">
      <AgeVerification 
        isOpen={showAgeVerification} 
        onVerify={handleAgeVerification} 
      />
      <Hero />
      <TrustBar />
      <ValueProposition />
      <NumberedFeatures />
      <AboutSection />
      <BestSellers products={products} onSelectStrength={handleSelectStrength} />
      <ShopByGoal products={products} onSelectStrength={handleSelectStrength} />
      <AllProducts products={products} onSelectStrength={handleSelectStrength} />
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