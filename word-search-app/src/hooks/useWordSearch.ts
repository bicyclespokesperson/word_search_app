import { useState, useCallback, useEffect } from 'react';
import type { GameState, Position, FoundWord } from '../types';
import { placeWordsInGrid } from '../utils/gridGenerator';
import { useTouch } from './useTouch';
import { initializeDictionary, isValidWord } from '../utils/dictionary';
import { saveGameState, loadGameState, clearGameState } from '../utils/storage';

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
    const initApp = async () => {
      await initializeDictionary();
      initializeGame();
    };
    initApp();
  }, [targetWords]);

  useEffect(() => {
    setGameState(prev => ({
      ...prev,
      currentSelection: touchState.selectedPositions,
      isSelecting: touchState.isActive
    }));

    updateCellHighlights();
  }, [touchState]);

  const initializeGame = useCallback((forcedSeed?: string) => {
    // Try to load saved game first
    if (!forcedSeed) {
      const savedGame = loadGameState();
      if (savedGame) {
        // Restore saved game
        const { grid } = placeWordsInGrid(savedGame.targetWords, 15, 1000, savedGame.gridSeed);
        
        // Restore found word highlights
        const restoredGrid = grid.map(row =>
          row.map(cell => {
            const foundWord = savedGame.foundWords.find(fw => 
              fw.positions.some(pos => pos.row === cell.position.row && pos.col === cell.position.col)
            );
            
            if (foundWord && foundWord.isTargetWord) {
              return {
                ...cell,
                isPartOfFoundWord: true,
                foundWordId: foundWord.id
              };
            }
            
            return cell;
          })
        );
        
        setGameState({
          grid: restoredGrid,
          targetWords: savedGame.targetWords,
          foundWords: savedGame.foundWords,
          bonusWordsFound: savedGame.bonusWordsFound,
          isCompleted: savedGame.isCompleted,
          currentSelection: [],
          isSelecting: false,
          gridSeed: savedGame.gridSeed
        });
        return;
      }
    }

    // Create new game
    const { grid, seed } = placeWordsInGrid(targetWords, 15, 1000, forcedSeed);
    
    setGameState({
      grid,
      targetWords,
      foundWords: [],
      bonusWordsFound: 0,
      isCompleted: false,
      currentSelection: [],
      isSelecting: false,
      gridSeed: seed
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
    setGameState(prev => {
      // Double-check that the word isn't already found to prevent duplicates
      const isAlreadyFound = prev.foundWords.some(fw => fw.word === word);
      if (isAlreadyFound) {
        return prev;
      }

      const foundWord: FoundWord = {
        id: `${isTargetWord ? 'target' : 'bonus'}-${word}-${Date.now()}-${Math.random()}`,
        word,
        positions,
        isTargetWord,
        isBonus: !isTargetWord
      };

      const newGrid = prev.grid.map(row =>
        row.map(cell => {
          const isPartOfWord = positions.some(pos => 
            pos.row === cell.position.row && pos.col === cell.position.col
          );
          
          // Only highlight target words permanently, not bonus words
          if (isPartOfWord && isTargetWord) {
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

      console.log(`Found word: ${word}, Total target words found: ${targetWordsFound.length}`);

      const newState = {
        ...prev,
        grid: newGrid,
        foundWords: newFoundWords,
        bonusWordsFound: newBonusWordsFound,
        isCompleted
      };

      // Auto-save game state
      if (prev.gridSeed) {
        saveGameState(newState, prev.gridSeed);
      }

      // Clear saved game if completed
      if (isCompleted) {
        setTimeout(() => clearGameState(), 1000);
      }

      return newState;
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
    } else if (!isTargetWord) {
      // Check for bonus words
      const isBonusWord = isValidWord(selectedWord) || isValidWord(reversedWord);
      const bonusWordToMark = isValidWord(selectedWord) ? selectedWord : reversedWord;
      const isBonusAlreadyFound = gameState.foundWords.some(fw => fw.word === bonusWordToMark);
      
      if (isBonusWord && !isBonusAlreadyFound) {
        markWordAsFound(bonusWordToMark, finalState.selectedPositions, false);
      }
    }
    
  }, [touchState, endSelection, getSelectedWord, gameState.targetWords, gameState.foundWords, markWordAsFound, clearSelection]);

  const newGame = useCallback(() => {
    clearGameState(); // Clear any saved progress
    initializeGame(Date.now().toString()); // Force new game with new seed
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