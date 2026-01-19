
import React, { useState, useEffect } from 'react';
import { GameData } from '../../types';
import { Button } from '../Button';
import { RotateCcw, Eye } from 'lucide-react';

interface FindMatchGameProps {
  data: GameData;
  onReset: () => void;
}

export const FindMatchGame: React.FC<FindMatchGameProps> = ({ data, onReset }) => {
  const [round, setRound] = useState(0);
  const [cardA, setCardA] = useState<string[]>([]);
  const [cardB, setCardB] = useState<string[]>([]);
  const [targetMatch, setTargetMatch] = useState<string>("");
  const [score, setScore] = useState(0);
  const [items, setItems] = useState<string[]>([]);

  // Setup initial items
  useEffect(() => {
    if (data.findMatchContent && data.findMatchContent.length > 0) {
      setItems(data.findMatchContent);
      generateRound(data.findMatchContent);
    }
  }, [data]);

  const generateRound = (sourceItems: string[]) => {
    if (sourceItems.length < 5) return; // Need enough items

    // 1. Pick a random item to be the "Match"
    const match = sourceItems[Math.floor(Math.random() * sourceItems.length)];
    setTargetMatch(match);

    // 2. Filter out the match to get remaining pool
    const pool = sourceItems.filter(i => i !== match);
    
    // 3. Shuffle pool
    const shuffled = [...pool].sort(() => Math.random() - 0.5);

    // 4. Fill Card A with match + 3 randoms
    const fillA = shuffled.slice(0, 3);
    const setA = [match, ...fillA].sort(() => Math.random() - 0.5);

    // 5. Fill Card B with match + 3 DIFFERENT randoms
    const fillB = shuffled.slice(3, 6);
    const setB = [match, ...fillB].sort(() => Math.random() - 0.5);

    setCardA(setA);
    setCardB(setB);
  };

  const handleItemClick = (item: string) => {
    if (item === targetMatch) {
      // Correct!
      setScore(prev => prev + 1);
      setRound(prev => prev + 1);
      generateRound(items);
    } else {
      // Wrong - shake effect?
      const el = document.getElementById('game-container');
      el?.classList.add('shake');
      setTimeout(() => el?.classList.remove('shake'), 500);
    }
  };

  return (
    <div id="game-container" className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-xl font-bold text-indigo-900">Find the one matching item!</h3>
        <div className="inline-block bg-indigo-100 text-indigo-700 px-4 py-1 rounded-full mt-2 font-bold">
           Score: {score}
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16">
        {/* Card A */}
        <div className="w-64 h-64 bg-white rounded-full shadow-xl border-8 border-indigo-100 relative flex flex-wrap items-center justify-center p-8 content-center gap-4 animate-fade-in">
           {cardA.map((item, i) => (
             <span key={i} className="text-sm md:text-base font-bold text-gray-700 bg-slate-50 px-2 py-1 rounded border border-slate-200 select-none">
               {item}
             </span>
           ))}
        </div>

        <div className="text-indigo-300 font-bold text-2xl">VS</div>

        {/* Card B (Interactive) */}
        <div className="w-64 h-64 bg-white rounded-full shadow-xl border-8 border-indigo-100 relative flex flex-wrap items-center justify-center p-8 content-center gap-4 animate-fade-in">
           {cardB.map((item, i) => (
             <button 
               key={i} 
               onClick={() => handleItemClick(item)}
               className="text-sm md:text-base font-bold text-gray-700 bg-slate-50 px-2 py-1 rounded border border-slate-200 hover:bg-indigo-500 hover:text-white hover:scale-110 transition-all"
             >
               {item}
             </button>
           ))}
        </div>
      </div>
      
      <div className="text-center mt-12">
        <p className="text-gray-500 text-sm">Be quick! The items shuffle every time you find a match.</p>
      </div>
    </div>
  );
};
