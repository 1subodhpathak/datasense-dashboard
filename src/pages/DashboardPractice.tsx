import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";



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
  subjectStreaks: Map<string, {
    currentStreak: number;
    longestStreak: number;
    lastActiveDate?: string | null;
  }>;
  activityLog: any;
}

// Mock data generators
function generateActivityLog(): any {
  const today = new Date();
  const activityLog: any = {};
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
    solved: new Array(10).fill({}),
    submissionHistory: [
      {
        questionId: null,
        isCorrect: true,
        submittedCode: "SELECT  Festival_Name,Country,Ticket_Type FROM festivaldata;",
        submittedAt: new Date(Date.now() - 3600000).toISOString(),
        _id: "67571ad63f4d82f359e49df9",
      },
      {
        questionId: null,
        isCorrect: false,
        submittedCode: "def find_max(lst):\n    # Your code here\n    print('heya')",
        submittedAt: new Date(Date.now() - 86400000).toISOString(),
        _id: "6744c5c35a3bea765a844345",
      },
      {
        questionId: null,
        isCorrect: true,
        submittedCode: "select festival_name, city, date from festivaldata where country='USA';",
        submittedAt: new Date(Date.now() - 172800000).toISOString(),
        _id: "67daae7677de071e30f7a386",
      },
    ],
    liveQuiz: [
      { subject: "Algorithms", scores: 85, totalScores: 100 },
      { subject: "Data Structures", scores: 70, totalScores: 100 },
      { subject: "System Design", scores: 60, totalScores: 100 },
    ],
    totalQuestions: 100,
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

const DashboardPractice = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  // const [totalQuestions, setTotalQuestions] = useState<number>(500);
  const [totalQuestions, setTotalQuestions] = useState<number>(500);
  const [loading, setLoading] = useState(true);
  const [expandedSolved, setExpandedSolved] = useState(false);
  const [expandedSubmissions, setExpandedSubmissions] = useState(false);
  const [tab, setTab] = useState<'submissions' | 'quizzes'>('submissions');
  const [handleClick, setHandleClick] = useState(false);

  const handleButtonClick = () => {
    setHandleClick(!handleClick);
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!isLoaded || !isSignedIn || !user) {
        setLoading(false);
        return;
      }
      try {
        const [userDataResponse, streakDataResponse] = await Promise.allSettled([
          axios.get(`https://server.datasenseai.com/practice-dashboard/${user.id}`),
          axios.get(`https://server.datasenseai.com/question-attempt/streak/${user.id}`),
        ]);

        let processedUserData: UserData | null = null;
        let processedStreakData: StreakData | null = null;

        if (userDataResponse.status === "fulfilled" && userDataResponse.value.data) {
          const apiUserData = userDataResponse.value.data;
          const matchedSubmissions: Submission[] =
            apiUserData.submissionHistory?.map((submission: Submission) => {
              const solvedQuestion = apiUserData.solved?.find((q: any) => q._id === submission.questionId);
              return {
                ...submission,
                solvedQuestion,
              };
            }) || [];
          processedUserData = {
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
          if (apiUserData.totalQuestions) setTotalQuestions(apiUserData.totalQuestions);
        } else {
          processedUserData = createMockUserData(user);
        }

        if (streakDataResponse.status === "fulfilled" && streakDataResponse.value.data) {
          const apiStreakData = streakDataResponse.value.data;
          processedStreakData = {
            subjectStreaks: new Map(
              Object.entries(apiStreakData.subjectStreaks || {}).map(([subject, data]: [string, any]) => [
                subject,
                {
                  currentStreak: data.currentStreak || 0,
                  longestStreak: data.longestStreak || 0,
                  lastActiveDate: data.lastActiveDate || null,
                },
              ])
            ),
            activityLog: apiStreakData.activityLog ?? generateActivityLog(),
          };
        } else {
          processedStreakData = createMockStreakData();
        }

        setUserData(processedUserData);
        setStreakData(processedStreakData);
        setLoading(false);
      } catch (error) {
        setUserData(createMockUserData(user));
        setStreakData(createMockStreakData());
        setLoading(false);
        toast.error("Practice dashboard or streak API failed. Showing mock data.");
      }
    };
    fetchData();
  }, [isLoaded, isSignedIn, user]);

  // useEffect(() => {
  //   toast.info("Practice Dashboard loaded", {
  //     description: `Active tab: Practice Dashboard`,
  //     duration: 3000,
  //   });
  // }, []);

  // if (loading) { ... } // keep loading spinner logic commented as per your preference

  // Helper for activity heatmap rendering
  function renderActivityHeatmap(activityLog: any) {
    if (!activityLog) return null;
    return (
      <div className="flex flex-wrap gap-1">
        {Object.entries(activityLog).flatMap(([year, yearData]: any) =>
          Object.entries(yearData.months || {}).flatMap(([month, monthData]: any) =>
            Object.entries(monthData || {}).map(([day, activity]: any) => {
              const activityLevel = typeof activity === "number" ? activity : 0;
              let bgColor = "bg-dsb-neutral3";
              if (activityLevel === 1) bgColor = "bg-emerald-700";
              else if (activityLevel === 2) bgColor = "bg-emerald-500";
              else if (activityLevel >= 3) bgColor = "bg-emerald-300";
              return (
                <div
                  key={`${year}-${month}-${day}`}
                  className={`w-4 h-4 rounded-sm ${bgColor}`}
                  title={`${month}/${day}/${year}: ${activityLevel} activities`}
                />
              );
            })
          )
        )}
      </div>
    );
  }

  // Helper for subject streaks
  function renderSubjectStreaks(subjectStreaks: Map<string, any>) {
    if (!subjectStreaks) return null;
    return (
      <div className="space-y-4">
        {[...subjectStreaks.entries()].map(([subject, data]) => (
          <div key={subject}>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-dsb-neutral2">{subject}</span>
              <span className="text-sm text-dsb-neutral2">{data.currentStreak} day{data.currentStreak !== 1 ? "s" : ""}</span>
            </div>
            <Progress value={(data.currentStreak / (data.longestStreak || 1)) * 100} className="h-2" />
          </div>
        ))}
      </div>
    );
  }

  // Helper for recently solved
  function renderRecentlySolved(solved: any[]) {
    if (!solved || solved.length === 0) return <div className="text-dsb-neutral2">No solved questions yet</div>;
    return (
      <div className="space-y-2">
        {solved.slice(0, expandedSolved ? solved.length : 3).map((question, idx) => (
          <div key={idx} className="text-sm p-2 rounded-md bg-black/30">
            <div className="font-medium text-dsb-neutral2">{question.title || "Untitled Question"}</div>
            <Badge variant="outline" className="mt-2 bg-dsb-neutral3 text-dsb-neutral1">
              {question.difficulty || "Unknown"}
            </Badge>
          </div>
        ))}
        {solved.length > 3 && (
          <Button variant="ghost" size="sm" onClick={() => setExpandedSolved(!expandedSolved)} className="mt-2 w-full text-dsb-accent">
            {expandedSolved ? "Show Less" : `Show All (${solved.length})`}
          </Button>
        )}
      </div>
    );
  }

  // Helper for recent submissions
  function renderRecentSubmissions(submissions: Submission[]) {
    if (!submissions || submissions.length === 0) return <div className="text-center py-6 text-dsb-neutral2">No submissions yet</div>;
    return (
      <div className="space-y-4">
        {submissions.slice(0, expandedSubmissions ? submissions.length : 5).map((submission, index) => {
          let title = submission.solvedQuestion?.title || "Problem";
          if (!title && submission.submittedCode) {
            if (submission.submittedCode.includes("find_max")) title = "Find Maximum Value";
            else if (submission.submittedCode.includes("reverse_list")) title = "Reverse List";
            else if (submission.submittedCode.includes("Festival_Name")) title = "Festival Data Query";
            else if (submission.submittedCode.includes("SELECT")) title = "SQL Query";
          }
          let difficulty = submission.solvedQuestion?.difficulty || "Medium";
          if (!submission.solvedQuestion && submission.submittedCode) {
            if (submission.submittedCode.length < 50) difficulty = "Easy";
            else if (submission.submittedCode.length > 150) difficulty = "Hard";
          }
          return (
            <div key={submission._id || index} className="flex items-center justify-between pb-3 border-b border-dsb-neutral3/30 last:border-0">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${submission.isCorrect ? "bg-emerald-500" : "bg-red-500"}`}></div>
                <div>
                  <div className="font-medium text-dsb-neutral2">{title}</div>
                  <div className="text-sm text-dsb-neutral2">
                    {new Date(submission.submittedAt).toLocaleDateString()} •
                    <Badge variant="outline" className="ml-2 bg-dsb-neutral3 text-dsb-neutral1">{difficulty}</Badge>
                  </div>
                </div>
              </div>
              <div className="text-sm text-dsb-neutral2">
                {new Date(submission.submittedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          );
        })}
        {submissions.length > 5 && (
          <Button variant="ghost" size="sm" onClick={() => setExpandedSubmissions(!expandedSubmissions)} className="w-full text-dsb-accent">
            {expandedSubmissions ? "Show Less" : `Show All (${submissions.length})`}
          </Button>
        )}
      </div>
    );
  }

  // Helper for live quiz results
  function renderLiveQuizResults(liveQuiz: any[]) {
    if (!liveQuiz || liveQuiz.length === 0) return <div className="text-center py-6 text-dsb-neutral2">No quiz results yet</div>;
    return (
      <div className="space-y-6">
        {liveQuiz.map((quiz, index) => (
          <div key={index}>
            <div className="flex justify-between mb-1">
              <span className="font-medium text-dsb-neutral2">{quiz.subject}</span>
              <span className="text-sm text-dsb-neutral2">{quiz.scores} / {quiz.totalScores}</span>
            </div>
            <Progress value={(quiz.scores / quiz.totalScores) * 100} className="h-2" />
          </div>
        ))}
      </div>
    );
  }

  // Stats for cards
  const solvedCount = userData?.solved?.length || 0;
  const solvedProgress = totalQuestions ? (solvedCount / totalQuestions) * 100 : 0;
  const currentStreak = streakData && streakData.subjectStreaks.size > 0 ? Math.max(...[...streakData.subjectStreaks.values()].map((s) => s.currentStreak)) : 0;
  const longestStreak = streakData && streakData.subjectStreaks.size > 0 ? Math.max(...[...streakData.subjectStreaks.values()].map((s) => s.longestStreak)) : 0;
  const successRate = userData && userData.submissionHistory.length > 0 ? Math.round((userData.submissionHistory.filter((s) => s.isCorrect).length / userData.submissionHistory.length) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="relative z-10 p-4 md:p-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-2">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white glow-text-subtle mb-2">
              Practice Dashboard
            </h1>
            <p className="text-dsb-neutral1">
              Track your learning progress and coding activities
            </p>
          </div>
          <Link to="https://practice.datasenseai.com/">
            <button onClick={handleButtonClick} className="text-dsb-accent font-semibold bg-black hover:bg-dsb-accent hover:text-black border-0 px-4 py-2 rounded-lg">
              Practice
            </button>
          </Link>
        </div>
        {/* Top cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Solved Questions */}
          <div className="neo-glass-dark p-6 rounded-xl border border-dsb-neutral3/30">
            <div className="text-lg font-semibold text-white mb-1">Solved Questions</div>
            <div className="text-dsb-neutral1 text-sm mb-2">Your progress</div>
            <div className="text-3xl font-bold mb-2 text-white">{solvedCount} / {totalQuestions}</div>
            <Progress value={solvedProgress} className="h-2 mb-4" />
            <div className="mt-2">
              <div className="text-sm font-medium mb-2 text-white">Recently Solved:</div>
              {renderRecentlySolved(userData?.solved || [])}
            </div>
          </div>
          {/* Current Streak */}
          <div className="neo-glass-dark p-6 rounded-xl border border-dsb-neutral3/30">
            <div className="text-lg font-semibold text-white mb-1">Current Streak</div>
            <div className="text-dsb-neutral1 text-sm mb-2">Keep it going!</div>
            <div className="text-3xl font-bold text-white mb-2">{currentStreak}</div>
            <div className="flex -space-x-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className={`w-6 h-6 rounded-full flex items-center justify-center ${i < 3 ? "bg-emerald-700" : "bg-dsb-neutral3"}`}>
                  <span className="text-xs text-white">{i + 1}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Longest Streak */}
          <div className="neo-glass-dark p-6 rounded-xl border border-dsb-neutral3/30">
            <div className="text-lg font-semibold text-white mb-1">Longest Streak</div>
            <div className="text-dsb-neutral1 text-sm mb-2">Your best run</div>
            <div className="text-3xl font-bold text-white mb-2">{longestStreak}</div>
          </div>
          {/* Success Rate */}
          <div className="neo-glass-dark p-6 rounded-xl border border-dsb-neutral3/30">
            <div className="text-lg font-semibold text-white mb-1">Success Rate</div>
            <div className="text-dsb-neutral1 text-sm mb-2">Correct submissions</div>
            <div className="text-3xl font-bold text-white mb-2">{successRate}%</div>
          </div>
        </div>

        {/* Activity Heatmap & Subject Streaks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Activity Heatmap */}
          <div className="neo-glass-dark p-6 rounded-xl border border-dsb-neutral3/30 lg:col-span-2">
            <div className="text-lg font-semibold text-white mb-1">Activity Heatmap</div>
            <div className="text-dsb-neutral1 text-sm mb-2">Your coding activity over time</div>
            {renderActivityHeatmap(streakData?.activityLog)}
          </div>
          {/* Subject Streaks */}
          <div className="neo-glass-dark p-6 rounded-xl border border-dsb-neutral3/30">
            <div className="text-lg font-semibold text-white mb-1">Subject Streaks</div>
            <div className="text-dsb-neutral1 text-sm mb-2">Your progress by topic</div>
            {renderSubjectStreaks(streakData?.subjectStreaks || new Map())}
          </div>
        </div>

        {/* Tabs for Recent Submissions and Live Quiz Results */}
        <Tabs value={tab} onValueChange={(v) => setTab(v as 'submissions' | 'quizzes')} className="mb-8">
          <TabsList className="mb-4 neo-glass-dark">
            <TabsTrigger
              value="submissions"
              className="text-white transition-colors px-4 py-2 rounded-md data-[state=active]:bg-dsb-accent/20 data-[state=active]:text-dsb-accent hover:bg-dsb-accent/10 hover:text-dsb-accent"
            >
              Recent Submissions
            </TabsTrigger>
            <TabsTrigger
              value="quizzes"
              className="text-white transition-colors px-4 py-2 rounded-md data-[state=active]:bg-dsb-accent/20 data-[state=active]:text-dsb-accent hover:bg-dsb-accent/10 hover:text-dsb-accent"
            >
              Live Quiz Results
            </TabsTrigger>
          </TabsList>
          <TabsContent value="submissions">
            <div className="neo-glass-dark p-6 rounded-xl border border-dsb-neutral3/30">
              <div className="text-lg font-semibold text-white mb-1">Recent Submissions</div>
              <div className="text-dsb-neutral1 text-sm mb-2">Your latest problem attempts</div>
              {renderRecentSubmissions(userData?.submissionHistory || [])}
            </div>
          </TabsContent>
          <TabsContent value="quizzes">
            <div className="neo-glass-dark p-6 rounded-xl border border-dsb-neutral3/30">
              <div className="text-lg font-semibold text-white mb-1">Live Quiz Performance</div>
              <div className="text-dsb-neutral1 text-sm mb-2">Your results from live quizzes</div>
              {renderLiveQuizResults(userData?.liveQuiz || [])}
            </div>
          </TabsContent>
        </Tabs>

        <div className="text-center text-sm text-white">
          <p>Keep up the good work! Your next milestone is just around the corner.</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPractice;