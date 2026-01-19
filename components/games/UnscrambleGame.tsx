import React, { useState, useEffect } from 'react';
import { GameData, UnscrambleItem } from '../../types';
import { Button } from '../Button';
import { CheckCircle, RotateCcw, Lightbulb } from 'lucide-react';
import isEqual from 'lodash.isequal';

interface UnscrambleGameProps {
  data: GameData;
  onReset: () => void;
  // Live Mode Props
  externalState?: {
    currentIndex: number;
    completedCount: number;
    currentGuess?: string[];
    availableLetters?: { char: string, id: number }[];
  };
  onStateChange?: (newState: Partial<UnscrambleGameProps['externalState']>) => void;
}

export const UnscrambleGame: React.FC<UnscrambleGameProps> = ({ 
  data, 
  onReset,
  externalState,
  onStateChange
}) => {
  const [items, setItems] = useState<UnscrambleItem[]>([]);
  
  // Local state for single player mode
  const [localState, setLocalState] = useState({
    currentIndex: 0,
    completedCount: 0,
    currentGuess: [] as string[],
    availableLetters: [] as { char: string, id: number }[],
  });
  
  // Use external state if provided (live mode), otherwise use local state
  const gameState = externalState || localState;
  const setState = onStateChange || ((newState) => {
    setLocalState(prev => ({ ...prev, ...newState }));
  });

  const [showHint, setShowHint] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    if (data.unscrambleContent && items.length === 0) {
      setItems(data.unscrambleContent);
      setupLevel(data.unscrambleContent[0], 0);
    }
  }, [data]);
  
  // Sync state if external state changes
  useEffect(() => {
    if (externalState && !isEqual(externalState, localState)) {
      setLocalState(externalState);
    }
  }, [externalState]);

  const setupLevel = (item: UnscrambleItem, index: number) => {
    // Shuffle deterministically in live mode to avoid sync issues.
    // In local mode, random is fine.
    const letters = item.original.toUpperCase().split('').map((char, i) => ({
      char,
      id: i
    }));

    if (!onStateChange) {
      letters.sort(() => Math.random() - 0.5);
    }
    
    setState({
      currentIndex: index,
      completedCount: gameState.completedCount,
      availableLetters: letters,
      currentGuess: [],
    });
    setIsCorrect(false);
    setShowHint(false);
  };

  const handleLetterClick = (char: string, id: number) => {
    const newGuess = [...gameState.currentGuess, char];
    const newAvailable = gameState.availableLetters.filter(l => l.id !== id);
    setState({ currentGuess: newGuess, availableLetters: newAvailable });
  };

  const handleGuessClick = (index: number, char: string) => {
    const letterToReturn = gameState.currentGuess[index];
    const originalId = items[gameState.currentIndex].original.toUpperCase().split('').indexOf(letterToReturn, index);
    
    const newAvailable = [...gameState.availableLetters, { char, id: Math.random() }];
    const newGuess = gameState.currentGuess.filter((_, i) => i !== index);
    setState({ currentGuess: newGuess, availableLetters: newAvailable });
  };

  const checkAnswer = () => {
    const guessWord = gameState.currentGuess.join('');
    if (guessWord === items[gameState.currentIndex].original.toUpperCase()) {
      setIsCorrect(true);
      // In live mode, state change will trigger for others. In local, we can do it here.
      if (!onStateChange) {
         setTimeout(nextLevel, 1000);
      }
    } else {
      alert("Not quite right. Try again!");
    }
  };

  const nextLevel = () => {
    const newIndex = gameState.currentIndex + 1;
    const newCompleted = isCorrect ? gameState.completedCount + 1 : gameState.completedCount;

    if (newIndex < items.length) {
      setupLevel(items[newIndex], newIndex);
      setState({ completedCount: newCompleted, currentIndex: newIndex });
    } else {
      setState({ completedCount: newCompleted });
      // End game
    }
  };

  if (gameState.completedCount === items.length && items.length > 0) {
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

  const currentItem = items[gameState.currentIndex];
  if (!currentItem) return null;

  return (
    <div className="max-w-2xl mx-auto text-center">
      
      {/* Progress */}
      <div className="mb-8 text-gray-400 font-bold uppercase tracking-widest text-sm">
        Word {gameState.currentIndex + 1} of {items.length}
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
      <div className="bg-white rounded-2xl shadow-lg p-6 min-h-[150px] flex items-center justify-center flex-wrap gap-3 border-4 border-slate-200">
        {gameState.currentGuess.map((char, i) => (
          <button key={i} onClick={() => handleGuessClick(i, char)} className="w-12 h-16 bg-indigo-500 text-white font-bold text-2xl rounded-lg shadow-md flex items-center justify-center">
            {char}
          </button>
        ))}
        {gameState.currentGuess.length === 0 && <span className="text-gray-400">Click letters below</span>}
      </div>

      {/* Available Letters */}
      <div className="mt-8 p-4 min-h-[100px] flex items-center justify-center flex-wrap gap-3">
        {gameState.availableLetters.map(({char, id}) => (
          <button key={id} onClick={() => handleLetterClick(char, id)} className="w-12 h-16 bg-slate-200 text-slate-800 font-bold text-2xl rounded-lg shadow-sm flex items-center justify-center hover:bg-slate-300 transition-transform hover:scale-110">
            {char}
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="mt-8">
        {isCorrect ? (
          <Button onClick={onStateChange ? () => {} : nextLevel} disabled={!!onStateChange} className="bg-green-500 hover:bg-green-600">
            Correct! Waiting for host... <CheckCircle className="ml-2" />
          </Button>
        ) : (
          <Button onClick={checkAnswer}>Check Answer</Button>
        )}
      </div>
    </div>
  );
};
