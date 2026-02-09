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
const InteractiveQuiz = lazy(() => import('@/components/academy/InteractiveQuiz'));

const LEARNING_MODULES = [
  {
    id: 'beginner',
    title: 'Fundamentals',
    level: 'Beginner',
    icon: BookOpen,
    color: 'bg-green-600',
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
    color: 'bg-blue-600',
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
    color: 'bg-red-600',
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
      className="text-left bg-slate-50 border border-slate-200 rounded-[32px] md:rounded-[40px] p-8 md:p-10 hover:border-red-600/50 hover:bg-white hover:shadow-2xl transition-all group"
    >
      <div className={`w-14 h-14 ${module.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-slate-200`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
        {module.level} Protocol
      </div>
      <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-4 group-hover:text-red-600 transition-colors uppercase tracking-tight">
        {module.title}
      </h3>
      <ul className="space-y-3 mb-6">
        {module.topics.slice(0, 3).map((topic, idx) => (
          <li key={idx} className="text-sm text-slate-600 flex items-start gap-3 font-medium">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            {topic}
          </li>
        ))}
        {module.topics.length > 3 && (
          <li className="text-xs text-slate-400 font-bold uppercase tracking-wider pl-7">
            +{module.topics.length - 3} Advanced Topics
          </li>
        )}
      </ul>
      <div className="flex items-center justify-between pt-6 border-t border-slate-100">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</span>
          <span className="text-sm font-black text-slate-900">
            {userProgress}% Complete
          </span>
        </div>
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-red-600 transition-colors">
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white transition-all" />
        </div>
      </div>
    </button>
  );
});

const QuestionSection = React.memo(({ section, onQuestionClick }) => (
  <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm hover:shadow-md transition-shadow">
    <h3 className="text-sm font-black text-slate-900 mb-6 flex items-center gap-3 uppercase tracking-widest">
      <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
        <FlaskConical className="w-4 h-4 text-white" />
      </div>
      {section.category}
    </h3>
    <ul className="space-y-4">
      {section.questions.map((question, qIdx) => (
        <li key={qIdx}>
          <button
            onClick={() => onQuestionClick(question)}
            className="text-left text-sm text-slate-600 hover:text-red-600 transition-colors flex items-start gap-3 group w-full font-medium"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-slate-200 mt-1.5 group-hover:bg-red-600 transition-colors" />
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

  const schemas = [
    generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Peptide Academy', url: '/peptide-academy' }
    ]),
    generateCourseSchema({
      title: 'Peptide Research Fundamentals',
      description: 'Comprehensive guide to research peptide handling, mechanisms, and safety protocols.'
    }),
    generateCourseSchema({
      title: 'Advanced Peptide Mechanisms',
      description: 'In-depth exploration of cellular signaling pathways and receptor binding.'
    })
  ];

  return (
    <div className="min-h-screen bg-white pt-24 md:pt-32 pb-20">
      <SEO
        title="Peptide Research Academy - Interactive Learning Platform | Red Helix Research"
        description="Master peptide research with our AI-powered learning platform. Interactive modules, mechanism visualizations, and personalized guidance for researchers at all levels."
        keywords="peptide education, research peptides learning, peptide mechanisms, peptide research training, interactive peptide guide"
        schema={schemas}
      />

      <div className="max-w-7xl mx-auto px-6">
        <Link to={createPageUrl('Home')}>
          <Button variant="outline" className="mb-8 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-full font-bold uppercase tracking-wider text-xs px-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        {/* Hero Section */}
        {activeView === 'overview' && (
          <div className="text-center mb-16 md:mb-24">
            <div className="inline-flex items-center gap-2 px-6 py-2 bg-red-600 border border-red-600 rounded-full mb-8">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-[10px] md:text-xs font-black text-white uppercase tracking-widest">Protocol Verified AI Learning</span>
            </div>
            
            <h1 className="text-5xl md:text-8xl font-black text-slate-900 mb-8 uppercase tracking-tighter leading-[0.9]">
              Research <span className="text-red-600">Academy</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-500 max-w-3xl mx-auto mb-12 font-medium leading-relaxed">
              Master the science of research peptides through interactive AI-guided learning, 
              visual mechanism diagrams, and personalized study paths tailored to your knowledge level.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg"
                className="w-full sm:w-auto bg-slate-900 hover:bg-black text-white px-10 py-8 rounded-full font-black uppercase tracking-widest text-sm shadow-xl shadow-slate-200"
                onClick={() => setActiveView('assistant')}
              >
                <Brain className="w-5 h-5 mr-3 text-red-600" />
                Start AI Assistant
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-slate-200 text-slate-900 px-10 py-8 rounded-full font-black uppercase tracking-widest text-sm hover:bg-slate-50"
                onClick={() => setActiveView('visualizer')}
              >
                <Dna className="w-5 h-5 mr-3 text-red-600" />
                Explore Mechanisms
              </Button>
            </div>
          </div>
        )}

        {/* Quick Start Guide */}
        {showQuickStart && activeView === 'overview' && (
          <div className="bg-slate-50 border border-slate-200 rounded-[32px] md:rounded-[40px] p-8 md:p-16 mb-20 md:mb-24 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
              <Zap className="w-64 h-64 text-slate-900" />
            </div>
            <button
              onClick={() => setShowQuickStart(false)}
              className="absolute top-6 right-6 md:top-8 md:right-8 text-slate-300 hover:text-red-600 text-3xl leading-none transition-colors z-20"
            >
              ×
            </button>
            
            <div className="flex flex-col lg:flex-row items-start gap-10 md:gap-12 relative z-10">
              <div className="w-20 h-20 bg-white rounded-[24px] shadow-lg shadow-slate-200 flex items-center justify-center flex-shrink-0">
                <Zap className="w-10 h-10 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 uppercase tracking-tight">
                  Learning <span className="text-red-600">Quick-Start</span>
                </h3>
                <p className="text-lg md:text-xl text-slate-500 mb-10 font-medium leading-relaxed max-w-2xl">
                  Choose your starting point based on your current knowledge level, or dive straight 
                  into our AI Research Assistant for personalized guidance.
                </p>
                <div className="grid md:grid-cols-3 gap-4 md:gap-6">
                  <button
                    onClick={() => handleModuleClick('beginner')}
                    className="text-left p-6 bg-white border border-slate-200 rounded-2xl hover:border-red-600/50 hover:shadow-xl transition-all group"
                  >
                    <BookOpen className="w-6 h-6 text-green-500 mb-4 group-hover:scale-110 transition-transform" />
                    <div className="font-black text-slate-900 mb-1 uppercase tracking-tight">New to Peptides?</div>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Start Fundamentals</div>
                  </button>
                  <button
                    onClick={() => setActiveView('assistant')}
                    className="text-left p-6 bg-white border border-slate-200 rounded-2xl hover:border-red-600/50 hover:shadow-xl transition-all group"
                  >
                    <Brain className="w-6 h-6 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
                    <div className="font-black text-slate-900 mb-1 uppercase tracking-tight">Have Questions?</div>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Ask AI Assistant</div>
                  </button>
                  <button
                    onClick={() => setActiveView('visualizer')}
                    className="text-left p-6 bg-white border border-slate-200 rounded-2xl hover:border-red-600/50 hover:shadow-xl transition-all group"
                  >
                    <Dna className="w-6 h-6 text-red-600 mb-4 group-hover:scale-110 transition-transform" />
                    <div className="font-black text-slate-900 mb-1 uppercase tracking-tight">Visual Learner?</div>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">See 3D Mechanisms</div>
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
              <div className="mb-24 md:mb-32">
                <div className="flex items-center gap-4 mb-10 md:mb-12">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-red-600" />
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter">
                    Learning <span className="text-slate-400">Paths</span>
                  </h2>
                </div>
                <div className="grid md:grid-cols-3 gap-8 md:gap-10">
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
              <div className="mb-24 md:mb-32">
                <div className="flex items-center gap-4 mb-10 md:mb-12">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-red-600" />
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter">
                    Research <span className="text-slate-400">Tools</span>
                  </h2>
                </div>
                <div className="grid lg:grid-cols-3 gap-8 md:gap-10">
                  <button
                    onClick={() => setActiveView('assistant')}
                    className="text-left bg-white border border-slate-200 rounded-[32px] md:rounded-[40px] p-10 md:p-12 hover:border-red-600/50 hover:shadow-2xl transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform">
                      <Brain className="w-48 h-48 text-slate-900" />
                    </div>
                    <Brain className="w-16 h-16 text-blue-600 mb-8 group-hover:scale-110 transition-transform" />
                    <h3 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tight">
                      AI Research Assistant
                    </h3>
                    <p className="text-lg text-slate-500 mb-8 font-medium leading-relaxed max-w-md">
                      Get instant, intelligent answers to your peptide research questions. 
                      Our AI understands context and provides detailed responses.
                    </p>
                    <div className="flex items-center gap-3 text-blue-600 font-black uppercase tracking-widest text-xs">
                      Start Conversation
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveView('visualizer')}
                    className="text-left bg-white border border-slate-200 rounded-[32px] md:rounded-[40px] p-10 md:p-12 hover:border-red-600/50 hover:shadow-2xl transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform">
                      <Dna className="w-48 h-48 text-slate-900" />
                    </div>
                    <Dna className="w-16 h-16 text-red-600 mb-8 group-hover:scale-110 transition-transform" />
                    <h3 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tight">
                      Mechanism Visualizer
                    </h3>
                    <p className="text-lg text-slate-500 mb-8 font-medium leading-relaxed max-w-md">
                      Explore interactive 3D visualizations of peptide mechanisms of action. 
                      See how research peptides interact at the cellular level.
                    </p>
                    <div className="flex items-center gap-3 text-red-600 font-black uppercase tracking-widest text-xs">
                      Explore Mechanisms
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveView('quiz')}
                    className="text-left bg-white border border-slate-200 rounded-[32px] md:rounded-[40px] p-10 md:p-12 hover:border-red-600/50 hover:shadow-2xl transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform">
                      <GraduationCap className="w-48 h-48 text-slate-900" />
                    </div>
                    <GraduationCap className="w-16 h-16 text-green-600 mb-8 group-hover:scale-110 transition-transform" />
                    <h3 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tight">
                      Competency Quiz
                    </h3>
                    <p className="text-lg text-slate-500 mb-8 font-medium leading-relaxed max-w-md">
                      Test your research knowledge and earn certification. 
                      Assess your understanding of protocols, safety, and mechanisms.
                    </p>
                    <div className="flex items-center gap-3 text-green-600 font-black uppercase tracking-widest text-xs">
                      Take Assessment
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                </div>
              </div>

              {/* Popular Questions */}
              <div>
                <div className="flex items-center gap-4 mb-10 md:mb-12">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center">
                    <Target className="w-6 h-6 text-red-600" />
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter">
                    Clinical <span className="text-slate-400">FAQ</span>
                  </h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-12">
                <Button 
                  variant="ghost" 
                  onClick={() => setActiveView('overview')}
                  className="text-slate-600 hover:text-slate-900 font-bold uppercase tracking-wider text-xs"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Modules
                </Button>
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${selectedModuleData.color}`} />
                  <span className="text-sm font-black text-slate-900 uppercase tracking-widest">
                    {selectedModuleData.level} Module
                  </span>
                </div>
              </div>
              <LearningPathway module={selectedModuleData} />
            </div>
          )}

          {activeView === 'assistant' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-12">
                <Button 
                  variant="ghost" 
                  onClick={() => setActiveView('overview')}
                  className="text-slate-600 hover:text-slate-900 font-bold uppercase tracking-wider text-xs"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Exit Assistant
                </Button>
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">AI Agent Online</span>
                </div>
              </div>
              <AIResearchAssistant />
            </div>
          )}

          {activeView === 'visualizer' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-12">
                <Button 
                  variant="ghost" 
                  onClick={() => setActiveView('overview')}
                  className="text-slate-600 hover:text-slate-900 font-bold uppercase tracking-wider text-xs"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Exit Visualizer
                </Button>
                <div className="flex items-center gap-2 px-4 py-2 bg-red-600 border border-red-600 rounded-full">
                  <Activity className="w-4 h-4 text-white" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Interactive 3D Engine</span>
                </div>
              </div>
              <MechanismVisualizer />
            </div>
          )}

          {activeView === 'quiz' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-12">
                <Button 
                  variant="ghost" 
                  onClick={() => setActiveView('overview')}
                  className="text-slate-600 hover:text-slate-900 font-bold uppercase tracking-wider text-xs"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Exit Quiz
                </Button>
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-100 rounded-full">
                  <GraduationCap className="w-4 h-4 text-green-600" />
                  <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Assessment Mode</span>
                </div>
              </div>
              <InteractiveQuiz />
            </div>
          )}
        </Suspense>
      </div>
    </div>
  );
}
