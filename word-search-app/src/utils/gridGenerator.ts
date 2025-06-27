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

export const placeWordsInGrid = (
  words: string[],
  gridSize: number = GRID_SIZE,
  maxAttempts: number = 1000
): { grid: Cell[][]; placements: WordPlacement[] } => {
  const grid = createEmptyGrid(gridSize);
  const placements: WordPlacement[] = [];
  const sortedWords = [...words].sort((a, b) => b.length - a.length);

  for (const word of sortedWords) {
    let placed = false;
    let attempts = 0;

    while (!placed && attempts < maxAttempts) {
      const startPos = getRandomPosition(gridSize);
      const direction = getRandomDirection();

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

  fillEmptyCells(grid);
  return { grid, placements };
};