import styles from './WordList.module.css';

interface WordListProps {
  words: string[];
  foundWords: string[];
}

export const WordList = ({ words, foundWords }: WordListProps) => {
  return (
    <div className={styles.wordList}>
      <h2 className={styles.title}>Find These Words</h2>
      <div className={styles.words}>
        {words.map((word) => (
          <div
            key={word}
            className={`${styles.word} ${foundWords.includes(word) ? styles.found : ''}`}
          >
            {word}
          </div>
        ))}
      </div>
    </div>
  );
};