
import React, { useState, useEffect } from 'react';
import { GameData, FillBlankData } from '../../types';
import { Button } from '../Button';
import { CheckCircle, RotateCcw } from 'lucide-react';

interface FillBlankGameProps {
  data: GameData;
  onReset: () => void;
}

export const FillBlankGame: React.FC<FillBlankGameProps> = ({ data, onReset }) => {
  const [segments, setSegments] = useState<string[]>([]);
  const [options, setOptions] = useState<{ id: string, word: string }[]>([]);
  const [answers, setAnswers] = useState<(string | null)[]>([]); // Array matching blank slots
  const [isComplete, setIsComplete] = useState(false);
  const [feedback, setFeedback] = useState<boolean | null>(null);

  useEffect(() => {
    if (data.fillBlankContent) {
      const content = data.fillBlankContent;
      setSegments(content.storySegments);
      // Initialize answers array (options length)
      setAnswers(new Array(content.missingWords.length).fill(null));
      
      // Create shuffle options
      const words = content.missingWords.map((w, i) => ({ id: `word-${i}`, word: w }));
      setOptions(words.sort(() => Math.random() - 0.5));
    }
  }, [data]);

  const handleDragStart = (e: React.DragEvent, word: string) => {
    e.dataTransfer.setData("text/plain", word);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    const word = e.dataTransfer.getData("text/plain");
    
    // Update answers
    const newAnswers = [...answers];
    newAnswers[index] = word;
    setAnswers(newAnswers);
    setFeedback(null); // Reset feedback on change
  };

  const handleOptionClick = (word: string) => {
    // Find first empty slot
    const emptyIndex = answers.findIndex(a => a === null);
    if (emptyIndex !== -1) {
      const newAnswers = [...answers];
      newAnswers[emptyIndex] = word;
      setAnswers(newAnswers);
    }
  };

  const removeAnswer = (index: number) => {
    const newAnswers = [...answers];
    newAnswers[index] = null;
    setAnswers(newAnswers);
    setFeedback(null);
  };

  const checkAnswers = () => {
    if (!data.fillBlankContent) return;
    
    const correctWords = data.fillBlankContent.missingWords;
    const isCorrect = answers.every((ans, i) => ans === correctWords[i]);
    
    setFeedback(isCorrect);
    if (isCorrect) setIsComplete(true);
  };

  if (isComplete) {
    return (
       <div className="text-center p-8 bg-white rounded-3xl shadow-xl max-w-2xl mx-auto animate-bounce-in">
        <h2 className="text-4xl font-bold text-indigo-600 mb-4">Story Complete!</h2>
        <p className="text-xl text-gray-600 mb-8">You filled in all the blanks correctly.</p>
        
        {/* Read full story */}
        <div className="bg-indigo-50 p-6 rounded-xl text-lg leading-relaxed text-indigo-900 mb-8 border border-indigo-100">
          {segments.map((seg, i) => (
            <span key={i}>
              {seg}
              {i < (data.fillBlankContent?.missingWords.length || 0) && (
                 <span className="font-bold text-indigo-600 bg-white px-2 py-0.5 rounded mx-1 shadow-sm">
                   {data.fillBlankContent?.missingWords[i]}
                 </span>
              )}
            </span>
          ))}
        </div>

        <Button onClick={onReset} variant="outline">
          <RotateCcw className="w-5 h-5" />
          Play Again
        </Button>
      </div>
    );
  }

  // Filter out used words from options
  const availableOptions = options.filter(opt => !answers.includes(opt.word));

  return (
    <div className="max-w-4xl mx-auto">
      
      {/* Story Area */}
      <div className="bg-white p-6 md:p-10 rounded-2xl shadow-lg border-2 border-indigo-50 leading-loose text-lg md:text-xl text-gray-800 mb-8">
        {segments.map((segment, i) => (
          <React.Fragment key={i}>
            <span>{segment}</span>
            {i < (data.fillBlankContent?.missingWords.length || 0) && (
              <span
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, i)}
                onClick={() => answers[i] && removeAnswer(i)}
                className={`
                  inline-flex items-center justify-center min-w-[80px] h-8 md:h-10 mx-1 align-middle border-b-2 px-2 cursor-pointer transition-colors
                  ${answers[i] 
                    ? feedback === false 
                      ? 'bg-red-50 border-red-400 text-red-800'
                      : 'bg-indigo-100 border-indigo-500 text-indigo-800 font-bold'
                    : 'bg-gray-50 border-gray-300 border-dashed hover:bg-gray-100'
                  }
                `}
              >
                {answers[i] || "?"}
              </span>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Word Bank */}
      <div className="bg-slate-100 p-4 rounded-xl mb-6">
        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Word Bank (Click or Drag)</p>
        <div className="flex flex-wrap gap-3">
          {availableOptions.map((opt) => (
            <div
              key={opt.id}
              draggable
              onDragStart={(e) => handleDragStart(e, opt.word)}
              onClick={() => handleOptionClick(opt.word)}
              className="px-4 py-2 bg-white rounded-lg shadow-sm border border-slate-200 cursor-grab active:cursor-grabbing hover:bg-indigo-50 hover:border-indigo-300 font-medium text-indigo-900 transition-all"
            >
              {opt.word}
            </div>
          ))}
          {availableOptions.length === 0 && (
             <span className="text-gray-400 italic text-sm">All words used! Check your answers.</span>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <Button 
          onClick={checkAnswers} 
          disabled={answers.includes(null)} 
          className="px-12 py-3"
        >
          Check My Story
        </Button>
        
        {feedback === false && (
          <p className="text-red-500 font-bold animate-pulse">Some words are in the wrong spot. Try again!</p>
        )}
      </div>
    </div>
  );
};
