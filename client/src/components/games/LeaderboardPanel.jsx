import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { HiOutlineChevronLeft } from 'react-icons/hi';
import { FaCrown } from 'react-icons/fa';
import { useGame } from '../../gameLogic/GameContext.jsx';
import { debug } from '../../utils/debug.js';

// Waiting placeholder component for empty podium positions
const WaitingPodiumItem = ({ position, height, theme, isAnimated }) => (
    <div className="flex flex-col items-center mx-2 font-lexend">
        <div className={`w-16 h-16 rounded-full border-4 border-dashed flex items-center justify-center shadow-lg z-10 ${
            theme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-gray-100'
        }`}>
            <span className={`text-2xl ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>⏳</span>
        </div>
        <p className={`font-semibold mt-2 text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Waiting...
        </p>
        <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
            0 points
        </p>
        <div
            className={`w-24 mt-2 rounded-t-lg flex items-center justify-center transition-all duration-700 ease-out ${isAnimated ? height : 'h-0'} ${theme === 'dark' ? 'bg-gray-700 border-b-[10px] border-gray-800' : 'bg-gray-200 border-b-[10px] border-gray-300'}`}
        >
            <span className={`text-4xl font-bold font-lexend transition-opacity duration-300 delay-500 ${isAnimated ? 'opacity-100' : 'opacity-0'} ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                {position}
            </span>
        </div>
    </div>
);

const PodiumItem = ({ player, height, theme, isAnimated }) => (
    <div className="flex flex-col items-center mx-2 font-lexend">
        <img src={player.photo || player.avatar || 'https://i.pravatar.cc/150?u=default'} alt={player.username || player.name} className="w-16 h-16 rounded-full border-4 border-white dark:border-gray-800 shadow-lg z-10" />
        <p className={`font-semibold mt-2 text-center text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            {(player.username || player.name || 'Unknown').length > 10 
                ? (player.username || player.name || 'Unknown').substring(0, 10) + '...' 
                : (player.username || player.name || 'Unknown')
            }
        </p>
        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{player.totalPoints || player.points} points</p>
        <div
            className={`w-24 mt-2 rounded-t-lg flex items-center justify-center transition-all duration-700 ease-out ${isAnimated ? height : 'h-0'} ${theme === 'dark' ? 'bg-emerald-800 border-b-[10px] border-emerald-900' : 'bg-[#D0E3C0] border-b-[10px] border-[#A8C497]'}`}
        >
            <span className={`text-4xl font-bold font-lexend transition-opacity duration-300 delay-500 ${isAnimated ? 'opacity-100' : 'opacity-0'} ${theme === 'dark' ? 'text-gray-200' : 'text-[#665A56]'}`}>
                {player.rank}
            </span>
        </div>
    </div>
);

export default function LeaderboardPanel({ onClose }) {
    const { theme } = useSelector((state) => state.theme);
    const { currentUser } = useSelector((state) => state.user);
    const { getLeaderboardData, calculateTotalPoints, state } = useGame();
    const [isPodiumAnimated, setPodiumAnimated] = useState(false);
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        const timer = setTimeout(() => {
            setPodiumAnimated(true);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const loadLeaderboard = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const data = await getLeaderboardData(null, 50); // Get more data to ensure we have top players
                
                // Filter out invalid entries and add proper ranking
                const validData = data
                    .filter(player => player && player.username && player.totalPoints !== undefined)
                    .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
                    .map((player, index) => ({
                        ...player,
                        rank: index + 1
                    }));
                
                setLeaderboardData(validData);
            } catch (err) {
                debug.error('Failed to load leaderboard:', err);
                setError('Failed to load leaderboard data');
                setLeaderboardData([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadLeaderboard();
    }, [getLeaderboardData]);

    // Always create podium with 3 positions, using waiting signs for missing positions
    const getPodiumData = () => {
        const podium = [null, null, null]; // positions 1, 2, 3
        
        leaderboardData.forEach(player => {
            if (player.rank === 1) podium[0] = player;
            else if (player.rank === 2) podium[1] = player;
            else if (player.rank === 3) podium[2] = player;
        });
        
        return podium;
    };

    const podiumData = getPodiumData();
    const restOfLeaderboard = leaderboardData.filter(p => p.rank > 3 && !p.isCurrentUser);
    
    // Find current user in leaderboard or create entry
    const currentUserInLeaderboard = leaderboardData.find(p => p.isCurrentUser || (currentUser && p.userId === currentUser._id));
    const currentUserData = currentUserInLeaderboard || {
        rank: leaderboardData.length + 1,
        username: currentUser?.username || 'You',
        photo: currentUser?.photo || 'https://i.pravatar.cc/150?u=currentuser',
        totalPoints: calculateTotalPoints(),
        gamesPlayed: state.totalGamesPlayed,
        winRate: 0,
        isCurrentUser: true
    };

    const tierColor = (tier) => {
        switch (tier) {
            case 'gold': 
                return {
                    background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                };
            case 'silver': 
                return {
                    background: 'linear-gradient(135deg, #e5e7eb, #9ca3af)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                };
            case 'bronze': 
                return {
                    background: 'linear-gradient(135deg, #fb923c, #ea580c)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                };
            case 'purple': 
                return {
                    background: 'linear-gradient(135deg, #ec4899, #be185d)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                };
            default: 
                return {
                    color: theme === 'dark' ? '#6b7280' : '#d1d5db'
                };
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center backdrop-blur-sm p-4 font-lexend">
            <div className={`rounded-3xl shadow-2xl w-full max-w-md h-[90vh] flex flex-col overflow-hidden border ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-[#FEFAED] border-gray-200'}`}>
                {/* Header */}
                <header className="flex items-center p-4">
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <HiOutlineChevronLeft className="w-6 h-6" />
                    </button>
                    <h2 className={`text-xl font-bold font-lexend text-center flex-1 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Leaderboard</h2>
                    <div className="w-8"></div>
                </header>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="flex flex-col items-center justify-center py-12 px-4">
                        <p className={`text-center ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
                            {error}
                        </p>
                        <button 
                            onClick={() => window.location.reload()} 
                            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Podium - Always show 3 positions */}
                {!isLoading && !error && (
                    <>
                        <div className="flex justify-center items-end pt-8 pb-12 px-4">
                            {/* 2nd Place */}
                            {podiumData[1] ? (
                                <PodiumItem player={podiumData[1]} height="h-32" theme={theme} isAnimated={isPodiumAnimated} />
                            ) : (
                                <WaitingPodiumItem position={2} height="h-32" theme={theme} isAnimated={isPodiumAnimated} />
                            )}

                            {/* 1st Place */}
                            {podiumData[0] ? (
                                <PodiumItem player={podiumData[0]} height="h-40" theme={theme} isAnimated={isPodiumAnimated} />
                            ) : (
                                <WaitingPodiumItem position={1} height="h-40" theme={theme} isAnimated={isPodiumAnimated} />
                            )}

                            {/* 3rd Place */}
                            {podiumData[2] ? (
                                <PodiumItem player={podiumData[2]} height="h-24" theme={theme} isAnimated={isPodiumAnimated} />
                            ) : (
                                <WaitingPodiumItem position={3} height="h-24" theme={theme} isAnimated={isPodiumAnimated} />
                            )}
                        </div>

                        {/* Current User Card */}
                        <div className="mx-4 mb-4">
                            <div className={`rounded-xl p-4 flex items-center gap-4 ${theme === 'dark' ? 'bg-orange-900/60' : 'bg-[#FC6F46]'}`}>
                                <img src={currentUserData.photo || 'https://i.pravatar.cc/150?u=currentuser'} alt={currentUserData.username} className="w-12 h-12 rounded-full border-2 border-white" />
                                <div className="flex-1 grid grid-cols-3 text-center">
                                    <div>
                                        <p className={`text-sm font-lexend ${theme === 'dark' ? 'text-gray-300' : 'text-white'}`}>Points</p>
                                        <p className={`font-bold text-lg font-lexend ${theme === 'dark' ? 'text-white' : 'text-white'}`}>{currentUserData.totalPoints || 0}</p>
                                    </div>
                                    <div>
                                        <p className={`text-sm font-lexend ${theme === 'dark' ? 'text-gray-300' : 'text-white'}`}>Games</p>
                                        <p className={`font-bold text-lg font-lexend ${theme === 'dark' ? 'text-white' : 'text-white'}`}>{currentUserData.gamesPlayed || 0}</p>
                                    </div>
                                    <div>
                                        <p className={`text-sm font-lexend ${theme === 'dark' ? 'text-gray-300' : 'text-white'}`}>Position</p>
                                        <p className={`font-bold text-lg font-lexend ${theme === 'dark' ? 'text-white' : 'text-white'}`}>#{currentUserData.rank}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Leaderboard List */}
                        <main className="flex-1 overflow-auto px-4">
                            {restOfLeaderboard.length > 0 ? (
                                <ul className="space-y-2">
                                    {restOfLeaderboard.map(player => (
                                        <li key={player.rank} className="flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                                            <div className={`text-lg font-bold font-lexend w-8 ${theme === 'dark' ? 'text-gray-400' : 'text-[#665A56]'}`}>
                                                {String(player.rank).padStart(2, '0')}
                                            </div>
                                            <img src={player.photo || 'https://i.pravatar.cc/150?u=default'} alt={player.username} className="w-10 h-10 rounded-full mx-4" />
                                            <div className="flex-1">
                                                <p className={`font-semibold font-lexend ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                                                    {player.username}
                                                </p>
                                                <p className={`text-sm font-lexend ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    {player.totalPoints} points • {player.gamesPlayed || 0} games
                                                </p>
                                            </div>
                                            <FaCrown className="w-6 h-6" style={tierColor('purple')} />
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className={`flex flex-col items-center justify-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                    <div className="text-6xl mb-4">🎮</div>
                                    <p className="text-lg font-medium">No players yet</p>
                                    <p className="text-sm mt-1 opacity-75 text-center">Play some games to see more players on the leaderboard!</p>
                                </div>
                            )}
                        </main>
                    </>
                )}
            </div>
        </div>
    );
}