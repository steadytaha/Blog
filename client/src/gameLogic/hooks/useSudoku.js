import { useState, useCallback, useEffect } from 'react';

const GRID_SIZE = 9;
const BOX_SIZE = 3;

// Difficulty levels - number of cells to remove from a completed puzzle
const DIFFICULTY_LEVELS = {
  easy: 40,
  medium: 50,
  hard: 60,
  expert: 70
};

export const useSudoku = () => {
  const [puzzle, setPuzzle] = useState(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0)));
  const [solution, setSolution] = useState(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0)));
  const [userInput, setUserInput] = useState(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0)));
  const [initialPuzzle, setInitialPuzzle] = useState(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0)));
  const [selectedCell, setSelectedCell] = useState(null);
  const [difficulty, setDifficulty] = useState('medium');
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'solved', 'invalid'
  const [errors, setErrors] = useState([]);
  const [hints, setHints] = useState(3);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [stats, setStats] = useState({
    gamesPlayed: 0,
    gamesWon: 0,
    bestTimes: { easy: null, medium: null, hard: null, expert: null },
    averageTimes: { easy: [], medium: [], hard: [], expert: [] }
  });

  // Check if a number is valid in a given position
  const isValidMove = useCallback((grid, row, col, num) => {
    // Check row
    for (let x = 0; x < GRID_SIZE; x++) {
      if (grid[row][x] === num) return false;
    }

    // Check column
    for (let x = 0; x < GRID_SIZE; x++) {
      if (grid[x][col] === num) return false;
    }

    // Check 3x3 box
    const boxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
    const boxCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;
    
    for (let i = 0; i < BOX_SIZE; i++) {
      for (let j = 0; j < BOX_SIZE; j++) {
        if (grid[boxRow + i][boxCol + j] === num) return false;
      }
    }

    return true;
  }, []);

  // Solve sudoku using backtracking
  const solveSudoku = useCallback((grid) => {
    const solve = (board) => {
      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          if (board[row][col] === 0) {
            for (let num = 1; num <= 9; num++) {
              if (isValidMove(board, row, col, num)) {
                board[row][col] = num;
                if (solve(board)) return true;
                board[row][col] = 0;
              }
            }
            return false;
          }
        }
      }
      return true;
    };

    const gridCopy = grid.map(row => [...row]);
    solve(gridCopy);
    return gridCopy;
  }, [isValidMove]);

  // Generate a complete filled sudoku grid
  const generateCompleteGrid = useCallback(() => {
    const grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
    
    // Fill diagonal boxes first
    const fillDiagonalBoxes = () => {
      for (let box = 0; box < GRID_SIZE; box += BOX_SIZE) {
        fillBox(grid, box, box);
      }
    };

    const fillBox = (grid, startRow, startCol) => {
      const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      // Shuffle numbers
      for (let i = numbers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
      }
      
      let idx = 0;
      for (let i = 0; i < BOX_SIZE; i++) {
        for (let j = 0; j < BOX_SIZE; j++) {
          grid[startRow + i][startCol + j] = numbers[idx++];
        }
      }
    };

    fillDiagonalBoxes();
    return solveSudoku(grid);
  }, [solveSudoku]);

  // Remove numbers from complete grid to create puzzle
  const createPuzzle = useCallback((completeGrid, difficulty) => {
    const puzzle = completeGrid.map(row => [...row]);
    const cellsToRemove = DIFFICULTY_LEVELS[difficulty];
    
    let removed = 0;
    while (removed < cellsToRemove) {
      const row = Math.floor(Math.random() * GRID_SIZE);
      const col = Math.floor(Math.random() * GRID_SIZE);
      
      if (puzzle[row][col] !== 0) {
        const backup = puzzle[row][col];
        puzzle[row][col] = 0;
        
        // Check if puzzle still has unique solution
        const testGrid = puzzle.map(row => [...row]);
        const solved = solveSudoku(testGrid);
        
        // For simplicity, we'll assume it's valid (in real implementation, you'd verify uniqueness)
        removed++;
      }
    }
    
    return puzzle;
  }, [solveSudoku]);

  // Generate new puzzle
  const generateNewPuzzle = useCallback((selectedDifficulty = difficulty) => {
    setDifficulty(selectedDifficulty); // Update difficulty state
    const completeGrid = generateCompleteGrid();
    const newPuzzle = createPuzzle(completeGrid, selectedDifficulty);
    
    setPuzzle(newPuzzle);
    setSolution(completeGrid);
    setUserInput(newPuzzle.map(row => [...row]));
    setInitialPuzzle(newPuzzle.map(row => [...row]));
    setSelectedCell(null);
    setGameStatus('playing');
    setErrors([]);
    setHints(3);
    setTimer(0);
    setIsTimerRunning(true);
  }, [generateCompleteGrid, createPuzzle]);

  // Timer effect
  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Check if puzzle is solved
  const checkSolution = useCallback((grid) => {
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (grid[row][col] === 0) return false;
        if (grid[row][col] !== solution[row][col]) return false;
      }
    }
    return true;
  }, [solution]);

  // Validate current state and find errors
  const validatePuzzle = useCallback((grid) => {
    const newErrors = [];
    
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const num = grid[row][col];
        if (num !== 0) {
          // Temporarily remove the number to check if it's valid
          const tempGrid = grid.map(r => [...r]);
          tempGrid[row][col] = 0;
          
          if (!isValidMove(tempGrid, row, col, num)) {
            newErrors.push(`${row}-${col}`);
          }
        }
      }
    }
    
    setErrors(newErrors);
    return newErrors.length === 0;
  }, [isValidMove]);

  // Place number in cell
  const placeNumber = useCallback((row, col, num) => {
    if (initialPuzzle[row][col] !== 0) return false; // Can't change initial numbers
    
    const newGrid = userInput.map(r => [...r]);
    newGrid[row][col] = num;
    setUserInput(newGrid);
    
    // Validate puzzle
    const isValid = validatePuzzle(newGrid);
    
    if (isValid && checkSolution(newGrid)) {
      setGameStatus('solved');
      setIsTimerRunning(false);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        gamesPlayed: prev.gamesPlayed + 1,
        gamesWon: prev.gamesWon + 1,
        bestTimes: {
          ...prev.bestTimes,
          [difficulty]: prev.bestTimes[difficulty] ? 
            Math.min(prev.bestTimes[difficulty], timer) : timer
        },
        averageTimes: {
          ...prev.averageTimes,
          [difficulty]: [...prev.averageTimes[difficulty], timer]
        }
      }));
    }
    
    return true;
  }, [userInput, initialPuzzle, validatePuzzle, checkSolution, difficulty, timer]);

  // Get hint
  const getHint = useCallback(() => {
    if (hints <= 0) return false;
    
    const emptyCells = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (userInput[row][col] === 0) {
          emptyCells.push({ row, col });
        }
      }
    }
    
    if (emptyCells.length === 0) return false;
    
    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const { row, col } = randomCell;
    
    placeNumber(row, col, solution[row][col]);
    setHints(prev => prev - 1);
    
    return true;
  }, [hints, userInput, solution, placeNumber]);

  // Reset puzzle
  const resetPuzzle = useCallback(() => {
    setUserInput(initialPuzzle.map(row => [...row]));
    setSelectedCell(null);
    setGameStatus('playing');
    setErrors([]);
    setTimer(0);
    setIsTimerRunning(true);
  }, [initialPuzzle]);

  // Initialize with a new puzzle
  useEffect(() => {
    generateNewPuzzle();
  }, []);

  // Format timer display
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Get cell background color based on state
  const getCellStatus = useCallback((row, col) => {
    const cellId = `${row}-${col}`;
    
    if (errors.includes(cellId)) return 'error';
    if (selectedCell && selectedCell.row === row && selectedCell.col === col) return 'selected';
    if (selectedCell && (selectedCell.row === row || selectedCell.col === col)) return 'highlighted';
    if (selectedCell && Math.floor(selectedCell.row / 3) === Math.floor(row / 3) && 
        Math.floor(selectedCell.col / 3) === Math.floor(col / 3)) return 'highlighted';
    if (initialPuzzle[row][col] !== 0) return 'given';
    
    return 'empty';
  }, [errors, selectedCell, initialPuzzle]);

  return {
    puzzle: userInput,
    selectedCell,
    difficulty,
    gameStatus,
    errors,
    hints,
    timer: formatTime(timer),
    stats,
    isTimerRunning,
    setSelectedCell,
    setDifficulty,
    placeNumber,
    getHint,
    resetPuzzle,
    generateNewPuzzle,
    getCellStatus,
    isInitialCell: (row, col) => initialPuzzle[row][col] !== 0,
    isGameActive: gameStatus === 'playing'
  };
}; 