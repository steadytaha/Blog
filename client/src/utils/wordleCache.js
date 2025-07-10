import { debug } from './debug';

const CACHE_KEY = 'wordle_words_cache';
const CACHE_VERSION_KEY = 'wordle_words_version';
const CACHE_EXPIRY_KEY = 'wordle_words_expiry';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

class WordleCache {
    constructor() {
        this.words = [];
        this.isLoaded = false;
        this.isLoading = false;
        this.loadPromise = null;
    }

    // Check if cache is valid
    isCacheValid() {
        try {
            const expiry = localStorage.getItem(CACHE_EXPIRY_KEY);
            const version = localStorage.getItem(CACHE_VERSION_KEY);
            const cachedWords = localStorage.getItem(CACHE_KEY);
            
            if (!expiry || !version || !cachedWords) {
                return false;
            }
            
            const expiryTime = parseInt(expiry);
            const now = Date.now();
            
            return now < expiryTime;
        } catch (error) {
            debug.error('Error checking cache validity:', error);
            return false;
        }
    }

    // Load words from cache
    loadFromCache() {
        try {
            const cachedWords = localStorage.getItem(CACHE_KEY);
            if (cachedWords) {
                this.words = JSON.parse(cachedWords);
                this.isLoaded = true;
                debug.log(`Loaded ${this.words.length} words from cache`);
                return true;
            }
        } catch (error) {
            debug.error('Error loading words from cache:', error);
        }
        return false;
    }

    // Save words to cache
    saveToCache(words, version = '1.0') {
        try {
            const expiry = Date.now() + CACHE_DURATION;
            
            localStorage.setItem(CACHE_KEY, JSON.stringify(words));
            localStorage.setItem(CACHE_VERSION_KEY, version);
            localStorage.setItem(CACHE_EXPIRY_KEY, expiry.toString());
            
            debug.log(`Saved ${words.length} words to cache (expires in 24h)`);
            return true;
        } catch (error) {
            debug.error('Error saving words to cache:', error);
            return false;
        }
    }

    // Fetch words from API
    async fetchFromAPI() {
        try {
            debug.log('Fetching words from API...');
            
            const response = await fetch('/api/wordle-words/all', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.success || !Array.isArray(data.data.words)) {
                throw new Error('Invalid API response format');
            }

            const { words, version } = data.data;
            
            // Save to cache
            this.saveToCache(words, version);
            
            this.words = words;
            this.isLoaded = true;
            
            debug.log(`Fetched ${words.length} words from API`);
            return words;
            
        } catch (error) {
            debug.error('Error fetching words from API:', error);
            throw error;
        }
    }

    // Load fallback words (subset for offline use)
    loadFallbackWords() {
        debug.log('Loading fallback words...');
        
        // A curated list of common 5-letter words for offline use
        this.words = [
            'ABOUT', 'ABOVE', 'ABUSE', 'ACTOR', 'ACUTE', 'ADMIT', 'ADOPT', 'ADULT', 'AFTER', 'AGAIN',
            'AGENT', 'AGREE', 'AHEAD', 'ALARM', 'ALBUM', 'ALERT', 'ALIEN', 'ALIGN', 'ALIKE', 'ALIVE',
            'ALLOW', 'ALONE', 'ALONG', 'ALTER', 'ANGEL', 'ANGER', 'ANGLE', 'ANGRY', 'APART', 'APPLE',
            'APPLY', 'ARENA', 'ARGUE', 'ARISE', 'ARRAY', 'ASIDE', 'ASSET', 'AVOID', 'AWAKE', 'AWARD',
            'AWARE', 'BADLY', 'BAKER', 'BASES', 'BASIC', 'BEACH', 'BEGAN', 'BEGIN', 'BEING', 'BELOW',
            'BENCH', 'BILLY', 'BIRTH', 'BLACK', 'BLAME', 'BLANK', 'BLAST', 'BLIND', 'BLOCK', 'BLOOD',
            'BOARD', 'BOAST', 'BOBBY', 'BOOST', 'BOOTH', 'BOUND', 'BRAIN', 'BRAND', 'BRASS', 'BRAVE',
            'BREAD', 'BREAK', 'BREED', 'BRIEF', 'BRING', 'BROAD', 'BROKE', 'BROWN', 'BUILD', 'BUILT',
            'BUYER', 'CABLE', 'CALIF', 'CARRY', 'CATCH', 'CAUSE', 'CHAIN', 'CHAIR', 'CHAOS', 'CHARM',
            'CHART', 'CHASE', 'CHEAP', 'CHECK', 'CHEST', 'CHIEF', 'CHILD', 'CHINA', 'CHOSE', 'CIVIL',
            'CLAIM', 'CLASS', 'CLEAN', 'CLEAR', 'CLICK', 'CLOCK', 'CLOSE', 'CLOUD', 'COACH', 'COAST',
            'COULD', 'COUNT', 'COURT', 'COVER', 'CRAFT', 'CRASH', 'CRAZY', 'CREAM', 'CRIME', 'CROSS',
            'CROWD', 'CROWN', 'CRUDE', 'CURVE', 'CYCLE', 'DAILY', 'DANCE', 'DATED', 'DEALT', 'DEATH',
            'DEBUT', 'DELAY', 'DEPTH', 'DOING', 'DOUBT', 'DOZEN', 'DRAFT', 'DRAMA', 'DRANK', 'DRAWN',
            'DREAM', 'DRESS', 'DRILL', 'DRINK', 'DRIVE', 'DROVE', 'DYING', 'EAGER', 'EARLY', 'EARTH',
            'EIGHT', 'ELITE', 'EMPTY', 'ENEMY', 'ENJOY', 'ENTER', 'ENTRY', 'EQUAL', 'ERROR', 'EVENT',
            'EVERY', 'EXACT', 'EXIST', 'EXTRA', 'FAITH', 'FALSE', 'FAULT', 'FIBER', 'FIELD', 'FIFTH',
            'FIFTY', 'FIGHT', 'FINAL', 'FIRST', 'FIXED', 'FLASH', 'FLEET', 'FLOOR', 'FLUID', 'FOCUS',
            'FORCE', 'FORTH', 'FORTY', 'FORUM', 'FOUND', 'FRAME', 'FRANK', 'FRAUD', 'FRESH', 'FRONT',
            'FRUIT', 'FULLY', 'FUNNY', 'GIANT', 'GIVEN', 'GLASS', 'GLOBE', 'GOING', 'GRACE', 'GRADE',
            'GRAND', 'GRANT', 'GRASS', 'GRAVE', 'GREAT', 'GREEN', 'GROSS', 'GROUP', 'GROWN', 'GUARD',
            'GUESS', 'GUEST', 'GUIDE', 'HAPPY', 'HARRY', 'HEART', 'HEAVY', 'HENCE', 'HENRY', 'HORSE',
            'HOTEL', 'HOUSE', 'HUMAN', 'IDEAL', 'IMAGE', 'INDEX', 'INNER', 'INPUT', 'ISSUE', 'JAPAN',
            'JIMMY', 'JOINT', 'JONES', 'JUDGE', 'KNOWN', 'LABEL', 'LARGE', 'LASER', 'LATER', 'LAUGH',
            'LAYER', 'LEARN', 'LEASE', 'LEAST', 'LEAVE', 'LEGAL', 'LEVEL', 'LEWIS', 'LIGHT', 'LIMIT',
            'LINKS', 'LIVES', 'LOCAL', 'LOGIC', 'LOOSE', 'LOWER', 'LUCKY', 'LUNCH', 'LYING', 'MAGIC',
            'MAJOR', 'MAKER', 'MARCH', 'MARIA', 'MATCH', 'MAYBE', 'MAYOR', 'MEANT', 'MEDIA', 'METAL',
            'MIGHT', 'MINOR', 'MINUS', 'MIXED', 'MODEL', 'MONEY', 'MONTH', 'MORAL', 'MOTOR', 'MOUNT',
            'MOUSE', 'MOUTH', 'MOVED', 'MOVIE', 'MUSIC', 'NEEDS', 'NEVER', 'NEWLY', 'NIGHT', 'NOISE',
            'NORTH', 'NOTED', 'NOVEL', 'NURSE', 'OCCUR', 'OCEAN', 'OFFER', 'OFTEN', 'ORDER', 'OTHER',
            'OUGHT', 'PAINT', 'PANEL', 'PAPER', 'PARTY', 'PEACE', 'PETER', 'PHASE', 'PHONE', 'PHOTO',
            'PIANO', 'PICKED', 'PIECE', 'PILOT', 'PITCH', 'PLACE', 'PLAIN', 'PLANE', 'PLANT', 'PLATE',
            'POINT', 'POUND', 'POWER', 'PRESS', 'PRICE', 'PRIDE', 'PRIME', 'PRINT', 'PRIOR', 'PRIZE',
            'PROOF', 'PROUD', 'PROVE', 'QUEEN', 'QUICK', 'QUIET', 'QUITE', 'RADIO', 'RAISE', 'RANGE',
            'RAPID', 'RATIO', 'REACH', 'READY', 'REALM', 'REBEL', 'REFER', 'RELAX', 'RIDER', 'RIDGE',
            'RIGHT', 'RIGID', 'RIVER', 'ROBOT', 'ROCKY', 'ROGER', 'ROMAN', 'ROUGH', 'ROUND', 'ROUTE',
            'ROYAL', 'RURAL', 'SCALE', 'SCENE', 'SCOPE', 'SCORE', 'SENSE', 'SERVE', 'SETUP', 'SEVEN',
            'SHALL', 'SHAPE', 'SHARE', 'SHARP', 'SHEET', 'SHELF', 'SHELL', 'SHIFT', 'SHINE', 'SHIRT',
            'SHOCK', 'SHOOT', 'SHORT', 'SHOWN', 'SIGHT', 'SILLY', 'SINCE', 'SIXTH', 'SIXTY', 'SIZED',
            'SKILL', 'SLEEP', 'SLIDE', 'SMALL', 'SMART', 'SMILE', 'SMITH', 'SMOKE', 'SOLID', 'SOLVE',
            'SORRY', 'SOUND', 'SOUTH', 'SPACE', 'SPARE', 'SPEAK', 'SPEED', 'SPEND', 'SPENT', 'SPLIT',
            'SPOKE', 'SPORT', 'SQUAD', 'STAFF', 'STAGE', 'STAKE', 'STAND', 'START', 'STATE', 'STEAM',
            'STEEL', 'STEEP', 'STICK', 'STILL', 'STOCK', 'STONE', 'STOOD', 'STORE', 'STORM', 'STORY',
            'STRIP', 'STUCK', 'STUDY', 'STUFF', 'STYLE', 'SUGAR', 'SUITE', 'SUPER', 'SWEET', 'TABLE',
            'TAKEN', 'TASTE', 'TAXES', 'TEACH', 'TERRY', 'TEXAS', 'THANK', 'THEFT', 'THEIR', 'THEME',
            'THERE', 'THESE', 'THICK', 'THING', 'THINK', 'THIRD', 'THOSE', 'THREE', 'THREW', 'THROW',
            'THUMB', 'TIGHT', 'TIRED', 'TITLE', 'TODAY', 'TOPIC', 'TOTAL', 'TOUCH', 'TOUGH', 'TOWER',
            'TRACK', 'TRADE', 'TRAIN', 'TREAT', 'TREND', 'TRIAL', 'TRIBE', 'TRICK', 'TRIED', 'TRIES',
            'TRUCK', 'TRULY', 'TRUNK', 'TRUST', 'TRUTH', 'TWICE', 'TWIST', 'TYLER', 'UNDER', 'UNDUE',
            'UNION', 'UNITY', 'UNTIL', 'UPPER', 'UPSET', 'URBAN', 'USAGE', 'USUAL', 'VALUE', 'VIDEO',
            'VIRUS', 'VISIT', 'VITAL', 'VOCAL', 'VOICE', 'WASTE', 'WATCH', 'WATER', 'WHEEL', 'WHERE',
            'WHICH', 'WHILE', 'WHITE', 'WHOLE', 'WHOSE', 'WOMAN', 'WOMEN', 'WORLD', 'WORRY', 'WORSE',
            'WORST', 'WORTH', 'WOULD', 'WRITE', 'WRONG', 'WROTE', 'YIELD', 'YOUNG', 'YOUTH'
        ];
        
        this.isLoaded = true;
        debug.log(`Loaded ${this.words.length} fallback words`);
    }

    // Main method to ensure words are loaded
    async ensureWordsLoaded() {
        if (this.isLoaded) {
            return this.words;
        }

        if (this.isLoading) {
            return this.loadPromise;
        }

        this.isLoading = true;
        this.loadPromise = this._loadWords();
        
        try {
            const result = await this.loadPromise;
            return result;
        } finally {
            this.isLoading = false;
            this.loadPromise = null;
        }
    }

    // Internal method to load words
    async _loadWords() {
        try {
            // Try cache first
            if (this.isCacheValid() && this.loadFromCache()) {
                return this.words;
            }

            // Try API
            try {
                return await this.fetchFromAPI();
            } catch (apiError) {
                debug.warn('API fetch failed, trying cache:', apiError);
                
                // Try expired cache as fallback
                if (this.loadFromCache()) {
                    return this.words;
                }
                
                // Last resort: fallback words
                this.loadFallbackWords();
                return this.words;
            }
        } catch (error) {
            debug.error('All word loading methods failed:', error);
            this.loadFallbackWords();
            return this.words;
        }
    }

    // Validate if a word exists in the loaded words
    isValidWord(word) {
        if (!this.isLoaded) {
            debug.warn('Words not loaded yet, validation may be inaccurate');
            return false;
        }
        
        return this.words.includes(word.toUpperCase());
    }

    // Get a random word from the loaded words
    getRandomWord() {
        if (!this.isLoaded || this.words.length === 0) {
            debug.warn('Words not loaded, returning fallback');
            return 'WORLD';
        }
        
        const randomIndex = Math.floor(Math.random() * this.words.length);
        return this.words[randomIndex];
    }

    // Get words count
    getWordsCount() {
        return this.words.length;
    }

    // Force refresh words from API
    async forceRefresh() {
        this.clearCache();
        this.words = [];
        this.isLoaded = false;
        
        return await this.ensureWordsLoaded();
    }

    // Clear cache
    clearCache() {
        try {
            localStorage.removeItem(CACHE_KEY);
            localStorage.removeItem(CACHE_VERSION_KEY);
            localStorage.removeItem(CACHE_EXPIRY_KEY);
            debug.log('Cache cleared');
        } catch (error) {
            debug.error('Error clearing cache:', error);
        }
    }

    // Get cache info
    getCacheInfo() {
        try {
            const expiry = localStorage.getItem(CACHE_EXPIRY_KEY);
            const version = localStorage.getItem(CACHE_VERSION_KEY);
            const wordsCount = this.words.length;
            
            return {
                isValid: this.isCacheValid(),
                expiry: expiry ? new Date(parseInt(expiry)) : null,
                version: version || 'unknown',
                wordsCount,
                isLoaded: this.isLoaded
            };
        } catch (error) {
            return {
                isValid: false,
                expiry: null,
                version: 'unknown',
                wordsCount: 0,
                isLoaded: false
            };
        }
    }
}

// Create singleton instance
const wordleCache = new WordleCache();

export default wordleCache; 