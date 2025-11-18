import { useState, useEffect } from "react";
import { Share2, Lock, Info } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/clerk-react";

// Badge type definitions
interface Badge {
  name: string;
  achieved: boolean;
  progress: number | null;
  description: string;
}

interface CategoryBadges {
  category: string;
  badges: Badge[];
  achievedBadges: number;
  totalBadges: number;
  overallProgress: number;
}

interface BadgesResponse {
  success: boolean;
  clerkId: string;
  badges: CategoryBadges[];
}

const BadgesPage = () => {
  const [badgeType, setBadgeType] = useState<"badges" | "certificates">("badges");
  const [badgesData, setBadgesData] = useState<BadgesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get the clerk ID from Clerk's useUser hook
  const { user } = useUser();
  const clerkId = user?.id;

  useEffect(() => {
    if (!clerkId) return; // Wait for clerkId to be available

    let isCancelled = false;
    let retryTimeout: NodeJS.Timeout | null = null;

    const fetchBadges = async (retryCount = 0) => {
      // Prevent multiple simultaneous requests
      if (isCancelled) return;

      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`https://server.datasenseai.com/badges/${clerkId}`);

        if (isCancelled) return;

        if (response.status === 404) {
          // Fallback: show empty badges with 0 progress
          setBadgesData({
            success: true,
            clerkId,
            badges: [
              {
                category: "General",
                badges: [
                  {
                    name: "No Badges Yet",
                    achieved: false,
                    progress: 0,
                    description: "Start learning to earn your first badge!",
                  },
                ],
                achievedBadges: 0,
                totalBadges: 1,
                overallProgress: 0,
              },
            ],
          });
          setError(null);
          return;
        }

        // Handle 429 (Rate Limit) with retry logic
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          // Use Retry-After header if available, otherwise exponential backoff
          const waitTime = retryAfter 
            ? parseInt(retryAfter) * 1000 
            : Math.min(1000 * Math.pow(2, retryCount), 10000); // Max 10 seconds
          
          // Only retry up to 3 times
          if (retryCount < 3) {
            console.log(`Rate limited. Retrying after ${waitTime}ms (attempt ${retryCount + 1}/3)`);
            
            retryTimeout = setTimeout(() => {
              if (!isCancelled) {
                fetchBadges(retryCount + 1);
              }
            }, waitTime);
            
            // Show user-friendly message
            setError(`Too many requests. Retrying in ${Math.ceil(waitTime / 1000)} seconds...`);
            setLoading(true); // Keep loading state while retrying
            return;
          } else {
            // Max retries reached
            setError("Rate limit exceeded. Please wait a moment and refresh the page.");
            setLoading(false);
            return;
          }
        }

        if (!response.ok) {
          throw new Error(`Error fetching badges: ${response.status}`);
        }

        const data = await response.json();
        
        if (isCancelled) return;
        
        setBadgesData(data);
        setError(null);
      } catch (err) {
        if (isCancelled) return;
        
        // Only show error if it's not a rate limit issue (already handled above)
        if (err instanceof Error && !err.message.includes('429')) {
          setError(err.message || "Failed to fetch badges");
        }
        console.error("Error fetching badges:", err);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchBadges();

    // Cleanup function to cancel pending requests
    return () => {
      isCancelled = true;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [clerkId]);

  // Calculate total statistics across all categories
  const totalStats = badgesData?.badges.reduce(
    (acc, category) => {
      acc.totalBadges += category.totalBadges;
      acc.achievedBadges += category.achievedBadges;
      return acc;
    },
    { totalBadges: 0, achievedBadges: 0 }
  );

  // Calculate overall completion percentage
  const completionRate = totalStats
    ? Math.round((totalStats.achievedBadges / totalStats.totalBadges) * 100)
    : 0;

  const renderBadgeIcon = (achieved: boolean, progress: number | null, category: string) => {
    if (!achieved && progress === null) return <Lock className="size-8 text-gray-500" />;

    // Determine badge type based on category (just an example mapping)
    const categoryBadgeType = {
      "SQL Lord": "gold",
      "Query Explorer": "gold",
      "CTE Master": "silver",
      "Window Wizard": "silver",
      "Join Ninja": "gold",
      "Subquery Slayer": "gold",
      "Case Solver": "silver",
      "Filter Freak": "silver",
      "Aggregation Guru": "gold",
    }[category] || "gold";

    // Generate image path based on badge name (simplified version)
    const badgeIndex = badgesData?.badges.findIndex(cat => cat.category === category) || 0;
    const imagePath = `/badge final png/${badgeIndex + 1}.png`;

    if (!achieved) {
      return (
        <div className={cn("size-10 rounded-full overflow-hidden flex items-center justify-center", "opacity-50 grayscale")}>
          <img src={imagePath} alt="Badge" className="w-full h-full object-contain" />
        </div>
      );
    }

    if (categoryBadgeType === "gold") {
      return (
        <div className="size-10 rounded-full overflow-hidden flex items-center justify-center">
          <img src={imagePath} alt="Badge" className="w-full h-full object-contain" />
        </div>
      );
    }

    if (categoryBadgeType === "silver") {
      return (
        <div className="size-10 rounded-full overflow-hidden flex items-center justify-center">
          <img src={imagePath} alt="Badge" className="w-full h-full object-contain" />
        </div>
      );
    }

    return (
      <div className="size-10 rounded-full overflow-hidden flex items-center justify-center">
        <img src={imagePath} alt="Badge" className="w-full h-full object-contain" />
      </div>
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 md:p-8 flex justify-center items-center h-full">
          <div className="text-white">Loading badges...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6 md:p-8 flex justify-center items-center h-full">
          <div className="text-red-500">Error: {error}</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="neo-glass-dark mt-8 p-6 rounded-xl">
          <h3 className="text-white text-lg font-medium mb-4">Achievements Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-black/30 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {totalStats?.achievedBadges || 0}/{totalStats?.totalBadges || 0}
              </div>
              <div className="text-dsb-neutral1 text-sm">Badges Earned</div>
            </div>

            <div className="bg-black/30 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {badgesData?.badges.filter(cat => cat.achievedBadges > 0).length || 0}/{badgesData?.badges.length || 0}
              </div>
              <div className="text-dsb-neutral1 text-sm">Skill Paths Started</div>
            </div>

            <div className="bg-black/30 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-dsb-accent mb-1">
                {totalStats?.achievedBadges ? totalStats.achievedBadges * 50 : 0}
              </div>
              <div className="text-dsb-neutral1 text-sm">Achievement Points</div>
            </div>

            <div className="bg-black/30 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-500 mb-1">
                {completionRate}%
              </div>
              <div className="text-dsb-neutral1 text-sm">Completion Rate</div>
            </div>
          </div>
        </div>

        <Tabs
          value={badgeType}
          onValueChange={(v) => setBadgeType(v as "badges" | "certificates")}
          className="w-full"
        >
          <TabsList className="neo-glass-dark w-full justify-start mb-6">
            <TabsTrigger
              value="badges"
              className="data-[state=active]:bg-dsb-accent/20 data-[state=active]:text-white"
            >
              Badges
            </TabsTrigger>
            <TabsTrigger
              value="certificates"
              className="data-[state=active]:bg-dsb-accent/20 data-[state=active]:text-white"
            >
              Certificates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="badges" className="mt-0">
            {badgesData?.badges.map((category, index) => (
              <div key={category.category} className="mb-8">
                <h2 className="text-xl font-medium text-white mb-4">{category.category}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.badges.map((badge, badgeIndex) => (
                    <div
                      key={`${category.category}-${badge.name}`}
                      className={cn(
                        "neo-glass-dark p-4 rounded-xl transition-all duration-300 relative group overflow-hidden",
                        !badge.achieved ? "opacity-60" : "hover:shadow-glow-subtle"
                      )}
                    >
                      {/* Background effects */}
                      <div className="absolute inset-0 z-0">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-black/30 rounded-full blur-3xl"></div>
                      </div>

                      <div className="flex justify-between items-start mb-3 relative z-10">
                        {renderBadgeIcon(badge.achieved, badge.progress, category.category)}

                        <button className="text-dsb-neutral2 hover:text-dsb-neutral1 transition-all">
                          <Share2 className="size-4" />
                        </button>
                      </div>

                      <div className="relative z-10">
                        <h3 className="text-white text-lg font-medium mb-1">{badge.name}</h3>
                        <p className="text-dsb-neutral1 text-sm mb-3">{badge.description}</p>

                        <div className="space-y-2">
                          <div className="h-1.5 bg-dsb-neutral3/50 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                badge.achieved ? "bg-green-500/90" : "bg-dsb-accent/80"
                              )}
                              style={{
                                width: `${badge.progress !== null ? badge.progress : 0}%`
                              }}
                            ></div>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-dsb-neutral1">Progress</span>
                            <span className={!badge.achieved ? "text-dsb-neutral2" : "text-white"}>
                              {badge.progress !== null ? badge.progress : 0}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="certificates" className="mt-0">
            <div className="neo-glass-dark p-8 rounded-xl flex flex-col items-center justify-center text-center">
              <Info className="size-12 text-dsb-neutral1 mb-4" />
              <h3 className="text-white text-lg font-medium mb-2">No Certificates Yet</h3>
              <p className="text-dsb-neutral1 max-w-md mb-6">
                Complete challenges and earn badges to unlock certificates that showcase your SQL mastery.
              </p>
              <Button className="bg-dsb-accent/60 hover:bg-dsb-accent/90 text-white">
                Start Learning
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default BadgesPage;