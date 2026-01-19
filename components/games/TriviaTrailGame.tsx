
import React, { useState } from 'react';
import { GameData, TriviaTrailItem } from '../../types';
import { Button } from '../Button';
import { Flag, Trophy, RotateCcw } from 'lucide-react';

interface TriviaTrailGameProps {
  data: GameData;
  onReset: () => void;
}

export const TriviaTrailGame: React.FC<TriviaTrailGameProps> = ({ data, onReset }) => {
  const [position, setPosition] = useState(0); // 0 is start
  const [currentQuestion, setCurrentQuestion] = useState<TriviaTrailItem | null>(null);
  const [showResult, setShowResult] = useState<boolean | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const questions = data.triviaTrailContent || [];
  const totalSteps = questions.length + 1; // +1 for start

  // Generate a simple S-shaped path visually
  // We won't map strictly to visual grid for simplicity, but use a linear progress logic
  
  const handleRoll = () => {
    // In this simplified version, you just move forward 1 step per correct answer
    // Find next question
    if (position < questions.length) {
      setCurrentQuestion(questions[position]);
      setShowResult(null);
    }
  };

  const handleAnswer = (opt: string) => {
    if (!currentQuestion) return;
    
    if (opt === currentQuestion.correctAnswer) {
      setShowResult(true);
      setTimeout(() => {
        const nextPos = position + 1;
        setPosition(nextPos);
        setCurrentQuestion(null);
        if (nextPos >= questions.length) {
          setIsFinished(true);
        }
      }, 1000);
    } else {
      setShowResult(false);
    }
  };

  if (isFinished) {
    return (
       <div className="text-center p-8 bg-white rounded-3xl shadow-xl max-w-2xl mx-auto animate-fade-in-up">
        <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-6 animate-bounce" />
        <h2 className="text-4xl font-bold text-indigo-600 mb-4">You Reached the End!</h2>
        <p className="text-xl text-gray-600 mb-8">You conquered the Parsha path.</p>
        <Button onClick={onReset} variant="outline">
          <RotateCcw className="w-5 h-5" />
          Play Again
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      
      {/* Path Visualizer */}
      <div className="mb-12 relative">
        <div className="flex justify-between items-center mb-4 px-2 font-bold text-gray-400 uppercase text-xs tracking-wider">
           <span>Start</span>
           <span>Finish</span>
        </div>
        <div className="h-6 bg-slate-200 rounded-full w-full relative">
          <div 
            className="h-full bg-emerald-400 rounded-full transition-all duration-700 ease-in-out" 
            style={{ width: `${(position / questions.length) * 100}%` }}
          />
          {/* Player Token */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-10 h-10 bg-white border-4 border-indigo-600 rounded-full shadow-lg flex items-center justify-center transition-all duration-700 ease-in-out z-10"
            style={{ left: `${(position / questions.length) * 100}%`, transform: 'translate(-50%, -50%)' }}
          >
            <span className="text-lg">🏃</span>
          </div>
          
          {/* Stops */}
          {questions.map((_, i) => (
             <div 
               key={i}
               className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white ${i < position ? 'bg-emerald-400' : 'bg-slate-300'}`}
               style={{ left: `${((i + 1) / questions.length) * 100}%`, transform: 'translate(-50%, -50%)' }}
             />
          ))}
        </div>
      </div>

      {/* Game Area */}
      <div className="min-h-[300px] flex items-center justify-center">
        {!currentQuestion ? (
          <div className="text-center">
             <p className="text-2xl font-bold text-indigo-900 mb-6">
                {position === 0 ? "Ready to start the journey?" : "Great job! Keep moving!"}
             </p>
             <Button onClick={handleRoll} className="text-xl px-12 py-4 shadow-xl shadow-indigo-200">
               {position === 0 ? "Start Game" : "Next Question"}
             </Button>
          </div>
        ) : (
          <div className="w-full max-w-2xl bg-white p-8 rounded-3xl shadow-xl border border-indigo-100 animate-fade-in-up">
            <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">{currentQuestion.question}</h3>
            <div className="grid gap-3">
              {currentQuestion.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(opt)}
                  disabled={showResult === true}
                  className={`
                    w-full p-4 rounded-xl text-left font-bold border-2 transition-all
                    ${showResult === true && opt === currentQuestion.correctAnswer 
                       ? 'bg-green-100 border-green-500 text-green-800'
                       : showResult === false 
                         ? 'bg-white border-slate-200 text-gray-400' // Dim others on wrong
                         : 'bg-white border-slate-100 hover:border-indigo-400 hover:bg-indigo-50 text-gray-700'
                    }
                  `}
                >
                  {opt}
                </button>
              ))}
            </div>
            {showResult === false && (
               <div className="mt-4 text-center text-red-500 font-bold animate-pulse">
                 Oops! Try again.
               </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};
