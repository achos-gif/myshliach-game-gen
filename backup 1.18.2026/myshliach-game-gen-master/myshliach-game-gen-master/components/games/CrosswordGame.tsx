
import React, { useState, useEffect } from 'react';
import { GameData, CrosswordItem } from '../../types';
import { Button } from '../Button';
import { RotateCcw, CheckCircle } from 'lucide-react';

interface CrosswordGameProps {
  data: GameData;
  onReset: () => void;
}

interface Cell {
  letter: string;
  row: number;
  col: number;
  words: {
    direction: 'across' | 'down';
    index: number; // Index in the original items array
    isStart: boolean;
  }[];
}

export const CrosswordGame: React.FC<CrosswordGameProps> = ({ data, onReset }) => {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [items, setItems] = useState<CrosswordItem[]>([]);
  const [userInputs, setUserInputs] = useState<Record<string, string>>({});
  const [selectedWord, setSelectedWord] = useState<number | null>(null);
  const [isSolved, setIsSolved] = useState(false);
  const [dimensions, setDimensions] = useState({ rows: 10, cols: 10 });

  useEffect(() => {
    if (data.crosswordContent) {
      const { grid: generatedGrid, placedItems, rows, cols } = generateCrosswordLayout(data.crosswordContent);
      setGrid(generatedGrid);
      setItems(placedItems); // Only use items that fit
      setDimensions({ rows, cols });
      
      // Select first word
      if (placedItems.length > 0) setSelectedWord(0);
    }
  }, [data]);

  const handleInputChange = (r: number, c: number, val: string) => {
    if (val.length > 1) return;
    const key = `${r}-${c}`;
    setUserInputs(prev => ({
      ...prev,
      [key]: val.toUpperCase()
    }));
  };

  const checkSolution = () => {
    let correct = true;
    items.forEach((item, idx) => {
      // Re-find position from grid to verify
      // This is simplified; in a real app we'd store start pos in items state
      // For now, assuming user filled it all correctly based on visual feedback
    });

    // Check every cell
    let allCorrect = true;
    grid.forEach(row => {
      row.forEach(cell => {
        if (cell) {
          const key = `${cell.row}-${cell.col}`;
          if (userInputs[key] !== cell.letter) allCorrect = false;
        }
      });
    });

    if (allCorrect) setIsSolved(true);
    else alert("Not quite right yet! Keep trying.");
  };

  // Helper to get styling for a cell
  const getCellClass = (r: number, c: number, cell: Cell | null) => {
    if (!cell) return "bg-transparent border-none";
    const key = `${r}-${c}`;
    const isActive = selectedWord !== null && cell.words.some(w => w.index === selectedWord);
    const isCorrect = userInputs[key] === cell.letter && isSolved;
    
    let base = "bg-white border border-gray-800 text-center font-bold uppercase transition-colors";
    if (isActive) base += " bg-yellow-100";
    if (isSolved) base += " bg-green-100 text-green-800 border-green-500";
    
    return base;
  };

  const getNumberLabel = (cell: Cell) => {
    const start = cell.words.find(w => w.isStart);
    return start ? start.index + 1 : null;
  };

  if (items.length === 0) return <div>Could not generate crossword layout. Try again.</div>;

  if (isSolved) {
    return (
       <div className="text-center p-8 bg-white rounded-3xl shadow-xl max-w-2xl mx-auto animate-fade-in-up">
        <h2 className="text-4xl font-bold text-indigo-600 mb-4">Puzzle Solved!</h2>
        <p className="text-xl text-gray-600 mb-8">You filled in the crossword correctly.</p>
        <Button onClick={onReset} variant="outline">
          <RotateCcw className="w-5 h-5" />
          Play Again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
      {/* Grid */}
      <div className="flex-1 overflow-auto flex justify-center p-4 bg-slate-200 rounded-xl shadow-inner border border-slate-300">
        <div 
          className="grid gap-0 bg-black border-2 border-black"
          style={{ 
            gridTemplateColumns: `repeat(${dimensions.cols}, minmax(30px, 40px))`,
            width: 'fit-content'
          }}
        >
          {grid.map((row, r) => (
            row.map((cell, c) => (
              <div key={`${r}-${c}`} className={`relative w-8 h-8 md:w-10 md:h-10 ${getCellClass(r, c, cell)}`}>
                {cell && (
                  <>
                    <span className="absolute top-0.5 left-0.5 text-[8px] md:text-[10px] leading-none font-sans select-none">
                      {getNumberLabel(cell)}
                    </span>
                    <input
                      type="text"
                      maxLength={1}
                      className="w-full h-full bg-transparent text-center focus:outline-none focus:bg-blue-100 text-sm md:text-lg"
                      value={userInputs[`${r}-${c}`] || ''}
                      onChange={(e) => handleInputChange(r, c, e.target.value)}
                      onFocus={() => {
                        // Find common word index if possible
                        if (cell.words.length > 0) setSelectedWord(cell.words[0].index);
                      }}
                    />
                  </>
                )}
              </div>
            ))
          ))}
        </div>
      </div>

      {/* Clues */}
      <div className="w-full md:w-80 space-y-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-indigo-100 h-full max-h-[500px] overflow-y-auto">
          <h3 className="font-bold text-indigo-900 mb-4 border-b pb-2">Clues</h3>
          <ul className="space-y-3">
            {items.map((item, idx) => (
              <li 
                key={idx}
                onClick={() => setSelectedWord(idx)}
                className={`cursor-pointer p-2 rounded-lg text-sm transition-colors ${selectedWord === idx ? 'bg-indigo-100 text-indigo-900 font-bold' : 'hover:bg-gray-50'}`}
              >
                <span className="font-bold mr-2">{idx + 1}.</span>
                {item.clue}
              </li>
            ))}
          </ul>
        </div>
        <Button onClick={checkSolution} className="w-full">Check Puzzle</Button>
      </div>
    </div>
  );
};

// Simplified layout generator
function generateCrosswordLayout(rawItems: CrosswordItem[]) {
  // Sort by length desc
  const items = [...rawItems].sort((a, b) => b.word.length - a.word.length).slice(0, 10);
  const size = 15;
  const grid: (string | null)[][] = Array(size).fill(null).map(() => Array(size).fill(null));
  
  const placedWords: { word: string, row: number, col: number, dir: 'across'|'down', index: number }[] = [];
  const placedItems: CrosswordItem[] = [];

  // Place first word in center
  const first = items[0];
  const startRow = Math.floor(size / 2);
  const startCol = Math.floor((size - first.word.length) / 2);
  
  for(let i=0; i<first.word.length; i++) {
    grid[startRow][startCol+i] = first.word[i].toUpperCase();
  }
  placedWords.push({ word: first.word, row: startRow, col: startCol, dir: 'across', index: 0 });
  placedItems.push(first);

  // Try to place others
  for(let i=1; i<items.length; i++) {
    const current = items[i];
    let placed = false;

    // Try to intersect with existing words
    for(const existing of placedWords) {
      if(placed) break;

      // Find common letter
      for(let j=0; j<current.word.length; j++) {
        if(placed) break;
        const char = current.word[j].toUpperCase();
        
        // Find char in existing word
        for(let k=0; k<existing.word.length; k++) {
          if(existing.word[k].toUpperCase() === char) {
            // Potential intersection
            const newDir = existing.dir === 'across' ? 'down' : 'across';
            const intersectRow = existing.row + (existing.dir === 'down' ? k : 0);
            const intersectCol = existing.col + (existing.dir === 'across' ? k : 0);

            const startR = intersectRow - (newDir === 'down' ? j : 0);
            const startC = intersectCol - (newDir === 'across' ? j : 0);

            if(canPlace(grid, current.word, startR, startC, newDir, size)) {
               // Place it
               for(let x=0; x<current.word.length; x++) {
                 if (newDir === 'across') grid[startR][startC+x] = current.word[x].toUpperCase();
                 else grid[startR+x][startC] = current.word[x].toUpperCase();
               }
               placedWords.push({ word: current.word, row: startR, col: startC, dir: newDir, index: i });
               placedItems.push(current);
               placed = true;
               break;
            }
          }
        }
      }
    }
  }

  // Convert to Cell grid for React
  const finalGrid: Cell[][] = Array(size).fill(null).map((_, r) => 
    Array(size).fill(null).map((_, c) => {
      const char = grid[r][c];
      if(!char) return null;
      
      const activeWords = placedWords.filter(w => {
         if(w.dir === 'across') return r === w.row && c >= w.col && c < w.col + w.word.length;
         else return c === w.col && r >= w.row && r < w.row + w.word.length;
      }).map(w => ({
        direction: w.dir,
        index: w.index,
        isStart: w.row === r && w.col === c
      }));

      return {
        letter: char,
        row: r,
        col: c,
        words: activeWords
      };
    })
  );

  // Trim grid
  let minR=size, maxR=0, minC=size, maxC=0;
  placedWords.forEach(w => {
    minR = Math.min(minR, w.row);
    maxR = Math.max(maxR, w.dir==='down' ? w.row + w.word.length : w.row + 1);
    minC = Math.min(minC, w.col);
    maxC = Math.max(maxC, w.dir==='across' ? w.col + w.word.length : w.col + 1);
  });
  
  // Pad by 1
  minR = Math.max(0, minR-1);
  minC = Math.max(0, minC-1);
  maxR = Math.min(size, maxR+1);
  maxC = Math.min(size, maxC+1);

  const trimmed = finalGrid.slice(minR, maxR).map(row => row.slice(minC, maxC));
  
  // Remap indices to match the new filtered array
  const remappedItems = placedItems.map(item => item);
  // Update indices in grid cells
  trimmed.forEach(row => row.forEach(cell => {
    if(cell) {
      cell.row -= minR;
      cell.col -= minC;
      cell.words.forEach(w => {
        // Find new index in placedItems
        const originalIndex = w.index; // Currently pointing to raw items index
        // We need to map it to the index in placedItems array
        const newIdx = placedItems.findIndex(p => p.word === rawItems[originalIndex].word);
        w.index = newIdx;
      });
    }
  }));

  return { grid: trimmed, placedItems: remappedItems, rows: maxR-minR, cols: maxC-minC };
}

function canPlace(grid: (string|null)[][], word: string, r: number, c: number, dir: 'across'|'down', size: number) {
  if (r < 0 || c < 0) return false;
  if (dir === 'across') {
    if (c + word.length > size) return false;
    // Check neighbors to ensure we don't accidentally form words or overwrite incorrectly
    if (c > 0 && grid[r][c-1]) return false; // Left neighbor
    if (c + word.length < size && grid[r][c+word.length]) return false; // Right neighbor

    for (let i = 0; i < word.length; i++) {
      const cell = grid[r][c+i];
      if (cell && cell !== word[i].toUpperCase()) return false; // Conflict
      
      // If empty, check vertical neighbors (top/bottom) to ensure no accidental adjacent words
      if (!cell) {
        if (r > 0 && grid[r-1][c+i]) return false;
        if (r < size-1 && grid[r+1][c+i]) return false;
      }
    }
  } else {
    if (r + word.length > size) return false;
    if (r > 0 && grid[r-1][c]) return false; // Top neighbor
    if (r + word.length < size && grid[r+word.length][c]) return false; // Bottom neighbor

    for (let i = 0; i < word.length; i++) {
      const cell = grid[r+i][c];
      if (cell && cell !== word[i].toUpperCase()) return false;
      
      if (!cell) {
        if (c > 0 && grid[r+i][c-1]) return false;
        if (c < size-1 && grid[r+i][c+1]) return false;
      }
    }
  }
  return true;
}
