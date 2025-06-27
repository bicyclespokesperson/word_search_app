// Dictionary state
class DictionaryService {
  private dictionarySet: Set<string> | null = null;

  async initialize(): Promise<void> {
    if (this.dictionarySet) return;

    try {
      // Try to load the processed dictionary JSON first
      const response = await fetch('/dictionary.json');
      if (response.ok) {
        const words: string[] = await response.json();
        this.dictionarySet = new Set(words.map(word => word.toUpperCase()));
        return;
      }
    } catch (error) {
      console.warn('Could not load processed dictionary, using fallback');
    }

    // Fallback: create a basic dictionary with common words
    this.dictionarySet = new Set([
      'CAT', 'DOG', 'BIRD', 'FISH', 'TREE', 'HOUSE', 'CAR', 'BOOK', 'WATER', 'FIRE',
      'EARTH', 'WIND', 'MOON', 'SUN', 'STAR', 'LIGHT', 'DARK', 'GOOD', 'BAD', 'BIG',
      'SMALL', 'FAST', 'SLOW', 'HOT', 'COLD', 'NEW', 'OLD', 'YOUNG', 'HAPPY', 'SAD',
      'LOVE', 'HATE', 'WORK', 'PLAY', 'SING', 'DANCE', 'WALK', 'RUN', 'JUMP', 'FLY',
      'SWIM', 'EAT', 'DRINK', 'SLEEP', 'WAKE', 'TALK', 'LISTEN', 'LOOK', 'SEE', 'HEAR',
      'FEEL', 'THINK', 'KNOW', 'LEARN', 'TEACH', 'HELP', 'GIVE', 'TAKE', 'MAKE', 'DO',
      'GO', 'COME', 'STAY', 'LEAVE', 'OPEN', 'CLOSE', 'START', 'STOP', 'BEGIN', 'END',
      'FIRST', 'LAST', 'NEXT', 'BACK', 'FRONT', 'SIDE', 'TOP', 'BOTTOM', 'UP', 'DOWN',
      'LEFT', 'RIGHT', 'IN', 'OUT', 'ON', 'OFF', 'OVER', 'UNDER', 'NEAR', 'FAR',
      'HERE', 'THERE', 'WHERE', 'WHEN', 'WHO', 'WHAT', 'WHY', 'HOW', 'YES', 'NO',
      'MAYBE', 'ALWAYS', 'NEVER', 'SOMETIMES', 'OFTEN', 'RARELY', 'DAILY', 'WEEKLY',
      'MONTHLY', 'YEARLY', 'TODAY', 'YESTERDAY', 'TOMORROW', 'NOW', 'THEN', 'SOON',
      'LATE', 'EARLY', 'QUICK', 'SLOW', 'EASY', 'HARD', 'SIMPLE', 'COMPLEX', 'CLEAR',
      'COMPUTER', 'PHONE', 'INTERNET', 'EMAIL', 'WEBSITE', 'PROGRAM', 'DATA', 'FILE',
      'FOLDER', 'SCREEN', 'KEYBOARD', 'MOUSE', 'CLICK', 'TYPE', 'SAVE', 'DELETE',
      'COPY', 'PASTE', 'CUT', 'UNDO', 'REDO', 'PRINT', 'SCAN', 'UPLOAD', 'DOWNLOAD'
    ]);
  }

  isValidWord(word: string): boolean {
    if (!this.dictionarySet) {
      console.warn('Dictionary not initialized');
      return false;
    }
    
    // Only consider words of 3+ characters as bonus words
    if (word.length < 3) return false;
    
    return this.dictionarySet.has(word.toUpperCase());
  }

  getDictionarySize(): number {
    return this.dictionarySet?.size || 0;
  }

  // For testing purposes
  reset(): void {
    this.dictionarySet = null;
  }
}

// Create singleton instance
const dictionaryService = new DictionaryService();

// Export public API
export const initializeDictionary = () => dictionaryService.initialize();
export const isValidWord = (word: string) => dictionaryService.isValidWord(word);
export const getDictionarySize = () => dictionaryService.getDictionarySize();

// Export for testing
export const _resetDictionary = () => dictionaryService.reset();