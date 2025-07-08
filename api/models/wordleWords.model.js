import mongoose from "mongoose";

const wordleWordsSchema = new mongoose.Schema({
    word: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
        minlength: 5,
        maxlength: 5
    },
    frequency: {
        type: Number,
        default: 1 // Can be used for word difficulty/commonness
    },
    category: {
        type: String,
        enum: ['common', 'uncommon', 'rare'],
        default: 'common'
    },
    isTarget: {
        type: Boolean,
        default: true // Whether this word can be used as a target word
    },
    difficulty: {
        type: Number,
        min: 1,
        max: 5,
        default: 3
    }
}, { 
    timestamps: true,
    collection: 'wordleWords' // Explicitly set collection name
});

// Indexes for better performance (word index created by unique: true)
wordleWordsSchema.index({ category: 1 });
wordleWordsSchema.index({ isTarget: 1 });
wordleWordsSchema.index({ difficulty: 1 });

// Static method to get a random target word
wordleWordsSchema.statics.getRandomTargetWord = async function(difficulty = null) {
    const matchStage = { isTarget: true };
    if (difficulty) {
        matchStage.difficulty = difficulty;
    }
    
    const words = await this.aggregate([
        { $match: matchStage },
        { $sample: { size: 1 } }
    ]);
    
    return words[0]?.word || null;
};

// Static method to validate if a word exists
wordleWordsSchema.statics.isValidWord = async function(word) {
    const count = await this.countDocuments({ 
        word: word.toUpperCase() 
    });
    return count > 0;
};

// Static method to get all words (for caching)
wordleWordsSchema.statics.getAllWords = async function() {
    const words = await this.find({}, 'word -_id').sort({ word: 1 });
    return words.map(w => w.word);
};

// Static method to get word count
wordleWordsSchema.statics.getWordCount = async function() {
    return await this.countDocuments();
};

// Static method to get words by category
wordleWordsSchema.statics.getWordsByCategory = async function(category) {
    const words = await this.find({ category }, 'word -_id').sort({ word: 1 });
    return words.map(w => w.word);
};

const WordleWords = mongoose.model('WordleWords', wordleWordsSchema);

export default WordleWords; 