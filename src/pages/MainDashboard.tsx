import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Activity,
  Award,
  Flame,
  Gauge,
  LineChart,
  PlayCircle,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import { useTheme } from "@/lib/theme-context";

interface Submission {
  questionId: string | null;
  isCorrect: boolean;
  submittedCode: string;
  submittedAt: string;
  _id?: string;
  title?: string;
  difficulty?: string;
  solvedQuestion?: any;
}

interface UserData {
  username: string;
  email: string;
  profileImageUrl: string;
  fuel: number;
  isPremium: boolean;
  solved: any[];
  submissionHistory: Submission[];
  liveQuiz: any[];
  totalQuestions?: number;
}

interface StreakData {
  subjectStreaks: Map<
    string,
    {
      currentStreak: number;
      longestStreak: number;
      lastActiveDate?: string | null;
    }
  >;
  activityLog: any;
}

interface BattlegroundStats {
  totalXP: number;
  totalWins: number;
  totalDraws: number;
  totalLosses: number;
  totalGames: number;
  rank: number;
}

const mockBattlegroundStats: BattlegroundStats = {
  totalXP: 12996,
  totalWins: 24,
  totalDraws: 4,
  totalLosses: 12,
  totalGames: 40,
  rank: 78,
};

function generateActivityLog(): any {
  const today = new Date();
  const activityLog: Record<string, { months: Record<string, Record<string, number>> }> = {};
  for (let i = 0; i < 60; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString();
    const day = date.getDate().toString();
    if (!activityLog[year]) activityLog[year] = { months: {} };
    if (!activityLog[year].months[month]) activityLog[year].months[month] = {};
    activityLog[year].months[month][day] = Math.floor(Math.random() * 4);
  }
  return activityLog;
}

function createMockUserData(user: any): UserData {
  return {
    username: user?.username || user?.firstName || "CodeMaster",
    email: user?.primaryEmailAddress?.emailAddress || "codemaster@example.com",
    profileImageUrl: user?.imageUrl || "/placeholder.svg?height=40&width=40",
    fuel: 75,
    isPremium: true,
    solved: new Array(5).fill({}).map((_, idx) => ({
      title: `Mock Challenge ${idx + 1}`,
      difficulty: idx % 3 === 0 ? "Hard" : idx % 2 === 0 ? "Medium" : "Easy",
    })),
    submissionHistory: [
      {
        questionId: null,
        isCorrect: true,
        submittedCode: "SELECT * FROM festival_data;",
        submittedAt: new Date(Date.now() - 3600000).toISOString(),
        _id: "mock-1",
        title: "Festival Data Query",
        difficulty: "Medium",
      },
      {
        questionId: null,
        isCorrect: false,
        submittedCode: "def find_max(lst):\n    return max(lst)",
        submittedAt: new Date(Date.now() - 86400000).toISOString(),
        _id: "mock-2",
        title: "Find Maximum",
        difficulty: "Easy",
      },
    ],
    liveQuiz: [
      { subject: "Algorithms", scores: 85, totalScores: 100 },
      { subject: "Data Structures", scores: 70, totalScores: 100 },
    ],
    totalQuestions: 120,
  };
}

function createMockStreakData(): StreakData {
  return {
    subjectStreaks: new Map([
      ["Algorithms", { currentStreak: 7, longestStreak: 14 }],
      ["Data Structures", { currentStreak: 3, longestStreak: 10 }],
      ["System Design", { currentStreak: 0, longestStreak: 5 }],
    ]),
    activityLog: generateActivityLog(),
  };
}

const MainDashboard = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const { theme } = useTheme();
  const [practiceData, setPracticeData] = useState<UserData | null>(null);
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [battlegroundStats, setBattlegroundStats] = useState<BattlegroundStats>(mockBattlegroundStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      if (!isLoaded) return;

      if (!isSignedIn || !user) {
        setPracticeData(createMockUserData(user));
        setStreakData(createMockStreakData());
        setBattlegroundStats(mockBattlegroundStats);
        setLoading(false);
        return;
      }

      try {
        const practicePromise = axios.get(`https://server.datasenseai.com/practice-dashboard/${user.id}`);
        const streakPromise = axios.get(`https://server.datasenseai.com/question-attempt/streak/${user.id}`);
        const battlegroundPromise = fetch(`https://server.datasenseai.com/battleground-leaderboard/user-data/${user.id}`);

        const [practiceResponse, streakResponse, battlegroundResponse] = await Promise.allSettled([
          practicePromise,
          streakPromise,
          battlegroundPromise,
        ]);

        let processedPractice: UserData | null = null;
        if (practiceResponse.status === "fulfilled" && practiceResponse.value.data) {
          const apiUserData = practiceResponse.value.data;
          const matchedSubmissions: Submission[] =
            apiUserData.submissionHistory?.map((submission: Submission) => {
              const solvedQuestion = apiUserData.solved?.find((q: any) => q._id === submission.questionId);
              return {
                ...submission,
                solvedQuestion,
              };
            }) || [];
          processedPractice = {
            username: user.username || user.firstName || "User",
            email: user.primaryEmailAddress?.emailAddress || "user@example.com",
            profileImageUrl: user.imageUrl || "/placeholder.svg?height=40&width=40",
            fuel: apiUserData.fuel || 75,
            isPremium: apiUserData.isPremium || false,
            solved: apiUserData.solved || [],
            submissionHistory: matchedSubmissions.slice().reverse(),
            liveQuiz: apiUserData.liveQuiz || [],
            totalQuestions: apiUserData.totalQuestions || 100,
          };
        } else {
          processedPractice = createMockUserData(user);
        }
        setPracticeData(processedPractice);

        if (streakResponse.status === "fulfilled" && streakResponse.value.data) {
          const apiStreakData = streakResponse.value.data;
          const mapped = new Map(
            Object.entries(apiStreakData.subjectStreaks || {}).map(([subject, data]: [string, any]) => [
              subject,
              {
                currentStreak: data.currentStreak || 0,
                longestStreak: data.longestStreak || 0,
                lastActiveDate: data.lastActiveDate || null,
              },
            ])
          );
          setStreakData({
            subjectStreaks: mapped,
            activityLog: apiStreakData.activityLog ?? generateActivityLog(),
          });
        } else {
          setStreakData(createMockStreakData());
        }

        if (battlegroundResponse.status === "fulfilled" && battlegroundResponse.value.ok) {
          const data = await battlegroundResponse.value.json();
          let totalXP = 0,
            totalWins = 0,
            totalDraws = 0,
            totalLosses = 0,
            totalGames = 0;

          data.forEach((entry: any) => {
            totalXP += entry.xp || 0;
            totalWins += entry.won || 0;
            totalDraws += entry.draw || 0;
            totalLosses += entry.lose || 0;
            totalGames += (entry.won || 0) + (entry.draw || 0) + (entry.lose || 0);
          });

          setBattlegroundStats({
            totalXP,
            totalWins,
            totalDraws,
            totalLosses,
            totalGames,
            rank: data?.[0]?.rank || mockBattlegroundStats.rank,
          });
        } else {
          setBattlegroundStats(mockBattlegroundStats);
        }
      } catch (error) {
        console.error("Failed to load dashboard data", error);
        setPracticeData(createMockUserData(user));
        setStreakData(createMockStreakData());
        setBattlegroundStats(mockBattlegroundStats);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [isLoaded, isSignedIn, user]);

  const solvedCount = practiceData?.solved?.length || 0;
  const totalQuestions = practiceData?.totalQuestions || 1;
  const completionRate = Math.round((solvedCount / totalQuestions) * 100);

  const streakHighlights = useMemo(() => {
    if (!streakData?.subjectStreaks) return [];
    return Array.from(streakData.subjectStreaks.entries()).map(([subject, data]) => ({
      subject,
      current: data.currentStreak,
      longest: data.longestStreak,
    }));
  }, [streakData]);

  const recentSubmissions = practiceData?.submissionHistory.slice(0, 4) || [];
  const topLiveQuiz = practiceData?.liveQuiz.slice(0, 3) || [];

  const quickActions = [
    {
      title: "Continue Practice",
      description: "Pick up from your last solved challenge.",
      icon: PlayCircle,
      cta: "Go to Practice",
      href: "/practice-dashboard",
    },
    {
      title: "Challenge a Peer",
      description: "Start a battleground match in seconds.",
      icon: Trophy,
      cta: "Open Battleground",
      href: "/battleground",
    },
    {
      title: "Review Solutions",
      description: "Analyse your submissions and iterate.",
      icon: Activity,
      cta: "View History",
      href: "/practice-dashboard?tab=submissions",
    },
  ];

  const battlegroundWinRate = battlegroundStats.totalGames
    ? Math.round((battlegroundStats.totalWins / battlegroundStats.totalGames) * 100)
    : 0;

  const gridLineColor = "rgba(255,255,255,0.18)";
  const gridGradientTop = "#1fb9b9";
  const gridGradientBottom = "#137c7c";

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="h-32 rounded-2xl bg-slate-200/30 animate-pulse dark:bg-slate-700/40" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-28 rounded-2xl bg-slate-200/30 animate-pulse dark:bg-slate-700/40" />
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 h-72 rounded-2xl bg-slate-200/30 animate-pulse dark:bg-slate-700/40" />
            <div className="h-72 rounded-2xl bg-slate-200/30 animate-pulse dark:bg-slate-700/40" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <section
          className="relative overflow-hidden rounded-3xl border border-white/20 p-8 text-white shadow-lg dark:border-white/10"
          style={{
            backgroundImage: `linear-gradient(${gridLineColor} 1px, transparent 1px), linear-gradient(90deg, ${gridLineColor} 1px, transparent 1px), linear-gradient(180deg, ${gridGradientTop} 0%, ${gridGradientBottom} 100%)`,
            backgroundSize: "32px 32px, 32px 32px, cover",
            backgroundPosition: "0 0, 0 0, 0 0",
          }}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-white/85">Welcome back</p>
              <h2 className="mt-2 text-3xl font-semibold text-white/85">
                {practiceData?.username ? `${practiceData.username}, your learning hub is ready.` : "Your learning hub is ready."}
              </h2>
              <p className="mt-3 max-w-2xl text-white/90">
                Track your battleground performance, monitor practice progress, and jump into your next milestone — everything lives here.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {quickActions.map((action) => (
                <Link key={action.title} to={action.href}>
                  <Button className="flex items-center gap-2 rounded-full bg-white/15 px-5 text-sm font-semibold text-white/85 hover:bg-white/25">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                      <action.icon className="h-4 w-4" />
                    </span>
                    {action.cta}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="neo-glass rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Battleground XP</span>
              <Flame className="h-5 w-5 text-[#00E2CA]" />
            </div>
            <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{battlegroundStats.totalXP}</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">Rank #{battlegroundStats.rank}</p>
          </div>

          <div className="neo-glass rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Win Rate</span>
              <Gauge className="h-5 w-5 text-[#00E2CA]" />
            </div>
            <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{battlegroundWinRate}%</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {battlegroundStats.totalWins}W · {battlegroundStats.totalLosses}L · {battlegroundStats.totalDraws}D
            </p>
          </div>

          <div className="neo-glass rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Practice Progress</span>
              <LineChart className="h-5 w-5 text-[#00E2CA]" />
            </div>
            <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{completionRate}%</p>
            <Progress value={completionRate} className="mt-4 h-2" />
          </div>

          <div className="neo-glass rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Top Streak</span>
              <Target className="h-5 w-5 text-[#00E2CA]" />
            </div>
            <div className="mt-3 space-y-2">
              {streakHighlights.slice(0, 2).map((streak) => (
                <div key={streak.subject} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700 dark:text-slate-200">{streak.subject}</span>
                  <span className="text-slate-900 dark:text-white">{streak.current} days</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="neo-glass rounded-3xl p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Recent Practice Activity</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">Latest submissions and outcomes</p>
              </div>
              <Badge variant="outline" className="border-slate-300 bg-slate-100 text-xs uppercase tracking-wide text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
                Submissions
              </Badge>
            </div>
            <div className="mt-4 space-y-4">
              {recentSubmissions.map((submission) => (
                <div
                  key={submission._id}
                  className="flex items-center justify-between rounded-xl bg-white/90 p-4 text-sm shadow-sm transition dark:bg-slate-900/60"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                        submission.isCorrect ? "bg-emerald-500/20 text-emerald-600" : "bg-red-500/20 text-red-600"
                      }`}
                    >
                      {submission.isCorrect ? "AC" : "WA"}
                    </span>
                    <div>
                      <p className="font-medium text-slate-800 dark:text-slate-100">{submission.title || "Untitled Challenge"}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {new Date(submission.submittedAt).toLocaleDateString()} · {submission.difficulty || "Medium"}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-slate-700 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800">
                    Review
                  </Button>
                </div>
              ))}
              {!recentSubmissions.length && (
                <div className="rounded-2xl bg-white/90 p-6 text-center text-sm text-slate-600 shadow-sm dark:bg-slate-900/60 dark:text-slate-300">
                  No practice submissions yet. Start solving to build your streak.
                </div>
              )}
            </div>
          </div>

          <div className="neo-glass rounded-3xl p-6">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Skill Streaks</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">Keep momentum across topics</p>
            <div className="mt-4 space-y-4">
              {streakHighlights.map((item) => (
                <div key={item.subject}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700 dark:text-slate-200">{item.subject}</span>
                    <span className="text-slate-900 dark:text-white">{item.current} days</span>
                  </div>
                  <Progress value={(item.current / Math.max(item.longest, 1)) * 100} className="mt-2 h-1.5" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="neo-glass rounded-3xl p-6">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Battleground Snapshot</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">Performance across recent matches</p>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-700 dark:text-slate-200">Matches Played</span>
                <span className="font-semibold text-slate-900 dark:text-white">{battlegroundStats.totalGames}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700 dark:text-slate-200">Win / Loss</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {battlegroundStats.totalWins} / {battlegroundStats.totalLosses}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700 dark:text-slate-200">Current Rank</span>
                <span className="inline-flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                  <Trophy className="h-4 w-4" /> #{battlegroundStats.rank}
                </span>
              </div>
            </div>
            <Link to="/battleground">
              <Button className="mt-6 w-full rounded-full bg-[#008B8B] text-white hover:bg-[#007a7a]">
                View Detailed Battleground
              </Button>
            </Link>
          </div>

          <div className="neo-glass rounded-3xl p-6">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Learning Momentum</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">Subjects trending upwards</p>
            <div className="mt-4 space-y-3">
              {topLiveQuiz.map((quiz) => (
                <div key={quiz.subject} className="rounded-xl bg-white/90 p-3 text-sm shadow-sm transition dark:bg-slate-900/60">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700 dark:text-slate-200">{quiz.subject}</span>
                    <Badge variant="outline" className="border-slate-300 bg-slate-100 text-xs text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
                      {quiz.scores}/{quiz.totalScores}
                    </Badge>
                  </div>
                  <Progress value={(quiz.scores / quiz.totalScores) * 100} className="mt-2 h-1.5" />
                </div>
              ))}
              {!topLiveQuiz.length && (
                <div className="rounded-xl bg-white/90 p-6 text-center text-sm text-slate-600 shadow-sm dark:bg-slate-900/60 dark:text-slate-300">
                  Join a live quiz to populate your learning metrics.
                </div>
              )}
            </div>
          </div>

          <div className="neo-glass rounded-3xl p-6">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Community Leaderboard</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">Top players to watch</p>
            <div className="mt-4 space-y-3">
              {[
                { name: "Isaac Roberts", points: 93267, position: 1 },
                { name: "Olivia King", points: 88267, position: 2 },
                { name: "Ava Garcia", points: 82267, position: 3 },
                { name: practiceData?.username || "You", points: battlegroundStats.totalXP, position: battlegroundStats.rank },
              ].map((player) => (
                <div key={player.name} className="flex items-center justify-between rounded-xl bg-white/90 p-3 text-sm shadow-sm dark:bg-slate-900/60">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#008B8B]/15 text-[#008B8B] dark:bg-white/10 dark:text-white">
                      {player.position <= 3 ? "#" + player.position : "You"}
                    </span>
                    <div>
                      <p className="font-medium text-slate-800 dark:text-slate-100">{player.name}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300">{player.points.toLocaleString()} pts</p>
                    </div>
                  </div>
                  <Users className="h-4 w-4 text-slate-700 dark:text-slate-200" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="neo-glass rounded-3xl p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Next Milestones</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">Goals curated from your practice and battles</p>
            </div>
            <Link to="/resources">
              <Button variant="outline" className="rounded-full border-slate-400 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-white dark:hover:bg-slate-800">
                View Learning Plan
              </Button>
            </Link>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {["Complete 5 SQL challenges", "Win 3 battleground matches", "Finish Python fundamentals"].map((goal, idx) => (
              <div key={goal} className="rounded-2xl bg-white/90 p-4 shadow-sm transition dark:bg-slate-900/60">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#008B8B]/15 text-[#008B8B] dark:bg-white/10 dark:text-white">
                  {idx === 0 ? <Award className="h-5 w-5" /> : idx === 1 ? <Trophy className="h-5 w-5" /> : <Target className="h-5 w-5" />}
                </div>
                <p className="font-medium text-slate-800 dark:text-slate-100">{goal}</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Stay consistent to unlock badges and climb the global leaderboard.
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default MainDashboard;
