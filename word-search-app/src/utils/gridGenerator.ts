import type { Cell, Position, WordPlacement } from '../types';
import { Direction } from '../types';

const GRID_SIZE = 15;
const COMMON_LETTERS = 'ETAOINSHRDLCUMWFGYPBVKJXQZ';
const LETTER_WEIGHTS = COMMON_LETTERS.split('').reduce((weights, letter, index) => {
  weights[letter] = Math.max(1, 26 - index);
  return weights;
}, {} as Record<string, number>);

export const createEmptyGrid = (size: number = GRID_SIZE): Cell[][] => {
  return Array(size).fill(null).map((_, row) =>
    Array(size).fill(null).map((_, col) => ({
      letter: '',
      position: { row, col },
      isHighlighted: false,
      isPartOfFoundWord: false
    }))
  );
};

export const getDirectionOffset = (direction: Direction): { rowOffset: number; colOffset: number } => {
  switch (direction) {
    case Direction.HORIZONTAL:
      return { rowOffset: 0, colOffset: 1 };
    case Direction.HORIZONTAL_REVERSE:
      return { rowOffset: 0, colOffset: -1 };
    case Direction.VERTICAL:
      return { rowOffset: 1, colOffset: 0 };
    case Direction.VERTICAL_REVERSE:
      return { rowOffset: -1, colOffset: 0 };
    case Direction.DIAGONAL_DOWN_RIGHT:
      return { rowOffset: 1, colOffset: 1 };
    case Direction.DIAGONAL_DOWN_LEFT:
      return { rowOffset: 1, colOffset: -1 };
    case Direction.DIAGONAL_UP_RIGHT:
      return { rowOffset: -1, colOffset: 1 };
    case Direction.DIAGONAL_UP_LEFT:
      return { rowOffset: -1, colOffset: -1 };
  }
};

export const isValidPosition = (position: Position, gridSize: number = GRID_SIZE): boolean => {
  return position.row >= 0 && position.row < gridSize && 
         position.col >= 0 && position.col < gridSize;
};

export const canPlaceWord = (
  grid: Cell[][],
  word: string,
  startPos: Position,
  direction: Direction
): boolean => {
  const { rowOffset, colOffset } = getDirectionOffset(direction);
  const gridSize = grid.length;

  for (let i = 0; i < word.length; i++) {
    const pos = {
      row: startPos.row + i * rowOffset,
      col: startPos.col + i * colOffset
    };

    if (!isValidPosition(pos, gridSize)) {
      return false;
    }

    const cell = grid[pos.row][pos.col];
    if (cell.letter !== '' && cell.letter !== word[i]) {
      return false;
    }
  }

  return true;
};

export const placeWordInGrid = (
  grid: Cell[][],
  word: string,
  startPos: Position,
  direction: Direction
): WordPlacement | null => {
  if (!canPlaceWord(grid, word, startPos, direction)) {
    return null;
  }

  const { rowOffset, colOffset } = getDirectionOffset(direction);
  const positions: Position[] = [];

  for (let i = 0; i < word.length; i++) {
    const pos = {
      row: startPos.row + i * rowOffset,
      col: startPos.col + i * colOffset
    };
    
    grid[pos.row][pos.col].letter = word[i];
    positions.push(pos);
  }

  return {
    word,
    startPosition: startPos,
    direction,
    positions
  };
};

export const getRandomPosition = (gridSize: number = GRID_SIZE): Position => {
  return {
    row: Math.floor(Math.random() * gridSize),
    col: Math.floor(Math.random() * gridSize)
  };
};

export const getRandomDirection = (): Direction => {
  const directions = Object.values(Direction);
  return directions[Math.floor(Math.random() * directions.length)];
};

export const getWeightedRandomLetter = (): string => {
  const totalWeight = Object.values(LETTER_WEIGHTS).reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * totalWeight;

  for (const [letter, weight] of Object.entries(LETTER_WEIGHTS)) {
    random -= weight;
    if (random <= 0) {
      return letter;
    }
  }

  return 'E';
};

export const fillEmptyCells = (grid: Cell[][]): void => {
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      if (grid[row][col].letter === '') {
        grid[row][col].letter = getWeightedRandomLetter();
      }
    }
  }
};

// Simple seeded random number generator
class SeededRandom {
  private seed: number;

  constructor(seed: string) {
    this.seed = this.hashCode(seed);
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

export const placeWordsInGrid = (
  words: string[],
  gridSize: number = GRID_SIZE,
  maxAttempts: number = 1000,
  seed?: string
): { grid: Cell[][]; placements: WordPlacement[]; seed: string } => {
  const actualSeed = seed || Date.now().toString();
  const rng = new SeededRandom(actualSeed);
  
  const grid = createEmptyGrid(gridSize);
  const placements: WordPlacement[] = [];
  const sortedWords = [...words].sort((a, b) => b.length - a.length);

  // Replace random functions with seeded versions
  const getSeededRandomPosition = (size: number): Position => ({
    row: Math.floor(rng.next() * size),
    col: Math.floor(rng.next() * size)
  });

  const getSeededRandomDirection = (wordsPlaced: number, totalWords: number): Direction => {
    const backwardDirections = [
      Direction.HORIZONTAL_REVERSE,
      Direction.VERTICAL_REVERSE
    ];
    
    const forwardDirections = [
      Direction.HORIZONTAL,
      Direction.VERTICAL,
      Direction.DIAGONAL_DOWN_RIGHT,
      Direction.DIAGONAL_DOWN_LEFT,
      Direction.DIAGONAL_UP_RIGHT,
      Direction.DIAGONAL_UP_LEFT
    ];
    
    // Calculate how many backwards words we want (target ~2 per grid)
    const targetBackwardsCount = Math.min(2, Math.floor(totalWords * 0.15)); // 15% max, but cap at 2
    const backwardsPlaced = placements.filter(p => 
      backwardDirections.includes(p.direction)
    ).length;
    
    // If we haven't placed enough backwards words and we're in the first 80% of placement
    const shouldConsiderBackwards = backwardsPlaced < targetBackwardsCount && 
                                   wordsPlaced < totalWords * 0.8;
    
    if (shouldConsiderBackwards && rng.next() < 0.3) { // 30% chance for backwards when eligible
      const allDirections = [...forwardDirections, ...backwardDirections];
      return allDirections[Math.floor(rng.next() * allDirections.length)];
    } else {
      // Favor forward directions
      return forwardDirections[Math.floor(rng.next() * forwardDirections.length)];
    }
  };

  const getSeededRandomLetter = (): string => {
    const totalWeight = Object.values(LETTER_WEIGHTS).reduce((sum, weight) => sum + weight, 0);
    let random = rng.next() * totalWeight;

    for (const [letter, weight] of Object.entries(LETTER_WEIGHTS)) {
      random -= weight;
      if (random <= 0) {
        return letter;
      }
    }
    return 'E';
  };

  for (let wordIndex = 0; wordIndex < sortedWords.length; wordIndex++) {
    const word = sortedWords[wordIndex];
    let placed = false;
    let attempts = 0;

    while (!placed && attempts < maxAttempts) {
      const startPos = getSeededRandomPosition(gridSize);
      const direction = getSeededRandomDirection(wordIndex, sortedWords.length);

      const placement = placeWordInGrid(grid, word, startPos, direction);
      if (placement) {
        placements.push(placement);
        placed = true;
      }

      attempts++;
    }

    if (!placed) {
      console.warn(`Could not place word: ${word}`);
    }
  }

  // Fill empty cells with seeded random letters
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      if (grid[row][col].letter === '') {
        grid[row][col].letter = getSeededRandomLetter();
      }
    }
  }

  return { grid, placements, seed: actualSeed };
};