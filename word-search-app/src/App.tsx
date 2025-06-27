import { useState } from 'react';
import { Header } from './components/Header/Header';
import { Grid } from './components/Grid/Grid';
import { Stats } from './components/Stats/Stats';
import { WordList } from './components/WordList/WordList';
import { Victory } from './components/Victory/Victory';
import { useWordSearch } from './hooks/useWordSearch';
import { selectRandomWords } from './utils/wordSelector';
import wordLists from './data/wordLists.json';
import styles from './App.module.css';

function App() {
  const [currentWords, setCurrentWords] = useState<string[] | null>(null);
  const [victoryDismissed, setVictoryDismissed] = useState(false);

  const {
    gameState,
    handlePointerDown,
    handlePointerEnter,
    handlePointerUp,
    toggleShowAnswers
  } = useWordSearch(currentWords);

  const handleNewGame = () => {
    const newWords = selectRandomWords(wordLists.programming, 15);
    setCurrentWords(newWords);
    setVictoryDismissed(false); // Reset victory modal for new game
    // newGame() will be called automatically by useWordSearch when targetWords change
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
        onNewGame={handleNewGame}
        onDismiss={handleVictoryDismiss}
      />
    </div>
  );
}

export default App;
