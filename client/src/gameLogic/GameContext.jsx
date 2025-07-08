import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useSelector } from 'react-redux';
import GameAPI from '../utils/gameApi.js';
import { debug } from '../utils/debug.js';

// Action types
const ACTIONS = {
  SET_ACTIVE_GAME: 'SET_ACTIVE_GAME',
  UPDATE_SCORE: 'UPDATE_SCORE',
  UPDATE_STATS: 'UPDATE_STATS',
  RESET_SCORES: 'RESET_SCORES',
  RESET_STATS: 'RESET_STATS',
  LOAD_FROM_STORAGE: 'LOAD_FROM_STORAGE',
  ADD_ACHIEVEMENT: 'ADD_ACHIEVEMENT',
  SET_PREFERENCES: 'SET_PREFERENCES'
};

// Initial state
const initialState = {
  activeGame: null,
  scores: {
    tictactoe: { player: 0, computer: 0 },
    wordle: { 
      gamesPlayed: 0, 
      gamesWon: 0, 
      currentStreak: 0, 
      maxStreak: 0,
      guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
    },
    sudoku: { 
      gamesPlayed: 0, 
      gamesWon: 0, 
      bestTimes: { easy: null, medium: null, hard: null, expert: null },
      averageTimes: { easy: [], medium: [], hard: [], expert: [] }
    }
  },
  achievements: [],
  preferences: {
    sounds: true,
    animations: true,
    darkMode: false,
    autoSave: true
  },
  totalGamesPlayed: 0,
  totalTimeSpent: 0,
  favoriteGame: null
};

// Achievement definitions
const ACHIEVEMENTS = {
  FIRST_WIN_TICTACTOE: {
    id: 'first_win_tictactoe',
    name: 'First Victory',
    description: 'Win your first Tic-Tac-Toe game',
    icon: '🏆',
    game: 'tictactoe'
  },
  STREAK_TICTACTOE_5: {
    id: 'streak_tictactoe_5',
    name: 'Winning Streak',
    description: 'Win 5 Tic-Tac-Toe games in a row',
    icon: '🔥',
    game: 'tictactoe'
  },
  FIRST_WIN_WORDLE: {
    id: 'first_win_wordle',
    name: 'Word Master',
    description: 'Solve your first Wordle puzzle',
    icon: '📝',
    game: 'wordle'
  },
  PERFECT_WORDLE: {
    id: 'perfect_wordle',
    name: 'Perfect Guess',
    description: 'Solve a Wordle puzzle in 1 guess',
    icon: '🎯',
    game: 'wordle'
  },
  WORDLE_STREAK_7: {
    id: 'wordle_streak_7',
    name: 'Word Wizard',
    description: 'Maintain a 7-day Wordle streak',
    icon: '⭐',
    game: 'wordle'
  },
  FIRST_WIN_SUDOKU: {
    id: 'first_win_sudoku',
    name: 'Number Ninja',
    description: 'Complete your first Sudoku puzzle',
    icon: '🧩',
    game: 'sudoku'
  },
  SPEED_SUDOKU: {
    id: 'speed_sudoku',
    name: 'Speed Solver',
    description: 'Complete a medium Sudoku puzzle in under 10 minutes',
    icon: '⚡',
    game: 'sudoku'
  },
  SUDOKU_EXPERT: {
    id: 'sudoku_expert',
    name: 'Sudoku Master',
    description: 'Complete 10 expert-level Sudoku puzzles',
    icon: '👑',
    game: 'sudoku'
  },
  GAME_MASTER: {
    id: 'game_master',
    name: 'Game Master',
    description: 'Win at least one game in each category',
    icon: '🎮',
    game: 'all'
  },
  CENTURY_CLUB: {
    id: 'century_club',
    name: 'Century Club',
    description: 'Play 100 games total',
    icon: '💯',
    game: 'all'
  }
};

// Reducer function
const gameReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_ACTIVE_GAME:
      return {
        ...state,
        activeGame: action.payload
      };

    case ACTIONS.UPDATE_SCORE:
      return {
        ...state,
        scores: {
          ...state.scores,
          [action.payload.game]: {
            ...state.scores[action.payload.game],
            ...action.payload.scores
          }
        },
        totalGamesPlayed: state.totalGamesPlayed + 1
      };

    case ACTIONS.UPDATE_STATS:
      return {
        ...state,
        totalTimeSpent: state.totalTimeSpent + (action.payload.timeSpent || 0),
        favoriteGame: calculateFavoriteGame({
          ...state.scores,
          [action.payload.game]: {
            ...state.scores[action.payload.game],
            ...action.payload.stats
          }
        })
      };

    case ACTIONS.RESET_SCORES:
      return {
        ...state,
        scores: {
          ...initialState.scores
        }
      };

    case ACTIONS.RESET_STATS:
      return {
        ...state,
        totalGamesPlayed: 0,
        totalTimeSpent: 0,
        favoriteGame: null
      };

    case ACTIONS.LOAD_FROM_STORAGE:
      return {
        ...state,
        ...action.payload
      };

    case ACTIONS.ADD_ACHIEVEMENT:
      if (state.achievements.some(a => a.id === action.payload.id)) {
        return state; // Achievement already exists
      }
      return {
        ...state,
        achievements: [...state.achievements, {
          ...action.payload,
          unlockedAt: new Date().toISOString()
        }]
      };

    case ACTIONS.SET_PREFERENCES:
      return {
        ...state,
        preferences: {
          ...state.preferences,
          ...action.payload
        }
      };

    default:
      return state;
  }
};

// Helper function to calculate favorite game
const calculateFavoriteGame = (scores) => {
  const gameCounts = {
    tictactoe: (scores.tictactoe.player || 0) + (scores.tictactoe.computer || 0),
    wordle: scores.wordle.gamesPlayed || 0,
    sudoku: scores.sudoku.gamesPlayed || 0
  };

  return Object.entries(gameCounts).reduce((a, b) => 
    gameCounts[a[0]] > gameCounts[b[0]] ? a : b
  )[0];
};

// Helper function to calculate favorite game from API stats
const calculateFavoriteGameFromStats = (gameStats) => {
  if (!gameStats || gameStats.length === 0) return null;
  
  return gameStats.reduce((prev, current) => 
    (prev.gamesPlayed > current.gamesPlayed) ? prev : current
  )?._id;
};

// Helper function to transform API stats to local state format
const transformApiStatsToLocalState = (gameStats) => {
  const scores = {
    tictactoe: { player: 0, computer: 0 },
    wordle: { 
      gamesPlayed: 0, 
      gamesWon: 0, 
      currentStreak: 0, 
      maxStreak: 0,
      guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
    },
    sudoku: { 
      gamesPlayed: 0, 
      gamesWon: 0, 
      bestTimes: { easy: null, medium: null, hard: null, expert: null },
      averageTimes: { easy: [], medium: [], hard: [], expert: [] }
    }
  };

  gameStats.forEach(stat => {
    if (stat._id === 'tictactoe') {
      // For tic-tac-toe, we'll estimate player wins vs computer wins
      scores.tictactoe.player = stat.gamesWon;
      scores.tictactoe.computer = stat.gamesPlayed - stat.gamesWon;
    } else if (stat._id === 'wordle') {
      scores.wordle.gamesPlayed = stat.gamesPlayed;
      scores.wordle.gamesWon = stat.gamesWon;
      // Note: currentStreak and maxStreak would need to be calculated separately
    } else if (stat._id === 'sudoku') {
      scores.sudoku.gamesPlayed = stat.gamesPlayed;
      scores.sudoku.gamesWon = stat.gamesWon;
      // Note: bestTimes would need to be fetched separately
    }
  });

  return scores;
};

// Create context
const GameContext = createContext();

// Context provider component
export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const { currentUser } = useSelector((state) => state.user);

  // Load user stats on mount and when user changes
  useEffect(() => {
    const loadUserData = async () => {
      if (currentUser) {
        try {
          const userData = await GameAPI.getUserStats();
          dispatch({
            type: ACTIONS.LOAD_FROM_STORAGE,
            payload: {
              scores: transformApiStatsToLocalState(userData.gameStats),
              totalGamesPlayed: userData.overallStats.totalGamesPlayed,
              totalTimeSpent: userData.overallStats.totalTimeSpent,
              favoriteGame: calculateFavoriteGameFromStats(userData.gameStats)
            }
          });
        } catch (error) {
          debug.error('Error loading user data:', error);
          // Fall back to localStorage for offline support
          loadFromLocalStorage();
        }
      } else {
        // Load from localStorage for guest users
        loadFromLocalStorage();
      }
    };

    loadUserData();
  }, [currentUser]);

  // Fallback to localStorage
  const loadFromLocalStorage = () => {
    const savedState = localStorage.getItem('gameState');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        dispatch({
          type: ACTIONS.LOAD_FROM_STORAGE,
          payload: parsedState
        });
      } catch (error) {
        debug.error('Error loading game state from localStorage:', error);
      }
    }
  };

  // Save to localStorage for guest users
  useEffect(() => {
    if (!currentUser && state.preferences.autoSave) {
      localStorage.setItem('gameState', JSON.stringify(state));
    }
  }, [state, currentUser]);

  // Action creators
  const setActiveGame = (game) => {
    dispatch({
      type: ACTIONS.SET_ACTIVE_GAME,
      payload: game
    });
  };

  const updateScore = async (game, gameResult, gameData = {}) => {
    // Update local state immediately for responsive UI
    dispatch({
      type: ACTIONS.UPDATE_SCORE,
      payload: { game, scores: gameResult }
    });

    // Save to API if user is authenticated
    if (currentUser) {
      try {
        const sessionData = GameAPI.formatGameSession(game, gameResult, gameData);
        await GameAPI.saveGameSession(sessionData);
        debug.log('Game session saved to API:', sessionData);
      } catch (error) {
        debug.error('Failed to save game session to API:', error);
        // Continue with local-only functionality if API fails
      }
    }

    // Check for achievements
    checkAchievements(game, gameResult, state);
  };

  const updateStats = (game, stats, timeSpent = 0) => {
    dispatch({
      type: ACTIONS.UPDATE_STATS,
      payload: { game, stats, timeSpent }
    });
  };

  const resetScores = () => {
    dispatch({ type: ACTIONS.RESET_SCORES });
  };

  const resetStats = () => {
    dispatch({ type: ACTIONS.RESET_STATS });
  };

  const addAchievement = (achievement) => {
    dispatch({
      type: ACTIONS.ADD_ACHIEVEMENT,
      payload: achievement
    });
  };

  const setPreferences = (preferences) => {
    dispatch({
      type: ACTIONS.SET_PREFERENCES,
      payload: preferences
    });
  };

  // Achievement checking logic
  const checkAchievements = (game, scores, currentState) => {
    // Tic-Tac-Toe achievements
    if (game === 'tictactoe') {
      if (scores.player > 0 && !currentState.achievements.some(a => a.id === 'first_win_tictactoe')) {
        addAchievement(ACHIEVEMENTS.FIRST_WIN_TICTACTOE);
      }
    }

    // Wordle achievements
    if (game === 'wordle') {
      if (scores.gamesWon > 0 && !currentState.achievements.some(a => a.id === 'first_win_wordle')) {
        addAchievement(ACHIEVEMENTS.FIRST_WIN_WORDLE);
      }
      
      if (scores.currentStreak >= 7 && !currentState.achievements.some(a => a.id === 'wordle_streak_7')) {
        addAchievement(ACHIEVEMENTS.WORDLE_STREAK_7);
      }
    }

    // Sudoku achievements
    if (game === 'sudoku') {
      if (scores.gamesWon > 0 && !currentState.achievements.some(a => a.id === 'first_win_sudoku')) {
        addAchievement(ACHIEVEMENTS.FIRST_WIN_SUDOKU);
      }
    }

    // Cross-game achievements
    if (currentState.totalGamesPlayed >= 100 && !currentState.achievements.some(a => a.id === 'century_club')) {
      addAchievement(ACHIEVEMENTS.CENTURY_CLUB);
    }
  };

  // Get leaderboard data
  const getLeaderboardData = async (gameType = null, limit = 10) => {
    try {
      const leaderboardData = await GameAPI.getLeaderboard(gameType, limit);
      
      // Ensure data is an array and has valid structure
      const validLeaderboardData = Array.isArray(leaderboardData) ? leaderboardData : [];
      
      // Filter out any invalid entries and ensure proper structure
      const cleanedData = validLeaderboardData
        .filter(user => user && user.username && user.totalPoints !== undefined && user.totalPoints !== null)
        .map((user, index) => ({
          userId: user.userId,
          username: user.username,
          photo: user.photo || `https://i.pravatar.cc/150?u=${user.username}`,
          totalPoints: user.totalPoints || 0,
          gamesPlayed: user.gamesPlayed || 0,
          gamesWon: user.gamesWon || 0,
          winRate: user.winRate || 0,
          lastPlayed: user.lastPlayed,
          rank: index + 1,
          isCurrentUser: false
        }));

      // Check if current user is already in the leaderboard
      let currentUserInLeaderboard = null;
      if (currentUser) {
        currentUserInLeaderboard = cleanedData.find(user => 
          user.userId === currentUser._id || user.username === currentUser.username
        );
        
        // Mark current user if found
        if (currentUserInLeaderboard) {
          currentUserInLeaderboard.isCurrentUser = true;
        }
      }
      
      // If current user is not in leaderboard and we have a current user, add them
      if (currentUser && !currentUserInLeaderboard) {
        try {
          const userStats = await GameAPI.getUserStats();
          const userTotalPoints = calculateTotalPoints(state.scores);
          
          const currentUserEntry = {
            userId: currentUser._id,
            username: currentUser.username,
            photo: currentUser.photo || `https://i.pravatar.cc/150?u=${currentUser.username}`,
            totalPoints: userTotalPoints,
            gamesPlayed: userStats?.overallStats?.totalGamesPlayed || state.totalGamesPlayed || 0,
            gamesWon: userStats?.overallStats?.totalGamesWon || 0,
            winRate: userStats?.overallStats?.totalGamesPlayed > 0 ? 
              Math.round((userStats.overallStats.totalGamesWon / userStats.overallStats.totalGamesPlayed) * 100) : 0,
            lastPlayed: new Date().toISOString(),
            rank: cleanedData.length + 1,
            isCurrentUser: true
          };
          
          cleanedData.push(currentUserEntry);
        } catch (statsError) {
          debug.error('Failed to get user stats for leaderboard:', statsError);
          // Add current user with basic info even if stats fail
          const currentUserEntry = {
            userId: currentUser._id,
            username: currentUser.username,
            photo: currentUser.photo || `https://i.pravatar.cc/150?u=${currentUser.username}`,
            totalPoints: calculateTotalPoints(state.scores),
            gamesPlayed: state.totalGamesPlayed || 0,
            gamesWon: 0,
            winRate: 0,
            lastPlayed: new Date().toISOString(),
            rank: cleanedData.length + 1,
            isCurrentUser: true
          };
          
          cleanedData.push(currentUserEntry);
        }
      }
      
      // Sort by total points and update ranks
      const sortedData = cleanedData
        .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
        .map((user, index) => ({
          ...user,
          rank: index + 1
        }));
      
      return sortedData;
    } catch (error) {
      debug.error('Error fetching leaderboard:', error);
      
      // Return empty leaderboard with current user only if we have one
      const fallbackData = [];
      
      if (currentUser) {
        fallbackData.push({
          userId: currentUser._id,
          username: currentUser.username,
          photo: currentUser.photo || `https://i.pravatar.cc/150?u=${currentUser.username}`,
          totalPoints: calculateTotalPoints(state.scores),
          gamesPlayed: state.totalGamesPlayed || 0,
          gamesWon: 0,
          winRate: 0,
          lastPlayed: new Date().toISOString(),
          rank: 1,
          isCurrentUser: true
        });
      }
      
      return fallbackData;
    }
  };

  // Calculate total points across all games
  const calculateTotalPoints = (scores) => {
    let totalPoints = 0;
    
    // Tic-tac-toe points
    totalPoints += scores.tictactoe.player * 10;
    
    // Wordle points
    totalPoints += scores.wordle.gamesWon * 25;
    totalPoints += scores.wordle.currentStreak * 5;
    
    // Sudoku points
    totalPoints += scores.sudoku.gamesWon * 50;
    
    // Achievement bonuses
    totalPoints += state.achievements.length * 100;
    
    return totalPoints;
  };

  const value = {
    state,
    setActiveGame,
    updateScore,
    updateStats,
    resetScores,
    resetStats,
    addAchievement,
    setPreferences,
    getLeaderboardData,
    calculateTotalPoints: () => calculateTotalPoints(state.scores),
    ACHIEVEMENTS
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

// Custom hook to use the game context
export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export default GameContext; 