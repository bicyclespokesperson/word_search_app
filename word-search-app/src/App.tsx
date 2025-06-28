import { useState } from 'react';
import { Header } from './components/Header/Header';
import { Grid } from './components/Grid/Grid';
import { Stats } from './components/Stats/Stats';
import { WordList } from './components/WordList/WordList';
import { Victory } from './components/Victory/Victory';
import { useWordSearch } from './hooks/useWordSearch';
import { selectRandomWords, getRandomCategory } from './utils/wordSelector';
import styles from './App.module.css';

function App() {
  const [currentWords, setCurrentWords] = useState<string[] | null>(null);
  const [currentCategory, setCurrentCategory] = useState<string>('');
  const [victoryDismissed, setVictoryDismissed] = useState(false);

  const {
    gameState,
    handlePointerDown,
    handlePointerEnter,
    handlePointerUp,
    toggleShowAnswers
  } = useWordSearch(currentWords);

  const handleNewGame = () => {
    const randomCategory = getRandomCategory();
    const newWords = selectRandomWords(randomCategory.words, 15);
    setCurrentWords(newWords);
    setCurrentCategory(randomCategory.name);
    setVictoryDismissed(false);
  };

  const handleVictoryDismiss = () => {
    setVictoryDismissed(true);
  };

  const foundTargetWords = gameState.foundWords.filter(fw => fw.isTargetWord).map(fw => fw.word);

  return (
    <div className={styles.app}>
      <Header 
        onNewGame={handleNewGame} 
        onToggleShowAnswers={toggleShowAnswers}
        showingAnswers={gameState.showingAnswers}
      />
      
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
      
      <Victory
        isVisible={gameState.isCompleted && !victoryDismissed}
        targetWordsFound={foundTargetWords.length}
        bonusWordsFound={gameState.bonusWordsFound}
        category={currentCategory}
        onNewGame={handleNewGame}
        onDismiss={handleVictoryDismiss}
      />
    </div>
  );
}

export default App;
