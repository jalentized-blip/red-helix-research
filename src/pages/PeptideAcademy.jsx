import React, { useState, useMemo, lazy, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Brain, Microscope, FlaskConical, Dna, Target,
  ChevronRight, Sparkles, BookOpen, GraduationCap, Zap,
  Activity, AlertCircle, CheckCircle, ArrowLeft
} from 'lucide-react';
import SEO from '@/components/SEO';

// Lazy load heavy components
const LearningPathway = lazy(() => import('@/components/academy/LearningPathway'));
const AIResearchAssistant = lazy(() => import('@/components/academy/AIResearchAssistant'));
const MechanismVisualizer = lazy(() => import('@/components/academy/MechanismVisualizer'));

const LEARNING_MODULES = [
  {
    id: 'beginner',
    title: 'Fundamentals',
    level: 'Beginner',
    icon: BookOpen,
    color: 'from-green-600 to-green-700',
    topics: [
      'What are research peptides?',
      'Peptide nomenclature & structure',
      'Storage & handling basics',
      'Reconstitution fundamentals',
      'Safety protocols',
      'Quality assessment (COAs)'
    ]
  },
  {
    id: 'intermediate',
    title: 'Mechanisms & Applications',
    level: 'Intermediate',
    icon: Microscope,
    color: 'from-blue-600 to-blue-700',
    topics: [
      'Cellular signaling pathways',
      'Receptor binding & activation',
      'Bioavailability factors',
      'Peptide categories overview',
      'Research protocol design',
      'Comparative efficacy'
    ]
  },
  {
    id: 'advanced',
    title: 'Advanced Research',
    level: 'Advanced',
    icon: GraduationCap,
    color: 'from-purple-600 to-purple-700',
    topics: [
      'Synergistic combinations',
      'Advanced dosing strategies',
      'Pharmacokinetics & half-lives',
      'Tissue-specific targeting',
      'Research outcome optimization',
      'Data analysis & documentation'
    ]
  }
];

const POPULAR_QUESTIONS = [
  {
    category: 'Getting Started',
    questions: [
      'How do I reconstitute peptides properly?',
      'What supplies do I need for peptide research?',
      'How should peptides be stored?',
      'What does a COA tell me?',
      'How do I calculate proper dosing?'
    ]
  },
  {
    category: 'Mechanisms',
    questions: [
      'How does BPC-157 promote tissue repair?',
      'What is the mechanism behind GLP-1 agonists?',
      'How does TB-500 affect cell migration?',
      'What pathways do growth hormone peptides activate?',
      'How do nootropic peptides cross the blood-brain barrier?'
    ]
  },
  {
    category: 'Research Protocol',
    questions: [
      'What is an appropriate research duration?',
      'How often should measurements be taken?',
      'What are common research endpoints?',
      'How do I document research findings?',
      'What controls should be included?'
    ]
  },
  {
    category: 'Safety & Quality',
    questions: [
      'How can I verify peptide purity?',
      'What are signs of degradation?',
      'How long are reconstituted peptides stable?',
      'What are proper disposal methods?',
      'How do I interpret third-party testing?'
    ]
  }
];

// Memoized components
const ModuleCard = React.memo(({ module, userProgress, onClick }) => {
  const Icon = module.icon;
  return (
    <button
      onClick={onClick}
      className="text-left bg-stone-900/60 border-2 border-stone-700 rounded-2xl p-6 hover:border-red-600/50 transition-all group"
    >
      <div className={`w-14 h-14 bg-gradient-to-br ${module.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
        {module.level}
      </div>
      <h3 className="text-xl font-bold text-amber-50 mb-3 group-hover:text-red-400 transition-colors">
        {module.title}
      </h3>
      <ul className="space-y-2 mb-4">
        {module.topics.slice(0, 3).map((topic, idx) => (
          <li key={idx} className="text-sm text-stone-400 flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            {topic}
          </li>
        ))}
        {module.topics.length > 3 && (
          <li className="text-sm text-stone-500 italic">
            +{module.topics.length - 3} more topics
          </li>
        )}
      </ul>
      <div className="flex items-center justify-between pt-4 border-t border-stone-700">
        <span className="text-sm text-stone-400">
          {userProgress}% Complete
        </span>
        <ChevronRight className="w-5 h-5 text-stone-600 group-hover:text-red-400 group-hover:translate-x-1 transition-all" />
      </div>
    </button>
  );
});

const QuestionSection = React.memo(({ section, onQuestionClick }) => (
  <div className="bg-stone-900/60 border border-stone-700 rounded-2xl p-6">
    <h3 className="text-lg font-bold text-amber-50 mb-4 flex items-center gap-2">
      <FlaskConical className="w-5 h-5 text-red-400" />
      {section.category}
    </h3>
    <ul className="space-y-3">
      {section.questions.map((question, qIdx) => (
        <li key={qIdx}>
          <button
            onClick={() => onQuestionClick(question)}
            className="text-left text-sm text-stone-300 hover:text-red-400 transition-colors flex items-start gap-2 group w-full"
          >
            <ChevronRight className="w-4 h-4 mt-0.5 text-stone-600 group-hover:text-red-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
            {question}
          </button>
        </li>
      ))}
    </ul>
  </div>
));

const LoadingFallback = () => (
  <div className="flex items-center justify-center py-20">
    <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function PeptideAcademy() {
  const [selectedModule, setSelectedModule] = useState(null);
  const [activeView, setActiveView] = useState('overview');
  const [userProgress, setUserProgress] = useState({ beginner: 0, intermediate: 0, advanced: 0 });
  const [showQuickStart, setShowQuickStart] = useState(true);

  const selectedModuleData = useMemo(
    () => LEARNING_MODULES.find(m => m.id === selectedModule),
    [selectedModule]
  );

  const handleModuleClick = (moduleId) => {
    setSelectedModule(moduleId);
    setActiveView('pathway');
  };

  const handleQuestionClick = (question) => {
    setActiveView('assistant');
  };

  return (
    <div className="min-h-screen bg-stone-950 pt-32 pb-20">
      <SEO
        title="Peptide Research Academy - Interactive Learning Platform | Red Helix Research"
        description="Master peptide research with our AI-powered learning platform. Interactive modules, mechanism visualizations, and personalized guidance for researchers at all levels."
        keywords="peptide education, research peptides learning, peptide mechanisms, peptide research training, interactive peptide guide"
      />

      <div className="max-w-7xl mx-auto px-4">
        <Link to={createPageUrl('Home')}>
          <Button variant="outline" className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        {/* Hero Section - Static, no animation on mount */}
        {activeView === 'overview' && (
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600/20 to-purple-600/20 border border-red-600/30 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-red-400" />
              <span className="text-sm font-bold text-amber-50">AI-Powered Learning Experience</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-amber-50 mb-6">
              Peptide Research
              <span className="block bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent">
                Academy
              </span>
            </h1>
            
            <p className="text-xl text-stone-300 max-w-3xl mx-auto mb-8">
              Master the science of research peptides through interactive AI-guided learning, 
              visual mechanism diagrams, and personalized study paths tailored to your knowledge level.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-red-600 to-red-700"
                onClick={() => setActiveView('assistant')}
              >
                <Brain className="w-5 h-5 mr-2" />
                Start AI Assistant
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => setActiveView('visualizer')}
              >
                <Dna className="w-5 h-5 mr-2" />
                Explore Mechanisms
              </Button>
            </div>
          </div>
        )}

        {/* Quick Start Guide */}
        {showQuickStart && activeView === 'overview' && (
          <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border-2 border-blue-600/30 rounded-2xl p-8 mb-12 relative">
            <button
              onClick={() => setShowQuickStart(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-amber-50 text-2xl leading-none"
            >
              ×
            </button>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-amber-50 mb-3">
                  Welcome to Your Learning Journey
                </h3>
                <p className="text-stone-300 mb-4">
                  Choose your starting point based on your current knowledge level, or dive straight 
                  into our AI Research Assistant for personalized guidance.
                </p>
                <div className="grid md:grid-cols-3 gap-3">
                  <button
                    onClick={() => handleModuleClick('beginner')}
                    className="text-left p-4 bg-stone-900/50 border border-stone-700 rounded-lg hover:border-green-600/50 transition-all group"
                  >
                    <BookOpen className="w-5 h-5 text-green-400 mb-2 group-hover:scale-110 transition-transform" />
                    <div className="font-semibold text-amber-50 mb-1">New to Peptides?</div>
                    <div className="text-xs text-stone-400">Start with fundamentals</div>
                  </button>
                  <button
                    onClick={() => setActiveView('assistant')}
                    className="text-left p-4 bg-stone-900/50 border border-stone-700 rounded-lg hover:border-blue-600/50 transition-all group"
                  >
                    <Brain className="w-5 h-5 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                    <div className="font-semibold text-amber-50 mb-1">Have Questions?</div>
                    <div className="text-xs text-stone-400">Ask our AI assistant</div>
                  </button>
                  <button
                    onClick={() => setActiveView('visualizer')}
                    className="text-left p-4 bg-stone-900/50 border border-stone-700 rounded-lg hover:border-purple-600/50 transition-all group"
                  >
                    <Dna className="w-5 h-5 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                    <div className="font-semibold text-amber-50 mb-1">Visual Learner?</div>
                    <div className="text-xs text-stone-400">See mechanisms in action</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Switcher */}
        <Suspense fallback={<LoadingFallback />}>
          {activeView === 'overview' && (
            <>
              {/* Learning Modules */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-amber-50 mb-8 flex items-center gap-3">
                  <GraduationCap className="w-8 h-8 text-red-600" />
                  Structured Learning Paths
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {LEARNING_MODULES.map((module) => (
                    <ModuleCard
                      key={module.id}
                      module={module}
                      userProgress={userProgress[module.id]}
                      onClick={() => handleModuleClick(module.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Interactive Tools */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-amber-50 mb-8 flex items-center gap-3">
                  <Sparkles className="w-8 h-8 text-red-600" />
                  Interactive Learning Tools
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <button
                    onClick={() => setActiveView('assistant')}
                    className="text-left bg-gradient-to-br from-blue-600/10 to-blue-700/5 border-2 border-blue-600/30 rounded-2xl p-8 hover:border-blue-500/50 transition-all group"
                  >
                    <Brain className="w-12 h-12 text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-2xl font-bold text-amber-50 mb-3">
                      AI Research Assistant
                    </h3>
                    <p className="text-stone-300 mb-4">
                      Get instant, intelligent answers to your peptide research questions. 
                      Our AI understands context and provides detailed, scientifically-backed responses.
                    </p>
                    <div className="flex items-center gap-2 text-blue-400 font-semibold">
                      Start Conversation
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveView('visualizer')}
                    className="text-left bg-gradient-to-br from-purple-600/10 to-purple-700/5 border-2 border-purple-600/30 rounded-2xl p-8 hover:border-purple-500/50 transition-all group"
                  >
                    <Dna className="w-12 h-12 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-2xl font-bold text-amber-50 mb-3">
                      Mechanism Visualizer
                    </h3>
                    <p className="text-stone-300 mb-4">
                      Explore interactive 3D visualizations of peptide mechanisms of action. 
                      See how research peptides interact at the cellular level.
                    </p>
                    <div className="flex items-center gap-2 text-purple-400 font-semibold">
                      Explore Mechanisms
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                </div>
              </div>

              {/* Popular Questions */}
              <div>
                <h2 className="text-3xl font-bold text-amber-50 mb-8 flex items-center gap-3">
                  <Target className="w-8 h-8 text-red-600" />
                  Most Searched Topics
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {POPULAR_QUESTIONS.map((section, idx) => (
                    <QuestionSection
                      key={idx}
                      section={section}
                      onQuestionClick={handleQuestionClick}
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          {activeView === 'pathway' && selectedModuleData && (
            <LearningPathway 
              module={selectedModuleData}
              onBack={() => setActiveView('overview')}
              onComplete={(progress) => {
                setUserProgress(prev => ({ ...prev, [selectedModule]: progress }));
              }}
            />
          )}

          {activeView === 'assistant' && (
            <AIResearchAssistant onBack={() => setActiveView('overview')} />
          )}

          {activeView === 'visualizer' && (
            <MechanismVisualizer onBack={() => setActiveView('overview')} />
          )}
        </Suspense>

        {/* Disclaimer */}
        <div className="mt-16 p-6 bg-stone-900/60 border border-stone-700 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-stone-400">
              <strong className="text-amber-50">Educational Resource:</strong> This academy is designed 
              for educational and informational purposes related to peptide research. All content is for 
              laboratory research use only. Not intended for human consumption or medical advice.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}