import { useEffect, useState } from 'react';
import styles from './Victory.module.css';

interface VictoryProps {
  isVisible: boolean;
  targetWordsFound: number;
  bonusWordsFound: number;
  onNewGame: () => void;
  onDismiss: () => void;
}

export const Victory = ({ isVisible, targetWordsFound, bonusWordsFound, onNewGame, onDismiss }: VictoryProps) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setTimeout(() => setShowContent(true), 300);
    } else {
      setShowContent(false);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className={styles.overlay}>
      <div className={`${styles.modal} ${showContent ? styles.visible : ''}`}>
        <div className={styles.celebration}>🎉</div>
        <h2 className={styles.title}>Congratulations!</h2>
        <p className={styles.message}>
          You found all <strong>{targetWordsFound}</strong> target words!
        </p>
        {bonusWordsFound > 0 && (
          <p className={styles.bonus}>
            Plus <strong>{bonusWordsFound}</strong> bonus words!
          </p>
        )}
        <div className={styles.buttons}>
          <button 
            className={styles.dismissButton}
            onClick={onDismiss}
          >
            Keep Searching
          </button>
          <button 
            className={styles.newGameButton}
            onClick={onNewGame}
          >
            New Game
          </button>
        </div>
      </div>
    </div>
  );
};