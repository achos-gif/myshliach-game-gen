
import React, { useState } from 'react';
import { GameData, EmojiChallengeItem } from '../../types';
import { Button } from '../Button';
import { CheckCircle, XCircle, RotateCcw, Lightbulb, Smile } from 'lucide-react';

interface EmojiGameProps {
  data: GameData;
  onReset: () => void;
}

export const EmojiGame: React.FC<EmojiGameProps> = ({ data, onReset }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);

  const questions = data.emojiContent || [];
  const currentQ = questions[currentIdx];

  const handleGuess = (option: string) => {
    if (selectedOption) return;
    setSelectedOption(option);
    if (option === currentQ.answer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
      setShowHint(false);
    } else {
      setIsFinished(true);
    }
  };

  if (questions.length === 0) return <div>No emoji questions generated.</div>;

  if (isFinished) {
    return (
      <div className="text-center p-8 bg-white rounded-3xl shadow-xl max-w-2xl mx-auto animate-fade-in-up">
        <h2 className="text-4xl font-bold text-indigo-600 mb-4">You're an Emoji Expert!</h2>
        <p className="text-2xl text-gray-700 mb-8">Score: {score} / {questions.length}</p>
        <Button onClick={onReset} variant="outline">
          <RotateCcw className="w-5 h-5" />
          Play Again
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* HUD */}
      <div className="flex justify-between items-center mb-6 text-gray-400 font-bold uppercase tracking-widest text-sm">
        <span>Question {currentIdx + 1}/{questions.length}</span>
        <span>Score: {score}</span>
      </div>

      {/* Card */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-indigo-50 mb-8">
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-12 text-center">
          <span className="text-6xl md:text-8xl animate-bounce-in inline-block drop-shadow-sm">
            {currentQ.emojis}
          </span>
        </div>

        <div className="p-6 md:p-8">
          <div className="mb-6">
             {showHint ? (
               <div className="bg-indigo-50 text-indigo-800 p-3 rounded-lg text-center animate-fade-in">
                 <strong>Hint:</strong> {currentQ.hint}
               </div>
             ) : (
               <button 
                 onClick={() => setShowHint(true)}
                 className="flex items-center justify-center gap-2 text-indigo-400 hover:text-indigo-600 w-full text-sm font-bold"
               >
                 <Lightbulb size={16} /> Need a hint?
               </button>
             )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQ.options.map((opt, i) => {
              let btnClass = "py-4 px-6 rounded-xl font-bold text-lg border-2 transition-all ";
              if (selectedOption) {
                if (opt === currentQ.answer) btnClass += "bg-green-100 border-green-500 text-green-800";
                else if (opt === selectedOption) btnClass += "bg-red-50 border-red-300 text-red-500";
                else btnClass += "bg-gray-50 border-transparent text-gray-400 opacity-50";
              } else {
                btnClass += "bg-white border-slate-100 hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-md text-gray-700";
              }

              return (
                <button
                  key={i}
                  onClick={() => handleGuess(opt)}
                  className={btnClass}
                  disabled={!!selectedOption}
                >
                  <div className="flex items-center justify-between">
                     <span>{opt}</span>
                     {selectedOption && opt === currentQ.answer && <CheckCircle className="text-green-600" size={20} />}
                     {selectedOption === opt && opt !== currentQ.answer && <XCircle className="text-red-500" size={20} />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {selectedOption && (
        <div className="flex justify-center animate-fade-in-up">
          <Button onClick={handleNext} className="px-10 py-3 text-lg">
            {currentIdx < questions.length - 1 ? "Next Emoji" : "Finish Game"}
          </Button>
        </div>
      )}
    </div>
  );
};
