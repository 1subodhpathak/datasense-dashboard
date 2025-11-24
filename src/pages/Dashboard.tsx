import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import OverviewTab from "@/components/dashboard/tabs/OverviewTab";
import { useUser } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

interface BadgeType {
  id: string;
  name: string;
  description: string;
  progress: number;
  status: "locked" | "in-progress" | "complete";
  type: "gold" | "silver" | "bronze";
  imagePath?: string;
}

const Dashboard = () => {

  // Clerk user and clerkId state
  const { user, isLoaded } = useUser();
  const [clerkId, setClerkId] = useState<string | null>(null);

  // Battleground leaderboard user data state
  const [userLeaderboardData, setUserLeaderboardData] = useState<any[]>([]);
  const [userStats, setUserStats] = useState({
    totalXP: 0,
    totalWins: 0,
    totalDraws: 0,
    totalLosses: 0,
    totalGames: 0,
  });
  const [userRank, setUserRank] = useState<number | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Set clerkId when user is loaded
  useEffect(() => {
    if (user?.id) {
      setClerkId(user.id);
    }
  }, [user]);

  // Fetch all battleground data when clerkId is set
  useEffect(() => {
    if (!clerkId || !isLoaded) return;
    
    const fetchBattlegroundData = async () => {
      setLoading(true);
      try {
        // Fetch all data in parallel
        const userDataPromise = fetch(`https://server.datasenseai.com/battleground-leaderboard/user-data/${clerkId}`);
        const overallLeaderboardPromise = fetch(`https://server.datasenseai.com/battleground-leaderboard/overall?limit=100`);
        const badgesPromise = fetch(`https://server.datasenseai.com/badges/${clerkId}`);

        const [userDataResponse, overallLeaderboardResponse, badgesResponse] = await Promise.allSettled([
          userDataPromise,
          overallLeaderboardPromise,
          badgesPromise,
        ]);

        // Process user leaderboard data
        if (userDataResponse.status === "fulfilled" && userDataResponse.value.ok) {
          const data = await userDataResponse.value.json();
          setUserLeaderboardData(data);

          // Calculate stats from data
          let totalXP = 0, totalWins = 0, totalDraws = 0, totalLosses = 0, totalGames = 0;
          data.forEach((entry: any) => {
            totalXP += entry.xp || 0;
            totalWins += entry.won || 0;
            totalDraws += entry.draw || 0;
            totalLosses += entry.lose || 0;
            totalGames += (entry.won || 0) + (entry.draw || 0) + (entry.lose || 0);
          });
          
          setUserStats({ totalXP, totalWins, totalDraws, totalLosses, totalGames });
        } else {
          // Handle 404 or other errors - set everything to 0
          setUserStats({
            totalXP: 0,
            totalWins: 0,
            totalDraws: 0,
            totalLosses: 0,
            totalGames: 0,
          });
          setUserLeaderboardData([]);
        }

        // Process overall leaderboard to calculate rank
        if (overallLeaderboardResponse.status === "fulfilled" && overallLeaderboardResponse.value.ok) {
          const leaderboardData = await overallLeaderboardResponse.value.json();
          setLeaderboardData(leaderboardData);
          
          // Calculate user's rank by comparing total XP
          // Note: leaderboard doesn't include clerkId, so we compare by XP
          if (userStats.totalXP > 0) {
            const rank = leaderboardData.findIndex((entry: any) => entry.xp < userStats.totalXP);
            if (rank !== -1) {
              setUserRank(rank + 1); // Rank is 1-based
            } else if (userStats.totalXP > 0) {
              // User's XP is higher than all shown entries, rank is beyond the limit
              setUserRank(leaderboardData.length + 1);
            } else {
              setUserRank(null);
            }
          } else {
            setUserRank(null);
          }
        }

        // Process badges data
        if (badgesResponse.status === "fulfilled" && badgesResponse.value.ok) {
          const badgesData = await badgesResponse.value.json();
          if (badgesData.success && badgesData.badges) {
            // Flatten badges from all categories
            const allBadges = badgesData.badges.flatMap((category: any) =>
              category.badges.map((badge: any) => ({
                id: `${category.category}-${badge.name}`,
                name: badge.name,
                description: badge.description,
                progress: badge.progress || 0,
                status: badge.achieved ? "complete" : (badge.progress > 0 ? "in-progress" : "locked"),
                type: category.category.includes("Lord") || category.category.includes("Guru") ? "gold" : 
                      category.category.includes("Master") || category.category.includes("Wizard") ? "silver" : "bronze",
                imagePath: undefined, // Badge images would need to be mapped
              }))
            );
            setBadges(allBadges);
          }
        } else if (badgesResponse.status === "fulfilled" && badgesResponse.value.status === 404) {
          // No badges yet - set empty array
          setBadges([]);
        }
        
      } catch (err) {
        console.error("Error fetching battleground data:", err);
        setUserStats({
          totalXP: 0,
          totalWins: 0,
          totalDraws: 0,
          totalLosses: 0,
          totalGames: 0,
        });
        setUserLeaderboardData([]);
        setBadges([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBattlegroundData();
  }, [clerkId, isLoaded]);


  // Create stats array using the calculated userStats
  const stats = [
    {
      title: "Rank",
      value: userRank ? `#${userRank}` : "N/A",
      icon: null
    },
    {
      title: "Wins",
      value: userStats.totalWins.toString(),
      icon: null
    },
    {
      title: "Losses",
      value: userStats.totalLosses.toString(),
      icon: null
    },
    {
      title: "Total Matches",
      value: userStats.totalGames.toString(),
      icon: null
    },
    {
      title: "Total XP",
      value: userStats.totalXP.toLocaleString(),
      icon: "🔥"
    }
  ];

  // Get top 3 from leaderboard and user's position
  const leaderboardHighlights = useMemo(() => {
    if (!leaderboardData.length) return [];
    
    const top3 = leaderboardData.slice(0, 3).map((player: any, index: number) => ({
      rank: index + 1,
      name: player.name || "Anonymous",
      points: player.xp || 0,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.name || index}`
    }));

    // Add user's position if they're not in top 3
    // Since leaderboard doesn't include clerkId, we check if user's XP would place them outside top 3
    if (userStats.totalXP > 0 && userRank && userRank > 3) {
      top3.push({
        rank: userRank,
        name: user?.username || user?.firstName || "You",
        points: userStats.totalXP,
        avatar: user?.imageUrl || "/lovable-uploads/69d28d83-f8e5-4020-9669-03543f7a31ff.png"
      });
    } else if (userStats.totalXP > 0 && !userRank) {
      // User has stats but rank couldn't be determined
      top3.push({
        rank: 0,
        name: user?.username || user?.firstName || "You",
        points: userStats.totalXP,
        avatar: user?.imageUrl || "/lovable-uploads/69d28d83-f8e5-4020-9669-03543f7a31ff.png"
      });
    }

    return top3;
  }, [leaderboardData, userStats.totalXP, userRank, user]);

  // Show a notification toast for debugging purposes when component mounts
  // useEffect(() => {
  //   toast.info("Dashboard loaded", {
  //     description: `Active tab: ${activeTab}`,
  //     duration: 3000
  //   });
  // }, []);

  return (
    <DashboardLayout>
      <div className="relative z-10 space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Battleground</h1>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
              Review matches, track performance, and jump back into the arena.
            </p>
          </div>
          <Link to="https://battleground.datasenseai.com/start" className="flex-shrink-0">
            <button
              className="rounded-lg bg-cyan-600 px-5 py-2 text-sm font-semibold text-white/95 transition hover:bg-cyan-700"
            >
              Game
            </button>
          </Link>
        </div>

        <OverviewTab
          stats={stats}
          leaderboardHighlights={leaderboardHighlights}
          activeChallenges={[]}
          badges={badges}
          selectedDate={new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          currentMonth={new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          days={['S', 'M', 'T', 'W', 'T', 'F', 'S']}
          currentDay={new Date().getDate()}
          maxDays={new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()}
        />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;