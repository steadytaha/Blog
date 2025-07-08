import { debug, sanitizeForLogging } from '../../utils/debug.js';

/**
 * Game API Debug Runner
 * Comprehensive testing suite for game API functionality
 */

class GameAPIDebugRunner {
    constructor() {
        this.results = {
            auth: { success: false, error: null },
            saveSession: { success: false, error: null },
            rateLimit: { success: false, error: null },
            leaderboard: { success: false, error: null }
        };
    }

    // Step 1: Check Authentication
    async testAuthentication() {
        debug.log('🔍 STEP 1: Checking Authentication...');
        
        try {
            // Check cookies
            debug.log('📋 Cookies:', sanitizeForLogging({ cookies: document.cookie }));
            
            // Try to get user stats
            const response = await fetch('/api/games/stats', {
                credentials: 'include'
            });
            
            if (response.ok) {
                const stats = await response.json();
                debug.log('✅ Auth working! User stats:', sanitizeForLogging(stats));
                this.results.auth.success = true;
                return true;
            } else {
                throw new Error(`Auth failed with status: ${response.status}`);
            }
        } catch (error) {
            debug.error('❌ Authentication failed:', error);
            this.results.auth.error = error.message;
            return false;
        }
    }

    // Step 2: Test Save Session
    async testSaveSession(gameType = 'wordle') {
        debug.log(`🔍 STEP 2: Testing Save Session for ${gameType}...`);
        
        try {
            const gameResult = this.generateMockGameResult(gameType);
            
            const sessionData = {
                gameType: gameType,
                gameData: gameResult,
                score: gameResult.score || 0,
                completed: gameResult.completed || true,
                duration: gameResult.duration || 0
            };

            debug.log('📤 Sending game result:', sanitizeForLogging(gameResult));
            debug.log('📦 Formatted session data:', sanitizeForLogging(sessionData));

            const response = await fetch('/api/games/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(sessionData)
            });

            if (response.ok) {
                const result = await response.json();
                debug.log('✅ Save successful:', result);
                this.results.saveSession.success = true;
                return true;
            } else {
                const errorText = await response.text();
                throw new Error(`Save failed: ${response.status} - ${errorText}`);
            }
        } catch (error) {
            debug.error('❌ Save session failed:', error);
            this.results.saveSession.error = error.message;
            return false;
        }
    }

    // Step 3: Test Rate Limiting
    async testRateLimit() {
        debug.log('🔍 STEP 3: Testing Rate Limiting...');
        
        let successCount = 0;
        const maxRequests = 7; // Should hit rate limit before this
        
        try {
            for (let i = 0; i < maxRequests; i++) {
                try {
                    debug.log(`📡 Request ${i + 1}/7...`);
                    
                    const gameResult = this.generateMockGameResult('wordle');
                    const sessionData = {
                        gameType: 'wordle',
                        gameData: gameResult,
                        score: gameResult.score,
                        completed: true,
                        duration: gameResult.duration
                    };

                    const response = await fetch('/api/games/session', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify(sessionData)
                    });

                    if (response.ok) {
                        debug.log(`✅ Request ${i + 1} succeeded`);
                        successCount++;
                    } else if (response.status === 429) {
                        debug.warn(`⏰ Rate limit triggered after ${successCount} successful requests`);
                        this.results.rateLimit.success = true;
                        break;
                    } else {
                        throw new Error(`Request failed with status: ${response.status}`);
                    }
                } catch (error) {
                    debug.error(`❌ Request ${i + 1} failed:`, error);
                    break;
                }
                
                // Small delay between requests
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            debug.log(`📊 Rate limit test complete: ${successCount} successful requests`);
            
            if (!this.results.rateLimit.success && successCount >= maxRequests) {
                debug.warn('⚠️ Rate limit not triggered - may need adjustment');
            }
            
        } catch (error) {
            debug.error('❌ Rate limit test failed:', error);
            this.results.rateLimit.error = error.message;
        }
    }

    // Step 4: Test Leaderboard
    async testLeaderboard() {
        debug.log('🔍 STEP 4: Testing Leaderboard (Public Endpoint)...');
        
        try {
            const response = await fetch('/api/games/leaderboard', {
                credentials: 'include'
            });
            
            if (response.ok) {
                const leaderboard = await response.json();
                debug.log('✅ Leaderboard loaded:', leaderboard);
                this.results.leaderboard.success = true;
                
                debug.log(`📊 Found ${leaderboard.length} players on leaderboard`);
                
                // Show top 3 players
                leaderboard.slice(0, 3).forEach((player, index) => {
                    debug.log(`   ${index + 1}. ${player.username}: ${player.totalPoints} points`);
                });
                
                return true;
            } else {
                throw new Error(`Leaderboard request failed: ${response.status}`);
            }
        } catch (error) {
            debug.error('❌ Leaderboard test failed:', error);
            this.results.leaderboard.error = error.message;
            return false;
        }
    }

    // Generate mock game data for testing
    generateMockGameResult(gameType) {
        const baseResult = {
            score: Math.floor(Math.random() * 1000) + 100,
            duration: Math.floor(Math.random() * 300000) + 30000, // 30s to 5min
            completed: true
        };

        switch (gameType) {
            case 'wordle':
                return {
                    ...baseResult,
                    word: 'HOUSE',
                    attempts: Math.floor(Math.random() * 6) + 1,
                    won: Math.random() > 0.3
                };
            case 'tictactoe':
                return {
                    ...baseResult,
                    winner: ['X', 'O', 'tie'][Math.floor(Math.random() * 3)],
                    moves: Math.floor(Math.random() * 9) + 3
                };
            case 'sudoku':
                return {
                    ...baseResult,
                    difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)],
                    hintsUsed: Math.floor(Math.random() * 5)
                };
            default:
                return baseResult;
        }
    }

    // Test game-specific leaderboards
    async testGameLeaderboards() {
        debug.log('🏆 Testing Leaderboard Functionality...\n');
        
        try {
            // Test general leaderboard
            await this.testLeaderboard();
            
            debug.log('\n' + '='.repeat(50) + '\n');
            
            // Test game-specific leaderboards
            debug.log('🔍 Testing game-specific leaderboards...');
            const gameTypes = ['wordle', 'tictactoe', 'sudoku'];
            
            for (const gameType of gameTypes) {
                try {
                    debug.log(`📋 Testing ${gameType} leaderboard...`);
                    const response = await fetch(`/api/games/leaderboard?gameType=${gameType}`, {
                        credentials: 'include'
                    });
                    const gameLeaderboard = await response.json();
                    debug.log(`✅ ${gameType} leaderboard:`, gameLeaderboard.length, 'players');
                } catch (error) {
                    debug.error(`❌ ${gameType} leaderboard failed:`, error);
                }
            }
            
            debug.log('\n🎯 Leaderboard Test Summary:');
            debug.log(this.results.leaderboard.success ? '✅ Leaderboard working correctly' : '❌ Leaderboard has issues');
            
        } catch (error) {
            debug.error('❌ Leaderboard test suite failed:', error);
        }
    }

    // Run all tests
    async runFullSuite() {
        debug.log('🚀 Starting comprehensive API debugging...\n');
        
        await this.testAuthentication();
        debug.log('\n' + '='.repeat(50) + '\n');
        
        await this.testSaveSession();
        debug.log('\n' + '='.repeat(50) + '\n');
        
        await this.testRateLimit();
        debug.log('\n' + '='.repeat(50) + '\n');
        
        await this.testLeaderboard();
        debug.log('\n' + '='.repeat(50) + '\n');
        
        await this.testGameLeaderboards();
        debug.log('\n' + '='.repeat(50) + '\n');
        
        this.printSummary();
    }

    // Print test summary
    printSummary() {
        debug.log('\n' + '='.repeat(50) + '\n');
        
        debug.log('📋 TEST SUMMARY:');
        debug.log('================');
        
        Object.entries(this.results).forEach(([test, result]) => {
            const status = result.success ? '✅' : '❌';
            debug.log(`${status} ${test}: ${result.success ? 'PASSED' : 'FAILED'}`);
            if (result.error) {
                debug.log(`   Error: ${result.error}`);
            }
        });

        debug.log('\n🎯 Next Steps:');
        if (!this.results.auth.success) {
            debug.log('1. ⚠️  Fix authentication - make sure you are logged in');
        }
        if (!this.results.saveSession.success) {
            debug.log('2. ⚠️  Check game session data format and required fields');
        }
        if (!this.results.leaderboard.success) {
            debug.log('3. ⚠️  Check API connectivity and endpoint URLs');
        }
        
        if (Object.values(this.results).every(r => r.success)) {
            debug.log('🎉 All tests passed! Your API is working correctly.');
        }
    }
}

// Create global instance for browser console access
const debugRunner = new GameAPIDebugRunner();

// Export for module usage
export default debugRunner;

// Make available globally
if (typeof window !== 'undefined') {
    window.gameAPIDebugRunner = debugRunner;
    window.runGameAPITests = () => debugRunner.runFullSuite();
    window.testAuth = () => debugRunner.testAuthentication();
    window.testSaveSession = () => debugRunner.testSaveSession();
    window.testRateLimit = () => debugRunner.testRateLimit();
    window.testLeaderboard = () => debugRunner.testLeaderboard();
} 