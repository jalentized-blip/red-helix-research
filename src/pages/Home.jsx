import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

import Hero from '@/components/home/Hero';
import TrustBar from '@/components/home/TrustBar';
import BestSellers from '@/components/home/BestSellers';
import ShopByGoal from '@/components/home/ShopByGoal';
import AllProducts from '@/components/home/AllProducts';
import HowItWorks from '@/components/home/HowItWorks';
import Reviews from '@/components/home/Reviews';
import FAQ from '@/components/home/FAQ';
import Contact from '@/components/home/Contact';
import Footer from '@/components/home/Footer';

export default function Home() {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <Hero />
      <TrustBar />
      <BestSellers products={products} />
      <ShopByGoal />
      <AllProducts products={products} />
      <HowItWorks />
      <Reviews />
      <FAQ />
      <Contact />
      <Footer />
    </div>
  );
}