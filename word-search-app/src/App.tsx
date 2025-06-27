import { useState, useEffect } from 'react';
import { Header } from './components/Header/Header';
import { Grid } from './components/Grid/Grid';
import { Stats } from './components/Stats/Stats';
import { WordList } from './components/WordList/WordList';
import { placeWordsInGrid } from './utils/gridGenerator';
import type { GameState } from './types';
import wordLists from './data/wordLists.json';
import styles from './App.module.css';

function App() {
  const [gameState, setGameState] = useState<GameState>({
    grid: [],
    targetWords: [],
    foundWords: [],
    bonusWordsFound: 0,
    isCompleted: false,
    currentSelection: [],
    isSelecting: false
  });

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const targetWords = wordLists.programming;
    const { grid } = placeWordsInGrid(targetWords);
    
    setGameState({
      grid,
      targetWords,
      foundWords: [],
      bonusWordsFound: 0,
      isCompleted: false,
      currentSelection: [],
      isSelecting: false
    });
  };

  const handlePointerDown = (row: number, col: number) => {
    console.log('Pointer down:', row, col);
  };

  const handlePointerEnter = (row: number, col: number) => {
    console.log('Pointer enter:', row, col);
  };

  const handlePointerUp = () => {
    console.log('Pointer up');
  };

  const foundTargetWords = gameState.foundWords.filter(fw => fw.isTargetWord).map(fw => fw.word);

  return (
    <div className={styles.app}>
      <Header />
      
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
