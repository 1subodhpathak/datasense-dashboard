import React, { useState, useEffect } from "react";
import { DashboardOverview } from "./overview";
import { Progress } from "@/components/ui/progress";
import { Database, Code, ArrowRight, BookOpen } from "lucide-react";
import PlayerStats from "@/components/PlayerStats";
import { useUser } from "@clerk/clerk-react";

interface OverviewTabProps {
  stats: Array<{ title: string; value: string; icon: string | null }>;
  leaderboardHighlights: Array<{
    rank: number;
    name: string;
    points: number;
    avatar: string
  }>;
  activeChallenges: Array<{
    id: number;
    title: string;
    progress: number;
    dueDate: string
  }>;
  badges: Array<{
    id: number;
    name: string;
    description: string;
    progress: number;
    status: "locked" | "in-progress" | "complete";
    type: "gold" | "silver" | "bronze";
    imagePath?: string;
  }>;
  selectedDate: string;
  currentMonth: string;
  days: string[];
  currentDay: number;
  maxDays: number;
}

interface ApiResponse {
  success: boolean;
  data: {
    statistics: {
      total: {
        questions: number;
        solved: number;
        completion: string;
      };
      sql: {
        total: number;
        solved: number;
        completion: string;
      };
      python: {
        total: number;
        solved: number;
        completion: string;
      };
      byDifficulty: {
        easy: { total: number; solved: number };
        medium: { total: number; solved: number };
        hard: { total: number; solved: number };
      };
      topics: {
        sql: string[];
        python: string[];
        solvedTopics: string[];
      };
      recentActivity: Array<{
        title: string;
        subject: string;
        solvedAt: string;
      }>;
    };
    user: {
      clerkId: string;
      totalSolved: number;
    };
  };
}

const OverviewTab: React.FC<OverviewTabProps> = (props) => {
  const { user, isLoaded } = useUser();
  const [clerkId, setClerkId] = useState<string>("");
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  // Set Clerk user ID when user is loaded
  useEffect(() => {
    if (isLoaded && user?.id) {
      setClerkId(user.id);
    }
  }, [isLoaded, user]);

  // Fetch data from API when clerkId is available
  useEffect(() => {
    const fetchUserProgress = async () => {
      if (!clerkId) return;
      
      setLoading(true);
      setError("");
      
      try {
        const response = await fetch(`https://server.datasenseai.com/battleground-user-progress-dashboard/${clerkId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: ApiResponse = await response.json();
        setApiData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user progress');
        console.error('Error fetching user progress:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProgress();
  }, [clerkId]);

  // Parse API data into component format
  const parseApiData = () => {
    if (!apiData?.success || !apiData.data) return null;

    const { statistics } = apiData.data;
    
    // Create learning paths from API data
    const learningPaths = [
      {
        name: "SQL",
        icon: <Database className="size-6 text-blue-400" />,
        solved: statistics.sql.solved,
        total: statistics.sql.total,
        percentComplete: parseFloat(statistics.sql.completion),
        topics: groupSqlTopics(statistics.topics.sql, statistics.topics.solvedTopics)
      },
      {
        name: "Python",
        icon: <Code className="size-6 text-violet-400" />,
        solved: statistics.python.solved,
        total: statistics.python.total,
        percentComplete: parseFloat(statistics.python.completion),
        topics: []
      }
    ];

    // Format recent activity
    const recentActivity = statistics.recentActivity.map(activity => ({
      title: activity.title,
      icon: activity.subject === 'sql' ? 
        <div className="size-8 rounded-md bg-blue-500/20 flex items-center justify-center">
          <Database className="size-4 text-blue-400" />
        </div> :
        <div className="size-8 rounded-md bg-violet-500/20 flex items-center justify-center">
          <Code className="size-4 text-violet-400" />
        </div>,
      date: new Date(activity.solvedAt).toLocaleString()
    }));

    return { learningPaths, recentActivity, statistics };
  };

  // Group SQL topics into categories
  const groupSqlTopics = (allTopics: string[], solvedTopics: string[]) => {
    const basicTopics = ["Column Selection", "SELECT", "WHERE", "Filtering"];
    const joinTopics = ["Joins", "Inner Join", "Left Join", "Self-Join"];
    const aggregationTopics = ["Aggregation", "GROUP BY", "SUM", "COUNT", "AVG", "MIN", "MAX"];
    const advancedTopics = ["Window Functions", "CTE", "Subqueries", "RANK", "PARTITION BY"];

    const createTopicGroup = (name: string, topicList: string[], icon?: React.ReactNode) => {
      const relevantTopics = allTopics.filter(topic => 
        topicList.some(basicTopic => 
          topic.toLowerCase().includes(basicTopic.toLowerCase())
        )
      );
      const solvedCount = relevantTopics.filter(topic => solvedTopics.includes(topic)).length;
      
      return {
        name,
        solved: solvedCount,
        total: Math.max(relevantTopics.length, 4), // Minimum 4 for display purposes
        icon
      };
    };

    return [
      createTopicGroup("Basics", basicTopics, <BookOpen className="size-4 text-amber-400" />),
      createTopicGroup("Joins", joinTopics),
      createTopicGroup("Aggregations", aggregationTopics, <BookOpen className="size-4 text-red-400" />),
      createTopicGroup("Advanced SQL", advancedTopics)
    ];
  };

  const parsedData = parseApiData();
  const learningPaths = parsedData?.learningPaths || [];
  const recentActivity = parsedData?.recentActivity || [];
  const overallCompletion = parsedData?.statistics ? 
    parseFloat(parsedData.statistics.total.completion) : 0;

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-white">Loading user data...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-white">Please sign in to view your progress.</div>
      </div>
    );
  }

  return (
    <>
      <DashboardOverview {...props} />
      
      {/* Learning Section */}
      <div className="mt-0">
        <div className=" mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Learning Progress and Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overall Progress */}
            <div className="neo-glass-dark rounded-xl overflow-hidden mb-6">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-medium text-white">Your Learning Journey</h2>
                  <span className="text-dsb-neutral1 text-sm">
                    Overall: {overallCompletion.toFixed(2)}% Complete
                  </span>
                </div>
                <div className="relative h-2 bg-dsb-neutral3/50 rounded-full overflow-hidden mb-1">
                  <div 
                    className="absolute top-0 left-0 h-full bg-dsb-accent" 
                    style={{ width: `${overallCompletion}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center text-xs text-dsb-neutral1">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="neo-glass-dark rounded-xl p-6 mb-6">
              <h2 className="text-lg font-medium text-white mb-4">Recent Activity</h2>
              {loading ? (
                <div className="text-dsb-neutral1">Loading recent activity...</div>
              ) : error ? (
                <div className="text-white">Not enough data</div>  // <div className="text-red-400">Error loading activity: {error}</div>
               
              ) : recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center gap-3">
                      {activity.icon}
                      <div>
                        <p className="text-white text-sm">{activity.title}</p>
                        <p className="text-dsb-neutral1 text-xs">{activity.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-dsb-neutral1">No recent activity found.</div>
              )}
            </div>

            {/* Learning Paths */}
            <div className="space-y-6">
              {learningPaths.map(path => (
                <div key={path.name} className="neo-glass-dark rounded-xl overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-black/40 flex items-center justify-center">
                          {path.icon}
                        </div>
                        <div>
                          <h2 className="text-lg font-medium text-white">{path.name}</h2>
                          <p className="text-dsb-neutral1 text-xs">
                            {path.solved} solved • {path.percentComplete.toFixed(1)}% complete
                          </p>
                        </div>
                      </div>
                      {path.topics.length > 0 && (
                        <button
                          className="bg-dsb-background border border-dsb-accent/20 text-dsb-neutral1 hover:text-white hover:border-dsb-accent/50 rounded px-3 py-1 text-sm"
                          onClick={() => setSelectedPath(selectedPath === path.name ? null : path.name)}
                        >
                          {selectedPath === path.name ? "Hide" : "Expand"}
                        </button>
                      )}
                    </div>
                    
                    {selectedPath === path.name && path.topics.length > 0 && (
                      <div className="mt-6">
                        {path.topics.map(topic => (
                          <div key={topic.name} className="mb-6">
                            <div className="flex justify-between items-center mb-1.5">
                              <div className="flex items-center gap-2">
                                {topic.icon && <span>{topic.icon}</span>}
                                <span className="text-white text-sm">{topic.name}</span>
                              </div>
                              <span className="text-dsb-neutral1 text-xs">
                                {topic.solved}/{topic.total} solved
                              </span>
                            </div>
                            <Progress
                              value={(topic.solved / topic.total) * 100}
                              className="h-2 bg-dsb-neutral3/50"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center p-4 text-sm">
              <span className="text-dsb-neutral1">
                {parsedData?.statistics.topics.solvedTopics.length || 0} completed subtopics
              </span>
              <span className="text-dsb-neutral1">1 badges earned</span>
            </div>
          </div>

          {/* Right: Your Stats */}
          <div className="neo-glass-dark rounded-xl p-6 flex flex-col gap-6">
            <h2 className="text-lg font-medium text-white mb-4">Your Stats</h2>
            <PlayerStats level={4} streak={3} />
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-dsb-neutral1">Total Questions</span>
                <span className="text-white">{parsedData?.statistics.total.questions || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dsb-neutral1">Completed Lessons</span>
                <span className="text-white">{parsedData?.statistics.total.solved || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dsb-neutral1">SQL Problems</span>
                <span className="text-white">{parsedData?.statistics.sql.solved || 0}/{parsedData?.statistics.sql.total || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dsb-neutral1">Python Problems</span>
                <span className="text-white">{parsedData?.statistics.python.solved || 0}/{parsedData?.statistics.python.total || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dsb-neutral1">Easy Problems</span>
                <span className="text-white">{parsedData?.statistics.byDifficulty.easy.solved || 0}/{parsedData?.statistics.byDifficulty.easy.total || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OverviewTab;