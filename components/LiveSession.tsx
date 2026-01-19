import React, { useState, useEffect } from 'react';
import { GameData } from '../types';
import { 
  subscribeToSession, 
  joinSession, 
  updateSessionState, 
  LiveSessionState 
} from '../services/firebaseService';
import { Button } from './Button';
import { Loader2, Users, Play, Trophy, ArrowRight, Copy } from 'lucide-react';
import { QuizGame } from './games/QuizGame';

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
  const [hasJoined, setHasJoined] = useState(isHost); // Host is implicitly joined
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      await joinSession(sessionId, playerName);
      setHasJoined(true);
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
    
    if (nextIndex >= totalQuestions) {
      await updateSessionState(sessionId, { status: 'finished' });
    } else {
      await updateSessionState(sessionId, { currentQuestionIndex: nextIndex });
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

  // --- Active Game Screen ---
  // Note: For this MVP, we are reusing the QuizGame component logic but "controlled" via session state
  // ideally we would refactor QuizGame to accept "controlled" props.
  // For now, we'll build a simple display here.
  
  const gameData = session.gameData as any; // We know it's stored here
  const currentQ = gameData.quizContent?.[session.currentQuestionIndex];

  if (session.status === 'active' && currentQ) {
    return (
      <div className="max-w-3xl mx-auto">
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
            {currentQ.options.map((opt: string, i: number) => (
              <button
                key={i}
                className={`w-full p-4 text-left rounded-xl border-2 transition-all font-semibold
                  ${false // We'd need local state to track selection
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                    : 'border-gray-200 hover:border-indigo-200 hover:bg-slate-50 text-gray-700'}
                `}
                onClick={() => {
                   // Handle answer submission here (update player score in firebase)
                }}
              >
                {opt}
              </button>
            ))}
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
