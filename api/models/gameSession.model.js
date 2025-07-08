import mongoose from "mongoose";

const gameSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    gameType: {
        type: String,
        required: true,
        enum: ['tictactoe', 'wordle', 'sudoku']
    },
    result: {
        type: String,
        required: true,
        enum: ['won', 'lost', 'draw', 'quit']
    },
    score: {
        type: Number,
        required: true,
        default: 0
    },
    duration: {
        type: Number, // in seconds
        required: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard', 'expert'],
        default: 'medium'
    },
    // Game-specific data
    gameData: {
        // Tic-tac-toe specific
        moves: [{ type: Number }], // sequence of moves
        
        // Wordle specific
        attempts: Number,
        targetWord: String,
        guesses: [{
            word: String,
            result: [String]
        }],
        guessWords: [String], // Simple array of just the words for backward compatibility
        
        // Sudoku specific
        hintsUsed: Number,
        mistakes: Number,
        
        // General
        startTime: Date,
        endTime: Date,
        metadata: mongoose.Schema.Types.Mixed
    },
    points: {
        basePoints: { type: Number, default: 0 },
        bonusPoints: { type: Number, default: 0 },
        totalPoints: { type: Number, default: 0 }
    },
    achievements: [{
        id: String,
        name: String,
        unlockedAt: Date
    }]
}, { timestamps: true });

// Indexes for better query performance
gameSessionSchema.index({ userId: 1, gameType: 1 });
gameSessionSchema.index({ gameType: 1, score: -1 });
gameSessionSchema.index({ userId: 1, createdAt: -1 });
gameSessionSchema.index({ 'points.totalPoints': -1 });

// Static method to get user stats
gameSessionSchema.statics.getUserStats = async function(userId) {
    const stats = await this.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        {
            $group: {
                _id: '$gameType',
                gamesPlayed: { $sum: 1 },
                gamesWon: { $sum: { $cond: [{ $eq: ['$result', 'won'] }, 1, 0] } },
                totalScore: { $sum: '$score' },
                totalPoints: { $sum: '$points.totalPoints' },
                avgDuration: { $avg: '$duration' },
                bestScore: { $max: '$score' },
                totalDuration: { $sum: '$duration' }
            }
        }
    ]);
    
    return stats;
};

// Static method to get leaderboard
gameSessionSchema.statics.getLeaderboard = async function(gameType = null, limit = 10) {
    const matchStage = gameType ? { gameType } : {};
    
    const leaderboard = await this.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: '$userId',
                totalPoints: { $sum: '$points.totalPoints' },
                gamesPlayed: { $sum: 1 },
                gamesWon: { $sum: { $cond: [{ $eq: ['$result', 'won'] }, 1, 0] } },
                lastPlayed: { $max: '$createdAt' }
            }
        },
        { $sort: { totalPoints: -1 } },
        { $limit: limit },
        {
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'user'
            }
        },
        { $unwind: '$user' },
        {
            $project: {
                userId: '$_id',
                username: '$user.username',
                photo: '$user.photo',
                totalPoints: 1,
                gamesPlayed: 1,
                gamesWon: 1,
                winRate: { 
                    $round: [{ 
                        $multiply: [{ $divide: ['$gamesWon', '$gamesPlayed'] }, 100] 
                    }, 2] 
                },
                lastPlayed: 1
            }
        }
    ]);
    
    return leaderboard;
};

// Static method to get user ranking
gameSessionSchema.statics.getUserRanking = async function(userId) {
    const userRanking = await this.aggregate([
        {
            $group: {
                _id: '$userId',
                totalPoints: { $sum: '$points.totalPoints' }
            }
        },
        { $sort: { totalPoints: -1 } },
        {
            $group: {
                _id: null,
                users: { $push: { userId: '$_id', totalPoints: '$totalPoints' } }
            }
        },
        {
            $project: {
                userRank: {
                    $indexOfArray: ['$users.userId', new mongoose.Types.ObjectId(userId)]
                }
            }
        }
    ]);
    
    return userRanking.length > 0 ? userRanking[0].userRank + 1 : null;
};

const GameSession = mongoose.model('GameSession', gameSessionSchema);

export default GameSession; 