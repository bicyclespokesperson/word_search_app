export interface Position {
  row: number;
  col: number;
}

export interface Cell {
  letter: string;
  position: Position;
  isHighlighted: boolean;
  isPartOfFoundWord: boolean;
  foundWordId?: string;
  isBonusFlashing?: boolean;
  isAnswerRevealed?: boolean;
}

export interface FoundWord {
  id: string;
  word: string;
  positions: Position[];
  isTargetWord: boolean;
  isBonus: boolean;
}

export interface WordPlacement {
  word: string;
  startPosition: Position;
  direction: Direction;
  positions: Position[];
}

export const Direction = {
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical',
  DIAGONAL_DOWN_RIGHT: 'diagonal-down-right',
  DIAGONAL_DOWN_LEFT: 'diagonal-down-left',
  DIAGONAL_UP_RIGHT: 'diagonal-up-right',
  DIAGONAL_UP_LEFT: 'diagonal-up-left',
  HORIZONTAL_REVERSE: 'horizontal-reverse',
  VERTICAL_REVERSE: 'vertical-reverse'
} as const;

export type Direction = typeof Direction[keyof typeof Direction];

export interface GameState {
  grid: Cell[][];
  targetWords: string[];
  foundWords: FoundWord[];
  bonusWordsFound: number;
  isCompleted: boolean;
  currentSelection: Position[];
  isSelecting: boolean;
  gridSeed?: string;
  showingAnswers: boolean;
}

export interface Theme {
  name: 'light' | 'dark';
  colors: {
    background: string;
    surface: string;
    text: string;
    primary: string;
    secondary: string;
    accent: string;
    targetWordHighlight: string;
    bonusWordHighlight: string;
    selectionHighlight: string;
    answerHighlight: string;
  };
}

export interface TouchState {
  isActive: boolean;
  startPosition: Position | null;
  currentPosition: Position | null;
  selectedPositions: Position[];
}