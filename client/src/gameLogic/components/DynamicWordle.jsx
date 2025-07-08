import React, { useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useWordle } from '../hooks/useWordle';
import { useGame } from '../GameContext.jsx';
import { playSound, animateElement } from '../utils/gameHelpers';

const DynamicWordle = () => {
  const { theme } = useSelector((state) => state.theme);
  const { updateScore, state: gameState } = useGame();
  const gameRef = useRef(null);
  const gameSavedRef = useRef(false); // Track if current game result has been saved
  
  const {
    targetWord,
    currentGuess,
    guesses,
    gameStatus,
    currentAttempt,
    keyboardStatus,
    stats,
    maxAttempts,
    startTime,
    submitGuess,
    addLetter,
    removeLetter,
    resetGame,
    getAllRows,
    isGameActive,
    wordsLoaded,
    wordsCount,
    getCacheInfo
  } = useWordle();

  // Debug cache status
  useEffect(() => {
    const cacheInfo = getCacheInfo();
    console.log('Wordle Cache Status:', {
      wordsLoaded,
      wordsCount,
      cacheInfo
    });
  }, [wordsLoaded, wordsCount, getCacheInfo]);

  // Reset saved flag when starting a new game
  useEffect(() => {
    if (gameStatus === 'playing') {
      gameSavedRef.current = false;
    }
  }, [gameStatus]);

  // Update global game state when game ends (only once per game)
  useEffect(() => {
    if ((gameStatus === 'won' || gameStatus === 'lost') && !gameSavedRef.current) {
      gameSavedRef.current = true; // Mark as saved immediately to prevent duplicates
      
      const gameResult = {
        result: gameStatus, // 'won' or 'lost'
        score: gameStatus === 'won' ? (7 - currentAttempt) * 10 : 0, // Points based on attempts
        duration: Date.now() - (startTime || Date.now()), // Game duration in ms
        attempts: currentAttempt + (gameStatus === 'won' ? 1 : 0),
        targetWord: targetWord,
        guesses: guesses,
        ...stats // Include existing stats
      };
      updateScore('wordle', gameResult);
      
      // Play appropriate sound
      if (gameStatus === 'won') {
        playSound('win');
      } else {
        playSound('lose');
      }

      // Animate game area
      if (gameRef.current) {
        animateElement(gameRef.current, 'pulse', 500);
      }
    }
  }, [gameStatus, currentAttempt, startTime, targetWord, guesses, stats, updateScore]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (!isGameActive) return;

      const key = event.key.toLowerCase();
      
      if (key === 'enter') {
        handleSubmitGuess();
      } else if (key === 'backspace') {
        handleRemoveLetter();
      } else if (/^[a-z]$/.test(key)) {
        handleAddLetter(key.toUpperCase());
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isGameActive, currentGuess]);

  const handleAddLetter = useCallback((letter) => {
    addLetter(letter);
    playSound('keypress');
  }, [addLetter]);

  const handleRemoveLetter = useCallback(() => {
    removeLetter();
    playSound('keypress');
  }, [removeLetter]);

  const handleSubmitGuess = useCallback(() => {
    console.log('Submitting guess:', currentGuess);
    const result = submitGuess();
    console.log('Submit result:', result);
    
    if (result.success) {
      playSound('correct');
    } else {
      playSound('invalid');
      // Show error message
      console.error('Invalid word:', currentGuess, result.error);
      // Animate current row on invalid guess
      const currentRow = document.querySelector(`[data-row="${currentAttempt}"]`);
      if (currentRow) {
        animateElement(currentRow, 'shake', 400);
      }
    }
  }, [submitGuess, currentAttempt, currentGuess]);

  const handleResetGame = () => {
    gameSavedRef.current = false; // Reset saved flag for new game
    resetGame();
    playSound('click');
    
    if (gameRef.current) {
      animateElement(gameRef.current, 'fade', 300);
    }
  };

  const getTileColor = (status) => {
    switch (status) {
      case 'correct':
        return theme === 'dark' ? 'bg-green-600 text-white border-green-600' : 'bg-green-500 text-white border-green-500';
      case 'partial':
        return theme === 'dark' ? 'bg-yellow-400 text-white border-yellow-400' : 'bg-yellow-300 text-white border-yellow-300';
      case 'incorrect':
        return theme === 'dark' ? 'bg-gray-600 text-white border-gray-600' : 'bg-gray-500 text-white border-gray-500';
      case 'current':
        return theme === 'dark' ? 'bg-gray-800 border-gray-500 text-white' : 'bg-white border-gray-400 text-gray-800';
      default:
        return theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getKeyboardKeyColor = (letter) => {
    const status = keyboardStatus[letter];
    if (!status) {
      return theme === 'dark' ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300';
    }
    
    switch (status) {
      case 'correct':
        return 'bg-green-500 text-white';
      case 'partial':
        return 'bg-yellow-400 text-white';
      case 'incorrect':
        return theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-400 text-gray-100';
      default:
        return theme === 'dark' ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300';
    }
  };

  const getGameStatusMessage = () => {
    if (gameStatus === 'won') {
      return `Congratulations! You found the word! 🎉`;
    } else if (gameStatus === 'lost') {
      return `Game Over! The word was: ${targetWord} 😞`;
    } else {
      return `Guess ${currentAttempt + 1} of ${maxAttempts}`;
    }
  };

  const getStatusMessageColor = () => {
    if (gameStatus === 'won') {
      return 'text-green-500';
    } else if (gameStatus === 'lost') {
      return 'text-red-500';
    } else {
      return theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
    }
  };

  const KEYBOARD_LAYOUT = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
  ];

  return (
    <div ref={gameRef} className="flex flex-col items-center justify-start pt-6 px-8">
      {/* Game Status */}
      <div className={`text-xl font-semibold mb-6 text-center ${getStatusMessageColor()}`}>
        {getGameStatusMessage()}
      </div>

      {/* Game Grid */}
      <div className="grid grid-rows-6 gap-2 mb-8">
        {getAllRows().map((row, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-5 gap-2" data-row={rowIndex}>
            {Array.from({ length: 5 }).map((_, colIndex) => {
              const letter = row?.word?.[colIndex]?.trim() || '';
              const status = row?.result?.[colIndex] || 'empty';
              
              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`w-16 h-16 border-2 flex items-center justify-center text-2xl font-bold transition-all duration-300 rounded-lg ${getTileColor(status)}`}
                >
                  <span style={{ fontFamily: 'Limelight' }}>
                    {letter}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* On-screen Keyboard */}
      <div className="mb-6 w-full max-w-lg">
        {KEYBOARD_LAYOUT.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1 mb-2">
            {row.map((key) => {
              const isSpecialKey = key === 'ENTER' || key === 'BACKSPACE';
              return (
                <button
                  key={key}
                  onClick={() => {
                    if (key === 'ENTER') {
                      handleSubmitGuess();
                    } else if (key === 'BACKSPACE') {
                      handleRemoveLetter();
                    } else {
                      handleAddLetter(key);
                    }
                  }}
                  disabled={!isGameActive}
                  className={`${
                    isSpecialKey ? 'px-3 py-2 text-sm' : 'w-10 h-10 text-lg'
                  } font-semibold rounded transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isSpecialKey 
                      ? (theme === 'dark' ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-gray-300 text-gray-800 hover:bg-gray-400')
                      : getKeyboardKeyColor(key)
                  }`}
                >
                  {key === 'BACKSPACE' ? '⌫' : key}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Game Controls and Stats */}
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={handleResetGame}
          className={`px-6 py-2.5 rounded-full text-base font-medium transition-all duration-300 transform hover:scale-105 ${
            theme === 'dark'
              ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg'
              : 'bg-green-500 hover:bg-green-600 text-white shadow-lg'
          }`}
        >
          {gameStatus === 'playing' ? 'New Game' : 'Play Again'}
        </button>

        {/* Statistics */}
        <div className={`grid grid-cols-4 gap-4 text-center text-sm ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          <div>
            <div className="text-lg font-bold">{stats.gamesPlayed}</div>
            <div>Played</div>
          </div>
          <div>
            <div className="text-lg font-bold">
              {stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0}%
            </div>
            <div>Win Rate</div>
          </div>
          <div>
            <div className="text-lg font-bold">{stats.currentStreak}</div>
            <div>Current Streak</div>
          </div>
          <div>
            <div className="text-lg font-bold">{stats.maxStreak}</div>
            <div>Max Streak</div>
          </div>
        </div>

        {/* Total Points */}
        <div className={`text-sm ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Total Points: {gameState.scores.wordle.gamesWon * 25 + gameState.scores.wordle.currentStreak * 5}
        </div>
      </div>
    </div>
  );
};

export default DynamicWordle; 