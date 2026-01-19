import React, { useState, useEffect } from 'react';
import { GameData, MatchingItem } from '../../types';
import { Button } from '../Button';
import { RotateCcw } from 'lucide-react';

interface MemoryGameProps {
  data: GameData;
  onReset: () => void;
}

interface Card {
  uniqueId: string; // unique ID for React key
  itemId: string; // logical ID to match pair
  content: string; // Text to display
  type: 'TERM' | 'DEFINITION';
  isFlipped: boolean;
  isMatched: boolean;
}

export const MemoryGame: React.FC<MemoryGameProps> = ({ data, onReset }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const rawItems = data.matchingContent || [];
    const gameCards: Card[] = [];

    rawItems.forEach((item, idx) => {
      // Add Term Card
      gameCards.push({
        uniqueId: `term-${idx}`,
        itemId: item.id,
        content: item.term,
        type: 'TERM',
        isFlipped: false,
        isMatched: false
      });
      // Add Definition Card
      gameCards.push({
        uniqueId: `def-${idx}`,
        itemId: item.id,
        content: item.definition,
        type: 'DEFINITION',
        isFlipped: false,
        isMatched: false
      });
    });

    // Shuffle
    setCards(gameCards.sort(() => Math.random() - 0.5));
  }, [data]);

  const handleCardClick = (index: number) => {
    // Prevent clicking if processing (waiting for unflip), card already flipped, or already matched
    if (isProcessing || cards[index].isFlipped || cards[index].isMatched) return;

    // Flip the card
    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlippedIndices = [...flippedIndices, index];
    setFlippedIndices(newFlippedIndices);

    // Check for match
    if (newFlippedIndices.length === 2) {
      setIsProcessing(true);
      const [firstIdx, secondIdx] = newFlippedIndices;
      const card1 = cards[firstIdx];
      const card2 = cards[secondIdx];

      if (card1.itemId === card2.itemId) {
        // Match found!
        setTimeout(() => {
          const matchedCards = [...newCards];
          matchedCards[firstIdx].isMatched = true;
          matchedCards[secondIdx].isMatched = true;
          setCards(matchedCards);
          setFlippedIndices([]);
          setIsProcessing(false);
        }, 500);
      } else {
        // No match, unflip after delay
        setTimeout(() => {
          const resetCards = [...newCards];
          resetCards[firstIdx].isFlipped = false;
          resetCards[secondIdx].isFlipped = false;
          setCards(resetCards);
          setFlippedIndices([]);
          setIsProcessing(false);
        }, 1500);
      }
    }
  };

  const allMatched = cards.length > 0 && cards.every(c => c.isMatched);

  if (allMatched) {
    return (
      <div className="text-center p-8 bg-white rounded-3xl shadow-xl max-w-2xl mx-auto">
        <h2 className="text-4xl font-bold text-indigo-600 mb-4">Memory Master!</h2>
        <Button onClick={onReset} variant="outline">
          <RotateCcw className="w-5 h-5" />
          Play Again
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((card, idx) => (
          <div 
            key={card.uniqueId}
            className="aspect-[4/3] perspective-1000 cursor-pointer"
            onClick={() => handleCardClick(idx)}
          >
            <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${card.isFlipped || card.isMatched ? 'rotate-y-180' : ''}`}>
              
              {/* Card Back (Face down) */}
              <div className="absolute w-full h-full backface-hidden bg-indigo-600 rounded-xl shadow-md flex items-center justify-center border-4 border-white">
                <span className="text-white font-bold text-2xl opacity-20">?</span>
              </div>

              {/* Card Front (Face up) */}
              <div className={`absolute w-full h-full backface-hidden rotate-y-180 rounded-xl shadow-md p-4 flex items-center justify-center text-center border-2 overflow-hidden
                ${card.isMatched 
                  ? 'bg-emerald-100 border-emerald-400 text-emerald-900' 
                  : 'bg-white border-indigo-200 text-indigo-900'}
              `}>
                <span className={`text-sm md:text-base font-bold select-none ${card.content.length > 50 ? 'text-xs' : ''}`}>
                  {card.content}
                </span>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
