
import React, { useState, useEffect, useRef } from 'react';
import { Player, Enemy, Card as CardType } from '../types';
import { CardComponent } from './Card';
import { EnemyComponent } from './Enemy';
import { PlayerComponent } from './Player';
import { MathModal } from './MathModal';
import { TutorialModal } from './TutorialModal';
import { generateProblem, MathProblem } from '../utils/mathGenerator';
import { Zap, RotateCcw, ScrollText, Shield as ShieldIcon, Target } from 'lucide-react';

interface CombatProps {
  player: Player;
  enemies: Enemy[];
  onVictory: (remainingHp: number) => void;
  onDefeat: () => void;
  showTutorial: boolean;
  onTutorialComplete: () => void;
  backgroundImage?: string;
}

type TurnPhase = 'PLAYER' | 'TARGETING' | 'MATH_CHALLENGE' | 'ENEMY_ANIMATING' | 'ENEMY' | 'END';

interface VisualEffect {
    id: number;
    text: string | React.ReactNode;
    type: 'damage' | 'block' | 'info';
    x: number; 
    y: number;
    targetId: string | 'player';
}

export const Combat: React.FC<CombatProps> = ({ 
    player: initialPlayer, 
    enemies: initialEnemies, 
    onVictory, 
    onDefeat,
    showTutorial,
    onTutorialComplete,
    backgroundImage
}) => {
  const [player, setPlayer] = useState<Player>(initialPlayer);
  const [enemies, setEnemies] = useState<Enemy[]>(initialEnemies);
  const [turnPhase, setTurnPhase] = useState<TurnPhase>('PLAYER');
  
  // Math & Targeting State
  const [pendingCard, setPendingCard] = useState<CardType | null>(null);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [activeProblem, setActiveProblem] = useState<MathProblem | null>(null);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  
  // Turn based buffs
  const [turnDamageBonus, setTurnDamageBonus] = useState(0);

  // Battle Log
  const [combatLog, setCombatLog] = useState<string[]>(["Encounter started!"]);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Visual Effects State
  const [effects, setEffects] = useState<VisualEffect[]>([]);
  const [playerShake, setPlayerShake] = useState(false);
  const [playerFlash, setPlayerFlash] = useState(false);
  const [playerBlockAnim, setPlayerBlockAnim] = useState(false);
  
  // Track animation state per enemy ID
  const [enemyAnimStates, setEnemyAnimStates] = useState<Record<string, 'idle' | 'attack' | 'hit'>>({});
  const [enemyFlashes, setEnemyFlashes] = useState<Record<string, boolean>>({});

  const addLog = (message: string) => {
      setCombatLog(prev => [...prev, message]);
  };

  const triggerVfx = (text: string | React.ReactNode, type: 'damage' | 'block' | 'info', targetId: string | 'player') => {
      const id = Date.now() + Math.random();
      let x = 30;
      let y = 30;

      if (targetId !== 'player') {
         x = 60 + Math.random() * 20; 
         y = 30 + Math.random() * 10;
      }
      
      setEffects(prev => [...prev, { id, text, type, x, y, targetId }]);
      setTimeout(() => {
          setEffects(prev => prev.filter(e => e.id !== id));
      }, 1000);
  };

  const triggerPlayerShake = () => {
      setPlayerShake(true);
      setPlayerFlash(true);
      setTimeout(() => { setPlayerShake(false); setPlayerFlash(false); }, 500);
  };

  const triggerEnemyShake = (id: string) => {
      setEnemyAnimStates(prev => ({ ...prev, [id]: 'hit' }));
      setEnemyFlashes(prev => ({ ...prev, [id]: true }));
      setTimeout(() => {
          setEnemyAnimStates(prev => ({ ...prev, [id]: 'idle' }));
          setEnemyFlashes(prev => ({ ...prev, [id]: false }));
      }, 500);
  };

  // Auto scroll log
  useEffect(() => {
    if (logContainerRef.current) {
        logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [combatLog]);

  // Initialize Combat
  useEffect(() => {
    startTurn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const drawCards = (currentDeck: CardType[], currentDiscard: CardType[], amount: number) => {
    let deck = [...currentDeck];
    let discard = [...currentDiscard];
    let hand: CardType[] = [];

    for (let i = 0; i < amount; i++) {
        if (deck.length === 0) {
            if (discard.length === 0) break;
            deck = [...discard].sort(() => Math.random() - 0.5);
            discard = [];
            addLog("Deck shuffled.");
        }
        const card = deck.pop();
        if (card) hand.push(card);
    }
    return { deck, discard, hand };
  };

  const startTurn = () => {
    addLog("--- Player Turn ---");
    setTurnDamageBonus(0);
    setPlayer(prev => {
        const { deck, discard, hand } = drawCards(prev.drawPile, prev.discardPile, 5);
        return {
            ...prev,
            energy: prev.maxEnergy,
            block: 0,
            drawPile: deck,
            discardPile: [...discard, ...prev.hand],
            hand: hand
        };
    });
    setTurnPhase('PLAYER');
  };

  const isTargetedEffect = (effectId: string) => {
      return [
          'deal_damage', 
          'deal_damage_heavy', 
          'damage_x', 
          'reckless_attack', 
          'lifesteal', 
          'multi_hit', 
          'multi_hit_2',
          'damage_prime',
          'block_slam',
          'damage_equal_to_block',
          'block_damage',
          'damage_discard',
          'damage_x_draw',
          'block_enemy' // Needs target to see HP
      ].includes(effectId);
  };

  const handleCardClick = (card: CardType) => {
      if (showTutorial) return; 

      if (player.energy < card.cost) {
          triggerVfx("No Energy!", "info", "player");
          return;
      }
      
      const needsTarget = isTargetedEffect(card.effectId);
      const livingEnemies = enemies.filter(e => e.currentHp > 0);

      if (needsTarget && livingEnemies.length > 1) {
          setPendingCard(card);
          setTurnPhase('TARGETING');
          addLog("Select a target...");
      } else {
          setPendingCard(card);
          if (needsTarget && livingEnemies.length === 1) {
              setTargetId(livingEnemies[0].id);
          } else {
              setTargetId(null);
          }
          setActiveProblem(generateProblem(card.mathType));
          setTurnPhase('MATH_CHALLENGE');
      }
  };

  const handleEnemyClick = (enemy: Enemy) => {
      if (showTutorial) return;

      if (turnPhase === 'TARGETING' && enemy.currentHp > 0) {
          setTargetId(enemy.id);
          setActiveProblem(generateProblem(pendingCard?.mathType));
          setTurnPhase('MATH_CHALLENGE');
      }
  };

  const handleMathAnswer = (correct: boolean) => {
      if (pendingCard) {
          if (correct) {
              playCard(pendingCard, targetId);
          } else {
              // Failed Calculation
              setPlayer(p => {
                  // If it's Pop Quiz, it exhausts (disappears) on wrong answer
                  const isPopQuiz = pendingCard.name === 'Pop Quiz';
                  
                  return {
                     ...p,
                     energy: p.energy - pendingCard.cost,
                     hand: p.hand.filter(c => c.id !== pendingCard.id),
                     // Only add to discard if NOT Pop Quiz
                     discardPile: isPopQuiz ? p.discardPile : [...p.discardPile, pendingCard]
                  };
              });

              addLog("Calculation Failed! Energy lost.");
              triggerVfx("Fizzle...", "info", "player");
              if (pendingCard.name === 'Order of Ops') {
                  triggerVfx("-2 Block", "damage", "player");
                  setPlayer(p => ({...p, block: Math.max(0, p.block - 2)}));
              }
          }
      }
      setPendingCard(null);
      setTargetId(null);
      setActiveProblem(null);
      setTurnPhase('PLAYER');
  };

  const playCard = (card: CardType, targetId: string | null) => {
    // 1. Pay Cost
    setPlayer(p => ({ ...p, energy: p.energy - card.cost }));

    // 2. Resolve Effect
    resolveCardEffect(card, targetId);

    // 3. Move to Discard (unless Pop Quiz on success, which behaves normally, only on fail it exhausts)
    // Actually standard play moves to discard. Pop quiz exhaust is only on FAIL per requirement.
    setPlayer(p => ({
        ...p,
        hand: p.hand.filter(c => c.id !== card.id),
        discardPile: [...p.discardPile, card]
    }));
  };

  const resolveCardEffect = (card: CardType, targetId: string | null) => {
    let damage = card.value + turnDamageBonus;
    let block = card.value;

    const getTarget = () => enemies.find(e => e.id === targetId);

    switch (card.effectId) {
        case 'gain_energy':
            setPlayer(p => ({ ...p, energy: p.energy + card.value }));
            triggerVfx(`+${card.value} Energy`, "info", "player");
            return;
        case 'block_hand_size':
            setPlayer(p => {
                // Count current hand (including the card being played, conceptually, or excluding? 
                // Usually excluding since it leaves hand. p.hand still has it until end of function. 
                // Let's count hand - 1).
                const amt = Math.max(0, p.hand.length - 1);
                triggerVfx(`+${amt} Block`, "block", "player");
                return { ...p, block: p.block + amt };
            });
            return;
        case 'damage_x_draw':
            setPlayer(p => {
                const amt = Math.max(0, p.hand.length - 1) + turnDamageBonus;
                if (targetId) dealDamage(amt, targetId, true);
                
                // Draw 1
                const { deck, discard, hand } = drawCards(p.drawPile, p.discardPile, 1);
                triggerVfx("Draw 1", "info", "player");
                return { ...p, drawPile: deck, discardPile: discard, hand: [...p.hand, ...hand] };
            });
            return;
        case 'block_enemy':
            const target = getTarget();
            if (target) {
                const amt = target.currentHp; // "Equal to opponent"
                triggerVfx(`+${amt} Block`, "block", "player");
                setPlayer(p => ({ ...p, block: p.block + amt }));
            }
            return;
        case 'buff_damage':
            setTurnDamageBonus(prev => prev + card.value);
            triggerVfx(`+${card.value} Dmg Up`, "info", "player");
            return;
        case 'damage_x':
            damage = (card.value * player.hand.length) + turnDamageBonus;
            break;
        case 'damage_equal_to_block':
            damage = player.block + turnDamageBonus;
            triggerVfx(`${damage} Block Slam!`, "info", "player");
            break;
        case 'damage_all':
             enemies.forEach(e => {
                 if (e.currentHp > 0) dealDamage(damage, e.id, true);
             });
             return; 
        case 'draw_cards':
            setPlayer(p => {
                const { deck, discard, hand } = drawCards(p.drawPile, p.discardPile, card.value);
                triggerVfx("Draw Cards", "info", "player");
                return { ...p, drawPile: deck, discardPile: discard, hand: [...p.hand, ...hand] };
            });
            break;
        case 'damage_prime':
            const t = getTarget();
             const isPrime = (num: number) => {
                if (num <= 1) return false;
                for(let i = 2, s = Math.sqrt(num); i <= s; i++)
                    if(num % i === 0) return false; 
                return true;
            }
            if (t && isPrime(t.currentHp)) {
                damage *= 2;
                triggerVfx("CRITICAL!", "damage", t.id);
            }
            break;
        case 'multi_hit':
             damage = card.value + turnDamageBonus;
             if (targetId) {
                setTimeout(() => dealDamage(damage, targetId, true), 100);
                setTimeout(() => dealDamage(damage, targetId, true), 300);
                setTimeout(() => dealDamage(damage, targetId, true), 500);
             }
             return;
        case 'multi_hit_2': // Chain calculation
             damage = card.value + turnDamageBonus;
             if (targetId) {
                setTimeout(() => dealDamage(damage, targetId, true), 100);
                setTimeout(() => dealDamage(damage, targetId, true), 400);
             }
             return;
        case 'swap_stats':
             setPlayer(p => {
                const newBlock = Math.min(10, p.currentHp); 
                const newHp = Math.min(p.maxHp, Math.max(1, p.block));
                triggerVfx("Swap!", "info", "player");
                return { ...p, currentHp: newHp, block: newBlock };
             });
             return;
        case 'block_slam':
            setPlayer(p => {
                const newBlock = p.block + block;
                triggerVfx(<ShieldIcon size={40} className="text-blue-400 fill-blue-900/50" />, "block", "player");
                if (targetId) dealDamage(newBlock + turnDamageBonus, targetId, true);
                return { ...p, block: newBlock };
            });
            return;
        case 'reckless_attack':
            setPlayer(p => {
                const selfDmg = 1; 
                triggerVfx(`-${selfDmg}`, "damage", "player");
                triggerPlayerShake();
                return { ...p, currentHp: Math.max(1, p.currentHp - selfDmg) };
            });
            break;
        case 'lifesteal':
             setPlayer(p => {
                 const heal = 1;
                 triggerVfx(`+${heal}`, "info", "player");
                 return { ...p, currentHp: Math.min(p.maxHp, p.currentHp + heal) };
             });
             break;
        case 'block_draw':
             setPlayer(p => {
                const { deck, discard, hand } = drawCards(p.drawPile, p.discardPile, 1);
                triggerVfx("Draw 1", "info", "player");
                triggerVfx(`+${block}`, "block", "player");
                return { ...p, block: p.block + block, drawPile: deck, discardPile: discard, hand: [...p.hand, ...hand] };
             });
             return;
        case 'upgrade_hand':
             setPlayer(p => {
                const otherCards = p.hand.filter(c => c.id !== card.id);
                let newHand = [...p.hand];
                if (otherCards.length > 0) {
                    const randomCard = otherCards[Math.floor(Math.random() * otherCards.length)];
                    const upgradedCard = { ...randomCard, value: randomCard.value + 3, name: randomCard.name + "+" };
                    triggerVfx("Card Upgraded!", "info", "player");
                    newHand = p.hand.map(c => c.id === randomCard.id ? upgradedCard : c);
                }
                triggerVfx(`+${block}`, "block", "player");
                return { ...p, block: p.block + block, hand: newHand };
             });
             return;
        case 'block_damage':
             setPlayer(p => {
                 triggerVfx("Keep Change!", "info", "player"); 
                 triggerVfx(`+1`, "block", "player");
                 return { ...p, block: p.block + 1 };
             });
             damage = 2 + turnDamageBonus; 
             if (targetId) dealDamage(damage, targetId, true);
             return;
        case 'damage_discard':
             if (targetId) dealDamage(damage, targetId, true);
             setPlayer(p => {
                 const otherCards = p.hand.filter(c => c.id !== card.id);
                 if (otherCards.length === 0) return p;
                 const randomIdx = Math.floor(Math.random() * otherCards.length);
                 const toDiscard = otherCards[randomIdx];
                 triggerVfx("Discarded!", "info", "player");
                 return {
                     ...p,
                     hand: p.hand.filter(c => c.id !== toDiscard.id), 
                     discardPile: [...p.discardPile, toDiscard]
                 };
             });
             return;
    }

    if (isTargetedEffect(card.effectId) && targetId) {
        dealDamage(damage, targetId, true); 
    } else if (card.type === 'skill' && (card.effectId === 'gain_block' || card.effectId === 'gain_block_heavy')) {
        setPlayer(p => ({ ...p, block: p.block + block }));
        triggerVfx(<ShieldIcon size={40} className="text-blue-400 fill-blue-900/50" />, "block", "player");
        triggerVfx(`+${block}`, "info", "player");
    }
  };

  const dealDamage = (amount: number, targetId: string, isPlayerSource: boolean) => {
    if (isPlayerSource) {
        setEnemies(prev => prev.map(e => {
            if (e.id === targetId) {
                const newHp = e.currentHp - amount;
                triggerVfx(amount.toString(), "damage", e.id);
                triggerEnemyShake(e.id);
                return { ...e, currentHp: newHp };
            }
            return e;
        }));
    } else {
        setPlayer(prev => {
            const blocked = Math.min(prev.block, amount);
            const unblocked = amount - blocked;
            if (blocked > 0) {
                triggerVfx(`Blocked ${blocked}`, "block", "player");
                setPlayerBlockAnim(true);
                setTimeout(() => setPlayerBlockAnim(false), 600); 
            }
            if (unblocked > 0) {
                triggerVfx(unblocked.toString(), "damage", "player");
                triggerPlayerShake();
            } else {
                triggerVfx("Blocked!", "block", "player");
            }
            return {
                ...prev,
                block: prev.block - blocked,
                currentHp: prev.currentHp - unblocked
            };
        });
    }
  };

  useEffect(() => {
    if (enemies.length > 0 && enemies.every(e => e.currentHp <= 0)) {
        setTurnPhase('END');
        addLog(`Victory!`);
        setTimeout(() => onVictory(player.currentHp), 1500);
    }
  }, [enemies, onVictory, player.currentHp]);

  useEffect(() => {
    if (player.currentHp <= 0) {
        setTurnPhase('END');
        onDefeat();
    }
  }, [player.currentHp, onDefeat]);

  const endTurn = async () => {
    setTurnPhase('ENEMY_ANIMATING');
    addLog("--- Enemy Turn ---");
    const livingEnemies = enemies.filter(e => e.currentHp > 0);
    for (const enemy of livingEnemies) {
        await processEnemyTurn(enemy);
    }
    setEnemies(prev => prev.map(e => {
        if (e.currentHp > 0) return { ...e, intent: getRandomIntent() };
        return e;
    }));
    setTurnPhase('PLAYER'); 
    startTurn();
  };

  const processEnemyTurn = (enemy: Enemy): Promise<void> => {
      return new Promise(resolve => {
        setTimeout(() => {
            const intent = enemy.intent;
            if (intent.type === 'attack') {
                setEnemyAnimStates(prev => ({ ...prev, [enemy.id]: 'attack' }));
                setTimeout(() => {
                    dealDamage(intent.value, 'player', false); 
                    setEnemyAnimStates(prev => ({ ...prev, [enemy.id]: 'idle' }));
                    resolve();
                }, 500);
            } else {
                if (intent.type === 'defend') {
                    addLog(`${enemy.name} gains block.`);
                    triggerVfx("Shield Up", "block", enemy.id);
                } else if (intent.type === 'buff') {
                    triggerVfx("Buff!", "info", enemy.id);
                }
                setTimeout(resolve, 500);
            }
        }, 600);
      });
  };

  const getRandomIntent = () => {
      const r = Math.random();
      if (r > 0.6) return { type: 'attack' as const, value: Math.floor(Math.random() * 2) + 1 };
      if (r > 0.3) return { type: 'defend' as const, value: 3 };
      return { type: 'attack' as const, value: 4 };
  };

  // ... Render ...
  return (
    <div className="h-full flex flex-row relative overflow-hidden bg-slate-900 select-none">
      {/* Background Layer */}
      {backgroundImage ? (
          <div className="absolute inset-0 z-0">
              <img src={backgroundImage} alt="Battle Background" className="w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-transparent to-black/80"></div>
          </div>
      ) : (
          <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black"></div>
      )}

      {showTutorial && <TutorialModal onClose={onTutorialComplete} />}

      {turnPhase === 'MATH_CHALLENGE' && activeProblem && pendingCard && (
          <MathModal 
            problem={activeProblem} 
            cardName={pendingCard.name}
            onAnswer={handleMathAnswer}
          />
      )}

      {turnPhase === 'TARGETING' && (
          <div className="absolute top-20 left-0 w-full text-center z-50 pointer-events-none">
              <div className="inline-block bg-black/70 px-8 py-3 rounded-full border-2 border-red-500 animate-pulse">
                  <span className="text-2xl font-bold text-red-100 flex items-center gap-3">
                      <Target className="animate-spin-slow" /> SELECT TARGET
                  </span>
              </div>
          </div>
      )}

      {effects.map(effect => (
          <div 
            key={effect.id}
            className={`absolute z-50 pointer-events-none font-bold text-4xl drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] animate-float-damage
                ${effect.type === 'damage' ? 'text-red-500' : effect.type === 'block' ? 'text-blue-400' : 'text-yellow-300'}`}
            style={{ left: `${effect.x}%`, top: `${effect.y}%` }}
          >
              {effect.text}
          </div>
      ))}
      
      {playerFlash && <div className="absolute inset-0 bg-red-500/20 z-40 animate-flash-hit pointer-events-none" />}

      {/* LEFT PANEL: Combat Arena + Hand */}
      <div className="flex-1 flex flex-col justify-between p-4 relative z-10">
        <div className="flex-1 flex items-center justify-between px-10 md:px-20 relative pt-10">
            <div className={`transition-transform duration-100 ${playerShake ? 'translate-x-[-10px] grayscale' : ''}`}>
                 <div className="relative">
                      {turnDamageBonus > 0 && (
                          <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-bounce-slow">
                              <div className="bg-red-600 text-white px-3 py-1 rounded-full border-2 border-red-400 font-bold text-xs shadow-lg mb-1">
                                  +{turnDamageBonus} DMG
                              </div>
                          </div>
                      )}
                      <PlayerComponent player={player} isBlocking={playerBlockAnim} />
                 </div>
            </div>

            <div className="flex items-end justify-center gap-4 min-w-[300px]">
                {enemies.filter(e => e.currentHp > 0).map(enemy => (
                    <div key={enemy.id} className="relative">
                         {enemyFlashes[enemy.id] && <div className="absolute inset-0 w-full h-full bg-white/50 z-20 animate-slash rotate-45 scale-150" style={{ background: 'linear-gradient(transparent, white, transparent)'}}></div>}
                         <EnemyComponent 
                            enemy={enemy} 
                            animationState={enemyAnimStates[enemy.id]} 
                            isTargetable={turnPhase === 'TARGETING'}
                            onClick={() => handleEnemyClick(enemy)}
                        />
                    </div>
                ))}
            </div>
        </div>

        <div className="h-[35%] flex flex-col justify-end relative z-20">
            <div className="absolute left-10 top-0 z-20 flex flex-col items-center">
                <div className="relative group">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 shadow-[0_0_20px_rgba(245,158,11,0.6)] flex items-center justify-center border-4 border-amber-200">
                        <Zap className="fill-white text-white w-8 h-8" />
                        <span className="text-3xl font-bold text-white drop-shadow-md ml-1">{player.energy}/{player.maxEnergy}</span>
                    </div>
                </div>
            </div>

            <div className="absolute left-4 bottom-4 text-xs font-bold text-slate-500 flex flex-col gap-1">
                <div className="bg-slate-800 px-2 py-1 rounded border border-slate-700">Draw: {player.drawPile.length}</div>
                <div className="bg-slate-800 px-2 py-1 rounded border border-slate-700">Discard: {player.discardPile.length}</div>
            </div>

            <div className="absolute right-4 top-0 z-20">
                <button 
                    disabled={turnPhase !== 'PLAYER' || showTutorial}
                    onClick={endTurn}
                    className="bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-3 px-8 rounded-full shadow-lg border-2 border-amber-400 disabled:border-slate-600 transition-all active:scale-95 flex items-center gap-2 hover:shadow-amber-500/20"
                >
                    End Turn <RotateCcw size={18} />
                </button>
            </div>

            {turnPhase === 'TARGETING' && (
                <div className="absolute left-1/2 -translate-x-1/2 -top-10 z-30">
                    <button 
                        onClick={() => { setTurnPhase('PLAYER'); setPendingCard(null); }}
                        className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-1 rounded shadow border border-slate-500"
                    >
                        Cancel Selection
                    </button>
                </div>
            )}

            <div className="flex justify-center items-end w-full px-10 pb-4 h-full">
                {player.hand.map((card, idx) => {
                    const totalCards = player.hand.length;
                    const middleIndex = (totalCards - 1) / 2;
                    const offset = idx - middleIndex;
                    const rotation = offset * 5; 
                    const translateY = Math.abs(offset) * 10; 
                    const isSelected = pendingCard?.id === card.id;
                    const isHovered = hoveredCardId === card.id;

                    const style = {
                        marginLeft: idx === 0 ? 0 : '-35px',
                        zIndex: isSelected ? 50 : (isHovered ? 40 : idx),
                        transform: isSelected 
                            ? 'translateY(-120px) scale(1.2) rotate(0deg)' 
                            : isHovered 
                                ? 'translateY(-100px) scale(1.2) rotate(0deg)' 
                                : `rotate(${rotation}deg) translateY(${translateY}px)`,
                        transition: 'transform 0.2s cubic-bezier(0.1, 0.7, 0.1, 1), margin 0.2s',
                    };

                    return (
                        <div 
                            key={card.id + idx} 
                            style={style}
                            onMouseEnter={() => setHoveredCardId(card.id)}
                            onMouseLeave={() => setHoveredCardId(null)}
                            className="relative origin-bottom"
                        >
                            <div className="animate-card-enter" style={{ animationDelay: `${idx * 100}ms` }}>
                                <CardComponent 
                                    card={card} 
                                    onClick={handleCardClick}
                                    disabled={turnPhase !== 'PLAYER' && turnPhase !== 'TARGETING'} 
                                    playable={player.energy >= card.cost}
                                    noAnim={true} 
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      </div>

      <div className="w-72 h-full bg-slate-950/80 border-l border-slate-800 p-4 flex flex-col backdrop-blur-md relative z-10">
          <div className="flex items-center gap-2 mb-4 text-amber-500 border-b border-slate-800 pb-2">
              <ScrollText size={20} />
              <h3 className="font-serif font-bold uppercase tracking-wider text-sm">Combat Log</h3>
          </div>
          <div 
            ref={logContainerRef}
            className="flex-1 overflow-y-auto space-y-3 text-sm text-slate-400 pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
          >
              {combatLog.map((log, i) => (
                  <div key={i} className="animate-fade-in border-l-2 border-slate-700 pl-2 py-1 leading-snug">
                      {log}
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
};
