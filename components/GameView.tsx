
import React, { useState } from 'react';
import { GameData, GameType } from '../types';
import { QuizGame } from './games/QuizGame';
import { MatchingGame } from './games/MatchingGame';
import { MemoryGame } from './games/MemoryGame';
import { SequenceGame } from './games/SequenceGame';
import { WordSearchGame } from './games/WordSearchGame';
import { SortingGame } from './games/SortingGame';
import { UnscrambleGame } from './games/UnscrambleGame';
import { FillBlankGame } from './games/FillBlankGame';
import { RiddleGame } from './games/RiddleGame';
import { CrosswordGame } from './games/CrosswordGame';
import { EmojiGame } from './games/EmojiGame';
import { TriviaTrailGame } from './games/TriviaTrailGame';
import { FindMatchGame } from './games/FindMatchGame';
import { Share2, User, CopyCheck, ArrowLeft, Printer } from 'lucide-react';
import { Button } from './Button';

interface GameViewProps {
  data: GameData;
  onReset: () => void; // This acts as "New Game" -> Back to Menu
}

export const GameView: React.FC<GameViewProps> = ({ data, onReset }) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      const jsonString = JSON.stringify(data);
      // Use standard encodeURIComponent before btoa to handle Unicode
      const encoded = btoa(encodeURIComponent(jsonString));
      const url = `${window.location.origin}${window.location.pathname}#game=${encoded}`;
      
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback for non-secure contexts or if clipboard API fails
        prompt("Copy this link to share:", url);
      }
    } catch (e) {
      console.error("Failed to share", e);
      alert("Could not generate share link. Game content might be too large.");
    }
  };

  const handlePrint = () => {
    try {
      window.print();
    } catch (e) {
      console.error("Print failed", e);
      alert("Printing seems to be blocked. Please press Ctrl+P (or Cmd+P) on your keyboard to print.");
    }
  };

  const renderGame = () => {
    switch (data.type) {
      case GameType.QUIZ:
      case GameType.TRUE_FALSE:
        return <QuizGame data={data} onReset={onReset} />;
      case GameType.MATCHING:
        return <MatchingGame data={data} onReset={onReset} />;
      case GameType.MEMORY:
        return <MemoryGame data={data} onReset={onReset} />;
      case GameType.SEQUENCE:
        return <SequenceGame data={data} onReset={onReset} />;
      case GameType.WORD_SEARCH:
        return <WordSearchGame data={data} onReset={onReset} />;
      case GameType.SORTING:
        return <SortingGame data={data} onReset={onReset} />;
      case GameType.UNSCRAMBLE:
        return <UnscrambleGame data={data} onReset={onReset} />;
      case GameType.FILL_IN_BLANK:
        return <FillBlankGame data={data} onReset={onReset} />;
      case GameType.RIDDLE:
        return <RiddleGame data={data} onReset={onReset} />;
      case GameType.CROSSWORD:
        return <CrosswordGame data={data} onReset={onReset} />;
      case GameType.EMOJI_CHALLENGE:
        return <EmojiGame data={data} onReset={onReset} />;
      case GameType.TRIVIA_TRAIL:
        return <TriviaTrailGame data={data} onReset={onReset} />;
      case GameType.FIND_MATCH:
        return <FindMatchGame data={data} onReset={onReset} />;
      default:
        return <div className="text-center text-red-500">Unsupported game type</div>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 print:p-0 print:max-w-none">
      {/* Header - Hide on print */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 print:hidden">
        <div className="flex items-center gap-4">
           <button onClick={onReset} className="p-2 rounded-full hover:bg-slate-200 transition-colors">
              <ArrowLeft size={24} className="text-gray-600" />
           </button>
           <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                {data.title}
              </h1>
              <p className="text-gray-600 mt-2 text-lg flex items-center gap-2">
                <span className="font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs uppercase tracking-wide">
                  {data.type.replace(/_/g, ' ')}
                </span>
                {data.instructions}
              </p>
           </div>
        </div>
        
        <div className="flex gap-2 shrink-0">
          <Button onClick={onReset} variant="ghost" className="hidden md:flex">
             Change Game
          </Button>
          <Button onClick={handlePrint} variant="outline" title="Print Game">
             <Printer size={20} />
             <span className="ml-2 hidden lg:inline">Print</span>
          </Button>
          <Button onClick={handleShare} variant="secondary">
            {copied ? <CopyCheck size={20} /> : <Share2 size={20} />}
            {copied ? "Link Copied" : "Share"}
          </Button>
        </div>
      </div>

      {/* Print Header (Only visible when printing) */}
      <div className="hidden print:block mb-6 text-center">
         <h1 className="text-3xl font-bold mb-2">{data.title}</h1>
         <p className="text-gray-600 italic">{data.instructions}</p>
      </div>

      {/* Game Area */}
      <div className="bg-slate-50 rounded-3xl min-h-[400px] mb-12 border border-slate-200 p-6 md:p-8 print:border-none print:shadow-none print:bg-white print:p-0">
        {renderGame()}
      </div>

      {/* Mentor Key Section */}
      <div className="mt-12 border-t-2 border-indigo-100 pt-8 print:break-inside-avoid">
        <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-200 print:bg-white print:border-slate-300">
          <div className="flex items-center gap-2 mb-4 text-indigo-800 print:text-black">
            <User size={24} />
            <h3 className="text-xl font-bold">Mentor's Corner</h3>
          </div>
          <p className="text-indigo-900/70 mb-4 text-sm italic print:text-black">
            Use these key points to guide the discussion with your student after the game.
          </p>
          <ul className="space-y-2">
            {data.mentorKey.map((point, i) => (
              <li key={i} className="flex gap-3 text-indigo-900 print:text-black">
                <span className="font-bold text-indigo-400 min-w-[20px] print:text-black">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
