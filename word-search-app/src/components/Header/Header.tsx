import { useTheme } from '../../hooks/useTheme';
import styles from './Header.module.css';

interface HeaderProps {
  onNewGame?: () => void;
}

export const Header = ({ onNewGame }: HeaderProps) => {
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