import { useTheme } from '../../hooks/useTheme';
import styles from './Header.module.css';

interface HeaderProps {
  onNewGame?: () => void;
  onToggleShowAnswers?: () => void;
  showingAnswers?: boolean;
}

export const Header = ({ onNewGame, onToggleShowAnswers, showingAnswers = false }: HeaderProps) => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>Word Search</h1>
      <div className={styles.controls}>
        {onNewGame && (
          <button 
            className={styles.newGameButton}
            onClick={onNewGame}
            aria-label="Start new game"
          >
            New Game
          </button>
        )}
        {onToggleShowAnswers && (
          <button 
            className={styles.showAnswersButton}
            onClick={onToggleShowAnswers}
            aria-label={showingAnswers ? "Hide answers" : "Show answers"}
          >
            {showingAnswers ? 'Hide Answers' : 'Show Answers'}
          </button>
        )}
        <button 
          className={styles.themeToggle}
          onClick={toggleTheme}
          aria-label={`Switch to ${theme.name === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme.name === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    </header>
  );
};