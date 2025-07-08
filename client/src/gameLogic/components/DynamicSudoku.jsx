import React, { useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useSudoku } from '../hooks/useSudoku';
import { useGame } from '../GameContext.jsx';
import { playSound, animateElement } from '../utils/gameHelpers';

const DynamicSudoku = () => {
  const { theme } = useSelector((state) => state.theme);
  const { updateScore, state: gameState } = useGame();
  const gameRef = useRef(null);
  const gameSavedRef = useRef(false); // Track if current game result has been saved
  
  const {
    puzzle,
    selectedCell,
    difficulty,
    gameStatus,
    errors,
    hints,
    timer,
    stats,
    isTimerRunning,
    setSelectedCell,
    setDifficulty,
    placeNumber,
    getHint,
    resetPuzzle,
    generateNewPuzzle,
    getCellStatus,
    isInitialCell,
    isGameActive
  } = useSudoku();

  // Reset saved flag when starting a new game
  useEffect(() => {
    if (gameStatus === 'playing') {
      gameSavedRef.current = false;
    }
  }, [gameStatus]);

  // Update global game state when game ends (only once per game)
  useEffect(() => {
    if (gameStatus === 'solved' && !gameSavedRef.current) {
      gameSavedRef.current = true; // Mark as saved immediately to prevent duplicates
      
      // Parse timer to get seconds
      const [minutes, seconds] = timer.split(':').map(Number);
      const totalSeconds = minutes * 60 + seconds;
      
      const gameResult = {
        result: 'won',
        score: calculateSudokuScore(difficulty, totalSeconds, hints),
        duration: totalSeconds * 1000, // Convert to milliseconds for API
        difficulty: difficulty,
        hintsUsed: 3 - hints, // Number of hints used
        timeSeconds: totalSeconds,
        ...stats // Include existing stats
      };
      
      updateScore('sudoku', gameResult);
      
      // Play win sound
      playSound('win');

      // Animate game area
      if (gameRef.current) {
        animateElement(gameRef.current, 'pulse', 500);
      }
    }
  }, [gameStatus, timer, difficulty, hints, stats, updateScore]);

  // Calculate Sudoku score based on difficulty, time, and hints used
  const calculateSudokuScore = (difficulty, timeSeconds, hintsLeft) => {
    const baseScores = { easy: 100, medium: 200, hard: 350, expert: 500 };
    const baseScore = baseScores[difficulty] || 200;
    
    // Time bonus (faster = more points)
    const timeBonus = Math.max(0, 600 - timeSeconds); // Bonus for solving under 10 minutes
    
    // Hints penalty
    const hintsUsed = 3 - hintsLeft;
    const hintsPenalty = hintsUsed * 25;
    
    return Math.max(10, baseScore + timeBonus - hintsPenalty);
  };

  // Handle cell selection
  const handleCellClick = useCallback((row, col, event) => {
    if (!isGameActive || isInitialCell(row, col)) return;
    
    // Stop event propagation to prevent container click
    event?.stopPropagation();
    
    setSelectedCell({ row, col });
    playSound('click');
  }, [isGameActive, isInitialCell, setSelectedCell]);

  // Handle clicking outside the grid to deselect
  const handleContainerClick = useCallback((event) => {
    // Only deselect if clicking directly on the container, not on child elements
    if (event.target === event.currentTarget) {
      setSelectedCell(null);
    }
  }, [setSelectedCell]);

  // Handle number input
  const handleNumberInput = useCallback((number) => {
    if (!selectedCell || !isGameActive) return;
    
    const success = placeNumber(selectedCell.row, selectedCell.col, number);
    if (success) {
      playSound('place');
      
      // Animate the cell
      const cellElement = document.querySelector(`[data-cell="${selectedCell.row}-${selectedCell.col}"]`);
      if (cellElement) {
        animateElement(cellElement, 'bounce', 200);
      }
    }
  }, [selectedCell, isGameActive, placeNumber]);

  // Handle clear cell
  const handleClearCell = useCallback(() => {
    if (!selectedCell || !isGameActive) return;
    
    placeNumber(selectedCell.row, selectedCell.col, 0);
    playSound('keypress');
  }, [selectedCell, isGameActive, placeNumber]);

  // Handle hint
  const handleGetHint = useCallback(() => {
    const success = getHint();
    if (success) {
      playSound('hint');
    } else {
      playSound('invalid');
    }
  }, [getHint]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (!isGameActive) return;

      const key = event.key;
      
      if (key >= '1' && key <= '9') {
        handleNumberInput(parseInt(key));
      } else if (key === 'Backspace' || key === 'Delete' || key === '0') {
        handleClearCell();
      } else if (key === 'h' || key === 'H') {
        handleGetHint();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isGameActive, handleNumberInput, handleClearCell, handleGetHint]);

  const handleResetPuzzle = () => {
    gameSavedRef.current = false; // Reset saved flag for new game
    resetPuzzle();
    playSound('click');
    
    if (gameRef.current) {
      animateElement(gameRef.current, 'fade', 300);
    }
  };

  const handleNewPuzzle = (newDifficulty = difficulty) => {
    gameSavedRef.current = false; // Reset saved flag for new game
    generateNewPuzzle(newDifficulty);
    playSound('click');
    
    if (gameRef.current) {
      animateElement(gameRef.current, 'fade', 300);
    }
  };

  const getCellBackgroundColor = (row, col) => {
    const status = getCellStatus(row, col);
    
    switch (status) {
      case 'error':
        return theme === 'dark' ? 'bg-red-900 border-red-500' : 'bg-red-200 border-red-400';
      case 'selected':
        return theme === 'dark' ? 'bg-orange-700 border-orange-400' : 'bg-orange-200 border-orange-400';
      case 'highlighted':
        return theme === 'dark' ? 'bg-orange-900/30 border-orange-600' : 'bg-orange-100 border-orange-300';
      case 'given':
        return theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-orange-50 border-orange-200';
      default:
        return theme === 'dark' ? 'bg-gray-900 border-gray-600' : 'bg-white border-gray-300';
    }
  };

  const getCellTextColor = (row, col) => {
    if (isInitialCell(row, col)) {
      return theme === 'dark' ? 'text-orange-300 font-bold' : 'text-orange-600 font-bold';
    }
    // User-added numbers also get orange/red styling but slightly different shade
    if (puzzle[row][col] !== 0) {
      return theme === 'dark' ? 'text-red-300 font-semibold' : 'text-red-700 font-semibold';
    }
    return theme === 'dark' ? 'text-gray-400' : 'text-gray-500';
  };

  const getGameStatusMessage = () => {
    if (gameStatus === 'solved') {
      return 'Puzzle Solved! 🎉';
    } else if (gameStatus === 'invalid') {
      return 'Invalid State - Check for Errors';
    } else {
      return `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Sudoku`;
    }
  };

  const getStatusMessageColor = () => {
    if (gameStatus === 'solved') {
      return 'text-green-500';
    } else if (gameStatus === 'invalid') {
      return 'text-red-500';
    } else {
      return theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
    }
  };

  return (
    <div ref={gameRef} className="flex flex-col items-center justify-start pt-6 px-8" onClick={handleContainerClick}>
      {/* Game Header */}
      <div className="flex justify-between items-center w-full max-w-xl mb-6" onClick={(e) => e.stopPropagation()}>
        {/* Timer */}
        <div className={`text-xl font-bold ${
          theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
        }`}>
          ⏱️ {timer}
        </div>

        {/* Game Status */}
        <div className={`text-xl font-semibold text-center ${getStatusMessageColor()}`}>
          {getGameStatusMessage()}
        </div>

        {/* Hints */}
        <div className={`text-xl font-bold ${
          theme === 'dark' ? 'text-red-400' : 'text-red-600'
        }`}>
          💡 {hints}
        </div>
      </div>

      {/* Difficulty Selector */}
      <div className="flex gap-2 mb-6" onClick={(e) => e.stopPropagation()}>
        {['easy', 'medium', 'hard', 'expert'].map((level) => (
          <button
            key={level}
            onClick={() => handleNewPuzzle(level)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
              difficulty === level
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                : (theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')
            }`}
          >
            {level.charAt(0).toUpperCase() + level.slice(1)}
          </button>
        ))}
      </div>

      {/* Sudoku Grid */}
      <div 
        className={`grid grid-cols-9 gap-1 mb-6 p-4 rounded-lg ${
          theme === 'dark' ? 'bg-gray-800 border border-orange-700' : 'bg-orange-50 border border-orange-200'
        }`} 
        style={{ gridTemplateColumns: 'repeat(9, 1fr)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {puzzle.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const isThickBorder = 
              (rowIndex % 3 === 2 && rowIndex !== 8) || 
              (colIndex % 3 === 2 && colIndex !== 8);
            
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                data-cell={`${rowIndex}-${colIndex}`}
                onClick={(event) => handleCellClick(rowIndex, colIndex, event)}
                className={`
                  w-12 h-12 border-2 flex items-center justify-center text-lg font-semibold 
                  cursor-pointer transition-all duration-200 hover:scale-105
                  ${getCellBackgroundColor(rowIndex, colIndex)}
                  ${getCellTextColor(rowIndex, colIndex)}
                  ${isThickBorder ? 'border-b-4 border-r-4' : ''}
                  ${!isGameActive || isInitialCell(rowIndex, colIndex) ? 'cursor-not-allowed' : ''}
                `}
                style={{
                  pointerEvents: (!isGameActive || isInitialCell(rowIndex, colIndex)) ? 'none' : 'auto'
                }}
              >
                {cell !== 0 ? cell : ''}
              </div>
            );
          })
        )}
      </div>

      {/* Number Input Buttons */}
      <div className="grid grid-cols-5 gap-2 mb-6" onClick={(e) => e.stopPropagation()}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
          <button
            key={number}
            onClick={() => handleNumberInput(number)}
            disabled={!isGameActive || !selectedCell}
            className={`w-12 h-12 text-lg font-bold rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-md'
                : 'bg-gradient-to-br from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white shadow-md'
            }`}
          >
            {number}
          </button>
        ))}
        
        {/* Clear button */}
        <button
          onClick={handleClearCell}
          disabled={!isGameActive || !selectedCell}
          className={`w-12 h-12 text-lg font-bold rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
            'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md'
          }`}
        >
          ✗
        </button>
      </div>

      {/* Game Controls */}
      <div className="flex gap-4 mb-6" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={handleGetHint}
          disabled={!isGameActive || hints <= 0}
          className={`px-6 py-2.5 rounded-full text-base font-medium transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
            'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg'
          }`}
        >
          💡 Hint ({hints})
        </button>
        
        <button
          onClick={handleResetPuzzle}
          className={`px-6 py-2.5 rounded-full text-base font-medium transition-all duration-300 transform hover:scale-105 ${
            'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg'
          }`}
        >
          {gameStatus === 'playing' ? 'Reset' : 'Play Again'}
        </button>
        
        <button
          onClick={() => handleNewPuzzle()}
          className={`px-6 py-2.5 rounded-full text-base font-medium transition-all duration-300 transform hover:scale-105 ${
            'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg'
          }`}
        >
          New Puzzle
        </button>
      </div>

      {/* Statistics */}
      <div 
        className={`grid grid-cols-4 gap-4 text-center text-sm ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <div className="text-lg font-bold">{stats.gamesPlayed}</div>
          <div>Played</div>
        </div>
        <div>
          <div className="text-lg font-bold">
            {stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0}%
          </div>
          <div>Success Rate</div>
        </div>
        <div>
          <div className="text-lg font-bold">
            {stats.bestTimes[difficulty] ? `${Math.floor(stats.bestTimes[difficulty] / 60)}:${(stats.bestTimes[difficulty] % 60).toString().padStart(2, '0')}` : '--:--'}
          </div>
          <div>Best Time</div>
        </div>
        <div>
          <div className="text-lg font-bold">
            {stats.averageTimes[difficulty]?.length > 0 
              ? (() => {
                  const avgSeconds = Math.round(stats.averageTimes[difficulty].reduce((a, b) => a + b, 0) / stats.averageTimes[difficulty].length);
                  return `${Math.floor(avgSeconds / 60)}:${(avgSeconds % 60).toString().padStart(2, '0')}`;
                })()
              : '--:--'
            }
          </div>
          <div>Avg Time</div>
        </div>
      </div>

      {/* Instructions */}
      <div 
        className={`text-xs text-center mt-4 max-w-lg ${
          theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        Click a cell and use number keys (1-9) or buttons to fill. Press H for hint, Backspace to clear.
        Fill each row, column, and 3×3 box with digits 1-9.
      </div>
    </div>
  );
};

export default DynamicSudoku; 