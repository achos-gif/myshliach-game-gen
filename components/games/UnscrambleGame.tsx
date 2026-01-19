
import React, { useState, useEffect } from 'react';
import { GameData, UnscrambleItem } from '../../types';
import { Button } from '../Button';
import { CheckCircle, RotateCcw, Lightbulb } from 'lucide-react';

interface UnscrambleGameProps {
  data: GameData;
  onReset: () => void;
}

export const UnscrambleGame: React.FC<UnscrambleGameProps> = ({ data, onReset }) => {
  const [items, setItems] = useState<UnscrambleItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentGuess, setCurrentGuess] = useState<string[]>([]);
  const [availableLetters, setAvailableLetters] = useState<{char: string, id: number}[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    if (data.unscrambleContent) {
      setItems(data.unscrambleContent);
      setupLevel(data.unscrambleContent[0]);
    }
  }, [data]);

  const setupLevel = (item: UnscrambleItem) => {
    const letters = item.original.toUpperCase().split('').map((char, i) => ({
      char,
      id: i
    })).sort(() => Math.random() - 0.5);
    
    setAvailableLetters(letters);
    setCurrentGuess([]);
    setIsCorrect(false);
    setShowHint(false);
  };

  const handleLetterClick = (char: string, id: number) => {
    // Move from available to guess
    setCurrentGuess(prev => [...prev, char]);
    setAvailableLetters(prev => prev.filter(l => l.id !== id));
  };

  const handleGuessClick = (index: number, char: string) => {
    // Move back from guess to available
    // We need to recreate the id, but since we just need uniqueness for the list, we can find it back or generate new logic. 
    // To simplify, let's just use a timestamp or random id, or better, store the original ID in guess too.
    // For this simple version, let's just push it back to available with a random ID.
    setAvailableLetters(prev => [...prev, { char, id: Math.random() }]);
    setCurrentGuess(prev => prev.filter((_, i) => i !== index));
  };

  const checkAnswer = () => {
    const guessWord = currentGuess.join('');
    if (guessWord === items[currentIndex].original.toUpperCase()) {
      setIsCorrect(true);
    } else {
      // Shake animation or error could go here
    }
  };

  const nextLevel = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setupLevel(items[currentIndex + 1]);
      setCompletedCount(prev => prev + 1);
    } else {
      setCompletedCount(prev => prev + 1);
      // End game state handled in render
    }
  };

  if (completedCount === items.length && items.length > 0) {
     return (
       <div className="text-center p-8 bg-white rounded-3xl shadow-xl max-w-2xl mx-auto animate-fade-in-up">
        <h2 className="text-4xl font-bold text-indigo-600 mb-4">Vocabulary Master!</h2>
        <p className="text-xl text-gray-600 mb-8">You unscrambled all the words.</p>
        <Button onClick={onReset} variant="outline">
          <RotateCcw className="w-5 h-5" />
          Play Again
        </Button>
      </div>
    );
  }

  const currentItem = items[currentIndex];
  if (!currentItem) return null;

  return (
    <div className="max-w-2xl mx-auto text-center">
      
      {/* Progress */}
      <div className="mb-8 text-gray-400 font-bold uppercase tracking-widest text-sm">
        Word {currentIndex + 1} of {items.length}
      </div>

      {/* Hint Button */}
      <div className="mb-8 min-h-[60px]">
        {showHint ? (
          <div className="bg-amber-100 text-amber-800 p-4 rounded-xl inline-block animate-fade-in">
            💡 Hint: {currentItem.hint}
          </div>
        ) : (
          <button 
            onClick={() => setShowHint(true)}
            className="text-amber-500 font-bold hover:text-amber-600 flex items-center gap-2 mx-auto"
          >
            <Lightbulb size={20} />
            Need a hint?
          </button>
        )}
      </div>

      {/* Guess Area (Slots) */}
      <div className="flex flex-wrap justify-center gap-2 mb-12 min-h-[80px]">
        {Array.from({ length: currentItem.original.length }).map((_, i) => {
          const char = currentGuess[i];
          return (
            <button
              key={i}
              onClick={() => char && !isCorrect ? handleGuessClick(i, char) : null}
              disabled={isCorrect}
              className={`
                w-12 h-14 md:w-16 md:h-20 rounded-xl border-b-4 text-2xl md:text-4xl font-bold flex items-center justify-center transition-all
                ${char 
                  ? isCorrect 
                    ? 'bg-green-500 border-green-700 text-white' 
                    : 'bg-indigo-600 border-indigo-800 text-white' 
                  : 'bg-slate-100 border-slate-300'}
              `}
            >
              {char}
            </button>
          );
        })}
      </div>

      {/* Available Letters */}
      {!isCorrect && (
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {availableLetters.map((l) => (
            <button
              key={l.id}
              onClick={() => handleLetterClick(l.char, l.id)}
              className="w-12 h-14 md:w-14 md:h-16 bg-white border-2 border-slate-200 border-b-4 rounded-xl text-xl md:text-2xl font-bold text-gray-700 hover:-translate-y-1 active:border-b-2 active:translate-y-1 transition-all"
            >
              {l.char}
            </button>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex justify-center gap-4 h-16">
        {isCorrect ? (
          <Button onClick={nextLevel} className="animate-bounce-in">
            Next Word
          </Button>
        ) : (
          <Button 
            onClick={checkAnswer} 
            disabled={currentGuess.length !== currentItem.original.length}
            variant="secondary"
          >
            Check Answer
          </Button>
        )}
      </div>

    </div>
  );
};
