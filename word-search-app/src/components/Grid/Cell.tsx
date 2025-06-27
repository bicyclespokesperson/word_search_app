import type { Cell as CellType } from '../../types';
import styles from './Grid.module.css';

interface CellProps {
  cell: CellType;
  onPointerDown?: (row: number, col: number) => void;
  onPointerEnter?: (row: number, col: number) => void;
  onPointerUp?: () => void;
}

export const Cell = ({ cell, onPointerDown, onPointerEnter, onPointerUp }: CellProps) => {
  const handlePointerDown = () => {
    onPointerDown?.(cell.position.row, cell.position.col);
  };

  const handlePointerEnter = () => {
    onPointerEnter?.(cell.position.row, cell.position.col);
  };

  const getCellClassName = () => {
    let className = styles.cell;
    
    if (cell.isHighlighted) {
      className += ` ${styles.highlighted}`;
    }
    
    if (cell.isPartOfFoundWord) {
      className += ` ${styles.foundWord}`;
      // Add bonus word styling if needed
      if (cell.foundWordId?.includes('bonus')) {
        className += ` ${styles.bonusWord}`;
      }
    }
    
    if (cell.isBonusFlashing) {
      className += ` ${styles.bonusFlash}`;
    }
    
    if (cell.isAnswerRevealed) {
      className += ` ${styles.answerRevealed}`;
    }
    
    return className;
  };

  return (
    <div
      className={getCellClassName()}
      onPointerDown={handlePointerDown}
      onPointerEnter={handlePointerEnter}
      onPointerUp={onPointerUp}
      data-row={cell.position.row}
      data-col={cell.position.col}
    >
      {cell.letter}
    </div>
  );
};