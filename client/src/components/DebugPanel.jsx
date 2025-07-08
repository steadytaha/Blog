import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import debugRunner from '../gameLogic/utils/debug-runner.js';
import { debug } from '../utils/debug.js';

const DebugPanel = () => {
  const { theme } = useSelector((state) => state.theme);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState([]);

  const addResult = (message, type = 'info') => {
    setResults(prev => [...prev, { 
      id: Date.now(), 
      message, 
      type, 
      timestamp: new Date().toLocaleTimeString() 
    }]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const runTest = async (testName, testFunc) => {
    if (isRunning) return;
    
    setIsRunning(true);
    addResult(`🚀 Starting ${testName} test...`, 'info');
    
    try {
      const result = await testFunc();
      addResult(`✅ ${testName} test completed successfully`, 'success');
      return result;
    } catch (error) {
      addResult(`❌ ${testName} test failed: ${error.message}`, 'error');
      debug.error(`${testName} test error:`, error);
    } finally {
      setIsRunning(false);
    }
  };

  // Create test functions using the new debugRunner API
  const quickTests = {
    auth: () => debugRunner.testAuthentication(),
    wordleGame: () => debugRunner.testSaveSession('wordle'),
    tictactoeGame: () => debugRunner.testSaveSession('tictactoe'),
    sudokuGame: () => debugRunner.testSaveSession('sudoku'),
    rateLimit: () => debugRunner.testRateLimit(),
    leaderboard: () => debugRunner.testLeaderboard(),
    all: () => debugRunner.runFullSuite()
  };

  const tests = [
    {
      name: 'Authentication',
      description: 'Test if user is properly authenticated',
      func: quickTests.auth
    },
    {
      name: 'Wordle Game Save',
      description: 'Test saving a Wordle game session',
      func: quickTests.wordleGame
    },
    {
      name: 'TicTacToe Game Save',
      description: 'Test saving a TicTacToe game session',
      func: quickTests.tictactoeGame
    },
    {
      name: 'Sudoku Game Save',
      description: 'Test saving a Sudoku game session',
      func: quickTests.sudokuGame
    },
    {
      name: 'Rate Limiting',
      description: 'Test API rate limiting (expect some failures)',
      func: quickTests.rateLimit
    },
    {
      name: 'Leaderboard',
      description: 'Test leaderboard functionality',
      func: quickTests.leaderboard
    },
    {
      name: 'All Tests',
      description: 'Run comprehensive test suite',
      func: quickTests.all
    }
  ];

  const getResultColor = (type) => {
    switch (type) {
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
    }
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 rounded-lg border ${
      theme === 'dark' 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="mb-6">
        <h2 className={`text-2xl font-bold mb-2 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          🔧 API Debug Panel
        </h2>
        <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Test your game API endpoints and troubleshoot issues. Check the browser console for detailed logs.
        </p>
      </div>

      {/* Test Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {tests.map((test, index) => (
          <button
            key={index}
            onClick={() => runTest(test.name, test.func)}
            disabled={isRunning}
            className={`p-4 rounded-lg border text-left transition-all duration-200 ${
              isRunning 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:shadow-md transform hover:scale-105'
            } ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                : 'bg-gray-50 border-gray-300 text-gray-900 hover:bg-gray-100'
            }`}
          >
            <div className="font-semibold mb-1">{test.name}</div>
            <div className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {test.description}
            </div>
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={clearResults}
          className={`px-4 py-2 rounded-lg transition-all duration-200 ${
            theme === 'dark'
              ? 'bg-gray-700 text-white hover:bg-gray-600'
              : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
          }`}
        >
          Clear Results
        </button>
        
        <button
          onClick={() => {
            debug.log('🔍 Opening browser console for detailed logs...');
            debug.log('💡 You can also run individual tests:');
            debug.log('   debugRunner.testAuthentication()');
            debug.log('   debugRunner.testSaveSession("wordle")');
            debug.log('   debugRunner.testSaveSession("tictactoe")');
            debug.log('   debugRunner.testRateLimit()');
            debug.log('   debugRunner.runFullSuite()');
          }}
          className={`px-4 py-2 rounded-lg transition-all duration-200 ${
            theme === 'dark'
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          Console Help
        </button>
      </div>

      {/* Results Display */}
      {results.length > 0 && (
        <div className={`border rounded-lg p-4 ${
          theme === 'dark' 
            ? 'border-gray-600 bg-gray-900' 
            : 'border-gray-300 bg-gray-50'
        }`}>
          <h3 className={`font-semibold mb-3 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Test Results:
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {results.map((result) => (
              <div
                key={result.id}
                className={`text-sm font-mono ${getResultColor(result.type)}`}
              >
                <span className="opacity-75">[{result.timestamp}]</span> {result.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Console Instructions */}
      <div className={`mt-6 p-4 rounded-lg border ${
        theme === 'dark' 
          ? 'border-blue-500 bg-blue-900 bg-opacity-20' 
          : 'border-blue-300 bg-blue-50'
      }`}>
        <h4 className="font-semibold mb-2 text-blue-600 dark:text-blue-400">
          💡 Console Commands
        </h4>
        <div className="text-sm space-y-1 font-mono">
          <div>• <code>debugRunner.testAuthentication()</code> - Test authentication</div>
          <div>• <code>debugRunner.testSaveSession('wordle')</code> - Test Wordle game save</div>
          <div>• <code>debugRunner.testSaveSession('tictactoe')</code> - Test TicTacToe game save</div>
          <div>• <code>debugRunner.testRateLimit()</code> - Test rate limiting</div>
          <div>• <code>debugRunner.runFullSuite()</code> - Run all tests</div>
        </div>
      </div>

      {isRunning && (
        <div className="flex items-center justify-center mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2">Running test...</span>
        </div>
      )}
    </div>
  );
};

export default DebugPanel; 