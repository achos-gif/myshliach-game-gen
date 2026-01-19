
import React, { useState, useEffect } from 'react';
import { GameData, SortingItem } from '../../types';
import { Button } from '../Button';
import { CheckCircle, RotateCcw } from 'lucide-react';

interface SortingGameProps {
  data: GameData;
  onReset: () => void;
}

export const SortingGame: React.FC<SortingGameProps> = ({ data, onReset }) => {
  const [items, setItems] = useState<SortingItem[]>([]);
  const [currentItem, setCurrentItem] = useState<SortingItem | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [completedItems, setCompletedItems] = useState<SortingItem[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  useEffect(() => {
    if (data.sortingContent) {
      setCategories(data.sortingContent.categories);
      const shuffled = [...data.sortingContent.items].sort(() => Math.random() - 0.5);
      setItems(shuffled);
      setCurrentItem(shuffled[0]);
    }
  }, [data]);

  const handleSort = (category: string) => {
    if (!currentItem || feedback) return;

    if (currentItem.category === category) {
      setFeedback('correct');
      setTimeout(() => {
        setCompletedItems(prev => [...prev, currentItem]);
        const nextIndex = items.indexOf(currentItem) + 1;
        if (nextIndex < items.length) {
          setCurrentItem(items[nextIndex]);
        } else {
          setCurrentItem(null); // Finished
        }
        setFeedback(null);
      }, 600);
    } else {
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 800);
    }
  };

  if (!currentItem && items.length > 0) {
    return (
       <div className="text-center p-8 bg-white rounded-3xl shadow-xl max-w-2xl mx-auto animate-fade-in-up">
        <h2 className="text-4xl font-bold text-indigo-600 mb-4">Sorting Complete!</h2>
        <p className="text-xl text-gray-600 mb-8">You categorized everything correctly.</p>
        <Button onClick={onReset} variant="outline">
          <RotateCcw className="w-5 h-5" />
          Play Again
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Current Item Card */}
      <div className="min-h-[200px] flex flex-col items-center justify-center mb-12 relative">
        {currentItem && (
          <div className={`
             bg-white p-8 rounded-2xl shadow-xl border-2 max-w-sm w-full text-center transition-all duration-300 transform
             ${feedback === 'correct' ? 'border-green-500 bg-green-50 scale-110 opacity-0 translate-y-20' : ''}
             ${feedback === 'wrong' ? 'border-red-500 bg-red-50 shake' : 'border-indigo-200'}
          `}>
             <h3 className="text-2xl font-bold text-gray-800">{currentItem.text}</h3>
             {feedback === 'correct' && <CheckCircle className="mx-auto mt-4 text-green-500" size={32} />}
          </div>
        )}
      </div>

      {/* Buckets */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {categories.map((cat, idx) => (
          <button
            key={idx}
            onClick={() => handleSort(cat)}
            className="group flex flex-col items-center p-6 bg-white rounded-2xl border-2 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all h-48 justify-between relative overflow-hidden"
          >
            <span className="text-lg md:text-xl font-bold text-gray-700 z-10">{cat}</span>
            <div className="w-full h-full absolute top-0 left-0 bg-indigo-100 opacity-0 group-hover:opacity-20 transition-opacity" />
            
            {/* Visual stack of sorted items */}
            <div className="flex flex-wrap justify-center gap-1 w-full z-10">
              {completedItems.filter(i => i.category === cat).map((_, i) => (
                <div key={i} className="w-8 h-2 bg-indigo-300 rounded-full" />
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
