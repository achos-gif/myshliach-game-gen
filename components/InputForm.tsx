
import React, { useState, useRef } from 'react';
import { Button } from './Button';
import { Sparkles, BookOpen, Upload, FileText, X } from 'lucide-react';
// Import GameGenerationInput from types.ts instead of geminiService.ts to fix non-exported module error
import { GameGenerationInput } from '../types';

interface InputFormProps {
  onSubmit: (input: GameGenerationInput) => void;
  isLoading: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const [mode, setMode] = useState<'upload' | 'text'>('upload');
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'text' && text.trim()) {
      onSubmit({ type: 'text', value: text });
    } else if (mode === 'upload' && file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix (e.g., "data:application/pdf;base64,")
        const base64Data = result.split(',')[1];
        onSubmit({ 
          type: 'file', 
          data: base64Data, 
          mimeType: file.type 
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
      } else {
        alert("Please upload a PDF file.");
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
      } else {
        alert("Please upload a PDF file.");
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-xl border border-indigo-100">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4 text-indigo-600">
          <BookOpen size={32} />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Create a New Game</h2>
        <p className="text-gray-600">Upload this week's Koivetz to choose from 8 fun activities!</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
        <button
          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${mode === 'upload' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setMode('upload')}
          type="button"
        >
          <Upload size={16} />
          Upload PDF
        </button>
        <button
          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${mode === 'text' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setMode('text')}
          type="button"
        >
          <FileText size={16} />
          Paste Text
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {mode === 'upload' && (
          <div 
            className={`
              border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer relative
              ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'}
              ${file ? 'bg-indigo-50 border-indigo-200' : ''}
            `}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              accept="application/pdf" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            
            {file ? (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-lg flex items-center justify-center mb-3">
                  <FileText size={24} />
                </div>
                <p className="font-bold text-gray-800 mb-1">{file.name}</p>
                <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="absolute top-2 right-2 p-1 bg-white rounded-full text-gray-400 hover:text-red-500 shadow-sm"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload size={24} />
                </div>
                <p className="font-bold text-gray-700">Click to upload or drag & drop</p>
                <p className="text-sm text-gray-500 mt-1">PDF files only</p>
              </>
            )}
          </div>
        )}

        {mode === 'text' && (
          <div>
            <textarea
              className="w-full h-64 p-4 rounded-xl border-2 border-indigo-100 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-all text-gray-700 bg-gray-50 resize-none"
              placeholder="Paste text here (story, sicha, halacha, etc.)..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isLoading}
            />
          </div>
        )}

        <Button 
          type="submit" 
          variant="primary" 
          className="w-full text-lg"
          isLoading={isLoading}
          disabled={mode === 'upload' ? !file : !text.trim()}
        >
          <Sparkles className="w-5 h-5" />
          Choose Activity
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Works best with the standard weekly Koivetz PDF.</p>
      </div>
    </div>
  );
};
