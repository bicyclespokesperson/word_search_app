import { describe, it, expect, beforeEach } from 'vitest';
import {
  createEmptyGrid,
  getDirectionOffset,
  isValidPosition,
  canPlaceWord,
  placeWordInGrid,
  getRandomPosition,
  getRandomDirection,
  getWeightedRandomLetter,
  fillEmptyCells,
  placeWordsInGrid
} from './gridGenerator';
import { Direction } from '../types';
import type { Cell } from '../types';

describe('Grid Generator', () => {
  describe('createEmptyGrid', () => {
    it('should create a grid with default size 15x15', () => {
      const grid = createEmptyGrid();
      expect(grid).toHaveLength(15);
      expect(grid[0]).toHaveLength(15);
    });

    it('should create a grid with custom size', () => {
      const size = 10;
      const grid = createEmptyGrid(size);
      expect(grid).toHaveLength(size);
      expect(grid[0]).toHaveLength(size);
    });

    it('should initialize cells with correct properties', () => {
      const grid = createEmptyGrid(3);
      const cell = grid[1][2];
      expect(cell.letter).toBe('');
      expect(cell.position).toEqual({ row: 1, col: 2 });
      expect(cell.isHighlighted).toBe(false);
      expect(cell.isPartOfFoundWord).toBe(false);
    });
  });

  describe('getDirectionOffset', () => {
    it('should return correct offsets for all directions', () => {
      expect(getDirectionOffset(Direction.HORIZONTAL)).toEqual({ rowOffset: 0, colOffset: 1 });
      expect(getDirectionOffset(Direction.HORIZONTAL_REVERSE)).toEqual({ rowOffset: 0, colOffset: -1 });
      expect(getDirectionOffset(Direction.VERTICAL)).toEqual({ rowOffset: 1, colOffset: 0 });
      expect(getDirectionOffset(Direction.VERTICAL_REVERSE)).toEqual({ rowOffset: -1, colOffset: 0 });
      expect(getDirectionOffset(Direction.DIAGONAL_DOWN_RIGHT)).toEqual({ rowOffset: 1, colOffset: 1 });
      expect(getDirectionOffset(Direction.DIAGONAL_DOWN_LEFT)).toEqual({ rowOffset: 1, colOffset: -1 });
      expect(getDirectionOffset(Direction.DIAGONAL_UP_RIGHT)).toEqual({ rowOffset: -1, colOffset: 1 });
      expect(getDirectionOffset(Direction.DIAGONAL_UP_LEFT)).toEqual({ rowOffset: -1, colOffset: -1 });
    });
  });

  describe('isValidPosition', () => {
    it('should return true for valid positions', () => {
      expect(isValidPosition({ row: 0, col: 0 }, 15)).toBe(true);
      expect(isValidPosition({ row: 14, col: 14 }, 15)).toBe(true);
      expect(isValidPosition({ row: 7, col: 8 }, 15)).toBe(true);
    });

    it('should return false for invalid positions', () => {
      expect(isValidPosition({ row: -1, col: 0 }, 15)).toBe(false);
      expect(isValidPosition({ row: 0, col: -1 }, 15)).toBe(false);
      expect(isValidPosition({ row: 15, col: 0 }, 15)).toBe(false);
      expect(isValidPosition({ row: 0, col: 15 }, 15)).toBe(false);
    });
  });

  describe('canPlaceWord', () => {
    let grid: Cell[][];

    beforeEach(() => {
      grid = createEmptyGrid(5);
    });

    it('should return true for valid word placement in empty grid', () => {
      const canPlace = canPlaceWord(grid, 'TEST', { row: 0, col: 0 }, Direction.HORIZONTAL);
      expect(canPlace).toBe(true);
    });

    it('should return false when word goes out of bounds', () => {
      const canPlace = canPlaceWord(grid, 'TOOLONG', { row: 0, col: 0 }, Direction.HORIZONTAL);
      expect(canPlace).toBe(false);
    });

    it('should return true when word overlaps with same letters', () => {
      grid[0][0].letter = 'T';
      grid[0][1].letter = 'E';
      const canPlace = canPlaceWord(grid, 'TEST', { row: 0, col: 0 }, Direction.HORIZONTAL);
      expect(canPlace).toBe(true);
    });

    it('should return false when word conflicts with existing letters', () => {
      grid[0][0].letter = 'X';
      const canPlace = canPlaceWord(grid, 'TEST', { row: 0, col: 0 }, Direction.HORIZONTAL);
      expect(canPlace).toBe(false);
    });

    it('should work with vertical placement', () => {
      const canPlace = canPlaceWord(grid, 'TEST', { row: 0, col: 0 }, Direction.VERTICAL);
      expect(canPlace).toBe(true);
    });

    it('should work with diagonal placement', () => {
      const canPlace = canPlaceWord(grid, 'TEST', { row: 0, col: 0 }, Direction.DIAGONAL_DOWN_RIGHT);
      expect(canPlace).toBe(true);
    });
  });

  describe('placeWordInGrid', () => {
    let grid: Cell[][];

    beforeEach(() => {
      grid = createEmptyGrid(5);
    });

    it('should place word horizontally and return placement info', () => {
      const placement = placeWordInGrid(grid, 'TEST', { row: 0, col: 0 }, Direction.HORIZONTAL);
      
      expect(placement).toBeTruthy();
      expect(placement!.word).toBe('TEST');
      expect(placement!.startPosition).toEqual({ row: 0, col: 0 });
      expect(placement!.direction).toBe(Direction.HORIZONTAL);
      expect(placement!.positions).toHaveLength(4);
      
      expect(grid[0][0].letter).toBe('T');
      expect(grid[0][1].letter).toBe('E');
      expect(grid[0][2].letter).toBe('S');
      expect(grid[0][3].letter).toBe('T');
    });

    it('should place word vertically', () => {
      const placement = placeWordInGrid(grid, 'TEST', { row: 0, col: 0 }, Direction.VERTICAL);
      
      expect(placement).toBeTruthy();
      expect(grid[0][0].letter).toBe('T');
      expect(grid[1][0].letter).toBe('E');
      expect(grid[2][0].letter).toBe('S');
      expect(grid[3][0].letter).toBe('T');
    });

    it('should place word diagonally', () => {
      const placement = placeWordInGrid(grid, 'TEST', { row: 0, col: 0 }, Direction.DIAGONAL_DOWN_RIGHT);
      
      expect(placement).toBeTruthy();
      expect(grid[0][0].letter).toBe('T');
      expect(grid[1][1].letter).toBe('E');
      expect(grid[2][2].letter).toBe('S');
      expect(grid[3][3].letter).toBe('T');
    });

    it('should return null when placement is invalid', () => {
      const placement = placeWordInGrid(grid, 'TOOLONG', { row: 0, col: 0 }, Direction.HORIZONTAL);
      expect(placement).toBeNull();
    });
  });

  describe('getRandomPosition', () => {
    it('should return valid positions within grid bounds', () => {
      for (let i = 0; i < 100; i++) {
        const pos = getRandomPosition(15);
        expect(pos.row).toBeGreaterThanOrEqual(0);
        expect(pos.row).toBeLessThan(15);
        expect(pos.col).toBeGreaterThanOrEqual(0);
        expect(pos.col).toBeLessThan(15);
      }
    });
  });

  describe('getRandomDirection', () => {
    it('should return valid directions', () => {
      const validDirections = Object.values(Direction);
      
      for (let i = 0; i < 100; i++) {
        const direction = getRandomDirection();
        expect(validDirections).toContain(direction);
      }
    });
  });

  describe('getWeightedRandomLetter', () => {
    it('should return valid letters', () => {
      const validLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      
      for (let i = 0; i < 100; i++) {
        const letter = getWeightedRandomLetter();
        expect(validLetters).toContain(letter);
      }
    });

    it('should favor more common letters', () => {
      const letterCounts: Record<string, number> = {};
      const iterations = 1000;
      
      for (let i = 0; i < iterations; i++) {
        const letter = getWeightedRandomLetter();
        letterCounts[letter] = (letterCounts[letter] || 0) + 1;
      }
      
      expect(letterCounts['E'] || 0).toBeGreaterThan(letterCounts['Z'] || 0);
    });
  });

  describe('fillEmptyCells', () => {
    it('should fill all empty cells with letters', () => {
      const grid = createEmptyGrid(3);
      fillEmptyCells(grid);
      
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          expect(grid[row][col].letter).not.toBe('');
          expect(grid[row][col].letter).toMatch(/[A-Z]/);
        }
      }
    });

    it('should not overwrite existing letters', () => {
      const grid = createEmptyGrid(3);
      grid[1][1].letter = 'X';
      fillEmptyCells(grid);
      
      expect(grid[1][1].letter).toBe('X');
    });
  });

  describe('placeWordsInGrid', () => {
    it('should place all words when possible', () => {
      const words = ['CAT', 'DOG', 'BIRD'];
      const { grid, placements } = placeWordsInGrid(words, 10);
      
      expect(placements).toHaveLength(3);
      expect(grid).toHaveLength(10);
      expect(grid[0]).toHaveLength(10);
      
      for (const placement of placements) {
        expect(words).toContain(placement.word);
      }
    });

    it('should sort words by length (longest first)', () => {
      const words = ['CAT', 'ELEPHANT', 'DOG'];
      const { placements } = placeWordsInGrid(words, 15);
      
      if (placements.length > 1) {
        expect(placements[0].word.length).toBeGreaterThanOrEqual(placements[1].word.length);
      }
    });

    it('should fill all empty cells after placing words', () => {
      const words = ['CAT'];
      const { grid } = placeWordsInGrid(words, 5);
      
      let emptyCells = 0;
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          if (grid[row][col].letter === '') {
            emptyCells++;
          }
        }
      }
      
      expect(emptyCells).toBe(0);
    });

    it('should handle impossible placements gracefully', () => {
      const words = ['VERYLONGWORDTHATCANNOTFIT'];
      const { grid, placements } = placeWordsInGrid(words, 5);
      
      expect(placements).toHaveLength(0);
      expect(grid).toHaveLength(5);
    });

    it('should place words in different directions', () => {
      const words = ['HORIZONTAL', 'VERTICAL', 'DIAGONAL'];
      const { placements } = placeWordsInGrid(words, 15);
      
      if (placements.length > 1) {
        const directions = placements.map(p => p.direction);
        expect(new Set(directions).size).toBeGreaterThan(1);
      }
    });
  });
});