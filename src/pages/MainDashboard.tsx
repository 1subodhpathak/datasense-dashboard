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
  BookOpen,
  Clock3,
  Flame,
  Gauge,
  LineChart,
  PlayCircle,
  Star,
  Target,
  Trophy,
  Users,
  Flag,
} from "lucide-react";

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

const getQuizType = (quizName: string): string => {
  const lowerCaseQuizName = quizName.toLowerCase();
  if (lowerCaseQuizName.startsWith("sql:")) return "sql";
  if (lowerCaseQuizName.startsWith("python:")) return "python";
  if (lowerCaseQuizName.startsWith("mcq:")) return "mcq";
  return "sql";
};

const checkIfQuizCompleted = async (quiz: any, userEmail: string): Promise<boolean> => {
  const quizType = getQuizType(quiz.quizName);

  if (!userEmail) return false;

  let url;
  if (quizType === 'mcq') {
    url = `https://server.datasenseai.com/leaderboard/${quiz._id}`;
  } else if (quizType === 'python') {
    url = `https://server.datasenseai.com/leaderboard/python/${quiz._id}`;
  } else if (quizType === 'sql') {
    url = `https://server.datasenseai.com/leaderboard/sql/${quiz._id}`;
  } else {
    return false;
  }

  try {
    const response = await axios.get(url);
    const leaderboard = response.data.leaderboard;

    // Check both timely and late users
    const allUsers = [
      ...(leaderboard.timelyUsers || []),
      ...(leaderboard.lateUsers || [])
    ];

    return allUsers.some((leaderboardUser: any) =>
      leaderboardUser.userId && leaderboardUser.userId.split(',')[0].trim() === userEmail
    );
  } catch (error) {
    return false;
  }
};

const MainDashboard = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const [practiceData, setPracticeData] = useState<UserData | null>(null);
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [battlegroundStats, setBattlegroundStats] = useState<BattlegroundStats>({
    totalXP: 0,
    totalWins: 0,
    totalDraws: 0,
    totalLosses: 0,
    totalGames: 0,
    rank: 0,
  });
  const [liveQuizProgress, setLiveQuizProgress] = useState({ completed: 0, total: 0, percentage: 0 });
  const [solvedQuestions, setSolvedQuestions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      if (!isLoaded) return;

      if (!isSignedIn || !user) {
        setPracticeData(null);
        setStreakData(null);
        setBattlegroundStats({
          totalXP: 0,
          totalWins: 0,
          totalDraws: 0,
          totalLosses: 0,
          totalGames: 0,
          rank: 0,
        });
        setLiveQuizProgress({ completed: 0, total: 0, percentage: 0 });
        setLoading(false);
        return;
      }

      try {
        // Fetch all data in parallel
        const practicePromise = axios.get(`https://server.datasenseai.com/practice-dashboard/${user.id}`);
        const streakPromise = axios.get(`https://server.datasenseai.com/question-attempt/streak/${user.id}`);
        const customTestPromise = axios.get(`https://server.datasenseai.com/custom-test/submissions/${user.id}`);
        const battlegroundPromise = fetch(`https://server.datasenseai.com/battleground-leaderboard/user-data/${user.id}`);
        const allQuizzesPromise = axios.get(`https://server.datasenseai.com/quiz/quizzes`);
        const solvedQuestionsPromise = fetch(`https://server.datasenseai.com/question-attempt/solved/${user.id}`);

        const [practiceResponse, streakResponse, customTestResponse, battlegroundResponse, allQuizzesResponse, solvedQuestionsResponse] = await Promise.allSettled([
          practicePromise,
          streakPromise,
          customTestPromise,
          battlegroundPromise,
          allQuizzesPromise,
          solvedQuestionsPromise,
        ]);

        // Process practice dashboard data
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
            fuel: apiUserData.fuel || 0,
            isPremium: apiUserData.isPremium || false,
            solved: apiUserData.solved || [],
            submissionHistory: matchedSubmissions.slice().reverse(),
            liveQuiz: apiUserData.liveQuiz || [],
            totalQuestions: apiUserData.totalQuestions || 0,
          };
        } else {
          processedPractice = {
            username: user.username || user.firstName || "User",
            email: user.primaryEmailAddress?.emailAddress || "user@example.com",
            profileImageUrl: user.imageUrl || "/placeholder.svg?height=40&width=40",
            fuel: 0,
            isPremium: false,
            solved: [],
            submissionHistory: [],
            liveQuiz: [],
            totalQuestions: 0,
          };
        }
        setPracticeData(processedPractice);

        // Process streak data - API returns { streakData: { subjectStreaks, activityLog } }
        if (streakResponse.status === "fulfilled" && streakResponse.value.data) {
          const responseData = streakResponse.value.data;
          // Handle both direct data and nested streakData structure
          const apiStreakData = responseData.streakData || responseData;

          // Convert subjectStreaks from Map or Object to Map
          let subjectStreaksMap = new Map();
          if (apiStreakData.subjectStreaks) {
            if (apiStreakData.subjectStreaks instanceof Map) {
              subjectStreaksMap = apiStreakData.subjectStreaks;
            } else if (typeof apiStreakData.subjectStreaks === 'object') {
              // Convert object to Map
              Object.entries(apiStreakData.subjectStreaks).forEach(([subject, data]: [string, any]) => {
                subjectStreaksMap.set(subject, {
                  currentStreak: data.currentStreak || 0,
                  longestStreak: data.longestStreak || 0,
                  lastActiveDate: data.lastActiveDate || null,
                });
              });
            }
          }

          setStreakData({
            subjectStreaks: subjectStreaksMap,
            activityLog: apiStreakData.activityLog || {},
          });
        } else {
          setStreakData({
            subjectStreaks: new Map(),
            activityLog: {},
          });
        }

        // Process battleground stats
        if (battlegroundResponse.status === "fulfilled" && battlegroundResponse.value.ok) {
          try {
            const data = await battlegroundResponse.value.json();
            let totalXP = 0,
              totalWins = 0,
              totalDraws = 0,
              totalLosses = 0,
              totalGames = 0;

            if (Array.isArray(data) && data.length > 0) {
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
                rank: 0, // Rank calculation would require fetching overall leaderboard
              });
            } else {
              setBattlegroundStats({
                totalXP: 0,
                totalWins: 0,
                totalDraws: 0,
                totalLosses: 0,
                totalGames: 0,
                rank: 0,
              });
            }
          } catch (parseError) {
            console.error("Error parsing battleground data:", parseError);
            setBattlegroundStats({
              totalXP: 0,
              totalWins: 0,
              totalDraws: 0,
              totalLosses: 0,
              totalGames: 0,
              rank: 0,
            });
          }
        } else {
          // Handle 404 or other errors gracefully
          setBattlegroundStats({
            totalXP: 0,
            totalWins: 0,
            totalDraws: 0,
            totalLosses: 0,
            totalGames: 0,
            rank: 0,
          });
        }

        // Process custom test data (stored for potential future use)
        if (customTestResponse.status === "fulfilled" && customTestResponse.value.data) {
          const customTestData = customTestResponse.value.data;
          // Custom test submissions are available in customTestData.data?.submissions
          // Can be used for future enhancements to display custom test history
          if (customTestData.data?.submissions) {
            console.log("Custom test submissions loaded:", customTestData.data.submissions.length);
          }
        }

        // Process live quiz progress
        if (allQuizzesResponse.status === "fulfilled" && allQuizzesResponse.value.data) {
          const allQuizzes = allQuizzesResponse.value.data || [];
          const userEmail = user.primaryEmailAddress?.emailAddress;

          if (userEmail && allQuizzes.length > 0) {
            // Check completion status for all quizzes
            const statusPromises = allQuizzes.map((quiz: any) =>
              checkIfQuizCompleted(quiz, userEmail).then((isCompleted: boolean) => ({
                quizId: quiz._id,
                isCompleted,
              }))
            );

            const statuses = await Promise.all(statusPromises);
            const completedCount = statuses.filter((status: any) => status.isCompleted).length;
            const totalQuizzes = allQuizzes.length;
            const progressPercentage = totalQuizzes > 0 ? Math.floor((completedCount / totalQuizzes) * 100) : 0;

            setLiveQuizProgress({
              completed: completedCount,
              total: totalQuizzes,
              percentage: progressPercentage,
            });
          } else {
            setLiveQuizProgress({ completed: 0, total: allQuizzes.length || 0, percentage: 0 });
          }
        } else {
          setLiveQuizProgress({ completed: 0, total: 0, percentage: 0 });
        }

        // Process solved questions for progress calculation (same as QuestionGallery.jsx)
        if (solvedQuestionsResponse.status === "fulfilled" && solvedQuestionsResponse.value.ok) {
          try {
            const solvedData = await solvedQuestionsResponse.value.json();
            const solvedArray: string[] = (solvedData.solvedQuestions || [])
              .filter((item: any) => item !== null)
              .map((item: any) => String(item));
            const solvedSet: Set<string> = new Set<string>(solvedArray);
            setSolvedQuestions(solvedSet);
          } catch (parseError) {
            console.error("Error parsing solved questions data:", parseError);
            setSolvedQuestions(new Set<string>());
          }
        } else {
          setSolvedQuestions(new Set<string>());
        }
      } catch (error) {
        console.error("Failed to load dashboard data", error);
        setPracticeData({
          username: user.username || user.firstName || "User",
          email: user.primaryEmailAddress?.emailAddress || "user@example.com",
          profileImageUrl: user.imageUrl || "/placeholder.svg?height=40&width=40",
          fuel: 0,
          isPremium: false,
          solved: [],
          submissionHistory: [],
          liveQuiz: [],
          totalQuestions: 0,
        });
        setStreakData({
          subjectStreaks: new Map(),
          activityLog: {},
        });
        setBattlegroundStats({
          totalXP: 0,
          totalWins: 0,
          totalDraws: 0,
          totalLosses: 0,
          totalGames: 0,
          rank: 0,
        });
        setLiveQuizProgress({ completed: 0, total: 0, percentage: 0 });
        setSolvedQuestions(new Set<string>());
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [isLoaded, isSignedIn, user]);

  // Calculate progress the same way as QuestionGallery.jsx
  const solvedCount = Array.from(solvedQuestions).length;
  const TOTAL_QUESTIONS = 500; // Based on the "500 Problems" text in the UI (same as QuestionGallery.jsx)
  const completionRate = Math.floor((solvedCount / TOTAL_QUESTIONS) * 100);

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

  const heroGridLineColor = "rgba(255,255,255,0.08)";
  const heroGradientTop = "#1eafaf";
  const heroGradientBottom = "#126464";

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="h-32 rounded-2xl bg-gray-200/30 animate-pulse dark:bg-[#32363C]/40" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-28 rounded-2xl bg-gray-200/30 animate-pulse dark:bg-[#32363C]/40" />
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 h-72 rounded-2xl bg-gray-200/30 animate-pulse dark:bg-[#32363C]/40" />
            <div className="h-72 rounded-2xl bg-gray-200/30 animate-pulse dark:bg-[#32363C]/40" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <section
          className="relative overflow-hidden rounded-3xl border border-white/20 text-white shadow-lg"
          style={{
            backgroundImage: `linear-gradient(${heroGridLineColor} 1px, transparent 1px), linear-gradient(90deg, ${heroGridLineColor} 1px, transparent 1px), linear-gradient(180deg, ${heroGradientTop} 0%, ${heroGradientBottom} 100%)`,
            backgroundSize: "32px 32px, 32px 32px, cover",
            backgroundPosition: "0 0, 0 0, 0 0",
          }}
        >
          <div className="flex flex-col gap-5 p-6 md:p-7">
            <div className="flex-1 space-y-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-14 w-14 flex-shrink-0 rounded-xl bg-white/20 flex items-center justify-center">
                  <LineChart className="h-7 w-7 text-white/95" />
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-xs font-semibold text-black px-5 py-2 rounded-lg backdrop-blur bg-[#abfff9]">
                    🔥 {(streakHighlights[0]?.current ?? 0).toLocaleString()} day streak
                  </span>
                  <span className="text-xs font-bold px-5 py-2 rounded-lg backdrop-blur bg-[#FFF9D8] text-[#FFB039]">
                    ★ {battlegroundWinRate || 0}% win rate
                  </span>
                </div>
              </div>
              <p className="text-2xl text-white/95">Welcome back</p>
              <h2 className="text-3xl md:text-[34px] font-extrabold tracking-tight text-white/95">
                {practiceData?.username
                  ? `${practiceData.username}, your learning hub is ready.`
                  : "Your learning hub is ready."}
              </h2>
              <div className="flex items-center gap-4 w-full">
                <p className="mt-2 text-base text-white/95">
                  Monitor every win, streak, and milestone in one place. Stay on pace with personalised insights and jump back into practice whenever you're ready.
                </p>
                <Link to="https://practice.datasenseai.com/practice-area?subject=sql" target="_blank" className="flex-shrink-0">
                  <Button className="bg-white text-[#12325d] hover:bg-white/95 font-semibold px-6 py-5 rounded-lg whitespace-nowrap">
                    Continue practice
                  </Button>
                </Link>
                <Link to="#" className="flex-shrink-0">
                  <Button className="bg-white text-[#12325d] hover:bg-white/95 font-semibold px-6 py-5 rounded-lg whitespace-nowrap">
                    Continue Learning
                  </Button>
                </Link>
              </div>
              {/* <div className="flex flex-wrap items-center gap-x-8 gap-y-3 mt-5 text-white/90 text-base">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  {(practiceData?.submissionHistory.length ?? 0).toLocaleString()} recent submissions
                </div>
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4" />
                  {practiceData?.liveQuiz.length ?? 0} active quizzes
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  {battlegroundStats.totalXP.toLocaleString()} XP earned
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {battlegroundStats.totalGames.toLocaleString()} battleground games
                </div>
                <div className="flex items-center gap-2">
                  <Flag className="h-4 w-4" />
                  Completion {completionRate}%
                </div>
              </div> */}
            </div>
            {/* <div className="mt-4">
              <div className="flex items-center gap-4 w-full">
                <div className="flex-1">
                  <div className="text-lg mb-2">
                    Your Progress :{" "}
                    <span className="font-semibold text-green-400">
                      {completionRate}% Completed
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/40">
                    <div
                      className="h-2 rounded-full bg-green-300"
                      style={{ width: `${Math.min(100, completionRate)}%` }}
                    />
                  </div>
                </div>
                <Link to="https://practice.datasenseai.com/practice-area?subject=sql" target="_blank" className="flex-shrink-0">
                  <Button className="bg-white text-[#12325d] hover:bg-white/95 font-semibold px-6 py-5 rounded-lg whitespace-nowrap">
                    Continue practice
                  </Button>
                </Link>
                <Link to="#" className="flex-shrink-0">
                  <Button className="bg-white text-[#12325d] hover:bg-white/95 font-semibold px-6 py-5 rounded-xl whitespace-nowrap">
                    Continue Learning
                  </Button>
                </Link>
              </div>
            </div> */}
          </div>
        </section>
        {/* <div className="flex flex-wrap gap-3">
          {quickActions.map((action) => (
            <Link key={action.title} to={action.href}>
              <Button className="flex items-center gap-2 rounded-lg bg-gray-900/10 px-5 text-sm font-semibold text-gray-800 hover:bg-gray-900/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900/10 dark:bg-white/10">
                  <action.icon className="h-4 w-4 text-gray-700 dark:text-white" />
                </span>
                {action.cta}
              </Button>
            </Link>
          ))}
        </div> */}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="neo-glass rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Practice Progress</span>
              <LineChart className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <p className="mt-3 text-3xl font-semibold text-gray-900 dark:text-white">{completionRate}%</p>
            <Progress value={completionRate} className="mt-4 h-2" />
          </div>

          <div className="neo-glass rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Live Quiz Progress</span>
              <BookOpen className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <p className="mt-3 text-3xl font-semibold text-gray-900 dark:text-white">{liveQuizProgress.percentage}%</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {liveQuizProgress.completed} / {liveQuizProgress.total} completed
            </p>
          </div>

          <div className="neo-glass rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Win Rate</span>
              <Gauge className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <p className="mt-3 text-3xl font-semibold text-gray-900 dark:text-white">{battlegroundWinRate}%</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {battlegroundStats.totalWins}W · {battlegroundStats.totalLosses}L · {battlegroundStats.totalDraws}D
            </p>
          </div>

          <div className="neo-glass rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Top Streak</span>
              <Target className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div className="mt-3 space-y-2">
              {streakHighlights.length > 0 ? (
                streakHighlights.slice(0, 2).map((streak) => (
                  <div key={streak.subject} className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-200">{streak.subject}</span>
                    <span className="text-gray-900 dark:text-white">{streak.current} days</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No streaks yet</p>
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="neo-glass rounded-3xl p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Recent Practice Activity</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Latest submissions and outcomes</p>
              </div>
              <Badge variant="outline" className="border-gray-300 bg-gray-100 text-xs uppercase tracking-wide text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200">
                Submissions
              </Badge>
            </div>
            <div className="mt-4 space-y-4">
              {recentSubmissions.map((submission) => (
                <div
                  key={submission._id}
                  className="flex items-center justify-between rounded-xl bg-white dark:bg-[#32363C] p-4 text-sm shadow-sm transition dark:bg-gray-900/60"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold ${submission.isCorrect ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-red-500/20 text-red-600 dark:text-red-400"
                        }`}
                    >
                      {submission.isCorrect ? "AC" : "WA"}
                    </span>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-100">{submission.title || "Untitled Challenge"}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        {new Date(submission.submittedAt).toLocaleDateString()} · {submission.difficulty || "Medium"}
                      </p>
                    </div>
                  </div>
                  {/* <Button variant="ghost" size="sm" className="text-gray-700 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800">
                    Review
                  </Button> */}
                </div>
              ))}
              {!recentSubmissions.length && (
                <div className="rounded-2xl bg-white dark:bg-[#32363C] p-6 text-center text-sm text-gray-600 shadow-sm dark:bg-gray-900/60 dark:text-gray-300">
                  No practice submissions yet. Start solving to build your streak.
                </div>
              )}
            </div>
          </div>

          <div className="neo-glass rounded-3xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Skill Streaks</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Keep momentum across topics</p>
            <div className="mt-4 space-y-4">
              {streakHighlights.length > 0 ? (
                streakHighlights.map((item) => (
                  <div key={item.subject}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700 dark:text-gray-200">{item.subject}</span>
                      <span className="text-gray-900 dark:text-white">{item.current} days</span>
                    </div>
                    <Progress value={(item.current / Math.max(item.longest, 1)) * 100} className="mt-2 h-1.5" />
                  </div>
                ))
              ) : (
                <div className="rounded-xl bg-white dark:bg-[#32363C] p-6 text-center text-sm text-gray-600 shadow-sm dark:bg-gray-900/60 dark:text-gray-300">
                  Start practicing to build your streaks.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="neo-glass rounded-3xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Battleground Snapshot</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Performance across recent matches</p>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-200">Matches Played</span>
                <span className="font-semibold text-gray-900 dark:text-white">{battlegroundStats.totalGames}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-200">Win / Loss</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {battlegroundStats.totalWins} / {battlegroundStats.totalLosses}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-200">Current Rank</span>
                <span className="inline-flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                  <Trophy className="h-4 w-4" /> {battlegroundStats.rank > 0 ? `#${battlegroundStats.rank}` : "N/A"}
                </span>
              </div>
            </div>
            <Link to="/battleground">
              <Button className="mt-6 w-full rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white/95">
                View Detailed Battleground
              </Button>
            </Link>
          </div>

          <div className="neo-glass rounded-3xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Learning Momentum</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Subjects trending upwards</p>
            <div className="mt-4 space-y-3">
              {topLiveQuiz.map((quiz) => (
                <div key={quiz.subject} className="rounded-xl bg-white dark:bg-[#32363C] p-3 text-sm shadow-sm transition dark:bg-gray-900/60">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700 dark:text-gray-200">{quiz.subject}</span>
                    <Badge variant="outline" className="border-gray-300 bg-gray-100 text-xs text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200">
                      {quiz.scores}/{quiz.totalScores}
                    </Badge>
                  </div>
                  <Progress value={(quiz.scores / quiz.totalScores) * 100} className="mt-2 h-1.5" />
                </div>
              ))}
              {!topLiveQuiz.length && (
                <div className="rounded-xl bg-white dark:bg-[#32363C] p-6 text-center text-sm text-gray-600 shadow-sm dark:bg-gray-900/60 dark:text-gray-300">
                  Join a live quiz to populate your learning metrics.
                </div>
              )}
            </div>
          </div>

          <div className="neo-glass rounded-3xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Your Stats</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Your performance overview</p>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-white dark:bg-[#32363C] p-3 text-sm shadow-sm dark:bg-gray-900/60">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-600/15 dark:bg-cyan-500/15 text-cyan-600 dark:text-cyan-400">
                    You
                  </span>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100">{practiceData?.username || "User"}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-300">{battlegroundStats.totalXP.toLocaleString()} XP</p>
                  </div>
                </div>
                <Users className="h-4 w-4 text-gray-700 dark:text-gray-200" />
              </div>
              <div className="rounded-xl bg-white dark:bg-[#32363C] p-4 text-center text-sm text-gray-600 shadow-sm dark:bg-gray-900/60 dark:text-gray-300">
                <Link to="/battleground" className="text-cyan-600 dark:text-cyan-500 hover:underline font-medium">
                  View full leaderboard →
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="neo-glass rounded-3xl p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Next Milestones</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Goals curated from your practice and battles</p>
            </div>
            <Link to="/resources">
              <Button className="mt-6 w-full md:mt-0 md:w-auto rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white/95">
                View Learning Plan
              </Button>
            </Link>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {(() => {
              const goals = [];
              if (solvedCount < 5) {
                goals.push({ text: `Complete ${5 - solvedCount} more challenge${5 - solvedCount > 1 ? 's' : ''}`, icon: Award, progress: solvedCount, target: 5 });
              }
              if (battlegroundStats.totalWins < 3) {
                goals.push({ text: `Win ${3 - battlegroundStats.totalWins} more battleground match${3 - battlegroundStats.totalWins > 1 ? 'es' : ''}`, icon: Trophy, progress: battlegroundStats.totalWins, target: 3 });
              }
              if (streakHighlights.length === 0 || (streakHighlights[0]?.current || 0) < 7) {
                goals.push({ text: `Build a 7-day streak`, icon: Target, progress: streakHighlights[0]?.current || 0, target: 7 });
              }

              if (goals.length === 0) {
                return (
                  <div className="md:col-span-3 rounded-2xl bg-white dark:bg-[#32363C] p-6 text-center shadow-sm dark:bg-gray-900/60">
                    <Award className="h-12 w-12 mx-auto mb-3 text-cyan-600 dark:text-cyan-500" />
                    <p className="font-medium text-gray-800 dark:text-gray-100">Great progress!</p>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                      Keep practicing to unlock new achievements.
                    </p>
                  </div>
                );
              }

              return goals.slice(0, 3).map((goal, idx) => (
                <div key={goal.text} className="rounded-2xl bg-white dark:bg-[#32363C] p-4 shadow-sm transition dark:bg-gray-900/60">
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-600/15 dark:bg-cyan-500/15 text-cyan-600 dark:text-cyan-400">
                    <goal.icon className="h-5 w-5" />
                  </div>
                  <p className="font-medium text-gray-800 dark:text-gray-100">{goal.text}</p>
                  <div className="mt-3">
                    <Progress value={(goal.progress / goal.target) * 100} className="h-2" />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {goal.progress} / {goal.target}
                    </p>
                  </div>
                </div>
              ));
            })()}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default MainDashboard;
