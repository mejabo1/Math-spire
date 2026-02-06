import React, { useState, useEffect } from 'react';
import { generateMathRiddle, MathRiddle } from '../services/geminiService';
import { Brain, Sparkles, ArrowRight } from 'lucide-react';

interface EventRoomProps {
  onComplete: (reward: boolean) => void;
}

export const EventRoom: React.FC<EventRoomProps> = ({ onComplete }) => {
  const [riddle, setRiddle] = useState<MathRiddle | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [result, setResult] = useState<'pending' | 'correct' | 'wrong'>('pending');

  useEffect(() => {
    const fetchRiddle = async () => {
      setLoading(true);
      const data = await generateMathRiddle();
      setRiddle(data);
      setLoading(false);
    };
    fetchRiddle();
  }, []);

  const handleOptionClick = (index: number) => {
    if (result !== 'pending' || !riddle) return;
    
    setSelectedOption(index);
    if (index === riddle.correctIndex) {
        setResult('correct');
    } else {
        setResult('wrong');
    }
  };

  if (loading) {
      return (
          <div className="flex flex-col items-center justify-center h-full text-amber-100 space-y-4">
              <Brain className="w-16 h-16 animate-pulse text-amber-400" />
              <p className="text-xl font-serif">The Sphinx of Numbers is formulating a riddle...</p>
          </div>
      );
  }

  if (!riddle) {
      return (
          <div className="text-center p-10">
              <p>The room is empty. Strange.</p>
              <button onClick={() => onComplete(false)} className="mt-4 px-6 py-2 bg-slate-700 text-white rounded">Leave</button>
          </div>
      );
  }

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col justify-center items-center p-8">
        <div className="bg-slate-800/90 border border-amber-500/50 p-10 rounded-2xl shadow-2xl backdrop-blur-sm w-full relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl"></div>
            
            <div className="flex items-center gap-4 mb-6">
                <div className="bg-amber-900/50 p-3 rounded-full border border-amber-500/30">
                     <Brain className="w-8 h-8 text-amber-400" />
                </div>
                <h2 className="text-3xl font-serif text-amber-100">The Sphinx's Challenge</h2>
            </div>

            <p className="text-xl text-slate-200 leading-relaxed mb-8 border-l-4 border-amber-600 pl-6 italic">
                "{riddle.question}"
            </p>

            <div className="grid gap-4 mb-8">
                {riddle.options.map((option, idx) => {
                    let btnClass = "w-full text-left p-4 rounded-lg border-2 transition-all duration-200 flex justify-between items-center group ";
                    
                    if (result === 'pending') {
                        btnClass += "border-slate-600 hover:border-amber-400 hover:bg-slate-700/50 cursor-pointer text-slate-300";
                    } else if (idx === riddle.correctIndex) {
                        btnClass += "border-green-500 bg-green-900/20 text-green-100 shadow-[0_0_15px_rgba(34,197,94,0.3)]";
                    } else if (idx === selectedOption) {
                        btnClass += "border-red-500 bg-red-900/20 text-red-100";
                    } else {
                        btnClass += "border-slate-700 opacity-50";
                    }

                    return (
                        <button 
                            key={idx}
                            onClick={() => handleOptionClick(idx)}
                            disabled={result !== 'pending'}
                            className={btnClass}
                        >
                            <span className="text-lg font-medium">
                                <span className="inline-block w-8 font-serif opacity-50 mr-2">{String.fromCharCode(65 + idx)}.</span>
                                {option}
                            </span>
                            {result === 'correct' && idx === riddle.correctIndex && <Sparkles className="w-5 h-5 text-green-400 animate-spin-slow" />}
                        </button>
                    );
                })}
            </div>

            {result !== 'pending' && (
                <div className="animate-fade-in border-t border-slate-700 pt-6 flex flex-col items-center">
                    <p className={`text-xl font-serif mb-4 ${result === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
                        {result === 'correct' ? riddle.rewardText : "The Sphinx frowns. The answer was elusive."}
                    </p>
                    
                    <button 
                        onClick={() => onComplete(result === 'correct')}
                        className="flex items-center gap-2 px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold shadow-lg transition-transform hover:-translate-y-1"
                    >
                        {result === 'correct' ? 'Claim Reward & Leave' : 'Leave in Shame'}
                        <ArrowRight size={20} />
                    </button>
                </div>
            )}
        </div>
    </div>
  );
};
