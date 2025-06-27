import { useTheme } from '../../hooks/useTheme';
import styles from './Header.module.css';

export const Header = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>Word Search</h1>
      <button 
        className={styles.themeToggle}
        onClick={toggleTheme}
        aria-label={`Switch to ${theme.name === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme.name === 'light' ? '🌙' : '☀️'}
      </button>
    </header>
  );
};