import styles from './Stats.module.css';

interface StatsProps {
  bonusWordsFound: number;
  targetWordsFound: number;
  totalTargetWords: number;
}

export const Stats = ({ bonusWordsFound, targetWordsFound, totalTargetWords }: StatsProps) => {
  const progress = Math.round((targetWordsFound / totalTargetWords) * 100);
  
  return (
    <div className={styles.stats}>
      <div className={styles.stat}>
        <span className={styles.label}>Progress:</span>
        <span className={styles.value}>{targetWordsFound}/{totalTargetWords} ({progress}%)</span>
      </div>
      <div className={styles.stat}>
        <span className={styles.label}>Bonus Words:</span>
        <span className={styles.value}>{bonusWordsFound}</span>
      </div>
    </div>
  );
};