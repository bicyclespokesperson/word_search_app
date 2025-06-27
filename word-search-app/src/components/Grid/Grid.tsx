import type { Cell as CellType } from '../../types';
import { Cell } from './Cell';
import styles from './Grid.module.css';
import { useRef } from 'react';

interface GridProps {
  grid: CellType[][];
  onPointerDown?: (row: number, col: number) => void;
  onPointerEnter?: (row: number, col: number) => void;
  onPointerUp?: () => void;
}

export const Grid = ({ grid, onPointerDown, onPointerEnter, onPointerUp }: GridProps) => {
  const lastTouchedCell = useRef<EventTarget | null>(null);

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);

    if (element && element !== lastTouchedCell.current) {
      const row = parseInt(element.getAttribute('data-row') || '-1', 10);
      const col = parseInt(element.getAttribute('data-col') || '-1', 10);

      if (row !== -1 && col !== -1) {
        onPointerEnter?.(row, col);
      }
      
      lastTouchedCell.current = element;
    }
  };

  return (
    <div
      className={styles.grid}
      onPointerUp={onPointerUp}
      onTouchMove={handleTouchMove}
      onPointerDown={() => (lastTouchedCell.current = null)}
    >
      {grid.flat().map((cell) => (
        <Cell
          key={`${cell.position.row}-${cell.position.col}`}
          cell={cell}
          onPointerDown={onPointerDown}
          onPointerEnter={onPointerEnter}
          onPointerUp={onPointerUp}
        />
      ))}
    </div>
  );
};
