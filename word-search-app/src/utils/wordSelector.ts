export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const selectRandomWords = (wordList: string[], count: number): string[] => {
  // Filter out words shorter than 3 letters
  const filteredWords = wordList.filter(word => word.length >= 3);
  
  if (filteredWords.length <= count) {
    return [...filteredWords];
  }
  
  const shuffled = shuffleArray(filteredWords);
  return shuffled.slice(0, count);
};