import { useState, useCallback } from 'react';
import type { Position, TouchState } from '../types';

export const useTouch = () => {
  const [touchState, setTouchState] = useState<TouchState>({
    isActive: false,
    startPosition: null,
    currentPosition: null,
    selectedPositions: [],
    dimmedPositions: []
  });


  const getPositionsInLine = useCallback((start: Position, end: Position): Position[] => {
    if (!start || !end) return [];

    const positions: Position[] = [];
    const deltaX = end.col - start.col;
    const deltaY = end.row - start.row;
    const steps = Math.max(Math.abs(deltaX), Math.abs(deltaY));

    if (steps === 0) {
      return [start];
    }

    const stepX = deltaX === 0 ? 0 : deltaX / Math.abs(deltaX);
    const stepY = deltaY === 0 ? 0 : deltaY / Math.abs(deltaY);

    if (Math.abs(deltaX) !== 0 && Math.abs(deltaY) !== 0 && Math.abs(deltaX) !== Math.abs(deltaY)) {
      return [];
    }

    for (let i = 0; i <= steps; i++) {
      positions.push({
        row: start.row + i * stepY,
        col: start.col + i * stepX
      });
    }

    return positions;
  }, []);

  const getAllTouchedPositions = useCallback((start: Position, end: Position): Position[] => {
    if (!start || !end) return [];

    const positions: Position[] = [];
    const deltaX = end.col - start.col;
    const deltaY = end.row - start.row;
    const steps = Math.max(Math.abs(deltaX), Math.abs(deltaY));

    if (steps === 0) {
      return [start];
    }

    const stepX = deltaX === 0 ? 0 : deltaX / steps;
    const stepY = deltaY === 0 ? 0 : deltaY / steps;

    for (let i = 0; i <= steps; i++) {
      positions.push({
        row: Math.round(start.row + i * stepY),
        col: Math.round(start.col + i * stepX)
      });
    }

    return positions;
  }, []);

  const startSelection = useCallback((position: Position) => {
    setTouchState({
      isActive: true,
      startPosition: position,
      currentPosition: position,
      selectedPositions: [position],
      dimmedPositions: []
    });
  }, []);

  const updateSelection = useCallback((position: Position) => {
    setTouchState(prev => {
      if (!prev.isActive || !prev.startPosition) return prev;

      const validLinePositions = getPositionsInLine(prev.startPosition, position);
      const allTouchedPositions = getAllTouchedPositions(prev.startPosition, position);
      
      // If we have a valid line, use it for selection and clear dimmed
      // Otherwise, use all touched positions for dimming
      if (validLinePositions.length > 0) {
        return {
          ...prev,
          currentPosition: position,
          selectedPositions: validLinePositions,
          dimmedPositions: []
        };
      } else {
        return {
          ...prev,
          currentPosition: position,
          selectedPositions: [],
          dimmedPositions: allTouchedPositions
        };
      }
    });
  }, [getPositionsInLine, getAllTouchedPositions]);

  const endSelection = useCallback(() => {
    const finalState = { ...touchState };
    setTouchState({
      isActive: false,
      startPosition: null,
      currentPosition: null,
      selectedPositions: [],
      dimmedPositions: []
    });
    return finalState;
  }, [touchState]);

  const clearSelection = useCallback(() => {
    setTouchState({
      isActive: false,
      startPosition: null,
      currentPosition: null,
      selectedPositions: [],
      dimmedPositions: []
    });
  }, []);

  return {
    touchState,
    startSelection,
    updateSelection,
    endSelection,
    clearSelection,
    isPositionSelected: useCallback((position: Position) => {
      return touchState.selectedPositions.some(
        pos => pos.row === position.row && pos.col === position.col
      );
    }, [touchState.selectedPositions]),
    isPositionDimmed: useCallback((position: Position) => {
      return touchState.dimmedPositions.some(
        pos => pos.row === position.row && pos.col === position.col
      );
    }, [touchState.dimmedPositions])
  };
};