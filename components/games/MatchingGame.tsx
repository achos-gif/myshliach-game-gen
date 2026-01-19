import React, { useState, useEffect } from 'react';
import { GameData, MatchingItem } from '../../types';
import { Button } from '../Button';
import { RotateCcw, Link } from 'lucide-react';

interface MatchingGameProps {
  data: GameData;
  onReset: () => void;
}

export const MatchingGame: React.FC<MatchingGameProps> = ({ data, onReset }) => {
  const [items] = useState<MatchingItem[]>(data.matchingContent || []);
  const [leftItems, setLeftItems] = useState<MatchingItem[]>([]);
  const [rightItems, setRightItems] = useState<MatchingItem[]>([]);
  
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [wrongAttempt, setWrongAttempt] = useState<string | null>(null);

  useEffect(() => {
    // Shuffle logic
    const shuffledLeft = [...items].sort(() => Math.random() - 0.5);
    const shuffledRight = [...items].sort(() => Math.random() - 0.5);
    setLeftItems(shuffledLeft);
    setRightItems(shuffledRight);
  }, [items]);

  const handleLeftClick = (id: string) => {
    if (matchedIds.includes(id)) return;
    setSelectedLeft(id);
    setWrongAttempt(null);
  };

  const handleRightClick = (id: string) => {
    if (matchedIds.includes(id) || !selectedLeft) return;

    if (selectedLeft === id) {
      // Match found
      setMatchedIds(prev => [...prev, id]);
      setSelectedLeft(null);
    } else {
      // Wrong match
      setWrongAttempt(id);
      setTimeout(() => {
        setWrongAttempt(null);
        setSelectedLeft(null);
      }, 1000);
    }
  };

  if (matchedIds.length === items.length && items.length > 0) {
    return (
      <div className="text-center p-8 bg-white rounded-3xl shadow-xl max-w-2xl mx-auto">
        <h2 className="text-4xl font-bold text-indigo-600 mb-4">All Matched!</h2>
        <p className="text-xl text-gray-600 mb-8">Great job connecting the concepts.</p>
        <Button onClick={onReset} variant="outline">
          <RotateCcw className="w-5 h-5" />
          Play Again
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8 justify-between">
        
        {/* Left Column - Terms */}
        <div className="flex-1 space-y-4">
          <h3 className="text-center text-lg font-bold text-indigo-400 mb-4 uppercase tracking-wider">Terms</h3>
          {leftItems.map((item) => {
            const isMatched = matchedIds.includes(item.id);
            const isSelected = selectedLeft === item.id;
            
            return (
              <button
                key={`left-${item.id}`}
                onClick={() => handleLeftClick(item.id)}
                disabled={isMatched}
                className={`
                  w-full p-4 rounded-xl text-left transition-all font-medium border-2
                  ${isMatched 
                    ? 'bg-emerald-100 border-emerald-400 text-emerald-800 opacity-60' 
                    : isSelected 
                      ? 'bg-indigo-600 border-indigo-600 text-white scale-105 shadow-lg' 
                      : 'bg-white border-indigo-100 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50'
                  }
                `}
              >
                {item.term}
              </button>
            );
          })}
        </div>

        {/* Center Indicator (Visual helper) */}
        <div className="hidden md:flex flex-col justify-center items-center text-indigo-200">
           <Link size={32} />
        </div>

        {/* Right Column - Definitions */}
        <div className="flex-1 space-y-4">
          <h3 className="text-center text-lg font-bold text-indigo-400 mb-4 uppercase tracking-wider">Definitions</h3>
          {rightItems.map((item) => {
             const isMatched = matchedIds.includes(item.id);
             const isWrong = wrongAttempt === item.id;

             return (
               <button
                 key={`right-${item.id}`}
                 onClick={() => handleRightClick(item.id)}
                 disabled={isMatched}
                 className={`
                   w-full p-4 rounded-xl text-left transition-all text-sm md:text-base border-2
                   ${isMatched 
                     ? 'bg-emerald-100 border-emerald-400 text-emerald-800 opacity-60' 
                     : isWrong
                       ? 'bg-red-100 border-red-500 text-red-800 shake'
                       : 'bg-white border-indigo-100 text-gray-600 hover:border-indigo-300 hover:bg-indigo-50'
                   }
                 `}
               >
                 {item.definition}
               </button>
             );
          })}
        </div>
      </div>
    </div>
  );
};
