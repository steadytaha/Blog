import { useState, useCallback, useEffect } from 'react';

const INITIAL_BOARD = Array(9).fill(null);
const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6] // diagonals
];

export const useTicTacToe = () => {
  const [board, setBoard] = useState(INITIAL_BOARD);
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'won', 'draw'
  const [winner, setWinner] = useState(null);
  const [scores, setScores] = useState({ player: 0, computer: 0 });
  const [gameHistory, setGameHistory] = useState([]);
  const [startTime, setStartTime] = useState(Date.now());

  const checkWinner = useCallback((board) => {
    for (let combination of WINNING_COMBINATIONS) {
      const [a, b, c] = combination;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  }, []);

  const checkDraw = useCallback((board) => {
    return board.every(cell => cell !== null);
  }, []);

  const getAvailableMoves = useCallback((board) => {
    return board.map((cell, index) => cell === null ? index : null).filter(val => val !== null);
  }, []);

  const minimax = useCallback((board, depth, isMaximizing) => {
    const winner = checkWinner(board);
    
    if (winner === 'O') return 10 - depth;
    if (winner === 'X') return depth - 10;
    if (checkDraw(board)) return 0;

    if (isMaximizing) {
      let maxScore = -Infinity;
      const availableMoves = getAvailableMoves(board);
      
      for (let move of availableMoves) {
        board[move] = 'O';
        const score = minimax(board, depth + 1, false);
        board[move] = null;
        maxScore = Math.max(score, maxScore);
      }
      return maxScore;
    } else {
      let minScore = Infinity;
      const availableMoves = getAvailableMoves(board);
      
      for (let move of availableMoves) {
        board[move] = 'X';
        const score = minimax(board, depth + 1, true);
        board[move] = null;
        minScore = Math.min(score, minScore);
      }
      return minScore;
    }
  }, [checkWinner, checkDraw, getAvailableMoves]);

  const getBestMove = useCallback((board) => {
    let bestScore = -Infinity;
    let bestMove = null;
    const availableMoves = getAvailableMoves(board);
    
    for (let move of availableMoves) {
      board[move] = 'O';
      const score = minimax(board, 0, false);
      board[move] = null;
      
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
    
    return bestMove;
  }, [getAvailableMoves, minimax]);

  const makeMove = useCallback((cellIndex) => {
    if (board[cellIndex] !== null || gameStatus !== 'playing') {
      return false;
    }

    const newBoard = [...board];
    newBoard[cellIndex] = currentPlayer;
    setBoard(newBoard);

    const winner = checkWinner(newBoard);
    if (winner) {
      setWinner(winner);
      setGameStatus('won');
      setScores(prev => ({
        ...prev,
        [winner === 'X' ? 'player' : 'computer']: prev[winner === 'X' ? 'player' : 'computer'] + 1
      }));
      setGameHistory(prev => [...prev, { board: newBoard, winner }]);
      return true;
    }

    if (checkDraw(newBoard)) {
      setGameStatus('draw');
      setGameHistory(prev => [...prev, { board: newBoard, winner: 'draw' }]);
      return true;
    }

    setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    return true;
  }, [board, currentPlayer, gameStatus, checkWinner, checkDraw]);

  const makeComputerMove = useCallback(() => {
    if (currentPlayer === 'O' && gameStatus === 'playing') {
      const bestMove = getBestMove(board);
      if (bestMove !== null) {
        setTimeout(() => {
          makeMove(bestMove);
        }, 500); // Add delay for better UX
      }
    }
  }, [currentPlayer, gameStatus, board, getBestMove, makeMove]);

  useEffect(() => {
    if (currentPlayer === 'O' && gameStatus === 'playing') {
      makeComputerMove();
    }
  }, [currentPlayer, gameStatus, makeComputerMove]);

  const resetGame = useCallback(() => {
    setBoard(INITIAL_BOARD);
    setCurrentPlayer('X');
    setGameStatus('playing');
    setWinner(null);
    setStartTime(Date.now());
  }, []);

  const resetScores = useCallback(() => {
    setScores({ player: 0, computer: 0 });
    setGameHistory([]);
  }, []);

  return {
    board,
    currentPlayer,
    gameStatus,
    winner,
    scores,
    gameHistory,
    startTime,
    makeMove,
    resetGame,
    resetScores,
    isPlayerTurn: currentPlayer === 'X' && gameStatus === 'playing'
  };
}; 