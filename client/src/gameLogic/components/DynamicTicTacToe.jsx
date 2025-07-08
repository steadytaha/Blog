import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useTicTacToe } from '../hooks/useTicTacToe';
import { useGame } from '../GameContext.jsx';
import { playSound, animateElement } from '../utils/gameHelpers';

const DynamicTicTacToe = () => {
  const { theme } = useSelector((state) => state.theme);
  const { updateScore, state: gameState } = useGame();
  const boardRef = useRef(null);
  const gameSavedRef = useRef(false); // Track if current game result has been saved
  
  const {
    board,
    currentPlayer,
    gameStatus,
    winner,
    scores,
    startTime,
    makeMove,
    resetGame,
    isPlayerTurn
  } = useTicTacToe();

  // Reset saved flag when starting a new game
  useEffect(() => {
    if (gameStatus === 'playing') {
      gameSavedRef.current = false;
    }
  }, [gameStatus]);

  // Update global game state when game ends (only once per game)
  useEffect(() => {
    if ((gameStatus === 'won' || gameStatus === 'draw') && !gameSavedRef.current) {
      gameSavedRef.current = true; // Mark as saved immediately to prevent duplicates
      
      const gameResult = {
        result: gameStatus === 'won' ? (winner === 'X' ? 'won' : 'lost') : 'draw',
        score: gameStatus === 'won' && winner === 'X' ? 100 : gameStatus === 'draw' ? 50 : 0,
        duration: Date.now() - startTime, // Actual game duration in ms
        winner: winner,
        difficulty: 'medium',
        ...scores // Include existing scores
      };
      updateScore('tictactoe', gameResult);
      
      // Play appropriate sound
      if (gameStatus === 'won') {
        if (winner === 'X') {
          playSound('win');
        } else {
          playSound('lose');
        }
      } else {
        playSound('draw');
      }

      // Animate board on game end
      if (boardRef.current) {
        animateElement(boardRef.current, 'pulse', 500);
      }
    }
  }, [gameStatus, winner, startTime, scores, updateScore]);

  const handleCellClick = (cellIndex) => {
    if (makeMove(cellIndex)) {
      playSound('move');
      
      // Animate the clicked cell
      const cell = document.querySelector(`[data-cell-index="${cellIndex}"]`);
      if (cell) {
        animateElement(cell, 'bounce', 200);
      }
    }
  };

  const handleResetGame = () => {
    gameSavedRef.current = false; // Reset saved flag for new game
    resetGame();
    playSound('click');
    
    if (boardRef.current) {
      animateElement(boardRef.current, 'fade', 300);
    }
  };

  const getCellContent = (cellIndex) => {
    const cellValue = board[cellIndex];
    if (!cellValue) return '';
    
    return (
      <span 
        className={`${
          cellValue === 'X' 
            ? 'text-blue-500' 
            : 'text-red-500'
        }`} 
        style={{ fontFamily: 'Knewave' }}
      >
        {cellValue}
      </span>
    );
  };

  const getGameStatusMessage = () => {
    if (gameStatus === 'won') {
      return winner === 'X' ? 'You Win! 🎉' : 'Computer Wins! 🤖';
    } else if (gameStatus === 'draw') {
      return "It's a Draw! 🤝";
    } else if (currentPlayer === 'X') {
      return 'Your Turn';
    } else {
      return 'Computer Thinking...';
    }
  };

  const getStatusMessageColor = () => {
    if (gameStatus === 'won') {
      return winner === 'X' ? 'text-green-500' : 'text-red-500';
    } else if (gameStatus === 'draw') {
      return 'text-yellow-500';
    } else {
      return theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
    }
  };

  return (
    <div className="flex items-start justify-center pt-8 px-8">
      {/* User Score Section */}
      <div className="flex flex-col items-center justify-start pt-8 flex-1">
        <h3 className={`text-2xl font-semibold mb-4 ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Player
        </h3>
        <div className={`text-7xl font-bold mb-4 ${
          theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
        }`} style={{ fontFamily: 'Tahoma' }}>
          {scores.player}
        </div>
      </div>

      {/* Game Board Section */}
      <div className="flex flex-col items-center mx-12">
        {/* Game Status */}
        <div className={`text-xl font-semibold mb-4 text-center ${getStatusMessageColor()}`}>
          {getGameStatusMessage()}
        </div>

        {/* Game Board */}
        <div ref={boardRef} className="grid grid-cols-3 gap-4 mb-8" data-testid="game-board">
          {board.map((cell, index) => (
            <div
              key={index}
              data-cell-index={index}
              className={`w-32 h-32 border-4 flex items-center justify-center text-6xl font-bold cursor-pointer transition-all duration-200 hover:scale-105 rounded-xl ${
                theme === 'dark'
                  ? 'border-gray-600 bg-gray-800 hover:bg-gray-700'
                  : 'border-gray-400 bg-gray-100 hover:bg-gray-200'
              } ${
                !isPlayerTurn || cell !== null ? 'cursor-not-allowed opacity-75' : ''
              }`}
              onClick={() => handleCellClick(index)}
              style={{
                pointerEvents: (!isPlayerTurn || cell !== null) ? 'none' : 'auto'
              }}
            >
              {getCellContent(index)}
            </div>
          ))}
        </div>

        {/* Game Controls */}
        <div className="flex gap-4">
          <button
            onClick={handleResetGame}
            className={`px-6 py-2.5 rounded-full text-base font-medium transition-all duration-300 transform hover:scale-105 ${
              theme === 'dark'
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
                : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg'
            }`}
          >
            {gameStatus === 'playing' ? 'Reset Game' : 'Play Again'}
          </button>
        </div>
      </div>

      {/* Computer Score Section */}
      <div className="flex flex-col items-center justify-start pt-8 flex-1">
        <h3 className={`text-2xl font-semibold mb-4 ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Computer
        </h3>
        <div className={`text-7xl font-bold mb-4 ${
          theme === 'dark' ? 'text-red-400' : 'text-red-600'
        }`} style={{ fontFamily: 'Tahoma' }}>
          {scores.computer}
        </div>
      </div>
    </div>
  );
};

export default DynamicTicTacToe; 