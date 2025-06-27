import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTouch } from './useTouch';

describe('useTouch', () => {
  it('should initialize with inactive state', () => {
    const { result } = renderHook(() => useTouch());
    
    expect(result.current.touchState.isActive).toBe(false);
    expect(result.current.touchState.startPosition).toBeNull();
    expect(result.current.touchState.currentPosition).toBeNull();
    expect(result.current.touchState.selectedPositions).toEqual([]);
  });

  it('should start selection correctly', () => {
    const { result } = renderHook(() => useTouch());
    const position = { row: 1, col: 1 };

    act(() => {
      result.current.startSelection(position);
    });

    expect(result.current.touchState.isActive).toBe(true);
    expect(result.current.touchState.startPosition).toEqual(position);
    expect(result.current.touchState.currentPosition).toEqual(position);
    expect(result.current.touchState.selectedPositions).toEqual([position]);
  });

  it('should update selection horizontally', () => {
    const { result } = renderHook(() => useTouch());
    const startPos = { row: 1, col: 1 };
    const endPos = { row: 1, col: 3 };

    act(() => {
      result.current.startSelection(startPos);
    });

    act(() => {
      result.current.updateSelection(endPos);
    });

    expect(result.current.touchState.currentPosition).toEqual(endPos);
    expect(result.current.touchState.selectedPositions).toEqual([
      { row: 1, col: 1 },
      { row: 1, col: 2 },
      { row: 1, col: 3 }
    ]);
  });

  it('should update selection vertically', () => {
    const { result } = renderHook(() => useTouch());
    const startPos = { row: 1, col: 1 };
    const endPos = { row: 3, col: 1 };

    act(() => {
      result.current.startSelection(startPos);
    });

    act(() => {
      result.current.updateSelection(endPos);
    });

    expect(result.current.touchState.selectedPositions).toEqual([
      { row: 1, col: 1 },
      { row: 2, col: 1 },
      { row: 3, col: 1 }
    ]);
  });

  it('should update selection diagonally', () => {
    const { result } = renderHook(() => useTouch());
    const startPos = { row: 1, col: 1 };
    const endPos = { row: 3, col: 3 };

    act(() => {
      result.current.startSelection(startPos);
    });

    act(() => {
      result.current.updateSelection(endPos);
    });

    expect(result.current.touchState.selectedPositions).toEqual([
      { row: 1, col: 1 },
      { row: 2, col: 2 },
      { row: 3, col: 3 }
    ]);
  });

  it('should handle reverse diagonal selection', () => {
    const { result } = renderHook(() => useTouch());
    const startPos = { row: 3, col: 1 };
    const endPos = { row: 1, col: 3 };

    act(() => {
      result.current.startSelection(startPos);
    });

    act(() => {
      result.current.updateSelection(endPos);
    });

    expect(result.current.touchState.selectedPositions).toEqual([
      { row: 3, col: 1 },
      { row: 2, col: 2 },
      { row: 1, col: 3 }
    ]);
  });

  it('should return empty array for non-straight lines', () => {
    const { result } = renderHook(() => useTouch());
    const startPos = { row: 1, col: 1 };
    const endPos = { row: 2, col: 3 }; // Not a straight line

    act(() => {
      result.current.startSelection(startPos);
    });

    act(() => {
      result.current.updateSelection(endPos);
    });

    expect(result.current.touchState.selectedPositions).toEqual([]);
  });

  it('should handle single cell selection', () => {
    const { result } = renderHook(() => useTouch());
    const position = { row: 1, col: 1 };

    act(() => {
      result.current.startSelection(position);
    });

    act(() => {
      result.current.updateSelection(position);
    });

    expect(result.current.touchState.selectedPositions).toEqual([position]);
  });

  it('should end selection and return final state', () => {
    const { result } = renderHook(() => useTouch());
    const startPos = { row: 1, col: 1 };
    const endPos = { row: 1, col: 3 };

    act(() => {
      result.current.startSelection(startPos);
    });

    act(() => {
      result.current.updateSelection(endPos);
    });

    let finalState: ReturnType<typeof result.current.endSelection>;
    act(() => {
      finalState = result.current.endSelection();
    });

    expect(finalState!.isActive).toBe(true);
    expect(finalState!.selectedPositions).toHaveLength(3);
    
    expect(result.current.touchState.isActive).toBe(false);
    expect(result.current.touchState.startPosition).toBeNull();
    expect(result.current.touchState.currentPosition).toBeNull();
    expect(result.current.touchState.selectedPositions).toEqual([]);
  });

  it('should clear selection', () => {
    const { result } = renderHook(() => useTouch());
    const position = { row: 1, col: 1 };

    act(() => {
      result.current.startSelection(position);
    });

    act(() => {
      result.current.clearSelection();
    });

    expect(result.current.touchState.isActive).toBe(false);
    expect(result.current.touchState.startPosition).toBeNull();
    expect(result.current.touchState.currentPosition).toBeNull();
    expect(result.current.touchState.selectedPositions).toEqual([]);
  });

  it('should correctly identify selected positions', () => {
    const { result } = renderHook(() => useTouch());
    const startPos = { row: 1, col: 1 };
    const endPos = { row: 1, col: 3 };

    act(() => {
      result.current.startSelection(startPos);
    });

    act(() => {
      result.current.updateSelection(endPos);
    });

    expect(result.current.isPositionSelected({ row: 1, col: 1 })).toBe(true);
    expect(result.current.isPositionSelected({ row: 1, col: 2 })).toBe(true);
    expect(result.current.isPositionSelected({ row: 1, col: 3 })).toBe(true);
    expect(result.current.isPositionSelected({ row: 2, col: 1 })).toBe(false);
  });

  it('should handle negative direction selections', () => {
    const { result } = renderHook(() => useTouch());
    const startPos = { row: 3, col: 3 };
    const endPos = { row: 1, col: 1 };

    act(() => {
      result.current.startSelection(startPos);
    });

    act(() => {
      result.current.updateSelection(endPos);
    });

    expect(result.current.touchState.selectedPositions).toEqual([
      { row: 3, col: 3 },
      { row: 2, col: 2 },
      { row: 1, col: 1 }
    ]);
  });

  it('should handle horizontal reverse selections', () => {
    const { result } = renderHook(() => useTouch());
    const startPos = { row: 1, col: 3 };
    const endPos = { row: 1, col: 1 };

    act(() => {
      result.current.startSelection(startPos);
    });

    act(() => {
      result.current.updateSelection(endPos);
    });

    expect(result.current.touchState.selectedPositions).toEqual([
      { row: 1, col: 3 },
      { row: 1, col: 2 },
      { row: 1, col: 1 }
    ]);
  });

  it('should handle vertical reverse selections', () => {
    const { result } = renderHook(() => useTouch());
    const startPos = { row: 3, col: 1 };
    const endPos = { row: 1, col: 1 };

    act(() => {
      result.current.startSelection(startPos);
    });

    act(() => {
      result.current.updateSelection(endPos);
    });

    expect(result.current.touchState.selectedPositions).toEqual([
      { row: 3, col: 1 },
      { row: 2, col: 1 },
      { row: 1, col: 1 }
    ]);
  });
});