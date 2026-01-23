import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Beaker, Youtube, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

const SourcesBubble = ({ productName }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [sources, setSources] = useState([]);
  const [loadingSource, setLoadingSource] = useState(false);

  const handleExpand = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isExpanded && sources.length === 0) {
      setLoadingSource(true);
      try {
        const response = await base44.integrations.Core.InvokeLLM({
          prompt: `Find the 4 most significant and well-cited peer-reviewed research studies on "${productName}". For each study, provide: title, year, journal, and a brief 2-3 sentence summary of the KEY FINDINGS and OUTCOMES. Return a JSON object with a "studies" array containing objects with: "title", "year", "journal", and "findings" (the summary of key outcomes).`,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              studies: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    year: { type: "string" },
                    journal: { type: "string" },
                    findings: { type: "string" }
                  }
                }
              }
            }
          }
        });
        setSources(response.studies || []);
      } catch (error) {
        console.error('Error fetching sources:', error);
      }
      setLoadingSource(false);
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="mt-4">
      <button
        onClick={handleExpand}
        className="inline-flex items-center gap-2 px-3 py-2 bg-black/40 hover:bg-black/60 rounded-full transition-all"
      >
        <Beaker className="w-4 h-4 text-blue-400" />
        <span className="text-xs font-semibold text-amber-50">Research</span>
        <ChevronDown className={`w-3 h-3 text-amber-50 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 space-y-3 bg-black/40 rounded-lg p-3 max-w-sm"
        >
          {loadingSource ? (
            <p className="text-xs text-stone-400">Loading research...</p>
          ) : sources.length > 0 ? (
            sources.map((study, idx) => (
              <div key={idx} className="border-l-2 border-green-500 pl-3 py-2">
                <p className="text-xs font-semibold text-white">{study.title}</p>
                <p className="text-xs text-stone-400 mt-1">{study.journal} ({study.year})</p>
                <p className="text-xs text-green-400 mt-2 leading-relaxed">{study.findings}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-stone-400">No research available</p>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default function LearnMore() {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const uniqueProducts = useMemo(() => {
    const seen = new Set();
    return products.filter(product => {
      if (seen.has(product.id)) {
        return false;
      }
      seen.add(product.id);
      return true;
    });
  }, [products]);

  const categoryLabels = {
    weight_loss: 'Weight Loss',
    recovery_healing: 'Recovery & Healing',
    cognitive_focus: 'Cognitive Focus',
    performance_longevity: 'Performance & Longevity',
    sexual_health: 'Sexual Health',
    general_health: 'General Health'
  };

  const categoryColors = {
    weight_loss: 'from-orange-600 to-red-600',
    recovery_healing: 'from-green-600 to-emerald-600',
    cognitive_focus: 'from-blue-600 to-indigo-600',
    performance_longevity: 'from-purple-600 to-pink-600',
    sexual_health: 'from-rose-600 to-red-600',
    general_health: 'from-amber-600 to-orange-600'
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-950 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-stone-400">Loading peptides...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <Link to={createPageUrl('Home')}>
            <Button variant="outline" className="border-stone-600 text-stone-400 hover:text-red-600 hover:border-red-600 mb-6">
              ← Back to Shop
            </Button>
          </Link>
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <BookOpen className="w-8 h-8 text-red-600" />
              <h1 className="text-5xl font-black text-amber-50">Learn More</h1>
            </div>
            <p className="text-stone-300 text-lg max-w-2xl">
              Explore the science behind our peptides. Discover potential uses, clinical research, and key findings for each product.
            </p>
          </div>
        </div>

        {/* Peptide Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {uniqueProducts.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <Link to={`${createPageUrl('PeptideLearn')}?id=${product.id}&name=${encodeURIComponent(product.name)}`}>
                <div className={`bg-gradient-to-br ${categoryColors[product.category] || 'from-stone-700 to-stone-800'} rounded-lg p-6 h-full cursor-pointer overflow-hidden relative`}>
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300" />
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <div className="mb-4">
                      <span className="inline-block px-3 py-1 bg-black/40 rounded-full text-xs font-semibold text-amber-50 mb-3">
                        {categoryLabels[product.category]}
                      </span>
                      <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-amber-50 transition-colors">
                        {product.name}
                      </h3>
                    </div>

                    <p className="text-white/90 text-sm leading-relaxed mb-6">
                      {product.description}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-white/80 text-sm">
                        <Beaker className="w-4 h-4" />
                        <span>View Research</span>
                      </div>
                      <span className="text-2xl font-bold text-amber-300">
                        ${product.price_from}+
                      </span>
                    </div>

                    <SourcesBubble productName={product.name} />
                  </div>

                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {uniqueProducts.length === 0 && (
          <div className="text-center py-20">
            <Beaker className="w-16 h-16 text-stone-600 mx-auto mb-4" />
            <p className="text-stone-400 text-lg">No peptides available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}