import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { HiOutlineXMark, HiOutlineTrophy } from 'react-icons/hi2';
import LeaderboardPanel from './LeaderboardPanel.jsx';
import DynamicTicTacToe from '../../gameLogic/components/DynamicTicTacToe.jsx';
import DynamicWordle from '../../gameLogic/components/DynamicWordle.jsx';
import DynamicSudoku from '../../gameLogic/components/DynamicSudoku.jsx';

// Dynamic game components

export default function GamesPanel({ onClose }) {
  const [activeGame, setActiveGame] = useState('TicTacToe');
  const [isLeaderboardOpen, setLeaderboardOpen] = useState(false);
  const theme = useSelector((state) => state.theme.theme);
  
  const renderGame = () => {
    switch (activeGame) {
      case 'TicTacToe':
        return <DynamicTicTacToe />;
      case 'Wordle':
        return <DynamicWordle />;
      case 'Sudoku':
        return <DynamicSudoku />;
      default:
        return null;
    }
  };
  
  const handleLeaderboardToggle = () => {
    setLeaderboardOpen(!isLeaderboardOpen);
  };
  
  const games = [
    { 
      id: 'TicTacToe', 
      name: 'Tic-Tac-Toe', 
      fontFamily: 'Knewave',
      gradient: 'from-blue-800 to-blue-900'
    },
    { 
      id: 'Wordle', 
      name: 'Wordle', 
      fontFamily: 'Limelight',
      gradient: 'from-green-500 to-emerald-600'
    },
    { 
      id: 'Sudoku', 
      name: 'Sudoku', 
      fontFamily: 'Fascinate Inline',
      gradient: 'from-orange-500 to-red-600'
    }
  ];
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center backdrop-blur-sm">
      <div className={`rounded-2xl shadow-2xl w-full max-w-6xl h-[80vh] flex flex-col backdrop-blur-md border transition-all duration-300 ${
        theme === 'dark' 
          ? 'bg-black bg-opacity-90 border-gray-800' 
          : 'bg-white bg-opacity-95 border-gray-200'
      }`}>
        {/* Header */}
        <header className={`flex items-center justify-between p-6 pb-4 transition-colors duration-300`}>
          {/* Left spacer to balance right buttons */}
          <div className="flex items-center gap-3 w-32">
            {/* Empty spacer to match right side width */}
          </div>
          
          <div className="flex items-center justify-center">
            <div className={`flex items-center rounded-3xl p-4 transition-all duration-300 ${
              theme === 'dark' 
                ? 'bg-gray-900 bg-opacity-50' 
                : 'bg-gray-100 bg-opacity-80'
            }`}>
              {games.map((game, index) => (
                <React.Fragment key={game.id}>
                  <button
                    onClick={() => setActiveGame(game.id)}
                    className={`px-10 py-5 text-2xl font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                      activeGame === game.id
                        ? `bg-gradient-to-r ${game.gradient} text-white shadow-xl`
                        : theme === 'dark'
                          ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                    }`}
                    style={{ 
                      fontFamily: game.fontFamily,
                      ...(game.extraStyles || {})
                    }}
                  >
                    {game.name}
                  </button>
                  {index < games.length - 1 && (
                    <div className={`w-px h-12 mx-4 transition-colors duration-300 ${
                      theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-32 justify-end">
            <button
              onClick={handleLeaderboardToggle}
              className={`p-4 rounded-full transition-all duration-300 transform hover:scale-110 ${
                theme === 'dark' 
                  ? 'text-white hover:text-gray-200 hover:bg-gray-800' 
                  : 'text-black hover:text-gray-800 hover:bg-gray-200'
              }`}
            >
              <HiOutlineTrophy className="w-8 h-8" />
            </button>
            <button
              onClick={onClose}
              className={`p-4 rounded-full transition-all duration-300 transform hover:scale-110 ${
                theme === 'dark' 
                  ? 'text-red-400 hover:text-red-300 hover:bg-red-900/30' 
                  : 'text-red-600 hover:text-red-700 hover:bg-red-100'
              }`}
            >
              <HiOutlineXMark className="w-8 h-8" />
            </button>
          </div>
        </header>
        
        {/* Main Game Area */}
        <main className={`flex-1 overflow-auto transition-colors duration-300 ${
          theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
        }`}>
          {renderGame()}
        </main>
      </div>
      {isLeaderboardOpen && <LeaderboardPanel onClose={handleLeaderboardToggle} />}
    </div>
  );
}