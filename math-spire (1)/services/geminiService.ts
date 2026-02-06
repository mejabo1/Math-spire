
export interface MathRiddle {
  question: string;
  options: string[];
  correctIndex: number;
  rewardText: string;
}

export const generateMathRiddle = async (): Promise<MathRiddle | null> => {
  // Simulating a short delay for dramatic effect (like entering a room)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        question: "I have no voice, but I can tell you all. I have leaves, but I am not a tree. I have a spine, but I have no bones. What am I?",
        options: ["A Book", "A Map", "A Ghost"],
        correctIndex: 0,
        rewardText: "Knowledge is power."
      });
    }, 600);
  });
};
