import { debug, sanitizeForLogging } from '../../utils/debug.js';

/**
 * Game API Usage Examples and Debugging
 * This file provides examples of how to use the game API endpoints
 * and debugging utilities for game functionality.
 */

/**
 * Save a game session to the backend
 * @param {Object} gameResult - The game result data
 * @param {string} gameType - Type of game (wordle, tictactoe, sudoku)
 */
export const saveGameSession = async (gameResult, gameType) => {
    try {
        // Format the session data according to the expected schema
        const sessionData = {
            gameType: gameType,
            gameData: gameResult,
            score: gameResult.score || 0,
            completed: gameResult.completed || false,
            duration: gameResult.duration || 0
        };

        debug.log('Sending session data:', sanitizeForLogging(sessionData));

        const response = await fetch('/api/games/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(sessionData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        debug.log('Success:', result);
        return result;

    } catch (error) {
        debug.error('Error saving game session:', error);
        throw error;
    }
};

/**
 * Test saving multiple sessions rapidly to test rate limiting
 */
export const testRateLimit = async () => {
    debug.log('Testing rate limiting...');
    
    const testGameResult = {
        score: 100,
        completed: true,
        duration: 120000,
        moves: 5
    };

    let successCount = 0;
    
    for (let i = 0; i < 7; i++) {
        try {
            debug.log(`Request ${i + 1}...`);
            await saveGameSession(testGameResult, 'wordle');
            debug.log(`Request ${i + 1} succeeded`);
            successCount++;
        } catch (error) {
            if (error.message.includes('429')) {
                debug.warn(`Rate limit hit on request ${i + 1}`);
                break;
            } else {
                debug.error(`Request ${i + 1} failed:`, error);
            }
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    debug.log(`Rate limit test completed. Successful requests: ${successCount}`);
    return successCount;
};

/**
 * Check if user is authenticated
 */
export const checkAuth = async () => {
    try {
        // Check if auth token exists
        const token = document.cookie.includes('token=');
        debug.log('Auth token present:', !!token);
        
        // Log cookies for debugging (sanitized)
        debug.log('Cookies:', sanitizeForLogging({ cookies: document.cookie }));
        
        // Try to get user stats to verify auth
        const response = await fetch('/api/games/stats', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const stats = await response.json();
            debug.log('Auth working, stats:', stats);
            return { authenticated: true, stats };
        } else {
            debug.warn('Auth failed, status:', response.status);
            return { authenticated: false };
        }
    } catch (error) {
        debug.error('Auth check error:', error);
        return { authenticated: false, error };
    }
};

/**
 * Get leaderboard data
 */
export const getLeaderboard = async (gameType = null) => {
    try {
        const url = gameType ? `/api/games/leaderboard?gameType=${gameType}` : '/api/games/leaderboard';
        const response = await fetch(url, {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const leaderboard = await response.json();
        debug.log('Leaderboard data:', leaderboard);
        return leaderboard;
    } catch (error) {
        debug.error('Error fetching leaderboard:', error);
        throw error;
    }
};

/**
 * Game-specific session save examples
 */
export const gameExamples = {
    /**
     * Save a Wordle game session
     */
    saveWordleGame: async (wordGuessed, attempts, timeElapsed, won) => {
        const gameResult = {
            word: wordGuessed,
            attempts: attempts,
            duration: timeElapsed,
            score: won ? (7 - attempts) * 100 : 0,
            completed: true,
            won: won
        };
        
        return await saveGameSession(gameResult, 'wordle');
    },

    /**
     * Save a Tic-Tac-Toe game session
     */
    saveTicTacToeGame: async (winner, moves, timeElapsed) => {
        const gameResult = {
            winner: winner, // 'X', 'O', or 'tie'
            moves: moves,
            duration: timeElapsed,
            score: winner === 'X' ? 100 : (winner === 'tie' ? 50 : 0),
            completed: true
        };
        
        return await saveGameSession(gameResult, 'tictactoe');
    },

    /**
     * Save a Sudoku game session
     */
    saveSudokuGame: async (difficulty, timeElapsed, completed, hints) => {
        const difficultyScores = { easy: 100, medium: 200, hard: 300 };
        const gameResult = {
            difficulty: difficulty,
            duration: timeElapsed,
            hintsUsed: hints,
            score: completed ? difficultyScores[difficulty] - (hints * 10) : 0,
            completed: completed
        };
        
        return await saveGameSession(gameResult, 'sudoku');
    }
};

/**
 * Debug logging utility
 */
export const logGameDebug = (type, message, data = null) => {
    const prefix = `[GAME-${type.toUpperCase()}]`;
    debug.log(`${prefix} ${message}`, data ? sanitizeForLogging(data) : '');
};

/**
 * Comprehensive API test
 */
export const runAPITests = async () => {
    debug.log('🚀 Starting Game API Tests...');
    
    const results = {
        auth: false,
        saveSession: false,
        rateLimit: false,
        leaderboard: false
    };
    
    try {
        // Test 1: Authentication
        debug.log('\n📋 Testing Authentication...');
        const authResult = await checkAuth();
        results.auth = authResult.authenticated;
        
        if (!results.auth) {
            debug.warn('⚠️ Authentication failed. Some tests may not work.');
        }
        
        // Test 2: Save Session
        debug.log('\n💾 Testing Save Session...');
        try {
            await gameExamples.saveWordleGame('CRANE', 3, 45000, true);
            results.saveSession = true;
            debug.log('✅ Save session test passed');
        } catch (error) {
            debug.error('❌ Save session test failed:', error);
        }
        
        // Test 3: Rate Limiting
        debug.log('\n⏱️ Testing Rate Limiting...');
        try {
            const limitResult = await testRateLimit();
            results.rateLimit = limitResult > 0;
        } catch (error) {
            debug.error('❌ Rate limit test failed:', error);
        }
        
        // Test 4: Leaderboard
        debug.log('\n🏆 Testing Leaderboard...');
        try {
            await getLeaderboard();
            results.leaderboard = true;
            debug.log('✅ Leaderboard test passed');
        } catch (error) {
            debug.error('❌ Leaderboard test failed:', error);
        }
        
    } catch (error) {
        debug.error('❌ Test suite error:', error);
    }
    
    debug.log('\n📊 Test Results:', results);
    return results;
};

// Export for global access
if (typeof window !== 'undefined') {
    window.gameApiDebug = {
        saveGameSession,
        checkAuth,
        getLeaderboard,
        testRateLimit,
        gameExamples,
        runAPITests,
        logGameDebug
    };
}