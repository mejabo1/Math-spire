import React from 'react';
import { Enemy } from '../types';
import { Sword, Shield, AlertTriangle, Target } from 'lucide-react';

interface EnemyProps {
  enemy: Enemy;
  animationState?: 'idle' | 'attack' | 'hit';
  isTargetable?: boolean;
  onClick?: () => void;
}

export const EnemyComponent: React.FC<EnemyProps> = ({ enemy, animationState = 'idle', isTargetable = false, onClick }) => {
  // Calculate HP Percentage
  const hpPercent = Math.max(0, (enemy.currentHp / enemy.maxHp) * 100);
  const isAttacking = enemy.intent.type === 'attack';

  let animationClass = "transition-transform duration-500 transform";
  
  if (animationState === 'attack') {
      animationClass += " animate-lunge-left"; // Defines the movement towards player
  } else if (animationState === 'hit') {
      animationClass += " animate-shake";
  } else if (isTargetable) {
      animationClass += " scale-105 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)] cursor-pointer hover:scale-110";
  }

  // Add pulsating red glow if attacking and not currently mid-animation
  if (isAttacking && animationState === 'idle') {
      animationClass += " animate-danger-pulse";
  }

  return (
    <div 
        className={`flex flex-col items-center relative animate-fade-in group mx-2 ${isTargetable ? 'z-20' : ''}`}
        onClick={() => isTargetable && onClick && onClick()}
    >
      {/* Target Reticle on Hover/Targetable */}
      {isTargetable && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
              <Target className="w-24 h-24 text-red-500 animate-ping" />
          </div>
      )}

      {/* Intent Bubble */}
      <div className="absolute -top-12 bg-white text-slate-900 px-3 py-1 rounded-full shadow-lg border-2 border-slate-300 flex items-center gap-2 font-bold animate-bounce-slow z-20">
        {enemy.intent.type === 'attack' && <><Sword size={16} className="text-red-600"/> <span className="text-lg">{enemy.intent.value}</span></>}
        {enemy.intent.type === 'defend' && <><Shield size={16} className="text-blue-600"/> <span className="text-lg">{enemy.intent.value}</span></>}
        {enemy.intent.type === 'buff' && <><AlertTriangle size={16} className="text-yellow-600"/> <span>Buff</span></>}
      </div>

      {/* Enemy Image with animation class */}
      <div className={`w-40 h-40 mb-4 relative ${animationClass}`}>
          <img 
            src={enemy.image} 
            alt={enemy.name} 
            className="w-full h-full object-contain drop-shadow-2xl" 
          />
          {/* Health Bar */}
          <div className="absolute -bottom-6 left-0 w-full">
            <div className="flex justify-between text-sm font-bold text-white mb-1 px-1 shadow-black drop-shadow-md">
                <span>{enemy.currentHp}</span>
                <span>{enemy.maxHp}</span>
            </div>
            <div className="h-4 bg-gray-900 rounded-full border border-gray-600 overflow-hidden relative">
                <div 
                    className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-500 ease-out"
                    style={{ width: `${hpPercent}%` }}
                />
            </div>
          </div>
      </div>
      
      <h2 className="text-xl font-serif text-red-200 mt-6 tracking-wide drop-shadow-lg text-center">{enemy.name}</h2>
    </div>
  );
};