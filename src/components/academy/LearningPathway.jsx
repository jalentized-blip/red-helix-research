import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, Circle, ChevronRight, BookOpen, Award, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import { EDUCATIONAL_CONTENT } from './educationalContent';
import { motion, AnimatePresence } from 'framer-motion';

// Memoized topic item
const TopicItem = React.memo(({ topic, isCompleted, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full text-left p-6 rounded-[24px] border-2 transition-all ${
      isActive
        ? `bg-red-50/50 border-red-600/30`
        : isCompleted
        ? 'bg-slate-50 border-green-600/20'
        : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'
    }`}
  >
    <div className="flex items-center gap-5">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${
        isCompleted
          ? 'bg-green-600 text-white shadow-sm shadow-green-100'
          : 'bg-slate-100 text-slate-400'
      }`}>
        {isCompleted ? (
          <CheckCircle2 className="w-6 h-6" />
        ) : (
          <Circle className="w-6 h-6" />
        )}
      </div>
      
      <div className="flex-1">
        <h3 className="text-xl font-black text-slate-900 mb-1 uppercase tracking-tighter leading-none">
          {topic}
        </h3>
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">
          {isCompleted ? 'Module Completed' : 'Research Topic Available'}
        </p>
      </div>
      
      <ChevronRight className={`w-6 h-6 transition-all ${isActive ? 'text-red-600 translate-x-1' : 'text-slate-300'}`} />
    </div>
  </button>
));

const TopicModal = React.memo(({ topic, moduleLevel, onComplete, onClose }) => {
  const content = EDUCATIONAL_CONTENT[topic];
  
  if (!content) {
    return (
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white border border-slate-200 rounded-[40px] p-12 max-w-2xl w-full shadow-2xl"
        >
          <p className="text-slate-600 text-lg font-medium">Content not available for this topic.</p>
          <Button onClick={onClose} className="mt-8 bg-slate-900 text-white rounded-2xl px-8">Close</Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[100] flex items-center justify-center p-4 md:p-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-slate-200 rounded-[40px] max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Modal Header */}
        <div className="p-8 md:p-12 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 bg-red-600 rounded-3xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-200">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] mb-2">
                  {moduleLevel} Research Protocol
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                  {topic}
                </h2>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors">
              <XCircle className="w-8 h-8 text-slate-300 hover:text-slate-900" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          {/* Overview Section */}
          <section>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
              Topic Overview
            </h3>
            <p className="text-xl text-slate-600 leading-relaxed font-medium">
              {content.overview}
            </p>
          </section>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Key Points */}
            <section>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Key Scientific Objectives</h3>
              <ul className="space-y-4">
                {content.keyPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700 font-medium">{point}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Examples */}
            <section>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Research Applications</h3>
              <div className="space-y-3">
                {content.examples.map((example, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <p className="text-slate-600 font-medium italic">"{example}"</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Mechanism */}
          <section className="bg-slate-900 rounded-[32px] p-8 md:p-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full -mr-32 -mt-32 blur-3xl" />
            <h3 className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mb-6 relative z-10">Mechanism of Action</h3>
            <p className="text-lg md:text-xl text-slate-300 leading-relaxed relative z-10">
              {content.mechanism}
            </p>
          </section>

          {/* Safety Warning */}
          <section className="bg-red-600 border border-red-500 rounded-[32px] p-8 md:p-10">
            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Compliance & Safety Protocol
            </h3>
            <p className="text-white font-bold text-lg leading-relaxed">
              {content.safety}
            </p>
          </section>

          {/* Clinical References */}
          {content.clinicalData && content.clinicalData.length > 0 && (
            <section className="border-t border-slate-100 pt-12">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Clinical Evidence & Peer-Reviewed Data</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {content.clinicalData.map((data, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-100 rounded-[24px] p-6 hover:border-red-600/20 transition-all group">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white bg-red-600 px-3 py-1 rounded-full">
                        {data.source}
                      </span>
                      <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-red-600 transition-colors" />
                    </div>
                    <h4 className="text-lg font-black text-slate-900 mb-3 uppercase tracking-tighter leading-tight">{data.title}</h4>
                    <p className="text-sm text-slate-500 leading-relaxed italic">
                      "{data.detail}"
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-8 border-t border-slate-100 bg-white flex gap-4">
          <Button
            onClick={onComplete}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white h-16 rounded-2xl text-lg font-bold uppercase tracking-wider shadow-lg shadow-red-200 transition-all active:scale-[0.98]"
          >
            <CheckCircle2 className="w-6 h-6 mr-3" />
            Validate Module Knowledge
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="px-10 h-16 rounded-2xl border-slate-200 text-slate-600 font-bold uppercase tracking-wider hover:bg-slate-50"
          >
            Exit Topic
          </Button>
        </div>
      </motion.div>
    </div>
  );
});

// Helper for XCircle icon missing in main imports but used in Modal
const XCircle = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default function LearningPathway({ module, onBack, onComplete }) {
  const [completedTopics, setCompletedTopics] = useState([]);
  const [currentTopic, setCurrentTopic] = useState(null);

  const Icon = module.icon;
  const isModuleComplete = completedTopics.length === module.topics.length;
  const progressPercent = (completedTopics.length / module.topics.length) * 100;

  const handleTopicComplete = useCallback((topic) => {
    setCompletedTopics(prev => {
      if (!prev.includes(topic)) {
        const newCompleted = [...prev, topic];
        const progress = Math.round((newCompleted.length / module.topics.length) * 100);
        onComplete(progress);
        return newCompleted;
      }
      return prev;
    });
    setCurrentTopic(null);
  }, [module.topics.length, onComplete]);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="rounded-full border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Academy
        </Button>
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
          <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-red-600" style={{ width: `${progressPercent}%` }} />
          </div>
          {completedTopics.length} / {module.topics.length} Modules Verified
        </div>
      </div>

      {/* Module Header */}
      <div className="bg-white border border-slate-200 rounded-[40px] p-10 md:p-14 mb-10 shadow-xl shadow-slate-100 relative overflow-hidden">
        {/* Background Decorative Element */}
        <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-br ${module.color} opacity-[0.03] rounded-full -mr-48 -mt-48 blur-3xl`} />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
          <div className="flex items-center gap-8">
            <div className={`w-24 h-24 bg-gradient-to-br ${module.color} rounded-[32px] flex items-center justify-center shadow-xl shadow-red-100 rotate-3`}>
              <Icon className="w-12 h-12 text-white -rotate-3" />
            </div>
            <div>
              <div className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] mb-2">
                {module.level} Research Track
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                {module.title}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right hidden md:block">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Progress</div>
              <div className="text-3xl font-black text-slate-900">{Math.round(progressPercent)}%</div>
            </div>
            {isModuleComplete && (
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center border-4 border-green-100">
                <Award className="w-10 h-10 text-green-600" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Topic List */}
      <div className="grid gap-4 mb-12">
        {module.topics.map((topic, idx) => (
          <TopicItem
            key={idx}
            topic={topic}
            isCompleted={completedTopics.includes(topic)}
            isActive={currentTopic === topic}
            onClick={() => setCurrentTopic(topic)}
          />
        ))}
      </div>

      <AnimatePresence>
        {/* Topic Detail Modal */}
        {currentTopic && (
          <TopicModal
            topic={currentTopic}
            moduleLevel={module.level}
            onComplete={() => handleTopicComplete(currentTopic)}
            onClose={() => setCurrentTopic(null)}
          />
        )}
      </AnimatePresence>

      {/* Completion Banner */}
      {isModuleComplete && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 rounded-[40px] p-12 md:p-16 text-center text-white relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.1),transparent)] pointer-events-none" />
          <Award className="w-24 h-24 text-red-600 mx-auto mb-8" />
          <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 leading-none">
            Research Track <span className="text-red-600">Mastered</span>
          </h3>
          <p className="text-slate-400 text-lg mb-10 max-w-md mx-auto">
            You've successfully completed all verified research modules for the {module.title} pathway.
          </p>
          <Button 
            onClick={onBack} 
            size="lg"
            className="bg-white hover:bg-slate-100 text-slate-900 px-12 py-8 rounded-2xl text-xl font-black uppercase tracking-widest shadow-2xl transition-all active:scale-95"
          >
            Return to Academy
          </Button>
        </motion.div>
      )}
    </div>
  );
}
