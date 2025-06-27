import type { Cell as CellType } from '../../types';
import { Cell } from './Cell';
import styles from './Grid.module.css';

interface GridProps {
  grid: CellType[][];
  onPointerDown?: (row: number, col: number) => void;
  onPointerEnter?: (row: number, col: number) => void;
  onPointerUp?: () => void;
}

export const Grid = ({ grid, onPointerDown, onPointerEnter, onPointerUp }: GridProps) => {
  return (
    <div 
      className={styles.grid}
      onPointerUp={onPointerUp}
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