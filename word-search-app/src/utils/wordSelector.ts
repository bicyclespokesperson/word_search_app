export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const selectRandomWords = (wordList: string[], count: number): string[] => {
  if (wordList.length <= count) {
    return [...wordList];
  }
  
  const shuffled = shuffleArray(wordList);
  return shuffled.slice(0, count);
};