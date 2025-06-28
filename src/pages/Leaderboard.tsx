import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { cn } from "@/lib/utils";

// Define Player interface based on API response structure
interface Player {
  _id: string;
  name: string;
  xp: number;
  won: number;
  draw: number;
  lose: number;
  gameType: string;
  // Derived fields
  rank?: string;
  rankNumber?: number;
  rating?: number;
  isCurrentUser?: boolean;
}

interface LeaderboardCategoryProps {
  title: string;
  icon: React.ReactNode;
  players: Player[];
  currentUserId?: string;
  loading: boolean;
}

const LeaderboardCategory = ({ title, icon, players, currentUserId, loading }: LeaderboardCategoryProps) => {
  if (loading) {
    return (
      <div className="neo-glass-dark rounded-xl p-8 text-center">
        <p className="text-dsb-neutral1">Loading leaderboard data...</p>
      </div>
    );
  }

  if (players.length === 0) {
    return (
      <div className="neo-glass-dark rounded-xl p-8 text-center">
        <p className="text-dsb-neutral1">No players found for this game type.</p>
      </div>
    );
  }

  return (
    <div className="neo-glass-dark rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 p-4 border-b border-white/5">
        <div className="flex items-center justify-center size-8 rounded-full bg-dsb-accent/20">
          {icon}
        </div>
        <h2 className="text-lg font-medium text-white">{title}</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5 bg-black/20">
              <th className="px-6 py-3 text-left text-xs font-medium text-dsb-neutral1 uppercase tracking-wider">Rank</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dsb-neutral1 uppercase tracking-wider">Player</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-dsb-neutral1 uppercase tracking-wider">Rating</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-dsb-neutral1 uppercase tracking-wider">XP</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-dsb-neutral1 uppercase tracking-wider">Won</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-dsb-neutral1 uppercase tracking-wider">Draw</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-dsb-neutral1 uppercase tracking-wider">Lost</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player, index) => (
              <tr
                key={player._id}
                className={cn(
                  "hover:bg-dsb-accent/5 transition-colors",
                  player.isCurrentUser && "bg-dsb-accent/20"
                )}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-white">
                    {index + 1 <= 3 ? (
                      <div className="inline-flex items-center justify-center size-6 rounded-full">
                        {index + 1 === 1 && <span className="text-yellow-500">🥇</span>}
                        {index + 1 === 2 && <span className="text-gray-300">🥈</span>}
                        {index + 1 === 3 && <span className="text-amber-700">🥉</span>}
                      </div>
                    ) : (
                      `#${index + 1}`
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 size-8">
                      <Avatar className="size-8">
                        <AvatarImage src="/lovable-uploads/b53ff161-d205-4b3d-8533-3298f75f82b5.png" />
                        <AvatarFallback>{player.name[0]}</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-white">
                        {player.name}
                        {player.isCurrentUser && (
                          <Badge className="ml-2 bg-dsb-accent/30 text-white border-dsb-accent/50">You</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-dsb-accent font-mono font-medium">
                  {Math.floor(player.xp / 100)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-white">
                  {player.xp}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-green-500">
                  {player.won}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-yellow-500">
                  {player.draw}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-red-400">
                  {player.lose}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-white/5 text-center">
        <span className="text-sm text-dsb-neutral1">
          {players.length} players on leaderboard
        </span>
      </div>
    </div>
  );
};

const PlayerCardStats = ({ currentPlayer, loading }) => {
  if (loading || !currentPlayer) {
    return (
      <div className="neo-glass-dark rounded-xl p-6 text-center">
        <h2 className="text-xl font-medium text-white mb-6">Player</h2>
        <div className="flex flex-col items-center">
          <div className="size-32 bg-gray-700/30 rounded-full flex items-center justify-center mb-4">
            <Avatar className="size-32">
              <AvatarFallback>?</AvatarFallback>
            </Avatar>
          </div>
          <h3 className="text-3xl font-bold text-white">-</h3>
          <p className="text-dsb-neutral1 text-sm mt-6">XP: -</p>
        </div>
      </div>
    );
  }

  return (
    <div className="neo-glass-dark rounded-xl p-6 text-center">
      <h2 className="text-xl font-medium text-white mb-6">Player</h2>

      <div className="flex flex-col items-center">
        <div className="size-32 bg-gray-700/30 rounded-full flex items-center justify-center mb-4">
          <Avatar className="size-32">
            <AvatarImage src="/lovable-uploads/b53ff161-d205-4b3d-8533-3298f75f82b5.png" />
            <AvatarFallback>{currentPlayer.name[0]}</AvatarFallback>
          </Avatar>
        </div>

        <h3 className="text-3xl font-bold text-white">{currentPlayer.name}</h3>
        <p className="text-dsb-neutral1 text-sm mt-2">Rating: {Math.floor(currentPlayer.xp / 100)}</p>
        <p className="text-dsb-neutral1 text-sm mt-1">XP: {currentPlayer.xp}</p>
        
        <div className="grid grid-cols-3 gap-4 mt-4 w-full">
          <div className="text-center">
            <p className="text-green-500 font-medium">{currentPlayer.won}</p>
            <p className="text-dsb-neutral1 text-xs">Won</p>
          </div>
          <div className="text-center">
            <p className="text-yellow-500 font-medium">{currentPlayer.draw}</p>
            <p className="text-dsb-neutral1 text-xs">Draw</p>
          </div>
          <div className="text-center">
            <p className="text-red-400 font-medium">{currentPlayer.lose}</p>
            <p className="text-dsb-neutral1 text-xs">Lost</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function LeaderboardPage() {
  const [gameType, setGameType] = useState('bullet-surge');
  const [leaderboardData, setLeaderboardData] = useState<Player[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // In a real app, this would come from authentication
  const currentUserId = '';
  const currentUserName = '';

  // Get filtered players based on game type and search term
  const getFilteredPlayers = (data: Player[], type: string, search: string) => {
    return data
      .filter(player => 
        player.gameType === type && 
        (search === '' || player.name.toLowerCase().includes(search.toLowerCase()))
      )
      .sort((a, b) => b.xp - a.xp); // Sort by XP descending
  };

  // Get current player if they exist in the data
  const getCurrentPlayer = (data: Player[], type: string) => {
    if (!currentUserName) return null;
    return data.find(player => 
      player.gameType === type && 
      player.name === currentUserName
    );
  };

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch leaderboard data from API
        const response = await fetch(`https://server.datasenseai.com/battleground-leaderboard/${gameType}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Process the data
        const processedData = data.map((player: Player) => ({
          ...player,
          isCurrentUser: player.name === currentUserName
        }));
        
        setLeaderboardData(processedData);
      } catch (err) {
        console.error('Error fetching leaderboard data:', err);
        setError('Failed to load leaderboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboardData();
  }, [gameType, currentUserName]);

  const filteredPlayers = getFilteredPlayers(leaderboardData, gameType, searchTerm);
  const currentPlayer = getCurrentPlayer(leaderboardData, gameType);

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
          <h1 className="text-2xl font-medium text-white glow-text">Leaderboard</h1>

          <div className="relative w-full md:w-auto">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-dsb-neutral1" />
            </div>
            <input
              type="text"
              className="neo-glass p-2 pl-10 pr-4 rounded-lg text-sm text-white bg-black/20 border border-white/10 focus:border-dsb-accent/50 outline-none w-full md:w-64"
              placeholder="Search players..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-white p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Tabs value={gameType} onValueChange={setGameType} className="w-full">
              <TabsList className="neo-glass-dark w-full justify-start mb-6">
                <TabsTrigger
                  value="bullet-surge"
                  className="data-[state=active]:bg-dsb-accent/20 data-[state=active]:text-white flex items-center gap-2"
                >
                  <img src="/png/Bullet Surge.png" alt="Bullet Surge" className="h-5 w-5" /> Bullet Surge
                </TabsTrigger>
                <TabsTrigger
                  value="rapid-sprint"
                  className="data-[state=active]:bg-dsb-accent/20 data-[state=active]:text-white flex items-center gap-2"
                >
                  <img src="/png/Rapid Sprint.png" alt="Rapid Sprint" className="h-5 w-5" /> Rapid Sprint
                </TabsTrigger>
              </TabsList>

              <TabsContent value="bullet-surge" className="mt-0">
                <LeaderboardCategory
                  title="Bullet Surge"
                  icon={<img src="/png/Bullet Surge.png" alt="Bullet Surge" className="h-5 w-5" />}
                  players={filteredPlayers}
                  currentUserId={currentUserId}
                  loading={loading}
                />
              </TabsContent>

              <TabsContent value="rapid-sprint" className="mt-0">
                <LeaderboardCategory
                  title="Rapid Sprint"
                  icon={<img src="/png/Rapid Sprint.png" alt="Rapid Sprint" className="h-5 w-5" />}
                  players={filteredPlayers}
                  currentUserId={currentUserId}
                  loading={loading}
                />
              </TabsContent>
            </Tabs>
          </div>

          <div>
            <PlayerCardStats currentPlayer={currentPlayer} loading={loading} />

            <div className="neo-glass-dark rounded-xl mt-6 p-6">
              <h3 className="text-lg font-medium text-white mb-4">Leaderboard Info</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-dsb-neutral1 mb-1">Ranking System</p>
                  <p className="text-white">Based on XP points and match performance</p>
                </div>
                <div>
                  <p className="text-dsb-neutral1 mb-1">Rating Calculation</p>
                  <p className="text-white">Rating = XP ÷ 100</p>
                </div>
                <div>
                  <p className="text-dsb-neutral1 mb-1">Updates</p>
                  <p className="text-white">Leaderboard is updated in real-time</p>
                </div>
                <div>
                  <p className="text-dsb-neutral1 mb-1">Reset Schedule</p>
                  <p className="text-white">Monthly reset on the 1st</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}