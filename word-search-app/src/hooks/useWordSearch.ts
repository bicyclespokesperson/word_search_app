import { useState, useCallback, useEffect } from 'react';
import type { GameState, Position, FoundWord } from '../types';
import { placeWordsInGrid } from '../utils/gridGenerator';
import { useTouch } from './useTouch';

export const useWordSearch = (targetWords: string[]) => {
  const [gameState, setGameState] = useState<GameState>({
    grid: [],
    targetWords,
    foundWords: [],
    bonusWordsFound: 0,
    isCompleted: false,
    currentSelection: [],
    isSelecting: false
  });

  const {
    touchState,
    startSelection,
    updateSelection,
    endSelection,
    clearSelection,
    isPositionSelected
  } = useTouch();

  useEffect(() => {
    initializeGame();
  }, [targetWords]);

  useEffect(() => {
    setGameState(prev => ({
      ...prev,
      currentSelection: touchState.selectedPositions,
      isSelecting: touchState.isActive
    }));

    updateCellHighlights();
  }, [touchState]);

  const initializeGame = useCallback(() => {
    const { grid } = placeWordsInGrid(targetWords);
    
    setGameState({
      grid,
      targetWords,
      foundWords: [],
      bonusWordsFound: 0,
      isCompleted: false,
      currentSelection: [],
      isSelecting: false
    });
  }, [targetWords]);

  const updateCellHighlights = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      grid: prev.grid.map(row =>
        row.map(cell => ({
          ...cell,
          isHighlighted: isPositionSelected(cell.position)
        }))
      )
    }));
  }, [isPositionSelected]);

  const getSelectedWord = useCallback((positions: Position[]): string => {
    if (positions.length === 0) return '';
    
    return positions
      .map(pos => gameState.grid[pos.row]?.[pos.col]?.letter || '')
      .join('');
  }, [gameState.grid]);

  const isValidGridPosition = useCallback((row: number, col: number): boolean => {
    return row >= 0 && row < gameState.grid.length && 
           col >= 0 && col < gameState.grid[0]?.length;
  }, [gameState.grid]);

  const markWordAsFound = useCallback((word: string, positions: Position[], isTargetWord: boolean) => {
    const foundWord: FoundWord = {
      id: `${word}-${Date.now()}`,
      word,
      positions,
      isTargetWord,
      isBonus: !isTargetWord
    };

    setGameState(prev => {
      const newGrid = prev.grid.map(row =>
        row.map(cell => {
          const isPartOfWord = positions.some(pos => 
            pos.row === cell.position.row && pos.col === cell.position.col
          );
          
          if (isPartOfWord) {
            return {
              ...cell,
              isPartOfFoundWord: true,
              foundWordId: foundWord.id
            };
          }
          
          return cell;
        })
      );

      const newFoundWords = [...prev.foundWords, foundWord];
      const newBonusWordsFound = isTargetWord 
        ? prev.bonusWordsFound 
        : prev.bonusWordsFound + 1;

      const targetWordsFound = newFoundWords.filter(fw => fw.isTargetWord);
      const isCompleted = targetWordsFound.length === prev.targetWords.length;

      return {
        ...prev,
        grid: newGrid,
        foundWords: newFoundWords,
        bonusWordsFound: newBonusWordsFound,
        isCompleted
      };
    });
  }, []);

  const handlePointerDown = useCallback((row: number, col: number) => {
    if (!isValidGridPosition(row, col)) return;
    
    startSelection({ row, col });
  }, [startSelection, isValidGridPosition]);

  const handlePointerEnter = useCallback((row: number, col: number) => {
    if (!isValidGridPosition(row, col) || !touchState.isActive) return;
    
    updateSelection({ row, col });
  }, [updateSelection, touchState.isActive, isValidGridPosition]);

  const handlePointerUp = useCallback(() => {
    if (!touchState.isActive || touchState.selectedPositions.length === 0) {
      clearSelection();
      return;
    }

    const finalState = endSelection();
    const selectedWord = getSelectedWord(finalState.selectedPositions);
    const reversedWord = selectedWord.split('').reverse().join('');
    
    if (selectedWord.length < 2) {
      return;
    }

    const isTargetWord = gameState.targetWords.includes(selectedWord) || gameState.targetWords.includes(reversedWord);
    const wordToMark = gameState.targetWords.includes(selectedWord) ? selectedWord : reversedWord;
    const isAlreadyFound = gameState.foundWords.some(fw => fw.word === wordToMark);

    if (isTargetWord && !isAlreadyFound) {
      markWordAsFound(wordToMark, finalState.selectedPositions, true);
    }
    
  }, [touchState, endSelection, getSelectedWord, gameState.targetWords, gameState.foundWords, markWordAsFound, clearSelection]);

  const newGame = useCallback(() => {
    initializeGame();
    clearSelection();
  }, [initializeGame, clearSelection]);

  return {
    gameState,
    handlePointerDown,
    handlePointerEnter,
    handlePointerUp,
    newGame,
    touchState
  };
};