
import React, { useState } from 'react';
import { GameData, QuizItem } from '../../types';
import { Button } from '../Button';
import { CheckCircle, XCircle, ArrowRight, RotateCcw, Flame } from 'lucide-react';

interface QuizGameProps {
  data: GameData;
  onReset: () => void;
}

export const QuizGame: React.FC<QuizGameProps> = ({ data, onReset }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const questions = data.quizContent || [];
  const currentQuestion = questions[currentIdx];
  const progress = ((currentIdx) / questions.length) * 100;

  const handleOptionClick = (option: string) => {
    if (selectedOption) return; // Prevent double guessing

    setSelectedOption(option);
    setShowResult(true);

    if (option === currentQuestion.correctAnswer) {
      setScore(prev => prev + 1);
      setStreak(prev => {
        const next = prev + 1;
        if (next > maxStreak) setMaxStreak(next);
        return next;
      });
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      setIsFinished(true);
    }
  };

  if (isFinished) {
    return (
      <div className="text-center p-8 bg-white rounded-3xl shadow-xl max-w-2xl mx-auto animate-fade-in-up">
        <div className="mb-6">
          <span className="text-6xl">🎉</span>
        </div>
        <h2 className="text-4xl font-bold text-indigo-600 mb-4">Mazel Tov!</h2>
        <p className="text-2xl text-gray-700 mb-8">You scored {score} out of {questions.length}</p>
        
        {maxStreak > 2 && (
          <div className="inline-block bg-orange-100 text-orange-600 px-6 py-3 rounded-full font-bold mb-8 animate-bounce">
            🔥 Best Streak: {maxStreak} in a row!
          </div>
        )}

        <div className="flex justify-center gap-4">
          <Button onClick={onReset} variant="outline">
            <RotateCcw className="w-5 h-5" />
            Play Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* HUD */}
      <div className="mb-8">
        <div className="flex justify-between items-end mb-2 px-2">
           <span className="font-bold text-gray-400 text-sm uppercase tracking-wider">Question {currentIdx + 1}/{questions.length}</span>
           <div className={`flex items-center gap-1 font-bold ${streak > 1 ? 'text-orange-500' : 'text-gray-300'}`}>
             <Flame size={20} className={streak > 1 ? 'animate-pulse' : ''} />
             <span>{streak}</span>
           </div>
        </div>
        <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="bg-white p-6 md:p-10 rounded-3xl shadow-xl mb-6 relative overflow-hidden">
        {/* Decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-8 -mt-8 -z-0" />
        
        <h3 className="relative z-10 text-2xl md:text-3xl font-extrabold text-gray-800 mb-8 leading-tight">
          {currentQuestion.question}
        </h3>
        
        <div className="grid gap-4 relative z-10">
          {currentQuestion.options.map((option, idx) => {
            let btnClass = "text-left text-lg md:text-xl font-medium transition-all transform duration-200 border-2";
            
            if (showResult) {
              if (option === currentQuestion.correctAnswer) {
                btnClass = "bg-green-100 border-green-500 text-green-800 scale-[1.02] shadow-md";
              } else if (option === selectedOption) {
                btnClass = "bg-red-50 border-red-200 text-red-400 opacity-75";
              } else {
                btnClass = "opacity-40 bg-gray-50 border-transparent";
              }
            } else {
              btnClass += " bg-white border-slate-100 hover:border-indigo-400 hover:shadow-lg hover:-translate-y-1 text-slate-700 active:scale-95";
            }

            return (
              <button
                key={idx}
                onClick={() => handleOptionClick(option)}
                disabled={showResult}
                className={`w-full p-5 rounded-2xl ${btnClass}`}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {showResult && option === currentQuestion.correctAnswer && <CheckCircle className="text-green-600 w-6 h-6" />}
                  {showResult && option === selectedOption && option !== currentQuestion.correctAnswer && <XCircle className="text-red-500 w-6 h-6" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {showResult && (
        <div className="animate-fade-in-up">
           {currentQuestion.explanation && (
            <div className="mb-6 p-5 bg-blue-50 text-blue-900 rounded-2xl border border-blue-100 shadow-sm flex gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <p className="font-bold mb-1">Did you know?</p>
                  <p>{currentQuestion.explanation}</p>
                </div>
            </div>
          )}

          <div className="flex justify-center">
            <Button onClick={handleNext} variant="primary" className="text-xl px-12 py-4 shadow-xl shadow-indigo-200 hover:shadow-indigo-300">
              {currentIdx === questions.length - 1 ? "Finish Game" : "Next Question"}
              <ArrowRight className="w-6 h-6 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
