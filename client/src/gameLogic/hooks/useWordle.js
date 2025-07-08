import { useState, useCallback, useEffect } from 'react';
import wordleCache from '../../utils/wordleCache.js';

const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 6;

// Fallback word list - in case cache fails
const FALLBACK_WORD_LIST = [
  'REACT', 'HOOKS', 'STATE', 'PROPS', 'ARRAY', 'ASYNC', 'CONST', 'FETCH',
  'BLOCK', 'CHAIN', 'CLICK', 'CLONE', 'CLOSE', 'CRAFT', 'CRASH', 'DANCE',
  'DEBUG', 'DOUBT', 'DREAM', 'DRIVE', 'EAGLE', 'EARLY', 'EARTH', 'EMPTY',
  'ENEMY', 'ENTRY', 'ERROR', 'EVENT', 'EVERY', 'EXACT', 'EXIST', 'EXTRA',
  'FAITH', 'FALSE', 'FRAME', 'FRESH', 'FRONT', 'FRUIT', 'FULLY', 'FUNNY',
  'GIANT', 'GLASS', 'GRACE', 'GRANT', 'GREAT', 'GREEN', 'GROSS', 'GROUP',
  'GUARD', 'GUESS', 'GUEST', 'GUIDE', 'HAPPY', 'HEART', 'HEAVY', 'HORSE',
  'HOUSE', 'HUMAN', 'IMAGE', 'INDEX', 'INPUT', 'ISSUE', 'JAPAN', 'JUDGE',
  'KNIFE', 'KNOWN', 'LABEL', 'LARGE', 'LASER', 'LATER', 'LAUGH', 'LAYER',
  'LEARN', 'LEAST', 'LEAVE', 'LEVEL', 'LIGHT', 'LIMIT', 'LOGIC', 'LOOSE',
  'LOWER', 'LUCKY', 'LUNCH', 'MAGIC', 'MAJOR', 'MAKER', 'MARCH', 'MATCH',
  'MAYBE', 'MEANS', 'METAL', 'MIGHT', 'MINOR', 'MINUS', 'MODEL', 'MONEY',
  'MONTH', 'MORAL', 'MOUSE', 'MOUTH', 'MUSIC', 'NEEDS', 'NEVER', 'NIGHT',
  'NOISE', 'NORTH', 'NOTED', 'NOVEL', 'NURSE', 'OCCUR', 'OCEAN', 'OFFER',
  'OFTEN', 'ORDER', 'OTHER', 'OUGHT', 'OWNED', 'OWNER', 'PAINT', 'PANEL',
  'PAPER', 'PARTY', 'PEACE', 'PHASE', 'PHONE', 'PHOTO', 'PIECE', 'PILOT',
  'PITCH', 'PLACE', 'PLAIN', 'PLANE', 'PLANT', 'PLATE', 'POINT', 'POUND',
  'POWER', 'PRESS', 'PRICE', 'PRIDE', 'PRIME', 'PRINT', 'PRIOR', 'PRIZE',
  'PROOF', 'PROUD', 'PROVE', 'QUEEN', 'QUICK', 'QUIET', 'QUITE', 'RADIO',
  'RAISE', 'RANGE', 'RAPID', 'RATIO', 'REACH', 'READY', 'REALM', 'REBEL',
  'REFER', 'RELAX', 'REMIX', 'REPLY', 'RIGHT', 'RIGID', 'RIVAL', 'RIVER',
  'ROBOT', 'ROGER', 'ROMAN', 'ROUGH', 'ROUND', 'ROUTE', 'ROYAL', 'RURAL',
  'SCALE', 'SCENE', 'SCOPE', 'SCORE', 'SENSE', 'SERVE', 'SETUP', 'SEVEN',
  'SHADE', 'SHAKE', 'SHALL', 'SHAPE', 'SHARE', 'SHARP', 'SHEET', 'SHELF',
  'SHELL', 'SHIFT', 'SHINE', 'SHIRT', 'SHOCK', 'SHOOT', 'SHORT', 'SHOWN',
  'SIGHT', 'SILLY', 'SINCE', 'SIXTH', 'SIXTY', 'SIZED', 'SKILL', 'SLEEP',
  'SLIDE', 'SMALL', 'SMART', 'SMILE', 'SMOKE', 'SNAKE', 'SOLID', 'SOLVE',
  'SORRY', 'SOUND', 'SOUTH', 'SPACE', 'SPARE', 'SPEAK', 'SPEED', 'SPEND',
  'SPENT', 'SPLIT', 'SPOKE', 'SPORT', 'SQUAD', 'STAFF', 'STAGE', 'STAKE',
  'STAND', 'START', 'STATE', 'STEAM', 'STEEL', 'STEEP', 'STICK', 'STILL',
  'STOCK', 'STONE', 'STOOD', 'STORE', 'STORM', 'STORY', 'STRIP', 'STUCK',
  'STUDY', 'STUFF', 'STYLE', 'SUGAR', 'SUITE', 'SUPER', 'SWEET', 'SWIFT',
  'SWING', 'SWISS', 'TABLE', 'TAKEN', 'TASTE', 'TAXES', 'TEACH', 'THANK',
  'THEFT', 'THEIR', 'THEME', 'THERE', 'THESE', 'THICK', 'THING', 'THINK',
  'THIRD', 'THOSE', 'THREE', 'THREW', 'THROW', 'THUMB', 'TIGER', 'TIGHT',
  'TIRED', 'TITLE', 'TODAY', 'TOKEN', 'TOPIC', 'TOTAL', 'TOUCH', 'TOUGH',
  'TOWER', 'TRACK', 'TRADE', 'TRAIL', 'TRAIN', 'TREAT', 'TREND', 'TRIAL',
  'TRIBE', 'TRICK', 'TRIED', 'TRIES', 'TRUCK', 'TRULY', 'TRUNK', 'TRUST',
  'TRUTH', 'TWICE', 'UNCLE', 'UNDER', 'UNDUE', 'UNION', 'UNITY', 'UNTIL',
  'UPPER', 'UPSET', 'URBAN', 'USAGE', 'USUAL', 'VALID', 'VALUE', 'VIDEO',
  'VIRUS', 'VISIT', 'VITAL', 'VOCAL', 'VOICE', 'WASTE', 'WATCH', 'WATER',
  'WAVE', 'WHEEL', 'WHERE', 'WHICH', 'WHILE', 'WHITE', 'WHOLE', 'WHOSE',
  'WIDER', 'WOMAN', 'WOMEN', 'WORLD', 'WORRY', 'WORSE', 'WORST', 'WORTH',
  'WOULD', 'WRITE', 'WRONG', 'WROTE', 'YOUNG', 'YOUTH', 'ZONE'
];

export const useWordle = () => {
  const [targetWord, setTargetWord] = useState('');
  const [currentGuess, setCurrentGuess] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'won', 'lost'
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [keyboardStatus, setKeyboardStatus] = useState({}); // Track letter status for keyboard
  const [wordsLoaded, setWordsLoaded] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [stats, setStats] = useState({
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
  });

  // Initialize word cache on component mount
  useEffect(() => {
    const loadWords = async () => {
      try {
        await wordleCache.ensureWordsLoaded();
        setWordsLoaded(true);
      } catch (error) {
        console.error('Failed to load words:', error);
        setWordsLoaded(true); // Continue with fallback words
      }
    };
    
    loadWords();
  }, []);

  const getRandomWord = useCallback(() => {
    return wordleCache.getRandomWord() || FALLBACK_WORD_LIST[Math.floor(Math.random() * FALLBACK_WORD_LIST.length)];
  }, []);

  const initializeGame = useCallback(() => {
    const newWord = getRandomWord();
    setTargetWord(newWord);
    setCurrentGuess('');
    setGuesses([]);
    setGameStatus('playing');
    setCurrentAttempt(0);
    setKeyboardStatus({});
    setStartTime(Date.now());
  }, [getRandomWord]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const isValidWord = useCallback((word) => {
    // Use cached words for validation, fallback to fallback list
    if (wordleCache.isValidWord(word)) {
      return true;
    }
    return FALLBACK_WORD_LIST.includes(word.toUpperCase());
  }, []);

  const checkGuess = useCallback((guess, target) => {
    const result = [];
    const targetArray = target.split('');
    const guessArray = guess.split('');
    
    // First pass: mark exact matches
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (guessArray[i] === targetArray[i]) {
        result[i] = 'correct';
        targetArray[i] = null; // Mark as used
      }
    }
    
    // Second pass: mark partial matches
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (result[i] !== 'correct') {
        const targetIndex = targetArray.indexOf(guessArray[i]);
        if (targetIndex !== -1) {
          result[i] = 'partial';
          targetArray[targetIndex] = null; // Mark as used
        } else {
          result[i] = 'incorrect';
        }
      }
    }
    
    return result;
  }, []);

  const updateKeyboardStatus = useCallback((guess, result) => {
    const newKeyboardStatus = { ...keyboardStatus };
    
    for (let i = 0; i < guess.length; i++) {
      const letter = guess[i];
      const status = result[i];
      
      // Only update if the new status is better than the current one
      if (!newKeyboardStatus[letter] || 
          (status === 'correct') ||
          (status === 'partial' && newKeyboardStatus[letter] === 'incorrect')) {
        newKeyboardStatus[letter] = status;
      }
    }
    
    setKeyboardStatus(newKeyboardStatus);
  }, [keyboardStatus]);

  const submitGuess = useCallback(() => {
    if (currentGuess.length !== WORD_LENGTH) {
      return { success: false, error: 'Word must be 5 letters long' };
    }
    
    if (!isValidWord(currentGuess)) {
      return { success: false, error: 'Not a valid word' };
    }
    
    const upperGuess = currentGuess.toUpperCase();
    const result = checkGuess(upperGuess, targetWord);
    
    const newGuess = {
      word: upperGuess,
      result: result
    };
    
    const newGuesses = [...guesses, newGuess];
    setGuesses(newGuesses);
    updateKeyboardStatus(upperGuess, result);
    
    // Check if won
    if (upperGuess === targetWord) {
      setGameStatus('won');
      setStats(prev => ({
        ...prev,
        gamesPlayed: prev.gamesPlayed + 1,
        gamesWon: prev.gamesWon + 1,
        currentStreak: prev.currentStreak + 1,
        maxStreak: Math.max(prev.maxStreak, prev.currentStreak + 1),
        guessDistribution: {
          ...prev.guessDistribution,
          [currentAttempt + 1]: prev.guessDistribution[currentAttempt + 1] + 1
        }
      }));
    } else if (currentAttempt >= MAX_ATTEMPTS - 1) {
      setGameStatus('lost');
      setStats(prev => ({
        ...prev,
        gamesPlayed: prev.gamesPlayed + 1,
        currentStreak: 0
      }));
    }
    
    setCurrentAttempt(prev => prev + 1);
    setCurrentGuess('');
    
    return { success: true };
  }, [currentGuess, targetWord, guesses, currentAttempt, isValidWord, checkGuess, updateKeyboardStatus]);

  const addLetter = useCallback((letter) => {
    if (currentGuess.length < WORD_LENGTH && gameStatus === 'playing') {
      setCurrentGuess(prev => prev + letter.toUpperCase());
    }
  }, [currentGuess, gameStatus]);

  const removeLetter = useCallback(() => {
    if (currentGuess.length > 0 && gameStatus === 'playing') {
      setCurrentGuess(prev => prev.slice(0, -1));
    }
  }, [currentGuess, gameStatus]);

  const getEmptyRows = useCallback(() => {
    const emptyRowsCount = MAX_ATTEMPTS - guesses.length - (gameStatus === 'playing' ? 1 : 0);
    return Array(emptyRowsCount).fill(null).map(() => ({
      word: '',
      result: Array(WORD_LENGTH).fill('empty')
    }));
  }, [guesses, gameStatus]);

  const getCurrentRow = useCallback(() => {
    if (gameStatus !== 'playing') return null;
    
    const paddedGuess = currentGuess.padEnd(WORD_LENGTH, ' ');
    return {
      word: paddedGuess,
      result: Array(WORD_LENGTH).fill('current')
    };
  }, [currentGuess, gameStatus]);

  const getAllRows = useCallback(() => {
    const rows = [...guesses];
    
    if (gameStatus === 'playing') {
      rows.push(getCurrentRow());
    }
    
    rows.push(...getEmptyRows());
    
    return rows;
  }, [guesses, gameStatus, getCurrentRow, getEmptyRows]);

  const resetGame = useCallback(() => {
    initializeGame();
  }, [initializeGame]);

  const resetStats = useCallback(() => {
    setStats({
      gamesPlayed: 0,
      gamesWon: 0,
      currentStreak: 0,
      maxStreak: 0,
      guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
    });
  }, []);

  // Cache utility functions
  const getCacheInfo = useCallback(() => {
    return wordleCache.getCacheInfo();
  }, []);

  const refreshWords = useCallback(async () => {
    try {
      await wordleCache.forceRefresh();
      return true;
    } catch (error) {
      console.error('Failed to refresh words:', error);
      return false;
    }
  }, []);

  return {
    targetWord,
    currentGuess,
    guesses,
    gameStatus,
    currentAttempt,
    keyboardStatus,
    stats,
    wordsLoaded,
    startTime,
    maxAttempts: MAX_ATTEMPTS,
    wordLength: WORD_LENGTH,
    submitGuess,
    addLetter,
    removeLetter,
    resetGame,
    resetStats,
    getAllRows,
    isGameActive: gameStatus === 'playing',
    // Cache utilities
    getCacheInfo,
    refreshWords,
    wordsCount: wordleCache.getWordsCount()
  };
}; 