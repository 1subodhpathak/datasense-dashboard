import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, User, Users, FileText, Eye, Code2, UserPlus, Loader2 } from "lucide-react";
import { useUser } from "@clerk/clerk-react";

const iconMap = {
  code: <Code2 className="w-5 h-5 text-gray-600 dark:text-gray-300 hover:text-dsb-accent transition-colors" />,
  users: <Users className="w-5 h-5 text-gray-600 dark:text-gray-300 hover:text-dsb-accent transition-colors" />,
  userplus: <UserPlus className="w-5 h-5 text-gray-600 dark:text-gray-300 hover:text-dsb-accent transition-colors" />
};

const ChallengesTab = () => {
  const { user, isLoaded } = useUser();
  const [gameData, setGameData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGameHistory = async () => {
      if (!isLoaded || !user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`https://server.datasenseai.com/game-history/game-data/${user.id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Filter out games with empty playernames and process the data
        const validGames = data.gameData
          .filter(game => game.playernames && game.playernames.length > 0)
          .map((game, index) => ({
            id: game._id || index,
            mode: game.gametype || "Unknown",
            players: game.playernames.map(name => ({
              name: name,
              rating: Math.floor(Math.random() * 200) + 700 // Mock rating since not in API
            })),
            result: game.result || "unknown",
            subject: game.subject || null,
            report: Math.random() > 0.5, // Mock report availability
            actions: ["code", "users", "userplus"], // Default actions
            createdAt: game.createdAt,
            // Additional fields available but not displayed:
            // - _id: game._id
            // - Full timestamp: game.createdAt
          }));
        
        setGameData(validGames);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching game history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGameHistory();
  }, [user, isLoaded]);

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getResultColor = (result) => {
    switch (result?.toLowerCase()) {
      case 'won':
        return 'bg-green-500/20 text-green-400';
      case 'lost':
        return 'bg-red-500/20 text-red-400';
      case 'tie':
        return 'bg-yellow-500/20 text-yellow-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getResultText = (result) => {
    switch (result?.toLowerCase()) {
      case 'won':
        return '+ Win';
      case 'lost':
        return '- Loss';
      case 'tie':
        return '= Tie';
      default:
        return '? Unknown';
    }
  };

  if (loading) {
    return (
      <div className="neo-glass-dark bg-white dark:bg-[#32363C] p-6 md:p-8 rounded-xl border border-gray-300 dark:border-gray-600/30 backdrop-blur-md w-full mt-8">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-dsb-accent" />
          <span className="ml-2 text-gray-600 dark:text-gray-300">Loading game history...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="neo-glass-dark bg-white dark:bg-[#32363C] p-6 md:p-8 rounded-xl border border-gray-300 dark:border-gray-600/30 backdrop-blur-md w-full mt-8">
        <div className="text-center py-8">
          <div className="text-red-400 mb-2">Error loading game history</div>
          <div className="text-gray-500 dark:text-gray-400 text-sm">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="neo-glass-dark bg-white dark:bg-[#32363C] p-6 md:p-8 rounded-xl border border-gray-300 dark:border-gray-600/30 backdrop-blur-md w-full mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-medium text-gray-900 dark:text-white mb-2">Game History</h2>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:text-white">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
      
      {gameData.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No game history found
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg">
          <table className="min-w-full text-sm text-left text-gray-600 dark:text-gray-300">
            <thead className="bg-gray-200 dark:bg-[#2f2f2f] border-b border-gray-300 dark:border-gray-600/30">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Mode</th>
                <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Players</th>
                <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Subject</th>
                <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Result</th>
                {/* <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">View Report</th> */}
                {/* <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Actions</th> */}
                <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Time</th>
              </tr>
            </thead>
            <tbody>
              {gameData.map((game, idx) => (
                <tr
                  key={game.id}
                  className="transition-all duration-200 hover:bg-cyan-600/5 dark:hover:bg-cyan-500/5 border-b border-gray-300 dark:border-gray-600/20"
                >
                  <td className="px-4 py-3 flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded bg-gray-200 dark:bg-[#2f2f2f] border border-cyan-600 dark:border-cyan-500/30">
                      <span className="text-yellow-400 text-xl">⚡</span>
                    </span>
                    <div className="flex flex-col">
                      <span className="text-gray-900 dark:text-white font-medium">{game.mode}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      {game.players.map((player, i) => (
                        <span key={i} className="flex items-center gap-2">
                          <span className="inline-block w-2 h-2 rounded-full bg-cyan-600 dark:bg-cyan-500/60" />
                          <span className="text-gray-900 dark:text-white font-medium">{player.name}</span>
                          <span className="text-gray-500 dark:text-gray-400 text-xs">({player.rating})</span>
                          <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {game.subject ? (
                      <span className="inline-flex items-center px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-xs font-medium">
                        {game.subject.toUpperCase()}
                      </span>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded font-semibold ${getResultColor(game.result)}`}>
                      {getResultText(game.result)}
                    </span>
                  </td>
                  {/* <td className="px-4 py-3">
                    {game.report ? (
                      <a href="#" className="text-dsb-accent underline hover:text-dsb-accentLight transition-colors">Review</a>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-500">-</span>
                    )}
                  </td> */}
                  {/* <td className="px-4 py-3">
                    <div className="flex gap-3">
                      {game.actions.map((action, i) => (
                        <span key={i} className="cursor-pointer">{iconMap[action]}</span>
                      ))}
                    </div>
                  </td> */}
                  <td className="px-4 py-3">
                    <span className="text-gray-500 dark:text-gray-400 text-xs">
                      {formatTimeAgo(game.createdAt)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ChallengesTab;