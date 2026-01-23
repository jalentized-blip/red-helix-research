import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import ProductModal from '@/components/product/ProductModal';

import AnnouncementBar from '@/components/home/AnnouncementBar';
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

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const handleSelectStrength = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-amber-50">
      <AnnouncementBar />
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