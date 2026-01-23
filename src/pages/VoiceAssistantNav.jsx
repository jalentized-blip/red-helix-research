import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mic, Volume2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function VoiceAssistantNav() {
  const features = [
    {
      icon: Mic,
      title: 'Voice Input',
      description: 'Speak naturally and let the AI understand you perfectly'
    },
    {
      icon: Volume2,
      title: 'Audio Output',
      description: 'Hear responses spoken aloud with natural voice synthesis'
    },
    {
      icon: Mic,
      title: 'Real-time Transcription',
      description: 'See what you\'re saying as you speak'
    }
  ];

  return (
    <div className="min-h-screen bg-stone-950 pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-red-600 hover:text-red-500 mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <h1 className="text-5xl font-black text-amber-50 mb-4">Voice Assistant</h1>
          <p className="text-xl text-stone-400">
            Experience hands-free interaction powered by advanced AI and ElevenLabs voice technology
          </p>
        </div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-red-900/30 to-stone-900/30 border border-red-600/30 rounded-lg p-8 mb-12"
        >
          <p className="text-stone-300 mb-6 leading-relaxed">
            The Voice Assistant lets you speak naturally to get responses read back to you. Type or speak, then hear the AI respond in a natural voice. Perfect for hands-free conversations.
          </p>
          <Link to={createPageUrl('VoiceAssistant')}>
            <Button className="bg-red-700 hover:bg-red-600 text-amber-50 px-8 gap-2 text-lg h-12">
              Open Voice Assistant
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </motion.div>

        {/* Features */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-amber-50 mb-6">Features</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-stone-900/50 border border-stone-700 rounded-lg p-6 hover:border-red-600/50 transition-colors"
                >
                  <Icon className="w-8 h-8 text-red-600 mb-3" />
                  <h3 className="text-lg font-semibold text-amber-50 mb-2">{feature.title}</h3>
                  <p className="text-stone-400 text-sm">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-stone-900/30 border border-stone-700 rounded-lg p-8"
        >
          <h2 className="text-2xl font-bold text-amber-50 mb-6">How It Works</h2>
          <div className="space-y-4 text-stone-300">
            <div className="flex gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-700 text-amber-50 font-bold text-sm flex-shrink-0">1</div>
              <p>Type something or click the mic button to start recording</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-700 text-amber-50 font-bold text-sm flex-shrink-0">2</div>
              <p>Click "Speak" or stop recording to process your input</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-700 text-amber-50 font-bold text-sm flex-shrink-0">3</div>
              <p>The AI responds with natural-sounding voice output</p>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link to={createPageUrl('VoiceAssistant')}>
            <Button className="bg-red-700 hover:bg-red-600 text-amber-50 px-12 gap-2 text-lg h-12">
              Start Using Voice Assistant
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}