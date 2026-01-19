
import React, { useState } from 'react';
import { GameData, RiddleItem } from '../../types';
import { Button } from '../Button';
import { Eye, RotateCcw, HelpCircle } from 'lucide-react';

interface RiddleGameProps {
  data: GameData;
  onReset: () => void;
}

export const RiddleGame: React.FC<RiddleGameProps> = ({ data, onReset }) => {
  const [currentRiddleIdx, setCurrentRiddleIdx] = useState(0);
  const [revealedClues, setRevealedClues] = useState(1);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const riddles = data.riddleContent || [];
  const currentRiddle = riddles[currentRiddleIdx];

  const handleNextClue = () => {
    if (currentRiddle && revealedClues < currentRiddle.clues.length) {
      setRevealedClues(prev => prev + 1);
    }
  };

  const handleRevealAnswer = () => {
    setShowAnswer(true);
  };

  const handleNextRiddle = () => {
    if (currentRiddleIdx < riddles.length - 1) {
      setCurrentRiddleIdx(prev => prev + 1);
      setRevealedClues(1);
      setShowAnswer(false);
    } else {
      setIsFinished(true);
    }
  };

  if (isFinished) {
    return (
       <div className="text-center p-8 bg-white rounded-3xl shadow-xl max-w-2xl mx-auto animate-fade-in-up">
        <h2 className="text-4xl font-bold text-indigo-600 mb-4">Riddle Master!</h2>
        <p className="text-xl text-gray-600 mb-8">You solved all the riddles.</p>
        <Button onClick={onReset} variant="outline">
          <RotateCcw className="w-5 h-5" />
          Play Again
        </Button>
      </div>
    );
  }

  if (!currentRiddle) return <div>No riddles found.</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4 text-center">
        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
          Riddle {currentRiddleIdx + 1} of {riddles.length}
        </span>
      </div>

      <div className="space-y-4 mb-8">
        {currentRiddle.clues.map((clue, idx) => {
          if (idx >= revealedClues) return null;
          return (
            <div 
              key={idx} 
              className="bg-white p-6 rounded-2xl shadow-md border-l-8 border-indigo-500 animate-fade-in flex items-start gap-4"
            >
              <div className="bg-indigo-100 text-indigo-600 rounded-full w-8 h-8 flex items-center justify-center font-bold shrink-0 mt-1">
                {idx + 1}
              </div>
              <p className="text-xl text-gray-800 font-medium">{clue}</p>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col items-center gap-4">
        {!showAnswer && (
          <div className="flex gap-4">
            <Button 
              onClick={handleNextClue} 
              disabled={revealedClues >= currentRiddle.clues.length}
              variant="secondary"
            >
              <HelpCircle className="w-5 h-5" />
              Need Another Clue
            </Button>
            <Button onClick={handleRevealAnswer} variant="primary">
              <Eye className="w-5 h-5" />
              I Know It!
            </Button>
          </div>
        )}

        {showAnswer && (
          <div className="w-full animate-bounce-in">
             <div className="bg-emerald-50 border-2 border-emerald-200 p-8 rounded-2xl text-center mb-6">
                <p className="text-gray-500 uppercase text-xs tracking-wider mb-2">The Answer Is</p>
                <h3 className="text-3xl font-extrabold text-emerald-700">{currentRiddle.answer}</h3>
             </div>
             <div className="flex justify-center">
               <Button onClick={handleNextRiddle} className="px-12">
                 {currentRiddleIdx < riddles.length - 1 ? 'Next Riddle' : 'Finish Game'}
               </Button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
