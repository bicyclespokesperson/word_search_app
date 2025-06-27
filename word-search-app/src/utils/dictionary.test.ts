import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initializeDictionary, isValidWord, getDictionarySize, _resetDictionary } from './dictionary';

// Mock fetch for testing
globalThis.fetch = vi.fn();

describe('Dictionary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the dictionary state
    _resetDictionary();
  });

  describe('initializeDictionary', () => {
    it('should load dictionary from JSON when available', async () => {
      const mockWords = ['CAT', 'DOG', 'BIRD'];
      (fetch as vi.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockWords)
      });

      await initializeDictionary();

      expect(fetch).toHaveBeenCalledWith('/dictionary.json');
      expect(isValidWord('CAT')).toBe(true);
      expect(isValidWord('DOG')).toBe(true);
      expect(isValidWord('BIRD')).toBe(true);
      expect(isValidWord('XYZ')).toBe(false);
    });

    it('should use fallback dictionary when fetch fails', async () => {
      (fetch as vi.Mock).mockRejectedValueOnce(new Error('Network error'));

      await initializeDictionary();

      // Should still have fallback words
      expect(isValidWord('CAT')).toBe(true);
      expect(isValidWord('COMPUTER')).toBe(true);
      expect(getDictionarySize()).toBeGreaterThan(50);
    });

    it('should use fallback dictionary when response is not ok', async () => {
      (fetch as vi.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      await initializeDictionary();

      // Should use fallback
      expect(isValidWord('CAT')).toBe(true);
      expect(isValidWord('COMPUTER')).toBe(true);
    });

    it('should not reinitialize if already loaded', async () => {
      const mockWords = ['TEST'];
      (fetch as vi.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockWords)
      });

      await initializeDictionary();
      expect(fetch).toHaveBeenCalledTimes(1);

      // Second call should not fetch again
      await initializeDictionary();
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('isValidWord', () => {
    beforeEach(async () => {
      (fetch as vi.Mock).mockRejectedValueOnce(new Error('Use fallback'));
      await initializeDictionary();
    });

    it('should return true for valid words', () => {
      expect(isValidWord('CAT')).toBe(true);
      expect(isValidWord('cat')).toBe(true); // case insensitive
      expect(isValidWord('COMPUTER')).toBe(true);
      expect(isValidWord('WATER')).toBe(true);
    });

    it('should return false for invalid words', () => {
      expect(isValidWord('XYZ')).toBe(false);
      expect(isValidWord('QQQQ')).toBe(false);
      expect(isValidWord('123')).toBe(false);
    });

    it('should return false for words shorter than 3 characters', () => {
      expect(isValidWord('A')).toBe(false);
      expect(isValidWord('AB')).toBe(false);
      expect(isValidWord('GO')).toBe(false); // Even if in dictionary
    });

    it('should return false when dictionary is not initialized', () => {
      // Reset dictionary state
      _resetDictionary();
      
      expect(isValidWord('CAT')).toBe(false);
    });
  });

  describe('getDictionarySize', () => {
    it('should return dictionary size when initialized', async () => {
      const mockWords = ['CAT', 'DOG', 'BIRD', 'FISH'];
      (fetch as vi.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockWords)
      });

      await initializeDictionary();
      expect(getDictionarySize()).toBe(4);
    });

    it('should return 0 when dictionary is not initialized', () => {
      expect(getDictionarySize()).toBe(0);
    });
  });

  describe('case handling', () => {
    beforeEach(async () => {
      const mockWords = ['hello', 'WORLD', 'Test'];
      (fetch as vi.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockWords)
      });
      await initializeDictionary();
    });

    it('should handle mixed case input correctly', () => {
      expect(isValidWord('hello')).toBe(true);
      expect(isValidWord('HELLO')).toBe(true);
      expect(isValidWord('Hello')).toBe(true);
      expect(isValidWord('world')).toBe(true);
      expect(isValidWord('WORLD')).toBe(true);
      expect(isValidWord('test')).toBe(true);
      expect(isValidWord('TEST')).toBe(true);
    });
  });
});