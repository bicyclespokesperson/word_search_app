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
        {words.map((word, index) => (
          <span key={word}>
            <span
              className={`${styles.word} ${foundWords.includes(word) ? styles.found : ''}`}
            >
              {word}
            </span>
            {index < words.length - 1 && <span className={styles.separator}>,</span>}
          </span>
        ))}
      </div>
    </div>
  );
};