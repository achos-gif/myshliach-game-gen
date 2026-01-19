
import React from 'react';
import { GameType } from '../types';
import { Button } from './Button';
import { 
  Brain, 
  Search, 
  ArrowRightLeft, 
  ListOrdered, 
  LayoutGrid, 
  PenTool, 
  HelpCircle, 
  MessageSquare,
  Grid,
  Smile,
  Map,
  Eye,
  Layers,
  CheckSquare
} from 'lucide-react';

interface GameMenuProps {
  onSelectGame: (type: GameType) => void;
  onBack: () => void;
}

export const GameMenu: React.FC<GameMenuProps> = ({ onSelectGame, onBack }) => {
  const games = [
    { type: GameType.QUIZ, label: 'Quiz Challenge', icon: Brain, color: 'bg-indigo-100 text-indigo-600', desc: 'Test your knowledge' },
    { type: GameType.TRUE_FALSE, label: 'True or False', icon: CheckSquare, color: 'bg-lime-100 text-lime-600', desc: 'Fact checking' },
    { type: GameType.WORD_SEARCH, label: 'Word Search', icon: Search, color: 'bg-emerald-100 text-emerald-600', desc: 'Find hidden words' },
    { type: GameType.MATCHING, label: 'Matching', icon: ArrowRightLeft, color: 'bg-amber-100 text-amber-600', desc: 'Connect terms & meanings' },
    { type: GameType.MEMORY, label: 'Memory Match', icon: Layers, color: 'bg-rose-100 text-rose-600', desc: 'Find matching pairs' },
    { type: GameType.SEQUENCE, label: 'Story Order', icon: ListOrdered, color: 'bg-blue-100 text-blue-600', desc: 'Arrange the timeline' },
    { type: GameType.CROSSWORD, label: 'Crossword', icon: Grid, color: 'bg-teal-100 text-teal-600', desc: 'Solve the puzzle' },
    { type: GameType.EMOJI_CHALLENGE, label: 'Emoji Guess', icon: Smile, color: 'bg-yellow-100 text-yellow-600', desc: 'Decode the pictures' },
    { type: GameType.TRIVIA_TRAIL, label: 'Parsha Maze', icon: Map, color: 'bg-green-100 text-green-600', desc: 'Board game adventure' },
    { type: GameType.FIND_MATCH, label: 'Spot It!', icon: Eye, color: 'bg-red-100 text-red-600', desc: 'Find the matching pair' },
    { type: GameType.SORTING, label: 'Category Sort', icon: LayoutGrid, color: 'bg-purple-100 text-purple-600', desc: 'Group items together' },
    { type: GameType.FILL_IN_BLANK, label: 'Fill in Blanks', icon: PenTool, color: 'bg-pink-100 text-pink-600', desc: 'Complete the story' },
    { type: GameType.RIDDLE, label: 'Riddle Me This', icon: HelpCircle, color: 'bg-orange-100 text-orange-600', desc: 'Guess from clues' },
    { type: GameType.UNSCRAMBLE, label: 'Unscramble', icon: MessageSquare, color: 'bg-cyan-100 text-cyan-600', desc: 'Fix the mixed words' },
  ];

  return (
    <div className="max-w-6xl mx-auto animate-fade-in-up">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-indigo-900 mb-2">Choose an Activity</h2>
        <p className="text-gray-600">Pick a game format to generate from your Koivetz.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
        {games.map((g) => (
          <button
            key={g.type}
            onClick={() => onSelectGame(g.type)}
            className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm border-2 border-slate-100 hover:border-indigo-400 hover:shadow-md hover:-translate-y-1 transition-all text-center group h-full"
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${g.color} group-hover:scale-110 transition-transform`}>
              <g.icon size={28} />
            </div>
            <h3 className="font-bold text-gray-800 text-lg mb-1">{g.label}</h3>
            <p className="text-xs text-gray-400">{g.desc}</p>
          </button>
        ))}
      </div>

      <div className="flex justify-center">
        <Button onClick={onBack} variant="ghost">
          Upload Different File
        </Button>
      </div>
    </div>
  );
};
