import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardTabs from "@/components/dashboard/DashboardTabs";
import OverviewTab from "@/components/dashboard/tabs/OverviewTab";
import BadgesTab from "@/components/dashboard/tabs/BadgesTab";
import ChallengesTab from "@/components/dashboard/tabs/ChallengesTab";
import LeaderboardTab from "@/components/dashboard/tabs/LeaderboardTab";
import { toast } from "sonner";
import { useUser } from "@clerk/clerk-react"; // <-- Import Clerk
import { Link } from "react-router-dom";

interface BadgeType {
  id: number;
  name: string;
  description: string;
  progress: number;
  status: "locked" | "in-progress" | "complete";
  type: "gold" | "silver" | "bronze";
  imagePath?: string;
}

const BADGE_IMAGE_FILES = [
  '2.png', '3.png', '4.png', '6.png', '7.png', '8.png', '10.png', '11.png', '12.png',
  '14.png', '15.png', '16.png', '18.png', '19.png', '20.png', '22.png', '23.png', '24.png',
  '26.png', '27.png', '28.png', '30.png', '31.png', '32.png', '34.png', '35.png', '36.png',
  '37.png', '38.png', '39.png', '40.png', '41.png', '42.png',
];

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState("overview"); // Default to overview
  const [selectedDate, setSelectedDate] = useState("Mon, Aug 17");
  const [currentMonth, setCurrentMonth] = useState("August 2025");
  const [badgeType, setBadgeType] = useState<"badges" | "certificates">("badges");
  const navigate = useNavigate();

  // Clerk user and clerkId state
  const { user } = useUser();
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
  const [handleClick, setHandleClick] = useState(false);
  
  const handleButtonClick = () => {
    setHandleClick(!handleClick);
  }

  // Set clerkId when user is loaded
  useEffect(() => {
    if (user?.id) {
      setClerkId(user.id);
    }
  }, [user]);

  // Fetch leaderboard user data when clerkId is set
  useEffect(() => {
    if (!clerkId) return;
    
    const fetchUserLeaderboardData = async () => {
      try {
        const res = await fetch(`https://server.datasenseai.com/battleground-leaderboard/user-data/${clerkId}`);
        
        if (!res.ok) {
          // Handle 404 or other errors - set everything to 0
          console.log("API returned error, setting stats to 0");
          setUserStats({
            totalXP: 0,
            totalWins: 0,
            totalDraws: 0,
            totalLosses: 0,
            totalGames: 0,
          });
          setUserLeaderboardData([]);
          return;
        }
        
        const data = await res.json();
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
        
      } catch (err) {
        console.error("Error fetching user leaderboard data:", err);
        // Set stats to 0 on error
        setUserStats({
          totalXP: 0,
          totalWins: 0,
          totalDraws: 0,
          totalLosses: 0,
          totalGames: 0,
        });
        setUserLeaderboardData([]);
      }
    };
    
    fetchUserLeaderboardData();
  }, [clerkId]);

  // Debug logging
  useEffect(() => {
    // console.log("Dashboard component mounted");
    // console.log("Initial active tab:", activeTab);
  }, []);

  // Ensure we update the tab if URL parameters change
  useEffect(() => {
    const newTab = tabFromUrl || "overview";
    console.log("Setting active tab from URL:", newTab);
    setActiveTab(newTab);
  }, [tabFromUrl]);

  // Debug log to verify active tab
  useEffect(() => {
    console.log("Current active tab:", activeTab);
  }, [activeTab]);

  // Create stats array using the calculated userStats
  const stats = [
    {
      title: "Rank",
      value: "#78", // You might want to calculate this from leaderboard position
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
      value: userStats.totalXP.toString(),
      icon: "🔥"
    }
  ];

  // Debug logging for data
  useEffect(() => {
    console.log("Stats data:", stats);
    console.log("User stats:", userStats);
    console.log("Leaderboard data:", leaderboardHighlights);
  }, [userStats]);

  const leaderboardHighlights = [
    {
      rank: 1,
      name: "Isaac Roberts",
      points: 93267,
      avatar: "https://i.pravatar.cc/150?u=1"
    },
    {
      rank: 2,
      name: "Olivia King",
      points: 88267,
      avatar: "https://i.pravatar.cc/150?u=2"
    },
    {
      rank: 3,
      name: "Ava Garcia",
      points: 82267,
      avatar: "https://i.pravatar.cc/150?u=3"
    },
    {
      rank: 45,
      name: "You",
      points: userStats.totalXP, // Use actual XP from API
      avatar: "/lovable-uploads/69d28d83-f8e5-4020-9669-03543f7a31ff.png"
    },
    {
      rank: 78,
      name: "Last item",
      points: 42135,
      avatar: "https://i.pravatar.cc/150?u=5"
    }
  ];

  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const currentDay = 17;
  const maxDays = 31;

  const activeChallenges = [
    {
      id: 1,
      title: "SQL Filter Challenge",
      progress: 75,
      dueDate: "Today"
    },
    {
      id: 2,
      title: "Query Performance",
      progress: 40,
      dueDate: "Tomorrow"
    },
    {
      id: 3,
      title: "Advanced Joins",
      progress: 20,
      dueDate: "3 days left"
    }
  ];

  const badges: BadgeType[] = [
    // Query Explorer
    {
      id: 1,
      name: "SQL Freshman",
      description: "Solve 10 SQL queries",
      progress: 40,
      status: "in-progress",
      type: "gold",
      imagePath: `/badge final png/${BADGE_IMAGE_FILES[0]}`
    },
    {
      id: 2,
      name: "Battle Beginner",
      description: "Win 2 SQL battles",
      progress: 33,
      status: "in-progress",
      type: "gold",
      imagePath: `/badge final png/${BADGE_IMAGE_FILES[1]}`
    },
    {
      id: 3,
      name: "SQL Streak (5 Days)",
      description: "Maintain a 5-day streak",
      progress: 60,
      status: "in-progress",
      type: "gold",
      imagePath: `/badge final png/${BADGE_IMAGE_FILES[2]}`
    },
    // Filter Freak
    {
      id: 4,
      name: "The Pro Finder",
      description: "Solve 10 filtering problems",
      progress: 0,
      status: "locked",
      type: "silver",
      imagePath: `/badge final png/${BADGE_IMAGE_FILES[3]}`
    },
    {
      id: 5,
      name: "Battle Challenger",
      description: "Win 5 SQL battles",
      progress: 20,
      status: "in-progress",
      type: "silver",
      imagePath: `/badge final png/${BADGE_IMAGE_FILES[4]}`
    },
    {
      id: 6,
      name: "Fast Hands",
      description: "Score >50% in a Live SQL test",
      progress: 0,
      status: "locked",
      type: "silver",
      imagePath: `/badge final png/${BADGE_IMAGE_FILES[5]}`
    }
  ];

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
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Battleground</h1>
          <p className="text-slate-600 dark:text-slate-300">
            Review matches, track performance, and jump back into the arena.
          </p>
        </div>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <DashboardTabs activeTab={activeTab} setActiveTab={setActiveTab} />
            <Link to="https://battleground.datasenseai.com/start">
              <button
                onClick={handleButtonClick}
                className="rounded-full bg-[#008B8B] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#007a7a]"
              >
                Game
              </button>
            </Link>
          </div>

          {/* Render the active tab */}
          <div className="mt-4 w-full">
            {activeTab === "overview" && (
              <OverviewTab
                stats={stats}
                leaderboardHighlights={leaderboardHighlights}
                activeChallenges={activeChallenges}
                badges={badges}
                selectedDate={selectedDate}
                currentMonth={currentMonth}
                days={days}
                currentDay={currentDay}
                maxDays={maxDays}
              />
            )}

            {activeTab === "badges" && (
              <BadgesTab badges={badges} badgeType={badgeType} setBadgeType={setBadgeType} />
            )}

            {activeTab === "challenges" && <ChallengesTab />}

            {activeTab === "leaderboard" && <LeaderboardTab />}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;