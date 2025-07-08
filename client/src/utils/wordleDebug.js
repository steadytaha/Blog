import { debug, sanitizeForLogging } from './debug.js';

/**
 * Wordle Debug Utilities
 * Provides debugging functions for Wordle game functionality
 */

/**
 * Check word validation and cache status
 */
export const debugWordValidation = async (word) => {
    try {
        // Import cache functions
        const { getCacheInfo, isWordValid } = await import('./wordleCache.js');
        
        const cacheInfo = getCacheInfo();
        debug.log('Cache Status:', cacheInfo);
        
        const isValid = await isWordValid(word);
        debug.log(`Word "${word.toUpperCase()}" is ${isValid ? '✅ VALID' : '❌ INVALID'}`);
        
        // Check if word exists in our word array
        const existsInArray = cacheInfo.totalWords > 0 && cacheInfo.words.includes(word.toLowerCase());
        debug.log(`Exists in words array: ${existsInArray ? '✅ YES' : '❌ NO'}`);
        
        return {
            word: word.toUpperCase(),
            isValid,
            existsInArray,
            cacheInfo
        };
    } catch (error) {
        debug.error('Error in debugWordValidation:', error);
        return null;
    }
};

/**
 * Test multiple words and show results
 */
export const debugMultipleWords = async (words) => {
    debug.log('🔍 Testing multiple words...');
    const results = [];
    
    for (const word of words) {
        const result = await debugWordValidation(word);
        if (result) results.push(result);
    }
    
    debug.log('📊 Summary:', results);
    return results;
};

/**
 * Show cache information
 */
export const debugCacheInfo = async () => {
    try {
        const { getCacheInfo } = await import('./wordleCache.js');
        const info = getCacheInfo();
        debug.log('📋 Cache Information:', info);
        return info;
    } catch (error) {
        debug.error('Error getting cache info:', error);
        return null;
    }
};

/**
 * Refresh the word cache
 */
export const debugRefreshCache = async () => {
    try {
        debug.log('🔄 Refreshing cache...');
        const { refreshCache } = await import('./wordleCache.js');
        await refreshCache();
        debug.log('✅ Cache refreshed successfully');
        return await debugCacheInfo();
    } catch (error) {
        debug.error('Error refreshing cache:', error);
        return null;
    }
};

/**
 * Clear the cache
 */
export const debugClearCache = async () => {
    try {
        debug.log('🗑️ Clearing cache...');
        const { clearCache } = await import('./wordleCache.js');
        clearCache();
        debug.log('✅ Cache cleared');
        return await debugCacheInfo();
    } catch (error) {
        debug.error('Error clearing cache:', error);
        return null;
    }
};

/**
 * Get random words for testing
 */
export const debugGetRandomWords = async (count = 5) => {
    try {
        const { getCacheInfo } = await import('./wordleCache.js');
        const { words } = getCacheInfo();
        
        if (words.length === 0) {
            debug.warn('No words in cache. Run debugRefreshCache() first.');
            return [];
        }
        
        const sample = [];
        for (let i = 0; i < count && i < words.length; i++) {
            const randomIndex = Math.floor(Math.random() * words.length);
            sample.push(words[randomIndex]);
        }
        
        debug.log(`📝 Random word sample (${count}):`, sample);
        return sample;
    } catch (error) {
        debug.error('Error getting random words:', error);
        return [];
    }
};

/**
 * Test API endpoints
 */
export const debugTestAPI = async () => {
    try {
        const { gameApi } = await import('./gameApi.js');
        const data = await gameApi.getWordleWords();
        debug.log('✅ API Response:', data);
        return data;
    } catch (error) {
        debug.error('❌ API Error:', error);
        return null;
    }
};

/**
 * Test word validation API
 */
export const debugTestWordValidationAPI = async (word) => {
    try {
        const { gameApi } = await import('./gameApi.js');
        const data = await gameApi.validateWordleWord(word);
        debug.log('✅ Word validation API:', data);
        return data;
    } catch (error) {
        debug.error('❌ Word validation API error:', error);
        return null;
    }
};

/**
 * Run comprehensive tests
 */
export const debugRunTests = async () => {
    debug.log('🚀 Running Wordle debug tests...');
    
    try {
        debug.log('1. Testing API...');
        await debugTestAPI();
        
        debug.log('2. Checking cache...');
        await debugCacheInfo();
        
        debug.log('3. Getting word sample...');
        const sample = await debugGetRandomWords(3);
        
        debug.log('4. Testing sample words...');
        if (sample.length > 0) {
            await debugMultipleWords(sample);
        }
        
        debug.log('5. Testing common words...');
        await debugMultipleWords(['CRANE', 'SLATE', 'AUDIO']);
        
        debug.log('✅ All tests completed');
    } catch (error) {
        debug.error('❌ Test suite failed:', error);
    }
};

// Make functions available globally for browser console
if (typeof window !== 'undefined') {
    window.wordleDebug = {
        debugWordValidation,
        debugMultipleWords,
        debugCacheInfo,
        debugRefreshCache,
        debugClearCache,
        debugGetRandomWords,
        debugTestAPI,
        debugTestWordValidationAPI,
        debugRunTests
    };
} 