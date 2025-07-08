// Console debugging utilities - Auto-exposes functions to window object in development
import { debug, sanitizeForLogging } from '../../utils/debug.js';

/**
 * Console Debug Utilities
 * Interactive debugging tools for the browser console
 */

// Help function to show available debugging commands
function debugHelp() {
    debug.log(`
🔧 GAME API DEBUGGING CONSOLE COMMANDS

📊 General Commands:
- debugHelp()                    Show this help
- testAPI()                      Quick API connectivity test
- runGameAPITests()              Run comprehensive test suite

🎮 Game Session Commands:
- saveTestGame(type, won)        Save a test game session
- testRateLimit()                Test API rate limiting
- checkAuth()                    Check authentication status

📈 Leaderboard Commands:
- getLeaderboard()               Get general leaderboard
- getGameLeaderboard(type)       Get game-specific leaderboard

🔍 Debugging Commands:
- debugWordValidation(word)      Test Wordle word validation
- debugMultipleWords(words)      Test multiple words
- debugCacheInfo()               Show Wordle cache info
- debugRefreshCache()            Refresh Wordle word cache

🎲 Mock Data Commands:
- generateMockGame(type)         Generate test game data
- testAllGameTypes()             Test all supported game types

Examples:
- saveTestGame('wordle', true)
- getGameLeaderboard('wordle')
- debugWordValidation('HOUSE')
- testAllGameTypes()
    `);
}

// Quick API connectivity test
async function testAPI() {
    debug.log('🔍 Testing API connectivity...');
    try {
        const response = await fetch('/api/games/stats', { credentials: 'include' });
        debug.log('✅ API is reachable');
        return response.ok;
    } catch (error) {
        debug.error('❌ API connection failed:', error);
        return false;
    }
}

// Save a test game session
async function saveTestGame(gameType = 'wordle', won = true) {
    try {
        const mockData = generateMockGame(gameType, won);
        const sessionData = {
            gameType: gameType,
            gameData: mockData,
            score: mockData.score,
            completed: true,
            duration: mockData.duration
        };

        const response = await fetch('/api/games/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(sessionData)
        });

        if (response.ok) {
            const result = await response.json();
            debug.log('✅ Test game saved:', result);
            return result;
        } else {
            throw new Error(`Failed to save: ${response.status}`);
        }
    } catch (error) {
        debug.error('❌ Save test game failed:', error);
        return null;
    }
}

// Generate mock game data
function generateMockGame(gameType = 'wordle', won = true) {
    const baseGame = {
        score: won ? Math.floor(Math.random() * 500) + 100 : Math.floor(Math.random() * 50),
        duration: Math.floor(Math.random() * 300000) + 30000, // 30s to 5min
        completed: true,
        timestamp: new Date().toISOString()
    };

    switch (gameType.toLowerCase()) {
        case 'wordle':
            return {
                ...baseGame,
                word: 'HOUSE',
                attempts: won ? Math.floor(Math.random() * 4) + 1 : 6,
                guesses: won ? ['CRANE', 'HOUSE'] : ['CRANE', 'MOUSE', 'LOUSE', 'DOUSE', 'ROUSE', 'PAUSE'],
                won: won
            };
        
        case 'tictactoe':
            return {
                ...baseGame,
                winner: won ? 'X' : 'O',
                moves: Math.floor(Math.random() * 6) + 3,
                board: won ? 
                    ['X', 'X', 'X', 'O', 'O', '', '', '', ''] : 
                    ['O', 'O', 'O', 'X', 'X', '', '', '', '']
            };
        
        case 'sudoku':
            return {
                ...baseGame,
                difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)],
                hintsUsed: Math.floor(Math.random() * 3),
                mistakes: won ? Math.floor(Math.random() * 2) : Math.floor(Math.random() * 5) + 3
            };
        
        default:
            return baseGame;
    }
}

// Test all game types
async function testAllGameTypes() {
    const gameTypes = ['wordle', 'tictactoe', 'sudoku'];
    debug.log('🎲 Testing all game types...');
    
    for (const gameType of gameTypes) {
        debug.log(`\n📝 Testing ${gameType}...`);
        await saveTestGame(gameType, Math.random() > 0.3);
        await new Promise(resolve => setTimeout(resolve, 500)); // Small delay
    }
    
    debug.log('✅ All game types tested');
}

// Get leaderboard data
async function getLeaderboard(gameType = null) {
    try {
        const url = gameType ? 
            `/api/games/leaderboard?gameType=${gameType}` : 
            '/api/games/leaderboard';
            
        const response = await fetch(url, { credentials: 'include' });
        
        if (response.ok) {
            const data = await response.json();
            debug.log(`📊 ${gameType || 'General'} Leaderboard:`, data);
            return data;
        } else {
            throw new Error(`Leaderboard request failed: ${response.status}`);
        }
    } catch (error) {
        debug.error('❌ Leaderboard error:', error);
        return null;
    }
}

// Get game-specific leaderboard
function getGameLeaderboard(gameType) {
    return getLeaderboard(gameType);
}

// Check authentication status
async function checkAuth() {
    try {
        const response = await fetch('/api/games/stats', { credentials: 'include' });
        
        if (response.ok) {
            const stats = await response.json();
            debug.log('✅ Authentication OK, stats:', sanitizeForLogging(stats));
            return { authenticated: true, stats };
        } else {
            debug.warn('❌ Authentication failed, status:', response.status);
            return { authenticated: false };
        }
    } catch (error) {
        debug.error('❌ Auth check error:', error);
        return { authenticated: false, error };
    }
}

// Test rate limiting
async function testRateLimit() {
    debug.log('⏱️ Testing rate limiting...');
    let count = 0;
    
    for (let i = 0; i < 10; i++) {
        try {
            await saveTestGame('wordle', true);
            count++;
            debug.log(`✅ Request ${i + 1} succeeded`);
        } catch (error) {
            if (error.message.includes('429')) {
                debug.warn(`⏰ Rate limit triggered after ${count} requests`);
                break;
            } else {
                debug.error(`❌ Request ${i + 1} failed:`, error);
            }
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return count;
}

// Make functions globally available
if (typeof window !== 'undefined') {
    // Main debugging functions
    window.debugHelp = debugHelp;
    window.testAPI = testAPI;
    window.saveTestGame = saveTestGame;
    window.generateMockGame = generateMockGame;
    window.testAllGameTypes = testAllGameTypes;
    window.getLeaderboard = getLeaderboard;
    window.getGameLeaderboard = getGameLeaderboard;
    window.checkAuth = checkAuth;
    window.testRateLimit = testRateLimit;
    
    // Auto-load message
    debug.log('🔧 Game API debugging functions loaded!');
    debug.log('📖 Type debugHelp() for usage instructions');
}

// Export for module usage
export {
    debugHelp,
    testAPI,
    saveTestGame,
    generateMockGame,
    testAllGameTypes,
    getLeaderboard,
    getGameLeaderboard,
    checkAuth,
    testRateLimit
}; 