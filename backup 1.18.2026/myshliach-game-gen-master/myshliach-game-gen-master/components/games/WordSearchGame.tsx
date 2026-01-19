
import React, { useState, useEffect, useRef } from 'react';
import { GameData } from '../../types';
import { Button } from '../Button';
import { CheckCircle, RotateCcw } from 'lucide-react';

interface WordSearchGameProps {
  data: GameData;
  onReset: () => void;
}

const GRID_SIZE = 12;

export const WordSearchGame: React.FC<WordSearchGameProps> = ({ data, onReset }) => {
  const [grid, setGrid] = useState<string[][]>([]);
  const [words, setWords] = useState<{ word: string; found: boolean }[]>([]);
  const [selection, setSelection] = useState<{ r: number; c: number }[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const startRef = useRef<{ r: number; c: number } | null>(null);

  useEffect(() => {
    if (data.wordSearchContent) {
      const wordList = data.wordSearchContent.map(w => ({ word: w.toUpperCase(), found: false }));
      setWords(wordList);
      setGrid(generateGrid(wordList.map(w => w.word)));
    }
  }, [data]);

  const generateGrid = (wordList: string[]): string[][] => {
    const newGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));
    for (const word of wordList) {
      let placed = false;
      let attempts = 0;
      while (!placed && attempts < 100) {
        const direction = Math.random() > 0.5 ? 'H' : 'V';
        const r = Math.floor(Math.random() * GRID_SIZE);
        const c = Math.floor(Math.random() * GRID_SIZE);
        if (canPlace(newGrid, word, r, c, direction)) {
          placeWord(newGrid, word, r, c, direction);
          placed = true;
        }
        attempts++;
      }
    }
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (newGrid[r][c] === '') {
          newGrid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
        }
      }
    }
    return newGrid;
  };

  const canPlace = (grid: string[][], word: string, r: number, c: number, d: 'H' | 'V') => {
    if (d === 'H') {
      if (c + word.length > GRID_SIZE) return false;
      for (let i = 0; i < word.length; i++) {
        if (grid[r][c + i] !== '' && grid[r][c + i] !== word[i]) return false;
      }
    } else {
      if (r + word.length > GRID_SIZE) return false;
      for (let i = 0; i < word.length; i++) {
        if (grid[r + i][c] !== '' && grid[r + i][c] !== word[i]) return false;
      }
    }
    return true;
  };

  const placeWord = (grid: string[][], word: string, r: number, c: number, d: 'H' | 'V') => {
    for (let i = 0; i < word.length; i++) {
      if (d === 'H') grid[r][c + i] = word[i];
      else grid[r + i][c] = word[i];
    }
  };

  const getLineCells = (start: { r: number; c: number }, end: { r: number; c: number }) => {
    const cells: { r: number; c: number }[] = [];
    const dr = end.r - start.r;
    const dc = end.c - start.c;
    const steps = Math.max(Math.abs(dr), Math.abs(dc));
    if (steps === 0) return [{ r: start.r, c: start.c }];
    if (start.r !== end.r && start.c !== end.c && Math.abs(dr) !== Math.abs(dc)) return [];
    const rStep = dr / steps;
    const cStep = dc / steps;
    for (let i = 0; i <= steps; i++) {
      cells.push({ r: start.r + i * rStep, c: start.c + i * cStep });
    }
    return cells;
  };

  const handleMouseDown = (r: number, c: number) => {
    setIsSelecting(true);
    startRef.current = { r, c };
    setSelection([{ r, c }]);
  };

  const handleMouseEnter = (r: number, c: number) => {
    if (isSelecting && startRef.current) {
      setSelection(getLineCells(startRef.current, { r, c }));
    }
  };

  const handleMouseUp = () => {
    if (isSelecting && selection.length > 0) {
      const selectedWord = selection.map(pos => grid[pos.r][pos.c]).join('');
      checkWord(selectedWord);
      checkWord(selectedWord.split('').reverse().join(''));
    }
    setIsSelecting(false);
    setSelection([]);
    startRef.current = null;
  };

  const checkWord = (selectedWord: string) => {
    const foundIdx = words.findIndex(w => w.word === selectedWord && !w.found);
    if (foundIdx >= 0) {
      const newWords = [...words];
      newWords[foundIdx].found = true;
      setWords(newWords);
    }
  };

  const allFound = words.length > 0 && words.every(w => w.found);

  if (allFound) {
    return (
       <div className="text-center p-8 bg-white rounded-3xl shadow-xl max-w-2xl mx-auto animate-fade-in-up">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={48} />
        </div>
        <h2 className="text-4xl font-bold text-indigo-600 mb-4">You found them all!</h2>
        <Button onClick={onReset} variant="outline">
          <RotateCcw className="w-5 h-5" />
          Play Again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8" onMouseUp={handleMouseUp}>
        {/* Grid */}
        <div className="flex-1 bg-white p-4 rounded-xl shadow-lg border border-indigo-100 select-none touch-none print:shadow-none print:border-2 print:border-black">
          <div 
            className="grid gap-1"
            style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
          >
            {grid.map((row, r) => (
              row.map((cell, c) => {
                const isSelected = selection.some(s => s.r === r && s.c === c);
                return (
                  <div
                    key={`${r}-${c}`}
                    onMouseDown={() => handleMouseDown(r, c)}
                    onMouseEnter={() => handleMouseEnter(r, c)}
                    className={`
                      aspect-square flex items-center justify-center font-bold text-sm md:text-lg rounded-md cursor-pointer transition-colors
                      ${isSelected ? 'bg-indigo-500 text-white print:bg-transparent print:text-black print:border print:border-black' : 'bg-slate-50 text-slate-700 hover:bg-indigo-50 print:bg-transparent'}
                    `}
                  >
                    {cell}
                  </div>
                );
              })
            ))}
          </div>
        </div>

        {/* Word List */}
        <div className="w-full md:w-64 print:w-auto print:mt-4">
          <h3 className="text-xl font-bold text-indigo-900 mb-4 print:text-black">Find these words:</h3>
          <div className="flex flex-wrap md:flex-col gap-2 print:grid print:grid-cols-4 print:gap-4">
            {words.map((w, idx) => (
              <div 
                key={idx}
                className={`
                  px-4 py-2 rounded-lg font-medium border-2 transition-all print:border-black print:bg-transparent
                  ${w.found 
                    ? 'bg-green-100 border-green-400 text-green-800 line-through opacity-60 print:no-underline print:text-black print:opacity-100' 
                    : 'bg-white border-slate-200 text-slate-700'}
                `}
              >
                {w.word}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
