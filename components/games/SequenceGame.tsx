
import React, { useState, useEffect } from 'react';
import { GameData, SequenceItem } from '../../types';
import { Button } from '../Button';
import { ArrowDown, ArrowUp, CheckCircle, RotateCcw, HelpCircle } from 'lucide-react';

interface SequenceGameProps {
  data: GameData;
  onReset: () => void;
}

export const SequenceGame: React.FC<SequenceGameProps> = ({ data, onReset }) => {
  const [items, setItems] = useState<SequenceItem[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (data.sequenceContent) {
      // Shuffle items on load
      const shuffled = [...data.sequenceContent].sort(() => Math.random() - 0.5);
      setItems(shuffled);
    }
  }, [data]);

  const handleSwap = (id1: string, id2: string) => {
    const idx1 = items.findIndex(i => i.id === id1);
    const idx2 = items.findIndex(i => i.id === id2);
    
    const newItems = [...items];
    [newItems[idx1], newItems[idx2]] = [newItems[idx2], newItems[idx1]];
    
    setItems(newItems);
    setHasChecked(false);
    setSelectedId(null);
  };

  const handleItemClick = (id: string) => {
    if (isCorrect) return;

    if (selectedId === null) {
      setSelectedId(id);
    } else if (selectedId === id) {
      setSelectedId(null);
    } else {
      handleSwap(selectedId, id);
    }
  };

  const checkOrder = () => {
    const currentOrder = items.map(i => i.order);
    // Check if sorted (assuming order is 1, 2, 3...)
    const isSorted = currentOrder.every((val, i, arr) => !i || (arr[i-1] <= val));
    
    setIsCorrect(isSorted);
    setHasChecked(true);
  };

  if (isCorrect) {
    return (
      <div className="text-center p-8 bg-white rounded-3xl shadow-xl max-w-2xl mx-auto animate-bounce-in">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={48} />
        </div>
        <h2 className="text-4xl font-bold text-indigo-600 mb-4">Story Solved!</h2>
        <p className="text-xl text-gray-600 mb-8">You put everything in the perfect order.</p>
        
        {/* Show the story read-through */}
        <div className="text-left bg-indigo-50 p-6 rounded-xl mb-8 border border-indigo-100">
           <h3 className="font-bold text-indigo-800 mb-4">The Full Story:</h3>
           <ol className="list-decimal pl-5 space-y-2">
             {items.map((item) => (
               <li key={item.id} className="text-indigo-900">{item.text}</li>
             ))}
           </ol>
        </div>

        <Button onClick={onReset} variant="outline">
          <RotateCcw className="w-5 h-5" />
          Play Again
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex justify-between items-center bg-indigo-50 p-4 rounded-xl border border-indigo-100">
        <div className="flex items-center gap-3">
          <HelpCircle className="text-indigo-500" />
          <p className="text-indigo-800 text-sm md:text-base font-medium">
            Tap two cards to swap them until the story is in order!
          </p>
        </div>
      </div>

      <div className="space-y-3 mb-8">
        {items.map((item, index) => {
          const isSelected = selectedId === item.id;
          return (
            <div 
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`
                relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4
                ${isSelected 
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg scale-[1.02] z-10' 
                  : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md text-gray-700'
                }
                ${hasChecked && !isCorrect ? 'shake' : ''}
              `}
            >
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0
                ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}
              `}>
                {index + 1}
              </div>
              <p className="font-medium text-lg leading-snug">{item.text}</p>
              
              {isSelected && (
                <div className="absolute right-4 text-xs font-bold bg-white/20 px-2 py-1 rounded">
                  SWAP
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-center pb-8">
        <Button 
          onClick={checkOrder} 
          variant="primary" 
          className="px-12 py-4 text-lg shadow-xl shadow-indigo-200"
        >
          Check Order
        </Button>
      </div>
      
      {hasChecked && !isCorrect && (
        <p className="text-center text-red-500 font-bold animate-pulse">
          Not quite right yet. Keep trying!
        </p>
      )}
    </div>
  );
};
