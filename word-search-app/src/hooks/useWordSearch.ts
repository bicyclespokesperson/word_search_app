import { useState, useCallback, useEffect } from 'react';
import type { GameState, Position, FoundWord, Cell } from '../types';
import { Direction } from '../types';
import { placeWordsInGrid } from '../utils/gridGenerator';
import { useTouch } from './useTouch';
import { initializeDictionary, isValidWord } from '../utils/dictionary';
import { saveGameState, loadGameState, clearGameState } from '../utils/storage';
import { selectRandomWords } from '../utils/wordSelector';
import wordLists from '../data/wordLists.json';

const arraysEqual = (a: string[], b: string[]): boolean => {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((val, index) => val === sortedB[index]);
};

export const useWordSearch = (targetWords: string[] | null) => {
  const [gameState, setGameState] = useState<GameState>({
    grid: [],
    targetWords: targetWords || [],
    foundWords: [],
    bonusWordsFound: 0,
    isCompleted: false,
    currentSelection: [],
    isSelecting: false,
    showingAnswers: false
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
    setGameState(prev => ({
      ...prev,
      currentSelection: touchState.selectedPositions,
      isSelecting: touchState.isActive
    }));

    updateCellHighlights();
  }, [touchState, updateCellHighlights]);

  const initializeGame = useCallback((forcedSeed?: string) => {
    // Determine the words to use
    let wordsToUse = targetWords;
    
    // Try to load saved game first
    if (!forcedSeed) {
      const savedGame = loadGameState();
      if (savedGame) {
        // If we don't have target words yet, use the saved game's words
        if (!targetWords) {
          wordsToUse = savedGame.targetWords;
        }
        // Only restore if words match
        if (wordsToUse && arraysEqual(savedGame.targetWords, wordsToUse)) {
          // Restore saved game
          const { grid } = placeWordsInGrid(savedGame.targetWords, 15, 1000, savedGame.gridSeed);
          
          // Restore found word highlights
          const restoredGrid = grid.map(row =>
            row.map(cell => {
              // Find all words that include this cell position
              const wordsAtPosition = savedGame.foundWords.filter(fw => 
                fw.positions.some(pos => pos.row === cell.position.row && pos.col === cell.position.col)
              );
              
              // Prioritize target words over bonus words for highlighting
              const targetWord = wordsAtPosition.find(fw => fw.isTargetWord);
              const wordToHighlight = targetWord || wordsAtPosition[0];
              
              if (wordToHighlight && wordToHighlight.isTargetWord) {
                return {
                  ...cell,
                  isPartOfFoundWord: true,
                  foundWordId: wordToHighlight.id
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
            gridSeed: savedGame.gridSeed,
            showingAnswers: false
          });
          return;
        }
      }
    }

    // If we still don't have words, generate them
    if (!wordsToUse) {
      wordsToUse = selectRandomWords(wordLists.programming, 15);
    }

    // Create new game
    const { grid, seed } = placeWordsInGrid(wordsToUse, 15, 1000, forcedSeed);
    
    setGameState({
      grid,
      targetWords: wordsToUse,
      foundWords: [],
      bonusWordsFound: 0,
      isCompleted: false,
      currentSelection: [],
      isSelecting: false,
      gridSeed: seed,
      showingAnswers: false
    });
  }, [targetWords]);

  useEffect(() => {
    const initApp = async () => {
      await initializeDictionary();
      initializeGame();
    };
    initApp();
  }, [targetWords, initializeGame]);

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
          
          if (isPartOfWord) {
            if (isTargetWord) {
              // Target words always override any existing highlighting
              return {
                ...cell,
                isPartOfFoundWord: true,
                foundWordId: foundWord.id,
                isBonusFlashing: false // Clear any bonus flashing
              };
            } else {
              // Only flash bonus words if the cell isn't already part of a target word
              if (!cell.isPartOfFoundWord) {
                return {
                  ...cell,
                  isBonusFlashing: true
                };
              }
            }
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

      // Clear bonus flash animation after 1.5 seconds
      if (!isTargetWord) {
        setTimeout(() => {
          setGameState(currentState => ({
            ...currentState,
            grid: currentState.grid.map(row =>
              row.map(cell => ({
                ...cell,
                isBonusFlashing: false
              }))
            )
          }));
        }, 1500);
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

  const toggleShowAnswers = useCallback(() => {
    setGameState(prev => {
      const showingAnswers = !prev.showingAnswers;
      
      // If showing answers, mark unfound target words
      if (showingAnswers) {
        const foundTargetWords = prev.foundWords.filter(fw => fw.isTargetWord).map(fw => fw.word);
        const unfoundTargetWords = prev.targetWords.filter(word => !foundTargetWords.includes(word));
        
        // Find positions of unfound words in the grid
        const newGrid = prev.grid.map(row => row.map(cell => ({ ...cell })));
        
        unfoundTargetWords.forEach(word => {
          const wordPositions = findWordInGrid(newGrid, word);
          if (wordPositions.length > 0) {
            wordPositions.forEach(pos => {
              newGrid[pos.row][pos.col].isAnswerRevealed = true;
            });
          }
        });
        
        return { ...prev, grid: newGrid, showingAnswers };
      } else {
        // Hide answers
        const newGrid = prev.grid.map(row => 
          row.map(cell => ({ ...cell, isAnswerRevealed: false }))
        );
        return { ...prev, grid: newGrid, showingAnswers };
      }
    });
  }, [findWordInGrid]);

  const findWordInGrid = useCallback((grid: Cell[][], word: string): Position[] => {
    const directions = [
      Direction.HORIZONTAL, Direction.HORIZONTAL_REVERSE,
      Direction.VERTICAL, Direction.VERTICAL_REVERSE,
      Direction.DIAGONAL_DOWN_RIGHT, Direction.DIAGONAL_DOWN_LEFT,
      Direction.DIAGONAL_UP_RIGHT, Direction.DIAGONAL_UP_LEFT
    ];

    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[0].length; col++) {
        for (const direction of directions) {
          const positions = checkWordAt(grid, word, { row, col }, direction);
          if (positions.length > 0) {
            return positions;
          }
        }
      }
    }
    return [];
  }, [checkWordAt]);

  const checkWordAt = useCallback((grid: Cell[][], word: string, start: Position, direction: Direction): Position[] => {
    const positions: Position[] = [];
    const { rowOffset, colOffset } = getDirectionOffset(direction);
    
    for (let i = 0; i < word.length; i++) {
      const row = start.row + (rowOffset * i);
      const col = start.col + (colOffset * i);
      
      if (row < 0 || row >= grid.length || col < 0 || col >= grid[0].length) {
        return [];
      }
      
      if (grid[row][col].letter !== word[i]) {
        return [];
      }
      
      positions.push({ row, col });
    }
    
    return positions;
  }, [getDirectionOffset]);

  const getDirectionOffset = useCallback((direction: Direction): { rowOffset: number; colOffset: number } => {
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
  }, []);

  return {
    gameState,
    handlePointerDown,
    handlePointerEnter,
    handlePointerUp,
    newGame,
    toggleShowAnswers,
    touchState
  };
};