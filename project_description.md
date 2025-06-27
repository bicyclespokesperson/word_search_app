# Word Search Website Specification

## Overview

A clean, modern word search puzzle game that runs entirely in the browser using GitHub Pages. Players find hidden words in a grid of letters by dragging their finger (or mouse) across consecutive letters. The game features both target words that must be found and bonus words that can be discovered for extra satisfaction.

## Core Requirements

### Basic Features

- Simple GitHub Pages based word search
- Written in TypeScript, using React
- Light mode and dark mode themes based on user's device preference
- Responsive design optimized for both desktop and mobile (especially mobile)
- 10-15 decently long target words displayed at the bottom
- Bonus word detection for any valid English dictionary word
- Bonus word counter

### UI Layout

- Page title at the top
- Letter grid in the middle
- Bonus word counter above the word list box but below the grid
- Box of target words to find at the bottom

### Interaction

- Find words by touching/clicking and dragging across letters
- Words must be in straight lines in one of eight directions (horizontal, vertical, diagonal)
- Visual feedback during selection
- Found words are highlighted permanently in the grid
- Found target words are marked (e.g., strikethrough) in the word list

## Detailed Features

### Game Mechanics

- **Grid Size**: 15x15 letter grid (can be adjusted for difficulty)
- **Word Placement**: Words placed in 8 directions
- **Word Selection**: Touch/click and drag to select, with visual selection path
- **Validation**: Real-time validation against target words and English dictionary
- **Completion**: Game ends when all target words are found, option to continue finding bonus words

### Visual Design

- **Minimalist UI**: Clean typography, subtle shadows, smooth animations
- **Color Coding**: Different colors for target words vs bonus words
- **Progress Indicators**: Visual feedback for found words (strikethrough, permanent highlighting)
- **Responsive Grid**: Square cells that scale appropriately on all devices

### User Experience Enhancements

- **Statistics**: Track bonus words found
- **New Game**: Generate fresh puzzles with different word sets
- **Smooth Animations**: Polished interactions and transitions

## Technical Implementation

### Technology Stack

- **Framework**: React with TypeScript
- **Styling**: CSS Modules with CSS custom properties for theming
- **Build Tool**: Vite
- **Deployment**: GitHub Actions → GitHub Pages
- **Dictionary**: Pre-processed word list bundled with the app (compressed JSON)

### Project Structure

```
src/
├── components/
│   ├── Grid/
│   │   ├── Grid.tsx          # Main grid component
│   │   ├── Cell.tsx          # Individual cell component
│   │   └── Grid.module.css
│   ├── WordList/
│   │   ├── WordList.tsx      # Target words display
│   │   └── WordList.module.css
│   ├── Header/
│   │   └── Header.tsx        # Title and theme toggle
│   └── Stats/
│       └── Stats.tsx         # Bonus word counter
├── hooks/
│   ├── useWordSearch.ts      # Main game logic hook
│   ├── useTheme.ts           # Theme management
│   └── useTouch.ts           # Touch/mouse interaction
├── utils/
│   ├── gridGenerator.ts      # Grid creation algorithm
│   ├── wordPlacer.ts         # Word placement logic
│   ├── dictionary.ts         # Dictionary validation
│   └── storage.ts            # Local storage for progress
├── data/
│   ├── wordLists.json        # Curated word sets
│   └── dictionary.json       # Compressed word list
└── types/
    └── index.ts              # TypeScript definitions
```

### Key Implementation Details

#### Grid Generation Algorithm

1. Place target words first using a backtracking algorithm
2. Fill remaining cells with weighted random letters (common letters appear more frequently)
3. Ensure reasonable bonus word density

#### Touch Interaction

- Track touch/mouse events on grid
- Calculate straight-line paths between cells
- Highlight valid selection paths in real-time
- Support both touch and mouse inputs seamlessly

#### Word Validation

- Use efficient data structure (e.g., Set or Trie) for dictionary lookups
- Separate validation for target vs bonus words
- Case-insensitive matching

#### State Management

- React Context or hooks for game state (found words, current selection)
- Local storage persistence for game progress
- Optimistic updates for smooth interactions

#### Performance Optimizations

- Memoized grid cells to prevent unnecessary re-renders
- CSS transforms for smooth animations
- Efficient dictionary lookup structure

#### Theme System

- CSS custom properties for colors
- `prefers-color-scheme` media query for automatic theme selection
- Smooth transitions between themes

### Implementation Priorities

#### Phase 1: Core Functionality (MVP)

- [x] Basic grid generation and display
- [x] Bonus word counter (doesn't need logic to be implemented yet, but should be included in page design)
- [x] Theme support (light/dark)
- [x] Word placement algorithm
- [x] Touch/click selection mechanics
- [x] Target word validation and highlighting
- [x] Basic responsive styling
- [x] Word list display with found word tracking
- [x] Smooth animations and transitions

#### Phase 2: Polish & Features

- [x] Bonus word detection with dictionary
- [x] Mobile touch optimizations
- [x] Local storage for game progress
- [x] New game functionality

#### Phase 3: Future Enhancements (Optional)

- [ ] Multiple difficulty levels
- [ ] Word categories/themes
- [ ] Share completion stats
- [ ] Sound effects
- [ ] Hint system
- [ ] Timer/scoring system

### Deployment

- Phase 1 - bash script with help message to run a local server for testing
- Phase 2 - GitHub Actions workflow for CI/CD
- Phase 2 - Automatic deployment to GitHub Pages on push to main
- Phase 2 - Base URL configuration for GitHub Pages
- Phase 2 - Mobile-friendly meta tags

## Dictionary Requirements

- Comprehensive English word list (minimum 10,000 common words)
- Compressed format to minimize bundle size
- Efficient lookup structure (Set or Trie)
- Case-insensitive matching
- A file of english words can be found at data/words_alpha.txt

## Example Word Lists

Target words should be 5-12 letters long and commonly known. Example set:

- JAVASCRIPT
- TYPESCRIPT
- FUNCTION
- VARIABLE
- COMPONENT
- ALGORITHM
- DATABASE
- INTERFACE
- PARAMETER
- DEVELOPER
- FRAMEWORK
- REPOSITORY
- DEBUGGING
- RESPONSIVE
- DEPLOYMENT
