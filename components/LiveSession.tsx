import React, { useState, useEffect } from 'react';
import { GameData } from '../types';
import { 
  subscribeToSession, 
  joinSession, 
  updateSessionState, 
  updatePlayerScore,
  updateBoardState, // Added import
  LiveSessionState 
} from '../services/firebaseService';
import { Button } from './Button';
import { Loader2, Users, Play, Trophy, ArrowRight, Copy, CheckCircle, XCircle } from 'lucide-react';
import { QuizGame } from './games/QuizGame';
import { WordSearchGame } from './games/WordSearchGame';
import { MatchingGame } from './games/MatchingGame';
import { MemoryGame } from './games/MemoryGame';
import { SequenceGame } from './games/SequenceGame';
import { SortingGame } from './games/SortingGame';
import { UnscrambleGame } from './games/UnscrambleGame';
import { FillBlankGame } from './games/FillBlankGame';
import { RiddleGame } from './games/RiddleGame';
import { CrosswordGame } from './games/CrosswordGame';
import { EmojiGame } from './games/EmojiGame';
import { TriviaTrailGame } from './games/TriviaTrailGame';
import { FindMatchGame } from './games/FindMatchGame';
import { GameType } from '../types';

interface LiveSessionProps {
  sessionId: string;
  isHost: boolean;
  onExit: () => void;
  initialGameData?: GameData | null;
}

export const LiveSession: React.FC<LiveSessionProps> = ({ 
  sessionId, 
  isHost, 
  onExit,
  initialGameData 
}) => {
  const [session, setSession] = useState<LiveSessionState | null>(null);
  const [playerName, setPlayerName] = useState('');
  
  // Robust check for joined state
  const [studentJoined, setStudentJoined] = useState(false);
  // Ensure we rely strictly on our local state to determine if we are the host or a joined student
  // We double check 'isHost' prop, but for the student flow 'studentJoined' must be true.
  const hasJoined = isHost ? true : studentJoined;

  const [playerId, setPlayerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Gameplay state
  // We now use session.sharedAnswer instead of local state for cooperative play
  const isCollaborative = true; // Defaulting to true as per request

  // Reset local state when sessionId changes
  useEffect(() => {
    setSession(null);
    setStudentJoined(false);
    setPlayerName('');
    setPlayerId(null);
    setError(null);
    setLoading(true);
  }, [sessionId]);

  // Subscribe to session updates
  useEffect(() => {
    const unsubscribe = subscribeToSession(sessionId, (data) => {
      setSession(data as LiveSessionState);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [sessionId]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    
    setLoading(true);
    try {
      const pid = await joinSession(sessionId, playerName);
      setPlayerId(pid);
      setStudentJoined(true);
    } catch (err) {
      console.error(err);
      setError("Failed to join session");
    } finally {
      setLoading(false);
    }
  };

  const handleStartGame = async () => {
    if (!isHost) return;
    await updateSessionState(sessionId, { status: 'active' });
  };

  const handleNextQuestion = async () => {
    if (!isHost || !session) return;
    const nextIndex = session.currentQuestionIndex + 1;
    // Check bounds (assuming QuizGame for now)
    const totalQuestions = (session as any).gameData?.quizContent?.length || 0;
    
    // Reset shared state for next question
    const updates: any = { 
        sharedAnswer: null, 
        answerFeedback: null 
    };

    if (nextIndex >= totalQuestions) {
      updates.status = 'finished';
    } else {
      updates.currentQuestionIndex = nextIndex;
    }
    await updateSessionState(sessionId, updates);
  };

  const handleAnswer = async (option: string, correctAnswer: string) => {
    // In cooperative mode, anyone can answer, and it updates for everyone
    if (session?.sharedAnswer) return; // Prevent changing answer once picked? Or allow changing? 
    // Let's allow picking once, then it shows result.

    const correct = option === correctAnswer;
    
    await updateSessionState(sessionId, {
        sharedAnswer: option,
        answerFeedback: correct
    });

    if (correct && playerId) {
        // Individual scoring could still track who clicked it if we wanted, 
        // but for now let's just show feedback.
    }
  };

  const copyInviteLink = () => {
    const url = `${window.location.origin}/#live=${sessionId}`;
    navigator.clipboard.writeText(url);
    alert("Invite link copied!");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-4" />
        <p>Connecting to Live Session...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Session Not Found</h2>
        <Button onClick={onExit}>Back to Menu</Button>
      </div>
    );
  }

  // --- Registration Screen (Student) ---
  if (!hasJoined) {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold text-indigo-900 mb-6 text-center">Join Live Game</h2>
        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Enter your name"
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Join Game <ArrowRight size={16} className="ml-2" />
          </Button>
        </form>
      </div>
    );
  }

  // --- Lobby Screen ---
  if (session.status === 'waiting') {
    const playerCount = Object.keys(session.players || {}).length;
    
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 rounded-full mb-6 text-indigo-600">
            <Users size={40} />
          </div>
          <h1 className="text-3xl font-bold text-indigo-900 mb-2">Waiting for Players...</h1>
          <p className="text-gray-500 mb-8">
            {isHost ? "Share the link so students can join." : "Waiting for the host to start."}
          </p>
          
          {isHost && (
            <div className="flex justify-center gap-4 mb-8">
              <Button onClick={copyInviteLink} variant="outline">
                <Copy size={16} className="mr-2" />
                Copy Link
              </Button>
              <Button onClick={handleStartGame}>
                <Play size={16} className="mr-2" />
                Start Game
              </Button>
            </div>
          )}

          <div className="bg-slate-50 rounded-xl p-6">
            <h3 className="font-bold text-gray-700 mb-4 flex items-center justify-center gap-2">
              <Users size={18} />
              Players Joined ({playerCount})
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {Object.values(session.players || {}).map((p: any, i) => (
                <span key={i} className="bg-white px-4 py-2 rounded-full shadow-sm text-indigo-600 font-bold">
                  {p.name}
                </span>
              ))}
              {playerCount === 0 && <span className="text-gray-400 italic">No players yet...</span>}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Debug/Role Indicator
  const RoleBadge = () => (
    <div className="fixed top-20 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full shadow-sm text-xs font-bold text-gray-500 z-50 pointer-events-none">
        {isHost ? "HOST" : `PLAYER: ${playerName || 'Guest'}`}
    </div>
  );

  // --- Active Game Screen ---
  // Note: For this MVP, we are reusing the QuizGame component logic but "controlled" via session state
  // ideally we would refactor QuizGame to accept "controlled" props.
  // For now, we'll build a simple display here.
  
  const gameData = session.gameData as any; // We know it's stored here
  const currentQ = gameData.quizContent?.[session.currentQuestionIndex];

  // Handle Games played independently (Board Games)
  // For these games, we show the game component directly.
  const independentGames = [
    GameType.MATCHING,
    GameType.MEMORY,
    GameType.SEQUENCE,
    GameType.SORTING,
    GameType.UNSCRAMBLE,
    GameType.FILL_IN_BLANK,
    GameType.RIDDLE,
    GameType.CROSSWORD,
    GameType.EMOJI_CHALLENGE,
    GameType.TRIVIA_TRAIL,
    GameType.FIND_MATCH
  ];

  // Cooperative games that are NOT question-based (like Crossword, Unscramble)
  if (session.status === 'active' && 
      (gameData.type === GameType.CROSSWORD || 
       gameData.type === GameType.UNSCRAMBLE || 
       gameData.type === GameType.WORD_SEARCH)) {
     const handleBoardUpdate = (updates: any) => {
        updateBoardState(sessionId, updates);
     };

     const renderCooperativeGame = () => {
        switch (gameData.type) {
            case GameType.CROSSWORD: 
              return <CrosswordGame 
                data={gameData} 
                onReset={() => {}} 
                externalInputs={session.boardState || {}}
                onCellChange={(key, val) => handleBoardUpdate({[key]: val})}
              />;
            case GameType.UNSCRAMBLE:
              return <UnscrambleGame 
                data={gameData} 
                onReset={() => {}} 
                externalState={session.boardState as any || { currentIndex: 0, completedCount: 0, currentGuess: [], availableLetters: [] }}
                onStateChange={handleBoardUpdate}
              />;
            case GameType.WORD_SEARCH:
                if (!isHost && !session.boardState?.grid) {
                   return <div className="text-center p-8 text-indigo-600 animate-pulse">Waiting for host to start game...</div>;
                }
                return <WordSearchGame 
                    data={gameData}
                    onReset={() => {}}
                    externalGrid={session.boardState?.grid}
                    externalFoundWords={session.boardState?.foundWords}
                    onGridGenerated={(grid) => handleBoardUpdate({ grid })}
                    onWordFound={(word) => {
                        const currentFound = session.boardState?.foundWords || [];
                        if (!currentFound.includes(word)) {
                            handleBoardUpdate({ foundWords: [...currentFound, word] });
                        }
                    }}
                />;
            default: return <div>Game not supported in Live Mode yet.</div>;
        }
     };

     return (
       <div className="max-w-6xl mx-auto">
         <RoleBadge />
         {isHost && (
           <div className="bg-cyan-50 p-4 rounded-xl mb-4 border border-cyan-200 text-cyan-800 text-center sticky top-4 z-50 shadow-md mx-4">
             <p className="font-bold text-lg">Host Control Panel</p>
             <p className="text-sm mb-2">You are solving this puzzle together with your student!</p>
             { gameData.type === GameType.UNSCRAMBLE && (
                <Button onClick={
                    () => {
                        const items = gameData.unscrambleContent;
                        if (!items) return;
                        const currentItem = items[session.boardState.currentIndex];
                        if(session.boardState.currentGuess.join('') === currentItem.original.toUpperCase()){
                            // This is a bit of a hack, we need a better way to trigger next level
                            // For now, let's just do it
                            const newIndex = session.boardState.currentIndex + 1;
                            if(newIndex < items.length){
                                const nextItem = items[newIndex];
                                 updateBoardState(sessionId, {
                                    currentIndex: newIndex,
                                    completedCount: session.boardState.completedCount + 1,
                                    currentGuess: [],
                                    availableLetters: nextItem.original.toUpperCase().split('').map((c: string, i: number) => ({char: c, id: i}))
                                });
                            } else {
                                updateSessionState(sessionId, { status: 'finished' });
                            }
                        }
                    }
                } size="sm" className="mt-1">
                  Next Word
                </Button>
             )}
             <Button onClick={async () => await updateSessionState(sessionId, { status: 'finished' })} className="mt-1">
               End Session
             </Button>
           </div>
         )}
         <div className="pointer-events-auto">
            {renderCooperativeGame()}
         </div>
       </div>
     );
  }

  // Handle Independent Play games
  if (session.status === 'active' && independentGames.includes(gameData.type)) {
     const renderIndependentGame = () => {
        switch (gameData.type) {
            case GameType.WORD_SEARCH: return <WordSearchGame data={gameData} onReset={() => {}} />;
            case GameType.MATCHING: return <MatchingGame data={gameData} onReset={() => {}} />;
            case GameType.MEMORY: return <MemoryGame data={gameData} onReset={() => {}} />;
            case GameType.SEQUENCE: return <SequenceGame data={gameData} onReset={() => {}} />;
            case GameType.SORTING: return <SortingGame data={gameData} onReset={() => {}} />;
            case GameType.FILL_IN_BLANK: return <FillBlankGame data={gameData} onReset={() => {}} />;
            case GameType.RIDDLE: return <RiddleGame data={gameData} onReset={() => {}} />;
            case GameType.EMOJI_CHALLENGE: return <EmojiGame data={gameData} onReset={() => {}} />;
            case GameType.TRIVIA_TRAIL: return <TriviaTrailGame data={gameData} onReset={() => {}} />;
            case GameType.FIND_MATCH: return <FindMatchGame data={gameData} onReset={() => {}} />;
            default: return <div>Game not supported in Live Mode yet.</div>;
        }
     };

     return (
       <div className="max-w-6xl mx-auto">
         <RoleBadge />
         {isHost && (
           <div className="bg-yellow-50 p-4 rounded-xl mb-4 border border-yellow-200 text-yellow-800 text-center sticky top-4 z-50 shadow-md mx-4">
             <p className="font-bold text-lg">Host Control Panel</p>
             <p className="text-sm mb-2">
               {gameData.type === GameType.CROSSWORD 
                 ? "Students are solving the Crossword together!" 
                 : "Students are playing independently on their devices."}
             </p>
             <Button onClick={async () => await updateSessionState(sessionId, { status: 'finished' })} className="mt-1">
               End Session
             </Button>
           </div>
         )}
         <div className="pointer-events-auto">
            {renderIndependentGame()}
         </div>
       </div>
     );
  }

  if (session.status === 'active' && currentQ) {
    return (
      <div className="max-w-3xl mx-auto">
        <RoleBadge />
        <div className="bg-white p-8 rounded-3xl shadow-xl mb-6">
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">
              Question {session.currentQuestionIndex + 1}/{gameData.quizContent.length}
            </span>
            {isHost && (
               <Button onClick={handleNextQuestion} size="sm">
                 Next <ArrowRight size={16} />
               </Button>
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-8">{currentQ.question}</h2>
          
          <div className="grid gap-4">
            {currentQ.options.map((opt: string, i: number) => {
              const isSelected = session.sharedAnswer === opt;
              const isCorrectAnswer = opt === currentQ.correctAnswer;
              
              let btnClass = "border-gray-200 hover:border-indigo-200 hover:bg-slate-50 text-gray-700";
              
              if (isSelected) {
                // If this is the selected answer, color it based on correctness
                btnClass = session.answerFeedback 
                    ? "border-green-500 bg-green-50 text-green-700" 
                    : "border-red-500 bg-red-50 text-red-700";
              } else if (session.sharedAnswer && isCorrectAnswer) {
                // If an answer has been picked (and it wasn't this one), but this IS the correct one -> show green
                btnClass = "border-green-500 bg-green-50 text-green-700 opacity-50"; 
              } else if (session.sharedAnswer) {
                // Dim other options
                btnClass = "border-gray-100 text-gray-400";
              }

              return (
                <button
                  key={i}
                  disabled={!!session.sharedAnswer} // Disable all buttons once an answer is shared
                  className={`w-full p-4 text-left rounded-xl border-2 transition-all font-semibold flex justify-between items-center ${btnClass}`}
                  onClick={() => handleAnswer(opt, currentQ.correctAnswer)}
                >
                  <span>{opt}</span>
                  {isSelected && (session.answerFeedback ? <CheckCircle size={20} /> : <XCircle size={20} />)}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center p-8">
      <h2 className="text-3xl font-bold mb-4">Game Finished!</h2>
      <Trophy size={64} className="mx-auto text-yellow-500 mb-4" />
      <Button onClick={onExit}>Exit</Button>
    </div>
  );
};
