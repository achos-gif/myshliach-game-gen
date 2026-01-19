
import React, { useState, useEffect } from 'react';
import { GameData, GameState, GameType, GameGenerationInput } from './types';
import { generateGameFromContent } from './services/geminiService';
import { InputForm } from './components/InputForm';
import { GameView } from './components/GameView';
import { GameMenu } from './components/GameMenu';
import { Loader2, AlertCircle, Key, ExternalLink } from 'lucide-react';
import { APP_TITLE } from './constants';
import { Button } from './components/Button';

const App: React.FC = () => {
  const [state, setState] = useState<GameState>({
    view: 'INPUT',
    data: null,
  });
  
  // Track if we need to show the key selection dialog
  const [isKeyRequired, setIsKeyRequired] = useState<boolean>(false);

  useEffect(() => {
    const checkKeyStatus = async () => {
      const win = window as any;
      if (!process.env.API_KEY && win.aistudio) {
        const hasKey = await win.aistudio.hasSelectedApiKey();
        setIsKeyRequired(!hasKey);
      }
    };
    checkKeyStatus();
  }, []);

  // Handle shared games from URL
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#game=')) {
        try {
          const encoded = hash.replace('#game=', '');
          const jsonString = decodeURIComponent(atob(encoded));
          const data = JSON.parse(jsonString) as GameData;
          setState({ view: 'GAME', data });
        } catch (e) {
          console.error("Shared link error:", e);
          setState(prev => ({ ...prev, error: "Invalid shared link." }));
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleOpenKeySelector = async () => {
    const win = window as any;
    if (win.aistudio) {
      await win.aistudio.openSelectKey();
      // Assume success to proceed
      setIsKeyRequired(false);
    }
  };

  const handleInputSubmit = (input: GameGenerationInput) => {
    setState({ view: 'MENU', inputData: input, data: null });
  };

  const handleSelectGame = async (type: GameType) => {
    if (!state.inputData) return;

    setState(prev => ({ ...prev, view: 'LOADING', error: undefined }));
    try {
      const data = await generateGameFromContent(state.inputData, type);
      setState(prev => ({ ...prev, view: 'GAME', data }));
    } catch (error: any) {
      console.error("Generation error:", error);
      
      const errorMessage = error.message || "Failed to generate game.";
      
      // If the error looks like an API key issue, prompt for selection
      if (errorMessage.toLowerCase().includes("key") || 
          errorMessage.toLowerCase().includes("not found") ||
          errorMessage.toLowerCase().includes("api_key")) {
        setIsKeyRequired(true);
      }

      setState(prev => ({ 
        ...prev, 
        view: 'MENU',
        error: errorMessage
      }));
    }
  };

  const handleBackToMenu = () => {
    if (state.inputData) {
      setState(prev => ({ ...prev, view: 'MENU', data: null }));
    } else {
      setState({ view: 'INPUT', data: null });
    }
  };

  const handleResetToInput = () => {
    setState({ view: 'INPUT', data: null, inputData: undefined });
  };

  // If we are explicitly missing a key and have the platform selection tool
  const win = window as any;
  if (isKeyRequired && win.aistudio) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 text-center border border-indigo-100 animate-fade-in-up">
          <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Key size={40} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Setup API Key</h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            The application needs a valid, billing-enabled API key from your Google Cloud project to continue.
          </p>
          <div className="space-y-4">
            <Button onClick={handleOpenKeySelector} className="w-full text-lg py-6 shadow-xl shadow-indigo-200">
              Select My API Key
            </Button>
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-indigo-500 font-bold hover:text-indigo-600 transition-colors"
            >
              Billing Documentation
              <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-900 selection:bg-indigo-100 selection:text-indigo-900 print:bg-white">
      {state.view !== 'GAME' && (
        <header className="bg-white border-b border-slate-200 py-4 px-6 mb-8 print:hidden">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-xl font-bold text-indigo-600 flex items-center gap-2">
              <span className="bg-indigo-600 text-white p-1 rounded-md text-xs">MS</span>
              {APP_TITLE}
            </h1>
          </div>
        </header>
      )}

      <main className="container mx-auto px-4 pb-12 print:p-0">
        {state.error && (
          <div className="max-w-2xl mx-auto mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-start gap-3 animate-shake print:hidden">
            <AlertCircle className="shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="font-bold">Error</p>
              <p className="text-sm opacity-90">{state.error}</p>
            </div>
            <button onClick={() => setState(s => ({...s, error: undefined}))} className="text-red-900 font-bold px-2">&times;</button>
          </div>
        )}

        {state.view === 'INPUT' && (
          <div className="animate-fade-in-up">
             <InputForm onSubmit={handleInputSubmit} isLoading={false} />
          </div>
        )}

        {state.view === 'MENU' && (
          <GameMenu onSelectGame={handleSelectGame} onBack={handleResetToInput} />
        )}

        {state.view === 'LOADING' && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-indigo-600">
            <Loader2 className="w-16 h-16 animate-spin mb-4" />
            <h3 className="text-xl font-bold text-gray-800">Designing your activity...</h3>
            <p className="text-gray-500">Studying the Koivetz content...</p>
          </div>
        )}

        {state.view === 'GAME' && state.data && (
          <div className="animate-fade-in">
             <GameView data={state.data} onReset={handleBackToMenu} />
          </div>
        )}
      </main>

      <footer className="text-center text-gray-400 text-sm py-8 print:hidden">
        <p>&copy; {new Date().getFullYear()} MyShliach Mentor Program</p>
      </footer>
    </div>
  );
};

export default App;
