// Sound effects and audio utilities
export const playSound = (soundType, volume = 0.5) => {
  // Check if sounds are enabled in preferences
  const gameState = JSON.parse(localStorage.getItem('gameState') || '{}');
  if (!gameState.preferences?.sounds) return;

  // Create audio context for better performance
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
  const sounds = {
    // Tic-tac-toe sounds
    move: { frequency: 440, duration: 0.1, type: 'sine' },
    win: { frequency: 523, duration: 0.5, type: 'sine' },
    lose: { frequency: 220, duration: 0.5, type: 'sine' },
    draw: { frequency: 330, duration: 0.3, type: 'sine' },
    
    // Wordle sounds
    keypress: { frequency: 200, duration: 0.05, type: 'sine' },
    correct: { frequency: 600, duration: 0.2, type: 'sine' },
    partial: { frequency: 400, duration: 0.2, type: 'sine' },
    invalid: { frequency: 150, duration: 0.3, type: 'sine' },
    
    // Sudoku sounds
    place: { frequency: 300, duration: 0.1, type: 'sine' },
    error: { frequency: 100, duration: 0.2, type: 'sine' },
    complete: { frequency: 800, duration: 0.8, type: 'sine' },
    
    // UI sounds
    click: { frequency: 250, duration: 0.05, type: 'sine' },
    achievement: { frequency: 700, duration: 0.6, type: 'sine' }
  };

  const sound = sounds[soundType];
  if (!sound) return;

  try {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = sound.frequency;
    oscillator.type = sound.type;
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + sound.duration);
  } catch (error) {
    console.warn('Audio playback failed:', error);
  }
};

// Animation utilities
export const animateElement = (element, animationType, duration = 300) => {
  if (!element) return;

  // Check if animations are enabled
  const gameState = JSON.parse(localStorage.getItem('gameState') || '{}');
  if (!gameState.preferences?.animations) return;

  const animations = {
    pulse: [
      { transform: 'scale(1)', opacity: 1 },
      { transform: 'scale(1.1)', opacity: 0.8 },
      { transform: 'scale(1)', opacity: 1 }
    ],
    shake: [
      { transform: 'translateX(0)' },
      { transform: 'translateX(-5px)' },
      { transform: 'translateX(5px)' },
      { transform: 'translateX(-5px)' },
      { transform: 'translateX(0)' }
    ],
    bounce: [
      { transform: 'translateY(0)' },
      { transform: 'translateY(-10px)' },
      { transform: 'translateY(0)' },
      { transform: 'translateY(-5px)' },
      { transform: 'translateY(0)' }
    ],
    fade: [
      { opacity: 1 },
      { opacity: 0 },
      { opacity: 1 }
    ],
    spin: [
      { transform: 'rotate(0deg)' },
      { transform: 'rotate(360deg)' }
    ]
  };

  const keyframes = animations[animationType];
  if (!keyframes) return;

  try {
    element.animate(keyframes, {
      duration,
      easing: 'ease-in-out'
    });
  } catch (error) {
    console.warn('Animation failed:', error);
  }
};

// Local storage utilities
export const saveGameState = (gameType, state) => {
  try {
    const key = `${gameType}GameState`;
    localStorage.setItem(key, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save game state:', error);
  }
};

export const loadGameState = (gameType) => {
  try {
    const key = `${gameType}GameState`;
    const state = localStorage.getItem(key);
    return state ? JSON.parse(state) : null;
  } catch (error) {
    console.error('Failed to load game state:', error);
    return null;
  }
};

export const clearGameState = (gameType) => {
  try {
    const key = `${gameType}GameState`;
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to clear game state:', error);
  }
};

// Time formatting utilities
export const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const formatTimeElapsed = (startTime, endTime = new Date()) => {
  const elapsed = Math.floor((endTime - startTime) / 1000);
  return formatTime(elapsed);
};

// Score calculation utilities
export const calculateScore = (gameType, gameData) => {
  switch (gameType) {
    case 'tictactoe':
      return {
        baseScore: gameData.won ? 100 : 0,
        timeBonus: 0, // Tic-tac-toe doesn't have time bonus
        difficultyMultiplier: 1,
        total: gameData.won ? 100 : 0
      };

    case 'wordle':
      const attemptsUsed = gameData.attempts || 6;
      const wordleBaseScore = gameData.won ? 100 : 0;
      const attemptBonus = gameData.won ? (7 - attemptsUsed) * 10 : 0;
      return {
        baseScore: wordleBaseScore,
        attemptBonus,
        streakBonus: gameData.streak ? gameData.streak * 5 : 0,
        total: wordleBaseScore + attemptBonus + (gameData.streak ? gameData.streak * 5 : 0)
      };

    case 'sudoku':
      const difficultyMultipliers = { easy: 1, medium: 1.5, hard: 2, expert: 3 };
      const sudokuBaseScore = gameData.solved ? 200 : 0;
      const timeBonus = gameData.solved && gameData.timeInSeconds ? 
        Math.max(0, 600 - gameData.timeInSeconds) : 0; // Bonus for solving under 10 minutes
      const difficultyMultiplier = difficultyMultipliers[gameData.difficulty] || 1;
      
      return {
        baseScore: sudokuBaseScore,
        timeBonus,
        difficultyMultiplier,
        total: Math.floor((sudokuBaseScore + timeBonus) * difficultyMultiplier)
      };

    default:
      return { baseScore: 0, total: 0 };
  }
};

// Difficulty level utilities
export const getDifficultySettings = (gameType, difficulty) => {
  const settings = {
    tictactoe: {
      easy: { aiDelay: 1000, aiMistakeProbability: 0.2 },
      medium: { aiDelay: 500, aiMistakeProbability: 0.1 },
      hard: { aiDelay: 200, aiMistakeProbability: 0.05 },
      expert: { aiDelay: 100, aiMistakeProbability: 0 }
    },
    wordle: {
      easy: { maxAttempts: 8, hintsAllowed: 3 },
      medium: { maxAttempts: 6, hintsAllowed: 1 },
      hard: { maxAttempts: 5, hintsAllowed: 0 },
      expert: { maxAttempts: 4, hintsAllowed: 0 }
    },
    sudoku: {
      easy: { emptyCells: 40, hintsAllowed: 5 },
      medium: { emptyCells: 50, hintsAllowed: 3 },
      hard: { emptyCells: 60, hintsAllowed: 2 },
      expert: { emptyCells: 70, hintsAllowed: 1 }
    }
  };

  return settings[gameType]?.[difficulty] || settings[gameType]?.medium;
};

// Random utilities
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const getRandomElement = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

export const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Validation utilities
export const validateInput = (input, type) => {
  switch (type) {
    case 'letter':
      return /^[a-zA-Z]$/.test(input);
    case 'number':
      return /^[1-9]$/.test(input);
    case 'word':
      return /^[a-zA-Z]{5}$/.test(input);
    default:
      return false;
  }
};

// Performance utilities
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Achievement utilities
export const checkAchievementProgress = (gameType, stats, achievements) => {
  const progress = {};
  
  // Define achievement requirements
  const requirements = {
    tictactoe: {
      first_win: stats.wins >= 1,
      streak_5: stats.winStreak >= 5,
      perfect_game: stats.perfectGames >= 1
    },
    wordle: {
      first_win: stats.gamesWon >= 1,
      streak_7: stats.currentStreak >= 7,
      perfect_guess: stats.perfectGuesses >= 1
    },
    sudoku: {
      first_win: stats.gamesWon >= 1,
      speed_solve: stats.bestTimes.medium && stats.bestTimes.medium < 600,
      expert_master: stats.expertWins >= 10
    }
  };

  const gameRequirements = requirements[gameType] || {};
  
  Object.entries(gameRequirements).forEach(([key, condition]) => {
    progress[key] = {
      unlocked: condition,
      alreadyEarned: achievements.some(a => a.id.includes(key))
    };
  });

  return progress;
};

// Export all utilities as default object
export default {
  playSound,
  animateElement,
  saveGameState,
  loadGameState,
  clearGameState,
  formatTime,
  formatTimeElapsed,
  calculateScore,
  getDifficultySettings,
  shuffleArray,
  getRandomElement,
  getRandomInt,
  validateInput,
  debounce,
  throttle,
  checkAchievementProgress
}; 