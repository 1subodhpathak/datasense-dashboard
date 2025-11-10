import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Progress } from "@/components/ui/progress";
import MilestonePanel from "@/components/journey/MilestonePanel";
import { milestones } from "@/data/sql-journey";
import SqlJourneyRoadmap from "@/components/journey/SqlJourneyRoadmap";
import JourneyStats from "@/components/journey/JourneyStats";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUser } from "@clerk/clerk-react";
import { useFetchBadges } from "@/hooks/useFetchBadges";
import ThreeBackground from "@/components/ThreeBackground";

// Starfield background component
const Starfield = () => {
  // Generate 80 random stars
  const stars = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    r: Math.random() * 1.2 + 0.4,
    twinkle: Math.random() * 2 + 1,
  }));
  
  return (
    <svg className="fixed inset-0 w-full h-full pointer-events-none z-0" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}>
      {stars.map(star => (
        <circle
          key={star.id}
          cx={star.x + '%'}
          cy={star.y + '%'}
          r={star.r}
          fill="#fff"
          opacity={0.7}
        >
          <animate
            attributeName="opacity"
            values="0.3;1;0.3"
            dur={`${star.twinkle}s`}
            repeatCount="indefinite"
            begin={`${star.id * 0.13}s`}
          />
        </circle>
      ))}
    </svg>
  );
};

// SVG grid background
const GridBackground = () => (
  <svg className="fixed inset-0 w-full h-full pointer-events-none z-0" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}>
    <defs>
      <pattern id="cyberGrid" width="60" height="60" patternUnits="userSpaceOnUse">
        <rect x="0" y="0" width="60" height="60" fill="none" />
        <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#3be6ff" strokeWidth="0.5" opacity="0.08" />
        <path d="M 60 60 L 60 0 0 0" fill="none" stroke="#3be6ff" strokeWidth="0.5" opacity="0.08" />
      </pattern>
    </defs>
    <rect x="0" y="0" width="100%" height="100%" fill="url(#cyberGrid)" />
  </svg>
);

// Define types for milestone and badge data
type Milestone = {
  id: number | string;
  // add other properties as needed
};

type Badge = {
  description?: string;
  achieved?: boolean;
  progress?: number;
  // add other properties as needed
};

type BadgeCategory = {
  badges: Badge[];
  // add other properties as needed
};

type BadgesData = {
  badges: BadgeCategory[];
  // add other properties as needed
};

type Stats = {
  overallProgress: number;
  totalAchievedBadges: number;
  totalBadges: number;
  // add other properties as needed
};

const SqlJourney = () => {
  const [selectedMilestone, setSelectedMilestone] = useState<number | string | null>(null);
  const isMobile = useIsMobile();

  // Get user data from Clerk
  const { user } = useUser();
  const [clerkId, setClerkId] = useState<string | null>(null);

  // Set clerkId when user is loaded
  useEffect(() => {
    if (user?.id) {
      setClerkId(user.id);
    }
  }, [user]);

  // Fetch badges data using our custom hook
  const { badgesData, isLoading, error, stats }: {
    badgesData: BadgesData | null,
    isLoading: boolean,
    error: any,
    stats: Stats
  } = useFetchBadges(clerkId);

  // Calculate streak from badges data
  const getCurrentStreak = (): number => {
    if (!badgesData || !badgesData.badges) return 0;

    // Find the highest achieved streak or progress towards a streak
    let highestStreak = 0;

    badgesData.badges.forEach((category: BadgeCategory) => {
      category.badges.forEach((badge: Badge) => {
        if (badge.description && badge.description.includes("SQL problem daily for")) {
          if (badge.achieved) {
            // Extract streak days from description (e.g., "for 5 days" -> 5)
            const match = badge.description.match(/for (\d+) days/);
            if (match && match[1]) {
              const streakDays = parseInt(match[1]);
              highestStreak = Math.max(highestStreak, streakDays);
            }
          } else if (badge.progress && badge.progress > 0) {
            // If a streak badge is in progress, calculate the current streak days
            const match = badge.description.match(/for (\d+) days/);
            if (match && match[1]) {
              const targetDays = parseInt(match[1]);
              const currentStreak = Math.round((badge.progress / 100) * targetDays);
              highestStreak = Math.max(highestStreak, currentStreak);
            }
          }
        }
      });
    });

    return highestStreak;
  };

  const handleMilestoneClick = (id: number | string) => {
    setSelectedMilestone(selectedMilestone === id ? null : id);
  };

  // Get overall progress from the badges data or use default
  const overallProgress = stats?.overallProgress || 0;
  const completedMilestones = isLoading ? 0 : Math.floor((stats?.totalAchievedBadges / 3) || 0); // Assume 3 badges per milestone
  const currentStreak = getCurrentStreak();

  return (
    <DashboardLayout>
      {/* Cyber grid, blue glow, and stars background */}
      <div className="fixed inset-0 w-full h-full z-0">
        {/* Soft blue radial glow */}
        <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[900px] rounded-full pointer-events-none z-0"
          style={{
            background: "radial-gradient(ellipse at center, rgba(59,230,255,0.13) 0%, rgba(0,0,0,0.0) 80%)",
            filter: "blur(2px)",
          }}
        />
        {/* <GridBackground /> */}
        {/* <ThreeBackground /> */}
        {/* <Starfield /> */}
      </div>

      <div className="p-4 md:p-8 min-h-screen relative z-10 pb-40" style={{ background: "transparent" }}>
        {/* Page header with futuristic style */}
        <div className="flex flex-col gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-xl md:text-3xl font-bold text-white glow-text-subtle">
              SQL Learning Journey
            </h1>
            <div className="hidden md:flex items-center gap-2">
              <div className={`size-2 rounded-full ${isLoading ? 'bg-dsb-neutral3' : 'bg-dsb-accent animate-pulse'}`}></div>
              <span className="text-dsb-neutral1 text-sm">
                {isLoading ? 'Loading progress...' : 'Live Progress Tracking'}
              </span>
            </div>
          </div>

          {/* Progress bar section */}
          <div className="neo-glass-dark p-3 md:p-6 rounded-lg border border-dsb-accent/10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white font-medium">Overall Journey Progress</span>
              <span className="text-dsb-accent font-bold">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-2 md:h-3 bg-dsb-neutral3/50">
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle,rgba(0,226,202,0.8)_0%,transparent_70%)]"></div>
              </div>
            </Progress>
          </div>
        </div>

        {/* Only render the SqlJourneyRoadmap view */}
        <div className="relative min-h-[1600px] sm:min-h-[1800px] md:min-h-[2400px] lg:min-h-[3000px] neo-glass-dark rounded-xl border border-dsb-accent/20 overflow-hidden">
          <SqlJourneyRoadmap onMilestoneClick={handleMilestoneClick} />
        </div>

        {/* Selected milestone panel */}
        {selectedMilestone && (
          <MilestonePanel
            milestone={milestones.find(m => m.id === selectedMilestone)}
            onClose={() => setSelectedMilestone(null)}
            allMilestones={milestones}
          />
        )}

        {/* Journey Stats with enhanced styling */}
        <div className="mt-6 md:mt-8">
          <JourneyStats
            completedMilestones={completedMilestones}
            totalMilestones={9}
            earnedBadges={stats.totalAchievedBadges}
            totalBadges={stats.totalBadges}
            currentStreak={currentStreak}
          />
        </div>

        {/* Additional motivation section */}
        <div className="mt-6 md:mt-8 neo-glass-dark rounded-lg p-4 md:p-6 border border-dsb-accent/10">
          <h3 className="text-dsb-accent font-bold mb-2">Keep Going!</h3>
          <p className="text-dsb-neutral1">
            Continue your journey to become a SQL Lord. Complete milestones to unlock new badges and challenges.
          </p>
          {error && (
            <p className="text-red-400 text-sm mt-2">
              Note: We couldn't load your latest badge data. Your progress will update next time you visit.
            </p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SqlJourney;