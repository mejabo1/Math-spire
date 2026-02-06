import React from 'react';
import { MathProblem } from '../utils/mathGenerator';
import { Brain } from 'lucide-react';

interface MathModalProps {
  problem: MathProblem;
  cardName: string;
  onAnswer: (correct: boolean) => void;
}

export const MathModal: React.FC<MathModalProps> = ({ problem, cardName, onAnswer }) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-800 border-2 border-amber-500 rounded-2xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-900/50 mb-3 border border-amber-500/30">
                <Brain className="text-amber-400 w-6 h-6" />
            </div>
            <h3 className="text-slate-400 text-sm uppercase tracking-widest mb-1">Casting Spell</h3>
            <h2 className="text-2xl font-serif text-white font-bold">{cardName}</h2>
        </div>

        {/* Question */}
        <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700 mb-6 text-center">
            <span className="text-xs text-slate-500 uppercase tracking-wide block mb-2">{problem.topic}</span>
            <p className="text-3xl font-mono text-amber-100">{problem.question}</p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-4">
            {problem.options.map((option, idx) => (
                <button
                    key={idx}
                    onClick={() => onAnswer(option === problem.correctAnswer)}
                    className="bg-slate-700 hover:bg-slate-600 border border-slate-500 hover:border-amber-400 text-white py-4 rounded-lg text-xl font-bold transition-all active:scale-95 shadow-lg"
                >
                    {option}
                </button>
            ))}
        </div>
        
        <div className="mt-6 text-center text-xs text-slate-500">
            Solve correctly to cast the card!
        </div>
      </div>
    </div>
  );
};
