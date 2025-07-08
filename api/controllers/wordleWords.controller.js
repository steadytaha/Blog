import WordleWords from '../models/wordleWords.model.js';
import { errorHandler } from '../utils/error.js';
import { debugServer } from '../utils/debug.js';

// Get all words (for caching)
export const getAllWords = async (req, res, next) => {
    try {
        const words = await WordleWords.getAllWords();
        
        // Set cache headers for 24 hours
        res.set({
            'Cache-Control': 'public, max-age=86400',
            'ETag': `"wordle-words-${words.length}"`,
            'Last-Modified': new Date().toUTCString()
        });

        res.json({
            success: true,
            data: {
                words,
                count: words.length,
                version: '1.0'
            }
        });
    } catch (error) {
        debugServer.error('Error fetching all words:', error);
        next(error);
    }
};

// Get a random target word
export const getRandomTargetWord = async (req, res, next) => {
    try {
        const { difficulty } = req.query;
        
        const word = await WordleWords.getRandomTargetWord(difficulty);
        
        if (!word) {
            return next(errorHandler(404, 'No target word found'));
        }

        res.json({
            success: true,
            data: {
                word,
                difficulty: difficulty || 3
            }
        });
    } catch (error) {
        debugServer.error('Error getting random target word:', error);
        next(error);
    }
};

// Validate a word
export const validateWord = async (req, res, next) => {
    try {
        const { word } = req.params;
        
        if (!word || word.length !== 5) {
            return next(errorHandler(400, 'Word must be exactly 5 characters'));
        }

        const isValid = await WordleWords.isValidWord(word);
        
        res.json({
            success: true,
            data: {
                word: word.toUpperCase(),
                isValid
            }
        });
    } catch (error) {
        debugServer.error('Error validating word:', error);
        next(error);
    }
};

// Get word statistics
export const getWordStats = async (req, res, next) => {
    try {
        const totalWords = await WordleWords.getWordCount();
        const categories = await WordleWords.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            }
        ]);
        
        const difficulties = await WordleWords.aggregate([
            {
                $group: {
                    _id: '$difficulty',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                totalWords,
                categories,
                difficulties,
                lastUpdated: new Date().toISOString()
            }
        });
    } catch (error) {
        debugServer.error('Error getting word stats:', error);
        next(error);
    }
};

// Admin: Add words (bulk import)
export const addWords = async (req, res, next) => {
    try {
        if (!req.user.isAdmin) {
            return next(errorHandler(403, 'Admin access required'));
        }

        const { words } = req.body;
        
        if (!Array.isArray(words) || words.length === 0) {
            return next(errorHandler(400, 'Words array is required'));
        }

        const wordDocs = words.map(word => ({
            word: word.toUpperCase(),
            category: word.category || 'common',
            difficulty: word.difficulty || 3,
            isTarget: word.isTarget !== false
        }));

        const result = await WordleWords.insertMany(wordDocs, { 
            ordered: false, // Continue on duplicate key errors
            lean: true 
        });

        res.json({
            success: true,
            message: `Successfully added ${result.length} words`,
            data: {
                added: result.length,
                total: await WordleWords.getWordCount()
            }
        });
    } catch (error) {
        // Handle duplicate key errors gracefully
        if (error.code === 11000) {
            const insertedCount = error.result?.insertedCount || 0;
            res.json({
                success: true,
                message: `Added ${insertedCount} words (some duplicates skipped)`,
                data: {
                    added: insertedCount,
                    total: await WordleWords.getWordCount()
                }
            });
        } else {
            debugServer.error('Error adding words:', error);
            next(error);
        }
    }
};

// Admin: Update word
export const updateWord = async (req, res, next) => {
    try {
        if (!req.user.isAdmin) {
            return next(errorHandler(403, 'Admin access required'));
        }

        const { word } = req.params;
        const updates = req.body;

        const updatedWord = await WordleWords.findOneAndUpdate(
            { word: word.toUpperCase() },
            updates,
            { new: true }
        );

        if (!updatedWord) {
            return next(errorHandler(404, 'Word not found'));
        }

        res.json({
            success: true,
            message: 'Word updated successfully',
            data: updatedWord
        });
    } catch (error) {
        debugServer.error('Error updating word:', error);
        next(error);
    }
};

// Admin: Delete word
export const deleteWord = async (req, res, next) => {
    try {
        if (!req.user.isAdmin) {
            return next(errorHandler(403, 'Admin access required'));
        }

        const { word } = req.params;

        const deletedWord = await WordleWords.findOneAndDelete({
            word: word.toUpperCase()
        });

        if (!deletedWord) {
            return next(errorHandler(404, 'Word not found'));
        }

        res.json({
            success: true,
            message: 'Word deleted successfully'
        });
    } catch (error) {
        debugServer.error('Error deleting word:', error);
        next(error);
    }
}; 