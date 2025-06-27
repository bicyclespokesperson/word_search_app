import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveGameState, loadGameState, clearGameState, hasInProgressGame } from './storage';
import type { GameState, FoundWord } from '../types';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

globalThis.localStorage = localStorageMock as unknown as Storage;

describe('Storage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('saveGameState', () => {
    it('should save game state to localStorage', () => {
      const gameState: GameState = {
        grid: [],
        targetWords: ['TEST', 'WORD'],
        foundWords: [],
        bonusWordsFound: 0,
        isCompleted: false,
        currentSelection: [],
        isSelecting: false,
        showingAnswers: false
      };

      saveGameState(gameState, 'test-seed');

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'word-search-game',
        expect.stringContaining('"targetWords":["TEST","WORD"]')
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'word-search-game',
        expect.stringContaining('"gridSeed":"test-seed"')
      );
    });

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage full');
      });

      const gameState: GameState = {
        grid: [],
        targetWords: ['TEST'],
        foundWords: [],
        bonusWordsFound: 0,
        isCompleted: false,
        currentSelection: [],
        isSelecting: false,
        showingAnswers: false
      };

      // Should not throw
      expect(() => saveGameState(gameState, 'test-seed')).not.toThrow();
    });
  });

  describe('loadGameState', () => {
    it('should load saved game state', () => {
      const savedData = {
        targetWords: ['TEST', 'WORD'],
        foundWords: [],
        bonusWordsFound: 0,
        isCompleted: false,
        timestamp: '2023-01-01T00:00:00Z',
        gridSeed: 'test-seed'
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedData));

      const result = loadGameState();

      expect(result).toEqual(savedData);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('word-search-game');
    });

    it('should return null when no saved game exists', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = loadGameState();

      expect(result).toBeNull();
    });

    it('should return null and clear storage for completed games', () => {
      const completedGame = {
        targetWords: ['TEST'],
        foundWords: [],
        bonusWordsFound: 0,
        isCompleted: true,
        timestamp: '2023-01-01T00:00:00Z',
        gridSeed: 'test-seed'
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(completedGame));

      const result = loadGameState();

      expect(result).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('word-search-game');
    });

    it('should handle corrupted data gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');

      const result = loadGameState();

      expect(result).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('word-search-game');
    });

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = loadGameState();

      expect(result).toBeNull();
    });
  });

  describe('clearGameState', () => {
    it('should remove saved game from localStorage', () => {
      clearGameState();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('word-search-game');
    });

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      // Should not throw
      expect(() => clearGameState()).not.toThrow();
    });
  });

  describe('hasInProgressGame', () => {
    it('should return true when incomplete game exists', () => {
      const incompleteGame = {
        targetWords: ['TEST'],
        foundWords: [],
        bonusWordsFound: 0,
        isCompleted: false,
        timestamp: '2023-01-01T00:00:00Z',
        gridSeed: 'test-seed'
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(incompleteGame));

      expect(hasInProgressGame()).toBe(true);
    });

    it('should return false when no saved game exists', () => {
      localStorageMock.getItem.mockReturnValue(null);

      expect(hasInProgressGame()).toBe(false);
    });

    it('should return false when completed game exists', () => {
      const completedGame = {
        targetWords: ['TEST'],
        foundWords: [],
        bonusWordsFound: 0,
        isCompleted: true,
        timestamp: '2023-01-01T00:00:00Z',
        gridSeed: 'test-seed'
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(completedGame));

      expect(hasInProgressGame()).toBe(false);
    });
  });

  describe('integration', () => {
    it('should save and load game state correctly', () => {
      const foundWord: FoundWord = {
        id: 'target-test-123',
        word: 'TEST',
        positions: [{ row: 0, col: 0 }, { row: 0, col: 1 }],
        isTargetWord: true,
        isBonus: false
      };

      const gameState: GameState = {
        grid: [],
        targetWords: ['TEST', 'WORD'],
        foundWords: [foundWord],
        bonusWordsFound: 2,
        isCompleted: false,
        currentSelection: [],
        isSelecting: false,
        showingAnswers: false
      };

      // Save the game
      saveGameState(gameState, 'test-seed-123');

      // Get what was saved
      const savedCall = localStorageMock.setItem.mock.calls[0];
      const savedData = savedCall[1];

      // Mock loading it back
      localStorageMock.getItem.mockReturnValue(savedData);

      const loaded = loadGameState();

      expect(loaded).toEqual({
        targetWords: ['TEST', 'WORD'],
        foundWords: [foundWord],
        bonusWordsFound: 2,
        isCompleted: false,
        timestamp: expect.any(String),
        gridSeed: 'test-seed-123'
      });
    });
  });
});