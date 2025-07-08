import GameSession from '../models/gameSession.model.js';
import { errorHandler } from '../utils/error.js';
import { debugServer } from '../utils/debug.js';

// Create a new game session
export const createGameSession = async (req, res, next) => {
    try {
        const { gameType, result, score, duration, difficulty, gameData, points, achievements } = req.body;
        
        if (!gameType || !result || score === undefined || duration === undefined) {
            return next(errorHandler(400, 'Missing required fields'));
        }

        // Validate game type
        const validGameTypes = ['tictactoe', 'wordle', 'sudoku'];
        if (!validGameTypes.includes(gameType)) {
            return next(errorHandler(400, 'Invalid game type'));
        }

        // Validate result
        const validResults = ['won', 'lost', 'draw', 'quit'];
        if (!validResults.includes(result)) {
            return next(errorHandler(400, 'Invalid result'));
        }

        const gameSession = new GameSession({
            userId: req.user.id,
            gameType,
            result,
            score,
            duration,
            difficulty: difficulty || 'medium',
            gameData: gameData || {},
            points: points || { basePoints: 0, bonusPoints: 0, totalPoints: 0 },
            achievements: achievements || []
        });

        await gameSession.save();

        debugServer.log('Game session created', {
            userId: req.user.id,
            gameType,
            result,
            score,
            sessionId: gameSession._id
        });

        res.status(201).json({
            success: true,
            message: 'Game session saved successfully',
            data: gameSession
        });
    } catch (error) {
        debugServer.error('Error creating game session:', error);
        next(error);
    }
};

// Get user's game statistics
export const getUserStats = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { gameType } = req.query;

        let matchStage = { userId };
        if (gameType) {
            matchStage.gameType = gameType;
        }

        const stats = await GameSession.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: '$gameType',
                    gamesPlayed: { $sum: 1 },
                    gamesWon: { $sum: { $cond: [{ $eq: ['$result', 'won'] }, 1, 0] } },
                    gamesLost: { $sum: { $cond: [{ $eq: ['$result', 'lost'] }, 1, 0] } },
                    gamesDraw: { $sum: { $cond: [{ $eq: ['$result', 'draw'] }, 1, 0] } },
                    totalScore: { $sum: '$score' },
                    totalPoints: { $sum: '$points.totalPoints' },
                    avgDuration: { $avg: '$duration' },
                    bestScore: { $max: '$score' },
                    totalDuration: { $sum: '$duration' }
                }
            },
            {
                $addFields: {
                    winRate: { 
                        $round: [{ 
                            $multiply: [{ $divide: ['$gamesWon', '$gamesPlayed'] }, 100] 
                        }, 2] 
                    }
                }
            }
        ]);

        // Get overall stats
        const overallStats = await GameSession.aggregate([
            { $match: { userId } },
            {
                $group: {
                    _id: null,
                    totalGamesPlayed: { $sum: 1 },
                    totalGamesWon: { $sum: { $cond: [{ $eq: ['$result', 'won'] }, 1, 0] } },
                    totalPoints: { $sum: '$points.totalPoints' },
                    totalTimeSpent: { $sum: '$duration' },
                    avgScore: { $avg: '$score' }
                }
            }
        ]);

        // Get user ranking
        const userRanking = await GameSession.getUserRanking(userId);

        res.json({
            success: true,
            data: {
                gameStats: stats,
                overallStats: overallStats[0] || {
                    totalGamesPlayed: 0,
                    totalGamesWon: 0,
                    totalPoints: 0,
                    totalTimeSpent: 0,
                    avgScore: 0
                },
                userRanking: userRanking || 'Unranked'
            }
        });
    } catch (error) {
        debugServer.error('Error getting user stats:', error);
        next(error);
    }
};

// Get leaderboard
export const getLeaderboard = async (req, res, next) => {
    try {
        const { gameType, limit = 10 } = req.query;
        const limitNum = parseInt(limit);

        if (limitNum > 100) {
            return next(errorHandler(400, 'Limit cannot exceed 100'));
        }

        const leaderboard = await GameSession.getLeaderboard(gameType, limitNum);

        // Add ranking to each user
        const leaderboardWithRanking = leaderboard.map((user, index) => ({
            ...user,
            rank: index + 1
        }));

        res.json({
            success: true,
            data: leaderboardWithRanking
        });
    } catch (error) {
        debugServer.error('Error getting leaderboard:', error);
        next(error);
    }
};

// Get user's game history
export const getUserGameHistory = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { gameType, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        let matchStage = { userId };
        if (gameType) {
            matchStage.gameType = gameType;
        }

        const history = await GameSession.find(matchStage)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .select('-gameData.metadata'); // Exclude potentially large metadata

        const totalCount = await GameSession.countDocuments(matchStage);

        res.json({
            success: true,
            data: {
                history,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: totalCount,
                    totalPages: Math.ceil(totalCount / parseInt(limit))
                }
            }
        });
    } catch (error) {
        debugServer.error('Error getting user game history:', error);
        next(error);
    }
};

// Delete a game session (admin only)
export const deleteGameSession = async (req, res, next) => {
    try {
        const { sessionId } = req.params;

        if (!req.user.isAdmin) {
            return next(errorHandler(403, 'Admin access required'));
        }

        const session = await GameSession.findByIdAndDelete(sessionId);

        if (!session) {
            return next(errorHandler(404, 'Game session not found'));
        }

        res.json({
            success: true,
            message: 'Game session deleted successfully'
        });
    } catch (error) {
        debugServer.error('Error deleting game session:', error);
        next(error);
    }
};

// Get game statistics for admin dashboard
export const getGameStats = async (req, res, next) => {
    try {
        if (!req.user.isAdmin) {
            return next(errorHandler(403, 'Admin access required'));
        }

        const stats = await GameSession.aggregate([
            {
                $group: {
                    _id: '$gameType',
                    totalSessions: { $sum: 1 },
                    totalPlayers: { $addToSet: '$userId' },
                    avgDuration: { $avg: '$duration' },
                    avgScore: { $avg: '$score' },
                    winRate: { 
                        $avg: { $cond: [{ $eq: ['$result', 'won'] }, 1, 0] } 
                    }
                }
            },
            {
                $addFields: {
                    totalPlayers: { $size: '$totalPlayers' },
                    winRate: { $multiply: ['$winRate', 100] }
                }
            }
        ]);

        // Get overall platform stats
        const overallStats = await GameSession.aggregate([
            {
                $group: {
                    _id: null,
                    totalSessions: { $sum: 1 },
                    uniquePlayers: { $addToSet: '$userId' },
                    avgDuration: { $avg: '$duration' },
                    totalPlayTime: { $sum: '$duration' }
                }
            },
            {
                $addFields: {
                    uniquePlayers: { $size: '$uniquePlayers' }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                gameStats: stats,
                overallStats: overallStats[0] || {
                    totalSessions: 0,
                    uniquePlayers: 0,
                    avgDuration: 0,
                    totalPlayTime: 0
                }
            }
        });
    } catch (error) {
        debugServer.error('Error getting game stats:', error);
        next(error);
    }
}; 