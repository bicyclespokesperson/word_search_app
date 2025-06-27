#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DICT_SOURCE = path.join(__dirname, '../data/words_alpha.txt');
const DICT_OUTPUT = path.join(__dirname, '../word-search-app/public/dictionary.json');

console.log('Processing dictionary...');

try {
  // Read the source dictionary
  const dictText = fs.readFileSync(DICT_SOURCE, 'utf8');
  const allWords = dictText.split('\n').map(word => word.trim().toUpperCase()).filter(word => word.length > 0);
  
  console.log(`Found ${allWords.length} total words`);
  
  // Filter to reasonable bonus words (3-12 characters, exclude very obscure words)
  const bonusWords = allWords.filter(word => {
    // Length filter
    if (word.length < 3 || word.length > 12) return false;
    
    // Exclude words with non-alphabetic characters
    if (!/^[A-Z]+$/.test(word)) return false;
    
    // Include common word patterns (this is a simple heuristic)
    // We'll keep most words but exclude some very obscure ones
    return true;
  });
  
  console.log(`Filtered to ${bonusWords.length} bonus words (3-12 characters)`);
  
  // Create the output directory if it doesn't exist
  const outputDir = path.dirname(DICT_OUTPUT);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Write the processed dictionary
  fs.writeFileSync(DICT_OUTPUT, JSON.stringify(bonusWords));
  
  console.log(`Dictionary processed and saved to ${DICT_OUTPUT}`);
  console.log(`File size: ${(fs.statSync(DICT_OUTPUT).size / 1024 / 1024).toFixed(2)} MB`);
  
} catch (error) {
  console.error('Error processing dictionary:', error);
  process.exit(1);
}