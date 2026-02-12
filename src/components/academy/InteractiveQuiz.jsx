import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2, XCircle, RefreshCw, Trophy, Brain, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QUIZ_QUESTIONS = [
  {
    question: "What is the recommended purity level for research-grade peptides?",
    options: ["≥ 90%", "≥ 95%", "≥ 98%", "100%"],
    correct: 2,
    explanation: "HPLC purity should be ≥ 98% for research-grade peptides to ensure experimental validity and minimize impurities."
  },
  {
    question: "How should reconstituted peptides be stored for maximum stability?",
    options: ["Room temperature", "Freezer (-20°C)", "Refrigerator (2-8°C)", "Incubator (37°C)"],
    correct: 2,
    explanation: "Once reconstituted, peptides should be refrigerated at 2-8°C and typically used within 30 days."
  },
  {
    question: "Which water is best for multi-dose peptide vials?",
    options: ["Distilled water", "Sterile water", "Bacteriostatic water", "Tap water"],
    correct: 2,
    explanation: "Bacteriostatic water contains 0.9% benzyl alcohol which prevents bacterial growth in multi-dose vials."
  },
  {
    question: "What does a single sharp peak on an HPLC chromatogram indicate?",
    options: ["Low purity", "High purity", "Peptide degradation", "Incorrect molecular weight"],
    correct: 1,
    explanation: "A single sharp peak indicates that the majority of the substance is the target peptide, signifying high purity."
  },
  {
    question: "Which peptide is known for its stability in gastric acid?",
    options: ["TB-500", "BPC-157", "CJC-1295", "Semaglutide"],
    correct: 1,
    explanation: "BPC-157 is uniquely stable in gastric juice, which is why it has been studied for oral applications in research."
  }
];

export default function InteractiveQuiz({ onBack }) {
  const [currentStep, setCurrentStep] = useState('start'); // start, quiz, result
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);

  const handleStart = () => {
    setCurrentStep('quiz');
    setCurrentQuestion(0);
    setScore(0);
    setSelectedOption(null);
    setIsAnswered(false);
  };

  const handleOptionSelect = (idx) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);
    if (idx === QUIZ_QUESTIONS[currentQuestion].correct) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setCurrentStep('result');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="rounded-full border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Academy
        </Button>
        <div className="flex items-center gap-2 text-slate-400 text-sm font-medium uppercase tracking-wider">
          <Brain className="w-4 h-4 text-[#dc2626]" />
          Knowledge Assessment
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[40px] p-8 md:p-12 shadow-xl shadow-slate-100 min-h-[500px] flex flex-col justify-center relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32 opacity-50 pointer-events-none" />
        
        <AnimatePresence mode="wait">
          {currentStep === 'start' && (
            <motion.div 
              key="start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center relative z-10"
            >
              <div className="w-20 h-20 bg-red-50 text-[#dc2626] rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm">
                <HelpCircle className="w-10 h-10" />
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 uppercase tracking-tighter leading-none">
                Research <span className="text-[#dc2626]">Competency</span> Quiz
              </h2>
              <p className="text-slate-600 text-lg mb-10 max-w-md mx-auto">
                Test your knowledge of peptide research protocols, safety standards, and mechanisms of action.
              </p>
              <Button 
                onClick={handleStart}
                className="bg-slate-900 hover:bg-slate-800 text-white px-10 py-6 rounded-2xl text-lg font-bold uppercase tracking-wider shadow-lg shadow-slate-200 transition-all active:scale-95"
              >
                Begin Assessment
              </Button>
            </motion.div>
          )}

          {currentStep === 'quiz' && (
            <motion.div 
              key="quiz"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="relative z-10"
            >
              <div className="flex justify-between items-center mb-8">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Question {currentQuestion + 1} of {QUIZ_QUESTIONS.length}
                </span>
                <div className="h-1.5 w-32 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-[#dc2626]"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
                  />
                </div>
              </div>

              <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-8 leading-tight">
                {QUIZ_QUESTIONS[currentQuestion].question}
              </h3>

              <div className="space-y-3 mb-8">
                {QUIZ_QUESTIONS[currentQuestion].options.map((option, idx) => {
                  const isCorrect = idx === QUIZ_QUESTIONS[currentQuestion].correct;
                  const isSelected = idx === selectedOption;
                  
                  let buttonClass = "w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center justify-between ";
                  if (!isAnswered) {
                    buttonClass += "border-slate-100 bg-white hover:border-[#dc2626]/30 hover:bg-[#dc2626] hover:text-white text-slate-700 font-medium";
                  } else if (isCorrect) {
                    buttonClass += "border-green-500 bg-green-50 text-green-900 font-bold";
                  } else if (isSelected && !isCorrect) {
                    buttonClass += "border-[#dc2626] bg-[#dc2626] text-white font-bold";
                  } else {
                    buttonClass += "border-slate-50 bg-slate-50 text-slate-400 opacity-50";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionSelect(idx)}
                      disabled={isAnswered}
                      className={buttonClass}
                    >
                      <span>{option}</span>
                      {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                      {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-[#dc2626]" />}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence>
                {isAnswered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-8"
                  >
                    <p className="text-slate-600 text-sm leading-relaxed">
                      <strong className="text-slate-900 block mb-1">Explanation:</strong>
                      {QUIZ_QUESTIONS[currentQuestion].explanation}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {isAnswered && (
                <Button 
                  onClick={handleNext}
                  className="w-full bg-[#dc2626] hover:bg-red-700 text-white py-6 rounded-2xl font-bold uppercase tracking-wider shadow-lg shadow-red-200"
                >
                  {currentQuestion < QUIZ_QUESTIONS.length - 1 ? 'Next Question' : 'View Results'}
                </Button>
              )}
            </motion.div>
          )}

          {currentStep === 'result' && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center relative z-10"
            >
              <div className="w-24 h-24 bg-yellow-50 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
                <Trophy className="w-12 h-12" />
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-2 uppercase tracking-tighter leading-none">
                Assessment <span className="text-[#dc2626]">Complete</span>
              </h2>
              <div className="text-6xl font-black text-slate-900 my-8">
                {score} <span className="text-slate-300">/</span> {QUIZ_QUESTIONS.length}
              </div>
              <p className="text-slate-600 text-lg mb-10 max-w-sm mx-auto">
                {score === QUIZ_QUESTIONS.length 
                  ? "Perfect score! You've demonstrated a high level of research competency."
                  : "Great effort. Review the educational content to further strengthen your research knowledge."}
              </p>
              <div className="flex gap-4">
                <Button 
                  onClick={handleStart}
                  variant="outline"
                  className="flex-1 rounded-2xl border-slate-200 py-6 font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retake Quiz
                </Button>
                <Button 
                  onClick={onBack}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-6 rounded-2xl font-bold uppercase tracking-wider"
                >
                  Return to Academy
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
