
export type CardType = 'attack' | 'skill' | 'power';

export type MathTopic = 'arithmetic' | 'algebra' | 'geometry' | 'percentage' | 'addition' | 'subtraction' | 'integer' | 'multiplication' | 'division' | 'exponent' | 'factorization' | 'pemdas' | 'absolute_value';

export interface Card {
  id: string;
  name: string;
  type: CardType;
  cost: number;
  value: number; // Damage or Block amount
  description: string;
  effectId: string; // ID to map to logic
  rarity: 'common' | 'rare' | 'epic';
  mathType?: MathTopic; // Optional: Force a specific math problem type for this card
}

export interface EnemyIntent {
  type: 'attack' | 'defend' | 'buff' | 'debuff';
  value: number;
}

export interface Enemy {
  id: string;
  name: string;
  maxHp: number;
  currentHp: number;
  intent: EnemyIntent;
  image: string;
}

export interface Player {
  maxHp: number;
  currentHp: number;
  energy: number;
  maxEnergy: number;
  block: number;
  deck: Card[];
  discardPile: Card[];
  drawPile: Card[];
  hand: Card[];
  relics: string[];
}

export type GameScreen = 'MENU' | 'MAP' | 'COMBAT' | 'EVENT' | 'REWARD' | 'GAME_OVER' | 'VICTORY';

export interface GameState {
  screen: GameScreen;
  player: Player;
  currentEnemies: Enemy[]; // Changed from single currentEnemy
  floor: number;
  map: MapNode[];
  currentMapNodeId: string | null;
  tutorialSeen: boolean;
}

export type RoomType = 'combat' | 'elite' | 'event' | 'rest' | 'boss';

export interface MapNode {
  id: string;
  type: RoomType;
  x: number;
  y: number;
  next: string[]; // IDs of connected next nodes
  completed: boolean;
}
