import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { base44 } from '@/api/base44Client';

export default function AboutSection() {
  const [vialImage, setVialImage] = useState(null);

  useEffect(() => {
    const generateImage = async () => {
      try {
        const result = await base44.integrations.Core.GenerateImage({
          prompt: "Professional photograph of a large-scale API peptide manufacturing facility in China, modern pharmaceutical factory interior with stainless steel equipment, clean room conditions, workers in cleanroom suits, high-tech production line, bright industrial lighting, quality manufacturing setting"
        });
        if (result?.url) {
          setVialImage(result.url);
        }
      } catch (error) {
        console.error('Failed to generate image:', error);
      }
    };
    generateImage();
  }, []);

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1579154204601-01588f351e67?w=1920&q=80')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/95 to-stone-950/90" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              <span className="text-amber-50">About</span>
              <br />
              <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                Red Dirt Research
              </span>
            </h2>

            <div className="space-y-4 text-amber-100 leading-relaxed">
              <p>
                Red Dirt Research is a trusted supplier of premium research-use compounds, 
                dedicated to unmatched quality, safety, and transparency. We proudly serve 
                laboratories, academic institutions, and professional researchers across the 
                world with fast, reliable service.
              </p>
              <p>
                Every batch is produced in cGMP-certified facilities and verified through 
                rigorous third-party testing by leading American labs. Certificates of 
                Analysis (COAs) are provided with every compound, ensuring researchers have 
                the confidence and clarity they need for consistent results.
              </p>
              <p>
                With same-day shipping and a commitment to precision, Red Dirt Research is 
                your dependable partner for research excellence.
              </p>
            </div>

            <Button 
              className="mt-8 bg-red-700 hover:bg-red-600 text-amber-50 font-semibold px-6"
            >
              Learn More
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>

          {/* Image/Visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-stone-700 bg-stone-800 relative">
              {vialImage ? (
                <>
                  <img 
                    src={vialImage}
                    alt="Peptide factory"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-red-900/20" />
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-stone-500">Loading image...</div>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 to-transparent" />
            </div>
            
            {/* Floating badge */}
            <div className="absolute -bottom-6 -left-6 bg-red-700 text-amber-50 font-bold px-6 py-4 rounded-xl shadow-xl">
              <div className="text-3xl">2,000+</div>
              <div className="text-sm uppercase tracking-wide">Researchers Trust Us</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}