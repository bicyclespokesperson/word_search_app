import { Header } from './components/Header/Header';
import { Grid } from './components/Grid/Grid';
import { Stats } from './components/Stats/Stats';
import { WordList } from './components/WordList/WordList';
import { useWordSearch } from './hooks/useWordSearch';
import wordLists from './data/wordLists.json';
import styles from './App.module.css';

function App() {
  const {
    gameState,
    handlePointerDown,
    handlePointerEnter,
    handlePointerUp,
    newGame
  } = useWordSearch(wordLists.programming);

  const foundTargetWords = gameState.foundWords.filter(fw => fw.isTargetWord).map(fw => fw.word);

  return (
    <div className={styles.app}>
      <Header onNewGame={newGame} />
      
      <main className={styles.main}>
        <Grid
          grid={gameState.grid}
          onPointerDown={handlePointerDown}
          onPointerEnter={handlePointerEnter}
          onPointerUp={handlePointerUp}
        />
        
        <Stats
          bonusWordsFound={gameState.bonusWordsFound}
          targetWordsFound={foundTargetWords.length}
          totalTargetWords={gameState.targetWords.length}
        />
        
        <WordList
          words={gameState.targetWords}
          foundWords={foundTargetWords}
        />
      </main>
    </div>
  );
}

export default App;
