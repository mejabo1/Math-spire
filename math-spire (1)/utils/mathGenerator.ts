
import { MathTopic } from '../types';

export interface MathProblem {
  question: string;
  options: string[];
  correctAnswer: string;
  topic: string;
}

const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export const generateProblem = (forcedTopic?: MathTopic): MathProblem => {
  let type = forcedTopic;
  
  if (!type) {
    const types: MathTopic[] = ['arithmetic', 'algebra', 'geometry', 'percentage'];
    // Weight arithmetic higher as it's the fastest to solve
    const r = Math.random();
    if (r > 0.5) type = 'arithmetic';
    else if (r > 0.35) type = 'algebra';
    else if (r > 0.2) type = 'geometry';
    else type = 'percentage';
  }

  switch (type) {
    case 'addition': return generateAddition();
    case 'subtraction': return generateSubtraction();
    case 'multiplication': return generateMultiplication();
    case 'division': return generateDivision();
    case 'integer': return generateIntegerProblem();
    case 'exponent': return generateExponent();
    case 'arithmetic': return generateArithmetic();
    case 'algebra': return generateAlgebra();
    case 'geometry': return generateGeometry();
    case 'percentage': return generatePercentage();
    case 'factorization': return generateFactorization();
    case 'pemdas': return generatePEMDAS();
    case 'absolute_value': return generateAbsoluteValue();
    default: return generateArithmetic();
  }
};

const generateOptions = (correct: number | string, type: 'number' | 'string' = 'number'): string[] => {
  const options = new Set<string>();
  options.add(correct.toString());

  while (options.size < 4) {
    let wrong: string | number = "";
    if (type === 'number') {
      const num = Number(correct);
      // Generate close numbers for distraction but not too tricky
      wrong = num + getRandomInt(-5, 5);
      if (wrong === num) wrong = num + 1;
    } else {
        wrong = (Number(correct) + getRandomInt(1, 10)).toString(); 
    }
    options.add(wrong.toString());
  }
  return Array.from(options).sort(() => Math.random() - 0.5);
};

// ... Basic generators ...
const generateAddition = (): MathProblem => {
  const a = getRandomInt(10, 99);
  const b = getRandomInt(10, 99);
  const ans = a + b;
  return { question: `${a} + ${b} = ?`, options: generateOptions(ans), correctAnswer: ans.toString(), topic: 'Addition' };
};

const generateSubtraction = (): MathProblem => {
  const a = getRandomInt(20, 99);
  const b = getRandomInt(10, a - 1);
  const ans = a - b;
  return { question: `${a} - ${b} = ?`, options: generateOptions(ans), correctAnswer: ans.toString(), topic: 'Subtraction' };
};

const generateMultiplication = (): MathProblem => {
  const a = getRandomInt(3, 15);
  const b = getRandomInt(3, 12);
  const ans = a * b;
  return { question: `${a} × ${b} = ?`, options: generateOptions(ans), correctAnswer: ans.toString(), topic: 'Multiplication' };
};

const generateDivision = (): MathProblem => {
  const b = getRandomInt(3, 12);
  const ans = getRandomInt(4, 15);
  const a = b * ans;
  return { question: `${a} ÷ ${b} = ?`, options: generateOptions(ans), correctAnswer: ans.toString(), topic: 'Division' };
};

const generateIntegerProblem = (): MathProblem => {
  const ops = ['+', '-'];
  const op = ops[getRandomInt(0, 1)];
  let a = getRandomInt(-15, 15);
  let b = getRandomInt(-15, 15);
  const bStr = b < 0 ? `(${b})` : `${b}`;
  let ans = op === '+' ? a + b : a - b;
  return { question: `${a} ${op} ${bStr} = ?`, options: generateOptions(ans), correctAnswer: ans.toString(), topic: 'Integers' };
};

const generateExponent = (): MathProblem => {
    const base = getRandomInt(2, 9);
    const power = base <= 3 ? getRandomInt(2, 4) : 2;
    const ans = Math.pow(base, power);
    return { question: `${base}^${power} = ?`, options: generateOptions(ans), correctAnswer: ans.toString(), topic: 'Exponents' };
};

const generateArithmetic = (): MathProblem => {
  const ops = ['+', '-', '*'];
  const op = ops[getRandomInt(0, 2)];
  let a = 0, b = 0, ans = 0;
  if (op === '*') { a = getRandomInt(2, 9); b = getRandomInt(2, 9); ans = a * b; }
  else if (op === '-') { a = getRandomInt(5, 20); b = getRandomInt(1, a - 1); ans = a - b; }
  else { a = getRandomInt(2, 15); b = getRandomInt(2, 10); ans = a + b; }
  return { question: `${a} ${op} ${b} = ?`, options: generateOptions(ans), correctAnswer: ans.toString(), topic: 'Arithmetic' };
};

const generateAlgebra = (): MathProblem => {
  const x = getRandomInt(2, 9);
  const a = getRandomInt(1, 9);
  const b = x + a;
  return { question: `Find x: x + ${a} = ${b}`, options: generateOptions(x), correctAnswer: x.toString(), topic: 'Algebra' };
};

const generateGeometry = (): MathProblem => {
    const w = getRandomInt(2, 6);
    const h = getRandomInt(2, 6);
    const ans = w * h;
    return { question: `Area of ${w} by ${h} rectangle?`, options: generateOptions(ans), correctAnswer: ans.toString(), topic: 'Geometry' };
};

const generatePercentage = (): MathProblem => {
    const types = [10, 25, 50];
    const percent = types[getRandomInt(0, 2)];
    let total = 0;
    if (percent === 10) total = getRandomInt(1, 9) * 10;
    else if (percent === 50) total = getRandomInt(2, 20) * 2;
    else total = getRandomInt(1, 5) * 4;
    const ans = (percent / 100) * total;
    return { question: `${percent}% of ${total}?`, options: generateOptions(ans), correctAnswer: ans.toString(), topic: 'Percentage' };
};

// --- NEW GENERATORS ---

const generateFactorization = (): MathProblem => {
  // Find the Greatest Common Factor (GCF) or just a factor
  const primes = [2, 3, 5, 7];
  const p1 = primes[getRandomInt(0, 3)];
  const p2 = primes[getRandomInt(0, 3)];
  const num = p1 * p2 * getRandomInt(1, 3); // Create a number with factors
  
  // Question: What is a prime factor of X?
  // Actually, keep it simple: GCF of two numbers
  const n1 = 12, n2 = 18; // Example hardcoded logic for stability or generate
  const a = getRandomInt(2, 6) * 2;
  const b = getRandomInt(2, 6) * 3;
  
  // Let's do GCF
  const gcd = (x: number, y: number): number => !y ? x : gcd(y, x % y);
  const ans = gcd(a, b);
  
  return {
    question: `GCF of ${a} and ${b}?`,
    options: generateOptions(ans),
    correctAnswer: ans.toString(),
    topic: 'Factorization'
  };
};

const generatePEMDAS = (): MathProblem => {
  // Simple order of operations: 3 + 4 * 2
  const m1 = getRandomInt(2, 5);
  const m2 = getRandomInt(2, 5);
  const add = getRandomInt(2, 10);
  const ans = add + (m1 * m2);
  
  return {
    question: `${add} + ${m1} × ${m2} = ?`,
    options: generateOptions(ans),
    correctAnswer: ans.toString(),
    topic: 'Order of Ops'
  };
};

const generateAbsoluteValue = (): MathProblem => {
  const val = getRandomInt(2, 15);
  const neg = -val;
  
  const type = getRandomInt(0, 1);
  if (type === 0) {
      return {
          question: `|${neg}| = ?`,
          options: generateOptions(val),
          correctAnswer: val.toString(),
          topic: 'Absolute Value'
      };
  } else {
      const v2 = getRandomInt(1, 5);
      const ans = val + v2;
      return {
          question: `|${neg}| + |${v2}| = ?`,
          options: generateOptions(ans),
          correctAnswer: ans.toString(),
          topic: 'Absolute Value'
      };
  }
};
