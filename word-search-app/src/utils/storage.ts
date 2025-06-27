import type { GameState, FoundWord } from '../types';

const STORAGE_KEY = 'word-search-game';

export interface SavedGameState {
  targetWords: string[];
  foundWords: FoundWord[];
  bonusWordsFound: number;
  isCompleted: boolean;
  timestamp: string;
  gridSeed: string; // Used to recreate the same puzzle
}

export const saveGameState = (gameState: GameState, gridSeed: string): void => {
  try {
    const savedState: SavedGameState = {
      targetWords: gameState.targetWords,
      foundWords: gameState.foundWords,
      bonusWordsFound: gameState.bonusWordsFound,
      isCompleted: gameState.isCompleted,
      timestamp: new Date().toISOString(),
      gridSeed
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedState));
  } catch (error) {
    console.warn('Could not save game state:', error);
  }
};

export const loadGameState = (): SavedGameState | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;

    const parsedState: SavedGameState = JSON.parse(saved);
    
    // Only return if it's an incomplete game
    if (parsedState.isCompleted) {
      clearGameState();
      return null;
    }

    return parsedState;
  } catch (error) {
    console.warn('Could not load game state:', error);
    clearGameState();
    return null;
  }
};

export const clearGameState = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Could not clear game state:', error);
  }
};

export const hasInProgressGame = (): boolean => {
  const saved = loadGameState();
  return saved !== null && !saved.isCompleted;
};