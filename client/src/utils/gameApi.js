import { debug } from './debug';
import { config } from '../config/env';

const API_BASE = `${config.API_BASE_URL}/api/games`;

// Rate limiting configuration
const rateLimiter = {
    requests: new Map(),
    maxRequests: 10, // Adjust based on your API limits
    windowMs: 60000, // 1 minute window
    
    canMakeRequest(endpoint) {
        const now = Date.now();
        const key = endpoint;
        const requestTimes = this.requests.get(key) || [];
        
        // Remove old requests outside the window
        const validRequests = requestTimes.filter(time => now - time < this.windowMs);
        
        if (validRequests.length >= this.maxRequests) {
            return false;
        }
        
        validRequests.push(now);
        this.requests.set(key, validRequests);
        return true;
    },
    
    getTimeUntilNextRequest(endpoint) {
        const now = Date.now();
        const key = endpoint;
        const requestTimes = this.requests.get(key) || [];
        const validRequests = requestTimes.filter(time => now - time < this.windowMs);
        
        if (validRequests.length < this.maxRequests) {
            return 0;
        }
        
        const oldestRequest = Math.min(...validRequests);
        return Math.max(0, this.windowMs - (now - oldestRequest));
    }
};

// API helper functions for game sessions
class GameAPI {
    // Add authentication token if needed
    static getAuthHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };
        
        // If you need to add an authorization token
        const token = localStorage.getItem('authToken'); // or from another source
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return headers;
    }
    
    // Handle rate limiting
    static async handleRateLimit(endpoint, requestFn) {
        if (!rateLimiter.canMakeRequest(endpoint)) {
            const waitTime = rateLimiter.getTimeUntilNextRequest(endpoint);
            debug.warn(`Rate limit reached. Please wait ${Math.ceil(waitTime / 1000)} seconds.`);
            throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds before trying again.`);
        }
        
        try {
            return await requestFn();
        } catch (error) {
            if (error.message.includes('429')) {
                // If we still get 429, increase the wait time
                const waitTime = rateLimiter.windowMs;
                debug.error(`Server rate limit hit. Waiting ${waitTime / 1000} seconds.`);
                throw new Error(`Server rate limit exceeded. Please wait ${waitTime / 1000} seconds.`);
            }
            throw error;
        }
    }
    
    // Validate session data before sending
    static validateSessionData(sessionData) {
        const required = ['gameType', 'result', 'score', 'duration'];
        const missing = required.filter(field => sessionData[field] === undefined || sessionData[field] === null);
        
        if (missing.length > 0) {
            throw new Error(`Missing required fields: ${missing.join(', ')}`);
        }
        
        // Validate data types
        if (typeof sessionData.score !== 'number') {
            throw new Error('Score must be a number');
        }
        
        if (typeof sessionData.duration !== 'number') {
            throw new Error('Duration must be a number');
        }
        
        if (!['won', 'lost', 'draw'].includes(sessionData.result)) {
            throw new Error('Result must be one of: won, lost, draw');
        }
        
        // Validate game-specific data
        if (sessionData.gameType === 'wordle' && sessionData.gameData) {
            if (sessionData.gameData.attempts && typeof sessionData.gameData.attempts !== 'number') {
                throw new Error('Attempts must be a number');
            }
        }
        
        return true;
    }

    // Save a game session with proper validation
    static async saveGameSession(sessionData) {
        return this.handleRateLimit('saveGameSession', async () => {
            try {
                // Validate data before sending
                this.validateSessionData(sessionData);
                
                // Ensure dates are properly formatted
                const formattedData = {
                    ...sessionData,
                    gameData: {
                        ...sessionData.gameData,
                        startTime: sessionData.gameData?.startTime ? 
                            new Date(sessionData.gameData.startTime).toISOString() : 
                            new Date().toISOString(),
                        endTime: sessionData.gameData?.endTime ? 
                            new Date(sessionData.gameData.endTime).toISOString() : 
                            new Date().toISOString()
                    }
                };
                
                debug.log('Saving game session:', formattedData);
                
                const response = await fetch(`${API_BASE}/session`, {
                    method: 'POST',
                    headers: this.getAuthHeaders(),
                    credentials: 'include',
                    body: JSON.stringify(formattedData)
                });

                // Check if response has content before parsing JSON
                let data = null;
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    try {
                        data = await response.json();
                    } catch (jsonError) {
                        debug.error('Failed to parse JSON response:', jsonError);
                        data = { message: 'Invalid response format' };
                    }
                } else {
                    const textResponse = await response.text();
                    debug.error('Non-JSON response received:', textResponse);
                    data = { message: `Server error: ${response.status} ${response.statusText}` };
                }
                
                if (!response.ok) {
                    // Log the actual error from server for debugging
                    debug.error('Server error response:', data);
                    throw new Error(data?.message || `HTTP ${response.status}: Failed to save game session`);
                }
                
                debug.log('Game session saved successfully:', data);
                return data;
            } catch (error) {
                debug.error('Error saving game session:', error);
                throw error;
            }
        });
    }

    // Get user statistics with rate limiting
    static async getUserStats(gameType = null) {
        return this.handleRateLimit('getUserStats', async () => {
            try {
                const params = new URLSearchParams();
                if (gameType) {
                    params.append('gameType', gameType);
                }
                
                const url = `${API_BASE}/stats${params.toString() ? '?' + params.toString() : ''}`;
                
                const response = await fetch(url, {
                    method: 'GET',
                    headers: this.getAuthHeaders(),
                    credentials: 'include'
                });

                let data = null;
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    try {
                        data = await response.json();
                    } catch (jsonError) {
                        debug.error('Failed to parse JSON response:', jsonError);
                        data = { message: 'Invalid response format' };
                    }
                } else {
                    const textResponse = await response.text();
                    debug.error('Non-JSON response received:', textResponse);
                    data = { message: `Server error: ${response.status} ${response.statusText}` };
                }
                
                if (!response.ok) {
                    debug.error('Server error response:', data);
                    throw new Error(data?.message || `HTTP ${response.status}: Failed to get user stats`);
                }
                
                return data.data || data;
            } catch (error) {
                debug.error('Error getting user stats:', error);
                throw error;
            }
        });
    }

    // Get leaderboard with rate limiting
    static async getLeaderboard(gameType = null, limit = 10) {
        return this.handleRateLimit('getLeaderboard', async () => {
            try {
                const params = new URLSearchParams();
                if (gameType) params.append('gameType', gameType);
                params.append('limit', limit.toString());
                
                const url = `${API_BASE}/leaderboard?${params.toString()}`;
                
                const response = await fetch(url, {
                    method: 'GET',
                    headers: this.getAuthHeaders(),
                    credentials: 'include'
                });

                let data = null;
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    try {
                        data = await response.json();
                    } catch (jsonError) {
                        debug.error('Failed to parse JSON response:', jsonError);
                        data = { message: 'Invalid response format' };
                    }
                } else {
                    const textResponse = await response.text();
                    debug.error('Non-JSON response received:', textResponse);
                    data = { message: `Server error: ${response.status} ${response.statusText}` };
                }
                
                if (!response.ok) {
                    debug.error('Server error response:', data);
                    throw new Error(data?.message || `HTTP ${response.status}: Failed to get leaderboard`);
                }
                
                return data.data || data;
            } catch (error) {
                debug.error('Error getting leaderboard:', error);
                throw error;
            }
        });
    }

    // Get user game history with rate limiting
    static async getUserGameHistory(gameType = null, page = 1, limit = 20) {
        return this.handleRateLimit('getUserGameHistory', async () => {
            try {
                const params = new URLSearchParams({
                    page: page.toString(),
                    limit: limit.toString()
                });
                
                if (gameType) params.append('gameType', gameType);
                
                const response = await fetch(`${API_BASE}/history?${params.toString()}`, {
                    method: 'GET',
                    headers: this.getAuthHeaders(),
                    credentials: 'include'
                });

                let data = null;
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    try {
                        data = await response.json();
                    } catch (jsonError) {
                        debug.error('Failed to parse JSON response:', jsonError);
                        data = { message: 'Invalid response format' };
                    }
                } else {
                    const textResponse = await response.text();
                    debug.error('Non-JSON response received:', textResponse);
                    data = { message: `Server error: ${response.status} ${response.statusText}` };
                }
                
                if (!response.ok) {
                    debug.error('Server error response:', data);
                    throw new Error(data?.message || `HTTP ${response.status}: Failed to get game history`);
                }
                
                return data.data || data;
            } catch (error) {
                debug.error('Error getting game history:', error);
                throw error;
            }
        });
    }

    // Calculate points based on game result
    static calculatePoints(gameType, gameResult) {
        let points = {
            basePoints: 0,
            bonusPoints: 0,
            totalPoints: 0
        };

        switch (gameType) {
            case 'tictactoe':
                if (gameResult.result === 'won') {
                    points.basePoints = 100;
                    points.totalPoints = 100;
                } else if (gameResult.result === 'draw') {
                    points.basePoints = 50;
                    points.totalPoints = 50;
                }
                break;

            case 'wordle':
                if (gameResult.result === 'won') {
                    points.basePoints = 100;
                    // Bonus points for fewer attempts
                    const attemptsUsed = gameResult.attempts || 6;
                    points.bonusPoints = Math.max(0, (7 - attemptsUsed) * 10);
                    // Streak bonus
                    if (gameResult.streak && typeof gameResult.streak === 'number') {
                        points.bonusPoints += gameResult.streak * 5;
                    }
                    points.totalPoints = points.basePoints + points.bonusPoints;
                }
                break;

            case 'sudoku':
                if (gameResult.result === 'won') {
                    const difficultyMultipliers = {
                        easy: 1,
                        medium: 1.5,
                        hard: 2,
                        expert: 3
                    };
                    
                    points.basePoints = 200;
                    
                    // Time bonus (bonus for solving under 10 minutes)
                    if (gameResult.duration && typeof gameResult.duration === 'number' && gameResult.duration < 600) {
                        points.bonusPoints = Math.max(0, 600 - gameResult.duration);
                    }
                    
                    const multiplier = difficultyMultipliers[gameResult.difficulty] || 1;
                    points.totalPoints = Math.floor((points.basePoints + points.bonusPoints) * multiplier);
                }
                break;

            default:
                debug.warn(`Unknown game type: ${gameType}`);
                break;
        }

        return points;
    }

    // Format game session data for API with validation
    static formatGameSession(gameType, gameResult, gameData = {}) {
        // Ensure required fields have default values
        const safeGameResult = {
            result: 'lost',
            score: 0,
            duration: 0,
            difficulty: 'medium',
            ...gameResult
        };
        
        const points = this.calculatePoints(gameType, safeGameResult);
        
        const sessionData = {
            gameType,
            result: safeGameResult.result,
            score: Number(safeGameResult.score) || 0,
            duration: Number(safeGameResult.duration) || 0,
            difficulty: safeGameResult.difficulty || 'medium',
            gameData: {
                ...gameData,
                startTime: safeGameResult.startTime || new Date().toISOString(),
                endTime: safeGameResult.endTime || new Date().toISOString(),
                // Game-specific data with proper types
                ...(gameType === 'tictactoe' && {
                    moves: Array.isArray(safeGameResult.moves) ? safeGameResult.moves : []
                }),
                ...(gameType === 'wordle' && {
                    attempts: Number(safeGameResult.attempts) || 0,
                    targetWord: String(safeGameResult.targetWord || ''),
                    guesses: this.formatWordleGuesses(safeGameResult.guesses),
                    guessWords: this.extractGuessWords(safeGameResult.guesses)
                }),
                ...(gameType === 'sudoku' && {
                    hintsUsed: Number(safeGameResult.hintsUsed) || 0,
                    mistakes: Number(safeGameResult.mistakes) || 0
                })
            },
            points,
            achievements: Array.isArray(safeGameResult.achievements) ? safeGameResult.achievements : []
        };
        
        // Validate before returning
        try {
            this.validateSessionData(sessionData);
        } catch (error) {
            debug.error('Invalid session data:', error);
            throw error;
        }
        
        return sessionData;
    }

    // Helper method to format Wordle guesses
    static formatWordleGuesses(guesses) {
        if (!Array.isArray(guesses)) return [];
        
        return guesses.map(guess => {
            // If it's already an object with word and result, return as-is
            if (typeof guess === 'object' && guess.word && guess.result) {
                return {
                    word: String(guess.word),
                    result: Array.isArray(guess.result) ? guess.result : []
                };
            }
            // If it's a string (from debug tests), create a simple object
            if (typeof guess === 'string') {
                return {
                    word: guess,
                    result: [] // Empty result for backward compatibility
                };
            }
            // Fallback
            return {
                word: String(guess || ''),
                result: []
            };
        });
    }

    // Helper method to extract just the words from guesses for backward compatibility
    static extractGuessWords(guesses) {
        if (!Array.isArray(guesses)) return [];
        
        return guesses.map(guess => {
            // If it's an object with word property, extract the word
            if (typeof guess === 'object' && guess.word) {
                return String(guess.word);
            }
            // If it's already a string, return as-is
            if (typeof guess === 'string') {
                return guess;
            }
            // Fallback
            return String(guess || '');
        });
    }

    // Get fallback data for offline/guest mode
    static getFallbackData(type) {
        const fallbackData = {
            stats: {
                gameStats: [],
                overallStats: {
                    totalGamesPlayed: 0,
                    totalGamesWon: 0,
                    totalPoints: 0,
                    totalTimeSpent: 0,
                    avgScore: 0
                },
                userRanking: 'Unranked'
            },
            leaderboard: [
                { rank: 1, username: 'Player1', totalPoints: 2000, gamesPlayed: 50, winRate: 85 },
                { rank: 2, username: 'Player2', totalPoints: 1750, gamesPlayed: 45, winRate: 78 },
                { rank: 3, username: 'Player3', totalPoints: 1500, gamesPlayed: 40, winRate: 72 },
                { rank: 4, username: 'You', totalPoints: 0, gamesPlayed: 0, winRate: 0, isCurrentUser: true }
            ],
            history: {
                history: [],
                pagination: {
                    page: 1,
                    limit: 20,
                    total: 0,
                    totalPages: 0
                }
            }
        };

        return fallbackData[type] || null;
    }
}

export default GameAPI;