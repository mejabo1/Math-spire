
import { Card, Enemy, MapNode } from './types';

export const INITIAL_PLAYER_HP = 30;
export const INITIAL_MAX_ENERGY = 3;
export const HAND_SIZE = 5;

// IMPORTANT: This must be a direct link to an image file (ending in .jpg, .png, etc.), not a website URL.
// Using a dark fantasy castle/dungeon interior for the battle background.
export const CUSTOM_BACKGROUND = "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=2069&auto=format&fit=crop";

// --- CARD LIBRARY ---

export const CARDS: Record<string, Omit<Card, 'id'>> = {
  strike: {
    name: 'Integer Strike',
    type: 'attack',
    cost: 1,
    value: 2,
    description: 'Deal 2 damage.',
    effectId: 'deal_damage',
    rarity: 'common',
    mathType: 'integer'
  },
  defend: {
    name: 'Absolute Shield',
    type: 'skill',
    cost: 2,
    value: 5,
    description: 'Gain 5 Block.',
    effectId: 'gain_block',
    rarity: 'common',
    mathType: 'addition'
  },
  subtraction: {
    name: 'Quick Minus',
    type: 'attack',
    cost: 0,
    value: 1,
    description: 'Deal 1 damage.',
    effectId: 'deal_damage',
    rarity: 'common',
    mathType: 'subtraction'
  },
  multiply_slam: {
    name: 'Multiply Slam',
    type: 'attack',
    cost: 2,
    value: 0,
    description: 'Deal damage equal to your current Block.',
    effectId: 'damage_equal_to_block',
    rarity: 'rare',
    mathType: 'multiplication'
  },
  divided_cleave: {
    name: 'Divided Cleave',
    type: 'attack',
    cost: 2,
    value: 4,
    description: 'Deal 4 damage to ALL enemies.',
    effectId: 'damage_all',
    rarity: 'rare',
    mathType: 'division'
  },
  // --- EXISTING REWARD CARDS ---
  greater_exponentially: {
    name: 'Greater Exponentially',
    type: 'skill',
    cost: 1,
    value: 3,
    description: 'Gain 3 Block. Upgrade a random card in hand.',
    effectId: 'upgrade_hand',
    rarity: 'rare',
    mathType: 'exponent'
  },
  keep_change_change: {
    name: 'Keep Change Change',
    type: 'attack',
    cost: 1,
    value: 2,
    description: 'Gain 1 Block. Deal 2 damage.',
    effectId: 'block_damage',
    rarity: 'common',
    mathType: 'integer'
  },
  aggressive_multiplied: {
    name: 'Aggressive Multiplied',
    type: 'attack',
    cost: 1,
    value: 4,
    description: 'Deal 4 damage. Discard a random card.',
    effectId: 'damage_discard',
    rarity: 'common',
    mathType: 'multiplication'
  },
  // --- NEW REQUESTED CARDS ---
  pop_quiz: {
    name: 'Pop Quiz',
    type: 'skill',
    cost: 1,
    value: 2,
    description: 'Gain 2 Energy. Exhausts if math answer is wrong.',
    effectId: 'gain_energy',
    rarity: 'common'
    // Random math topic by default (undefined mathType)
  },
  show_your_work: {
    name: 'Show Your Work',
    type: 'skill',
    cost: 1,
    value: 4,
    description: 'Gain 4 Block.',
    effectId: 'gain_block',
    rarity: 'common'
  },
  factor_defense: {
    name: 'Factor Defense',
    type: 'skill',
    cost: 1,
    value: 0,
    description: 'Gain Block equal to cards in hand.',
    effectId: 'block_hand_size',
    rarity: 'rare',
    mathType: 'factorization'
  },
  order_of_ops: {
    name: 'Order of Ops',
    type: 'attack',
    cost: 1,
    value: 3,
    description: 'Deal 3 damage. Incorrect answer reduces Block by 2.',
    effectId: 'deal_damage', // Penalty handled in combat logic via "risk" check or just basic damage for now
    rarity: 'common',
    mathType: 'pemdas'
  },
  chain_calculation: {
    name: 'Chain Calculation',
    type: 'attack',
    cost: 2,
    value: 3,
    description: 'Deal 3 damage 2 times.',
    effectId: 'multi_hit_2', // Simplified from "solve 2 problems" to "multi-hit" for engine stability
    rarity: 'rare',
    mathType: 'arithmetic'
  },
  divided_fraction_split: {
    name: 'Divided Fraction Split',
    type: 'attack',
    cost: 2,
    value: 2,
    description: 'Deal 2 damage to ALL enemies.',
    effectId: 'damage_all',
    rarity: 'rare',
    mathType: 'division' // Fraction division specific in generator
  },
  variable_strike: {
    name: 'Variable Strike',
    type: 'attack',
    cost: 3,
    value: 0,
    description: 'Deal damage equal to cards in hand. Draw 1 card.',
    effectId: 'damage_x_draw',
    rarity: 'epic',
    mathType: 'algebra'
  },
  absolute_value: {
    name: 'Absolute Value',
    type: 'power', 
    cost: 1,
    value: 2,
    description: 'Gain 2 Strength (Damage) for this combat.',
    effectId: 'buff_damage',
    rarity: 'rare',
    mathType: 'absolute_value'
  },
  balance_equation: {
    name: 'Balance Equation',
    type: 'skill',
    cost: 1,
    value: 0,
    description: 'Gain Block equal to the target enemy\'s HP.',
    effectId: 'block_enemy',
    rarity: 'epic',
    mathType: 'algebra'
  }
};

export const REWARD_POOL_IDS = [
  'greater_exponentially',
  'keep_change_change',
  'aggressive_multiplied',
  'pop_quiz',
  'show_your_work',
  'factor_defense',
  'order_of_ops',
  'chain_calculation',
  'divided_fraction_split',
  'variable_strike',
  'absolute_value',
  'balance_equation'
];

export const STARTING_DECK_IDS = [
  'strike', 'strike', 'strike', 
  'defend', 'defend',
  'subtraction',
  'multiply_slam',
  'divided_cleave'
];

// --- PLAYER SPRITE ---
export const PLAYER_SPRITE = `data:image/svg+xml;utf8,<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><path d="M60 140 Q60 180 140 180 Q140 140 140 140 L130 90 L70 90 Z" fill="%233b82f6" stroke="%231e3a8a" stroke-width="3"/><path d="M70 90 L50 130" stroke="%231e3a8a" stroke-width="3" fill="none"/><path d="M130 90 L150 130" stroke="%231e3a8a" stroke-width="3" fill="none"/><path d="M75 90 L75 140" stroke="%231f2937" stroke-width="4"/><path d="M125 90 L125 140" stroke="%231f2937" stroke-width="4"/><circle cx="100" cy="70" r="35" fill="%23fca5a5" stroke="%237f1d1d" stroke-width="3"/><circle cx="90" cy="70" r="8" fill="%23e0f2fe" stroke="black" stroke-width="2"/><circle cx="110" cy="70" r="8" fill="%23e0f2fe" stroke="black" stroke-width="2"/><line x1="98" y1="70" x2="102" y2="70" stroke="black" stroke-width="2"/><path d="M65 70 Q70 30 100 30 Q130 30 135 70" fill="%234b5563" stroke="black" stroke-width="2"/><rect x="140" y="40" width="15" height="120" fill="%23facc15" stroke="%23854d0e" stroke-width="2" transform="rotate(15 140 100)"/><polygon points="135,35 155,35 145,15" fill="%23fbcfe8" stroke="%23be185d" stroke-width="2" transform="rotate(15 140 100)"/><polygon points="140,160 155,160 147.5,180" fill="%23fcd34d" stroke="%23854d0e" stroke-width="2" transform="rotate(15 140 100)"/><polygon points="144,175 151,175 147.5,180" fill="black" transform="rotate(15 140 100)"/></svg>`;

// --- ENEMY SPRITES (SVG Data URIs) ---

const SVG_TRIANGLE = `data:image/svg+xml;utf8,<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M50 10 L90 90 L10 90 Z" fill="%23ef4444" stroke="%237f1d1d" stroke-width="3"/><circle cx="40" cy="50" r="5" fill="white"/><circle cx="60" cy="50" r="5" fill="white"/><path d="M40 70 Q50 60 60 70" stroke="black" stroke-width="3" fill="none"/></svg>`;

const SVG_ALGEBRA_IMP = `data:image/svg+xml;utf8,<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="20" y="20" width="60" height="60" rx="10" fill="%238b5cf6" stroke="%234c1d95" stroke-width="3"/><text x="50" y="65" font-family="monospace" font-size="40" fill="white" text-anchor="middle" font-weight="bold">x</text><path d="M30 30 L40 40 M70 30 L60 40" stroke="black" stroke-width="3"/></svg>`;

const SVG_FRACTION_PHANTOM = `data:image/svg+xml;utf8,<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" fill="%233b82f6" opacity="0.8"/><line x1="20" y1="50" x2="80" y2="50" stroke="white" stroke-width="4"/><circle cx="35" cy="35" r="4" fill="white"/><circle cx="65" cy="35" r="4" fill="white"/><path d="M40 70 Q50 60 60 70" stroke="white" stroke-width="2" fill="none"/></svg>`;

const SVG_BOSS_POLYGONE = `data:image/svg+xml;utf8,<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><polygon points="50 5, 95 27, 95 72, 50 95, 5 72, 5 27" fill="%231e293b" stroke="%23fbbf24" stroke-width="4"/><circle cx="35" cy="40" r="6" fill="%23ef4444" className="animate-pulse"/><circle cx="65" cy="40" r="6" fill="%23ef4444" className="animate-pulse"/><path d="M30 70 Q50 85 70 70" stroke="%23fbbf24" stroke-width="3" fill="none"/></svg>`;


// --- ENEMIES ---

export const ENEMIES: Enemy[] = [
  {
    id: 'basic_shape',
    name: 'Angry Triangle',
    maxHp: 10,
    currentHp: 10,
    intent: { type: 'attack', value: 5 },
    image: SVG_TRIANGLE
  },
  {
    id: 'algebra_imp',
    name: 'Algebra Imp',
    maxHp: 5,
    currentHp: 5,
    intent: { type: 'defend', value: 6 },
    image: SVG_ALGEBRA_IMP
  },
  {
    id: 'fraction_phantom',
    name: 'Fraction Phantom',
    maxHp: 45,
    currentHp: 45,
    intent: { type: 'attack', value: 7 },
    image: SVG_FRACTION_PHANTOM
  },
  {
    id: 'boss_geometry',
    name: 'The Poly-Gone',
    maxHp: 100,
    currentHp: 100,
    intent: { type: 'buff', value: 0 },
    image: SVG_BOSS_POLYGONE
  }
];

// --- MAP GENERATION HELPERS ---

export const GENERATE_MAP = (): MapNode[] => {
    // Simplified 3-tier map
    const nodes: MapNode[] = [];
    
    // Tier 1: 3 Combat Rooms
    nodes.push({ id: '1-1', type: 'combat', x: 20, y: 80, next: ['2-1', '2-2'], completed: false });
    nodes.push({ id: '1-2', type: 'combat', x: 50, y: 80, next: ['2-2'], completed: false });
    nodes.push({ id: '1-3', type: 'combat', x: 80, y: 80, next: ['2-2', '2-3'], completed: false });

    // Tier 2: Event or Elite
    nodes.push({ id: '2-1', type: 'event', x: 30, y: 50, next: ['3-1'], completed: false });
    nodes.push({ id: '2-2', type: 'elite', x: 50, y: 50, next: ['3-1'], completed: false });
    nodes.push({ id: '2-3', type: 'rest', x: 70, y: 50, next: ['3-1'], completed: false });

    // Tier 3: Boss
    nodes.push({ id: '3-1', type: 'boss', x: 50, y: 20, next: [], completed: false });

    return nodes;
};
