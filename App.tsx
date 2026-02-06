
import React, { useState, useCallback } from 'react';
import { GameState, Card, MapNode, Player, Enemy } from './types';
import { CARDS, STARTING_DECK_IDS, ENEMIES, GENERATE_MAP, INITIAL_PLAYER_HP, INITIAL_MAX_ENERGY } from './constants';
import { GameMap } from './components/GameMap';
import { Combat } from './components/Combat';
import { EventRoom } from './components/EventRoom';
import { CardReward } from './components/CardReward';
import { Play, RotateCw } from 'lucide-react';

const createInitialDeck = (): Card[] => {
    return STARTING_DECK_IDS.map(id => ({
        ...CARDS[id],
        id: id + Math.random().toString(36).substr(2, 9)
    }) as Card);
};

const INITIAL_STATE: GameState = {
    screen: 'MENU',
    player: {
        maxHp: INITIAL_PLAYER_HP,
        currentHp: INITIAL_PLAYER_HP,
        energy: INITIAL_MAX_ENERGY,
        maxEnergy: INITIAL_MAX_ENERGY,
        block: 0,
        deck: [],
        discardPile: [],
        drawPile: [],
        hand: [],
        relics: []
    },
    currentEnemies: [],
    floor: 1,
    map: [],
    currentMapNodeId: null,
    tutorialSeen: false,
};

const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);

    const startGame = () => {
        const deck = createInitialDeck();
        setGameState({
            ...INITIAL_STATE,
            screen: 'MAP',
            map: GENERATE_MAP(),
            player: {
                ...INITIAL_STATE.player,
                deck: deck,
                drawPile: [...deck] // Initialize draw pile for safety, though combat resets it
            }
        });
    };

    const handleNodeSelect = (node: MapNode) => {
        
        let nextScreen: GameState['screen'] = 'COMBAT'; // Default
        let enemies: Enemy[] = [];
        let isCombatNode = false;

        if (node.type === 'combat') {
            nextScreen = 'COMBAT';
            isCombatNode = true;
            
            // Check tier for difficulty scaling
            // Tier 1 nodes start with '1-'. 
            // For the first battles, we limit enemies to 1-2 to ease the player in.
            const isFirstTier = node.id.startsWith('1-');
            
            // Tier 1: 1-2 enemies. Later: 2-3 enemies.
            const min = isFirstTier ? 1 : 2;
            const max = isFirstTier ? 2 : 3;
            const count = Math.floor(Math.random() * (max - min + 1)) + min;
            
            const pool = [ENEMIES[0], ENEMIES[1]];
            
            for(let i=0; i<count; i++) {
                const template = pool[Math.floor(Math.random() * pool.length)];
                enemies.push({
                    ...template,
                    id: `${template.id}-${Date.now()}-${i}`,
                    currentHp: template.maxHp
                });
            }

        } else if (node.type === 'elite') {
            nextScreen = 'COMBAT';
            isCombatNode = true;
             // Generate 2 stronger enemies
             const pool = [ENEMIES[1], ENEMIES[2]]; // Imp, Phantom
             for(let i=0; i<2; i++) {
                const template = pool[Math.floor(Math.random() * pool.length)];
                enemies.push({
                    ...template,
                    id: `${template.id}-${Date.now()}-${i}`,
                    currentHp: template.maxHp
                });
            }

        } else if (node.type === 'boss') {
            nextScreen = 'COMBAT';
            isCombatNode = true;
            const template = ENEMIES[3];
            enemies.push({
                ...template,
                id: 'boss-1',
                currentHp: template.maxHp
            });
        } else if (node.type === 'event') {
            nextScreen = 'EVENT';
        } else if (node.type === 'rest') {
            nextScreen = 'REWARD';
        }

        setGameState(prev => {
            let updatedPlayer = { ...prev.player };
            
            // CRITICAL FIX: Reset the player's combat piles when entering a new combat.
            // This ensures that the Draw Pile is refreshed from the Master Deck,
            // including any newly acquired cards.
            if (isCombatNode) {
                updatedPlayer.drawPile = [...updatedPlayer.deck].sort(() => Math.random() - 0.5);
                updatedPlayer.discardPile = [];
                updatedPlayer.hand = [];
                updatedPlayer.block = 0;
                updatedPlayer.energy = updatedPlayer.maxEnergy;
            }

            return {
                ...prev,
                screen: nextScreen,
                currentEnemies: enemies,
                currentMapNodeId: node.id,
                map: prev.map.map(n => n.id === node.id ? { ...n, completed: true } : n),
                player: updatedPlayer
            };
        });
    };

    const handleCombatVictory = (remainingHp: number) => {
        setGameState(prev => ({
            ...prev,
            screen: 'REWARD',
            currentEnemies: [],
            player: { ...prev.player, currentHp: remainingHp }
        }));
    };

    const handleCombatDefeat = () => {
        setGameState(prev => ({ ...prev, screen: 'GAME_OVER' }));
    };

    const handleTutorialComplete = () => {
        setGameState(prev => ({ ...prev, tutorialSeen: true }));
    };

    const handleEventComplete = (reward: boolean) => {
        setGameState(prev => {
            let newPlayer = { ...prev.player };
            if (reward) {
                // Grant reward (Max HP Up)
                newPlayer.maxHp += 10;
                newPlayer.currentHp += 10;
            }
            return {
                ...prev,
                screen: 'MAP',
                player: newPlayer
            };
        });
    };

    const handleCardRewardSelect = (card: Card) => {
        setGameState(prev => {
            // Assign a unique ID to the new card
            const newCard = { ...card, id: card.id + Math.random().toString(36).substr(2, 5) };
            
            // Also heal the player a bit since it's a "Rest" site or Combat Victory
            const healAmount = 5;
            const newHp = Math.min(prev.player.maxHp, prev.player.currentHp + healAmount);
            
            const newDeck = [...prev.player.deck, newCard];
            console.log("Adding card to deck:", newCard.name);
            console.log("New Deck Size:", newDeck.length);

            return {
                ...prev,
                screen: 'MAP',
                player: {
                    ...prev.player,
                    deck: newDeck,
                    currentHp: newHp
                }
            };
        });
    };

    const getCurrentNodeType = () => {
        return gameState.map.find(n => n.id === gameState.currentMapNodeId)?.type || 'combat';
    }

    return (
        <div className="w-screen h-screen bg-black text-white overflow-hidden">
            {gameState.screen === 'MENU' && (
                <div className="flex flex-col items-center justify-center h-full bg-slate-900 bg-[url('https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center">
                    <div className="bg-black/60 p-10 rounded-2xl backdrop-blur-sm text-center border border-white/10">
                        <h1 className="text-6xl font-serif mb-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500 drop-shadow-lg">MATH SPIRE</h1>
                        <p className="text-xl text-gray-300 mb-8 font-light">Climb the tower. Solve the equations.</p>
                        <button 
                            onClick={startGame}
                            className="bg-red-700 hover:bg-red-600 text-white font-bold py-4 px-12 rounded-full shadow-[0_0_20px_rgba(185,28,28,0.5)] transition-all hover:scale-105 flex items-center gap-3 mx-auto text-xl"
                        >
                            <Play fill="white" /> Start Journey
                        </button>
                    </div>
                </div>
            )}

            {gameState.screen === 'MAP' && (
                <GameMap 
                    mapNodes={gameState.map} 
                    currentNodeId={gameState.currentMapNodeId}
                    onNodeSelect={handleNodeSelect}
                />
            )}

            {gameState.screen === 'COMBAT' && (
                <Combat 
                    player={gameState.player}
                    enemies={gameState.currentEnemies}
                    onVictory={handleCombatVictory}
                    onDefeat={handleCombatDefeat}
                    showTutorial={!gameState.tutorialSeen}
                    onTutorialComplete={handleTutorialComplete}
                />
            )}

            {gameState.screen === 'EVENT' && (
                <EventRoom onComplete={handleEventComplete} />
            )}

            {gameState.screen === 'REWARD' && (
                <CardReward 
                    onSelect={handleCardRewardSelect} 
                    type={getCurrentNodeType() === 'rest' ? 'rest' : 'combat'} 
                />
            )}

            {gameState.screen === 'GAME_OVER' && (
                <div className="flex flex-col items-center justify-center h-full bg-red-950/90 text-center">
                    <h2 className="text-6xl font-serif text-red-500 mb-4">DEFEAT</h2>
                    <p className="text-2xl text-red-200 mb-8">The numbers were too strong.</p>
                    <button 
                        onClick={() => setGameState(INITIAL_STATE)}
                        className="bg-white text-red-900 font-bold py-3 px-8 rounded hover:bg-gray-200 flex items-center gap-2"
                    >
                       <RotateCw /> Try Again
                    </button>
                </div>
            )}
        </div>
    );
};

export default App;
