import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

const LeaderboardTab: React.FC = () => {
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameType, setGameType] = useState<string>("overall");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`https://server.datasenseai.com/battleground-leaderboard/${gameType}?limit=100`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setLeaderboardData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch leaderboard');
        console.error('Error fetching leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [gameType]);

  if (loading) {
    return (
      <div className="neo-glass-dark bg-white dark:bg-[#32363C] p-6 md:p-8 rounded-xl border-gray-300 dark:border-gray-600/30 backdrop-blur-md">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-600 dark:text-cyan-500" />
          <span className="ml-2 text-gray-600 dark:text-gray-300">Loading leaderboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="neo-glass-dark bg-white dark:bg-[#32363C] p-6 md:p-8 rounded-xl border-gray-300 dark:border-gray-600/30 backdrop-blur-md">
        <div className="text-center py-8">
          <div className="text-red-400 mb-2">Error loading leaderboard</div>
          <div className="text-gray-500 dark:text-gray-400 text-sm">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="neo-glass-dark bg-white dark:bg-[#32363C] p-6 md:p-8 rounded-xl border-gray-300 dark:border-gray-600/30 backdrop-blur-md">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-medium text-gray-900 dark:text-white mb-2">Leaderboard</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setGameType("overall")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              gameType === "overall"
                ? "bg-cyan-600 dark:bg-cyan-500 text-white"
                : "bg-gray-200 dark:bg-[#2f2f2f] text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-[#3f3f3f]"
            }`}
          >
            Overall
          </button>
          <button
            onClick={() => setGameType("bullet-surge")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              gameType === "bullet-surge"
                ? "bg-cyan-600 dark:bg-cyan-500 text-white"
                : "bg-gray-200 dark:bg-[#2f2f2f] text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-[#3f3f3f]"
            }`}
          >
            Bullet Surge
          </button>
          <button
            onClick={() => setGameType("rapid-sprint")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              gameType === "rapid-sprint"
                ? "bg-cyan-600 dark:bg-cyan-500 text-white"
                : "bg-gray-200 dark:bg-[#2f2f2f] text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-[#3f3f3f]"
            }`}
          >
            Rapid Sprint
          </button>
        </div>
      </div>

      {leaderboardData.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No leaderboard data available
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg">
          <table className="min-w-full text-sm text-left text-gray-600 dark:text-gray-300">
            <thead className="bg-gray-200 dark:bg-[#2f2f2f] border-b border-gray-300 dark:border-gray-600/30">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Rank</th>
                <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Player</th>
                <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">XP</th>
                <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Wins</th>
                <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Losses</th>
                <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Draws</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.slice(0, 50).map((player: any, index: number) => (
                <tr
                  key={player._id || index}
                  className="transition-all duration-200 hover:bg-cyan-600/5 dark:hover:bg-cyan-500/5 border-b border-gray-300 dark:border-gray-600/20"
                >
                  <td className="px-4 py-3">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      #{index + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {player.name || "Anonymous"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{player.xp?.toLocaleString() || 0}</td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{player.won || 0}</td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{player.lose || 0}</td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{player.draw || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LeaderboardTab;
