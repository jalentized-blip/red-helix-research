import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, Circle, ChevronRight, BookOpen, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LearningPathway({ module, onBack, onComplete }) {
  const [completedTopics, setCompletedTopics] = useState([]);
  const [currentTopic, setCurrentTopic] = useState(null);

  const handleTopicComplete = (topic) => {
    if (!completedTopics.includes(topic)) {
      const newCompleted = [...completedTopics, topic];
      setCompletedTopics(newCompleted);
      const progress = Math.round((newCompleted.length / module.topics.length) * 100);
      onComplete(progress);
    }
    setCurrentTopic(null);
  };

  const Icon = module.icon;
  const isModuleComplete = completedTopics.length === module.topics.length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="flex items-center justify-between mb-8">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Academy
        </Button>
        <div className="text-sm text-stone-400">
          {completedTopics.length} / {module.topics.length} topics completed
        </div>
      </div>

      {/* Module Header */}
      <div className={`bg-gradient-to-br ${module.color} rounded-2xl p-8 mb-8 relative overflow-hidden`}>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Icon className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-white/80 uppercase tracking-wider mb-1">
                {module.level}
              </div>
              <h1 className="text-3xl font-black text-white">
                {module.title}
              </h1>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white"
              initial={{ width: 0 }}
              animate={{ width: `${(completedTopics.length / module.topics.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
        
        {isModuleComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-4 right-4"
          >
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Award className="w-8 h-8 text-white" />
            </div>
          </motion.div>
        )}
      </div>

      {/* Topic List */}
      <div className="space-y-4 mb-8">
        {module.topics.map((topic, idx) => {
          const isCompleted = completedTopics.includes(topic);
          const isActive = currentTopic === topic;
          
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <button
                onClick={() => setCurrentTopic(topic)}
                className={`w-full text-left p-6 rounded-xl border-2 transition-all ${
                  isActive
                    ? 'bg-gradient-to-r ' + module.color + '/10 border-white/30'
                    : isCompleted
                    ? 'bg-stone-800/50 border-green-600/30'
                    : 'bg-stone-900/60 border-stone-700 hover:border-stone-600'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isCompleted
                      ? 'bg-green-600/20 border-2 border-green-600/50'
                      : 'bg-stone-800 border-2 border-stone-700'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-stone-500" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-amber-50 mb-1">
                      {topic}
                    </h3>
                    <p className="text-sm text-stone-400">
                      {isCompleted ? 'Completed' : 'Click to learn more'}
                    </p>
                  </div>
                  
                  <ChevronRight className="w-5 h-5 text-stone-500" />
                </div>
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Topic Detail Modal */}
      <AnimatePresence>
        {currentTopic && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setCurrentTopic(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-stone-900 border-2 border-stone-700 rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className={`w-12 h-12 bg-gradient-to-br ${module.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-amber-50 mb-2">
                    {currentTopic}
                  </h2>
                  <p className="text-stone-400">
                    {module.level} Level Topic
                  </p>
                </div>
              </div>

              <div className="prose prose-invert max-w-none mb-8">
                <p className="text-stone-300 leading-relaxed">
                  This is where the detailed educational content for "{currentTopic}" would appear. 
                  In a full implementation, this would include:
                </p>
                <ul className="text-stone-300 space-y-2 mt-4">
                  <li>Comprehensive explanations of the concept</li>
                  <li>Visual diagrams and illustrations</li>
                  <li>Practical examples and applications</li>
                  <li>Common mistakes to avoid</li>
                  <li>Additional resources for deeper learning</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => handleTopicComplete(currentTopic)}
                  className="flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark as Complete
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentTopic(null)}
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion Badge */}
      {isModuleComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-green-600/20 to-green-700/10 border-2 border-green-600/30 rounded-2xl p-8 text-center"
        >
          <Award className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-amber-50 mb-2">
            Module Complete!
          </h3>
          <p className="text-stone-300 mb-6">
            You've mastered all topics in {module.title}
          </p>
          <Button onClick={onBack} size="lg">
            Return to Academy
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}