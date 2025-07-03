"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Progress } from "../components/ui/progress"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Button } from "../components/ui/button"
import axios from "axios"
import { useUser } from '@clerk/clerk-react'
import DashboardLayout from "@/components/layout/DashboardLayout"
import UserDetailModal from "@/components/UserDetailModal"

// Helper to strip 'user_' prefix if present
// function getBackendUserId(clerkId: string) {
//   return clerkId && clerkId.startsWith('user_') ? clerkId.replace('user_', '') : clerkId;
// }

export default function PracticeDashboard() {
  const { isLoaded, isSignedIn, user } = useUser()
  const [userData, setUserData] = useState(null)
  const [streakData, setStreakData] = useState(null)
  const [totalQuestions, setTotalQuestions] = useState(100)
  const [loading, setLoading] = useState(true)
  const [expandedSolved, setExpandedSolved] = useState(false)
  const [expandedSubmissions, setExpandedSubmissions] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userChecked, setUserChecked] = useState(false); // To avoid double fetch

  // On login, check if user exists in backend
  useEffect(() => {
    if (isLoaded && isSignedIn && user && !userChecked) {
      const backendUserId = user.id;
      axios.get(`https://server.datasenseai.com/practice-dashboard/${backendUserId}`)
        .then(res => {
          setShowProfileModal(false);
          setUserChecked(true);
        })
        .catch(err => {
          if (err.response?.status === 404) {
            setShowProfileModal(true);
            setUserChecked(true);
          } else {
            setShowProfileModal(false);
            setUserChecked(true);
          }
        });
    }
  }, [isLoaded, isSignedIn, user, userChecked]);

  // Only fetch dashboard data if user exists and modal is not shown
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user || showProfileModal === true) {
      setLoading(false)
      return
    }
    if (!userChecked) return;

    const backendUserId = user.id;
    console.log(user.id)

    setLoading(true);
    const fetchData = async () => {
      try {
        const [userDataResponse, streakDataResponse] = await Promise.allSettled([
          axios.get(`https://server.datasenseai.com/practice-dashboard/${backendUserId}`),
          axios.get(`https://server.datasenseai.com/question-attempt/streak/${backendUserId}`),
        ])

        let processedUserData = null
        let processedStreakData = null

        if (userDataResponse.status === "fulfilled" && userDataResponse.value.data) {
          const apiUserData = userDataResponse.value.data

          const matchedSubmissions =
            apiUserData.submissionHistory?.map((submission) => {
              const solvedQuestion = apiUserData.solved?.find((question) => question._id === submission.questionId)
              return {
                ...submission,
                solvedQuestion,
              }
            }) || []

          processedUserData = {
            username: user.username || user.firstName || "User",
            email: user.primaryEmailAddress?.emailAddress || "user@example.com",
            profileImageUrl: user.imageUrl || "/placeholder.svg?height=40&width=40",
            fuel: apiUserData.fuel || 75,
            isPremium: apiUserData.isPremium || false,
            solved: apiUserData.solved || [],
            submissionHistory: matchedSubmissions.slice().reverse(),
            liveQuiz: apiUserData.liveQuiz || [],
          }

          if (apiUserData.totalQuestions) {
            setTotalQuestions(apiUserData.totalQuestions)
          }
        } else {
          processedUserData = createMockUserData()
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

        setUserData(processedUserData)
        setStreakData(processedStreakData)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        setUserData(createMockUserData())
        setStreakData(createMockStreakData())
        setLoading(false)
      }
    }

    fetchData()
  }, [isLoaded, isSignedIn, user, showProfileModal, userChecked])

  function generateActivityLog() {
    const today = new Date()
    const activityLog: any = {}

    for (let i = 0; i < 60; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)

      const year = date.getFullYear().toString()
      const month = (date.getMonth() + 1).toString()
      const day = date.getDate().toString()

      if (!activityLog[year]) {
        activityLog[year] = { months: {} }
      }

      if (!activityLog[year].months[month]) {
        activityLog[year].months[month] = {}
      }

      activityLog[year].months[month][day] = Math.floor(Math.random() * 4)
    }

    return activityLog
  }

  function createMockUserData() {
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
    }
  }

  function createMockStreakData() {
    return {
      subjectStreaks: new Map([
        ["Algorithms", { currentStreak: 7, longestStreak: 14 }],
        ["Data Structures", { currentStreak: 3, longestStreak: 10 }],
        ["System Design", { currentStreak: 0, longestStreak: 5 }],
      ]),
      activityLog: generateActivityLog(),
    }
  }

  const processStreakData = () => {
    if (!streakData) return null

    const processedActivityLog = streakData.activityLog

    if (!(streakData.subjectStreaks instanceof Map)) {
      const subjectStreaksMap = new Map()
      if (streakData.subjectStreaks) {
        Object.entries(streakData.subjectStreaks).forEach(([subject, data]: [string, any]) => {
          subjectStreaksMap.set(subject, {
            currentStreak: data.currentStreak || 0,
            longestStreak: data.longestStreak || 0,
            lastActiveDate: data.lastActiveDate || new Date().toISOString(),
          })
        })
      }
      return {
        ...streakData,
        subjectStreaks: subjectStreaksMap,
        activityLog: processedActivityLog,
      }
    }

    return streakData
  }

  const processedStreakData = processStreakData()

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-dsb-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-lg text-white">Loading your practice dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!userData && !streakData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-lg text-white">No practice dashboard data available.</p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              Refresh
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // If modal is open, block dashboard rendering
  if (showProfileModal) {
    return (
      <DashboardLayout>
        <UserDetailModal
          open={showProfileModal}
          onOpenChange={setShowProfileModal}
          onClose={() => window.location.reload()}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="relative z-10">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white glow-text-subtle mb-2">
            Practice Dashboard
          </h1>
          <p className="text-dsb-neutral1">
            Track your learning progress and coding activities
          </p>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="neo-glass-dark border-dsb-neutral3/30 backdrop-blur-md hover:border-dsb-accent/50 transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-dsb-neutral1">Solved Questions</CardTitle>
              <CardDescription className="text-dsb-neutral2">Your progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white glow-text-subtle mb-2">
                {userData.solved?.length || 0} / {totalQuestions}
              </div>
              <Progress
                value={(userData.solved?.length / totalQuestions) * 100 || 0}
                className="h-2 mb-4 bg-dsb-neutral3/50"
                style={{
                  "--progress-background": "#00E2CA",
                } as React.CSSProperties}
              />

              {userData.solved && userData.solved.length > 0 && (
                <div className="mt-2">
                  <div className="text-sm font-medium mb-2 text-white">Recently Solved:</div>
                  <div className="space-y-2">
                    {userData.solved.slice(0, expandedSolved ? userData.solved.length : 3).map((question: any) => (
                      <div
                        key={question._id}
                        className="text-sm p-2 rounded-md bg-dsb-neutral3/20 border border-dsb-neutral3/30"
                      >
                        <div className="font-medium text-white">{question.title || "Untitled Question"}</div>
                        <div className="flex justify-between items-center mt-1">
                          <Badge
                            variant="outline"
                            className={
                              question.difficulty === "easy"
                                ? "bg-emerald-900/30 border-emerald-500/50 text-emerald-400"
                                : question.difficulty === "medium"
                                  ? "bg-amber-900/30 border-amber-500/50 text-amber-400"
                                  : "bg-red-900/30 border-red-500/50 text-red-400"
                            }
                          >
                            {question.difficulty || "Unknown"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>

                  {userData.solved.length > 3 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedSolved(!expandedSolved)}
                      className="mt-2 w-full text-dsb-accent hover:text-white hover:bg-dsb-accent/10"
                    >
                      {expandedSolved ? "Show Less" : `Show All (${userData.solved.length})`}
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="neo-glass-dark border-dsb-neutral3/30 backdrop-blur-md hover:border-dsb-accent/50 transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-dsb-neutral1">Current Streak</CardTitle>
              <CardDescription className="text-dsb-neutral2">Keep it going!</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold text-white glow-text-subtle">
                  {processedStreakData && processedStreakData.subjectStreaks.size > 0
                    ? Math.max(...[...processedStreakData.subjectStreaks.values()].map((s: any) => s.currentStreak))
                    : 0}
                </div>
                <div className="flex -space-x-1">
                  {Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded-full flex items-center justify-center bg-dsb-accent"
                      >
                        <span className="text-xs text-black font-bold">{i + 1}</span>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="neo-glass-dark border-dsb-neutral3/30 backdrop-blur-md hover:border-dsb-accent/50 transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-dsb-neutral1">Longest Streak</CardTitle>
              <CardDescription className="text-dsb-neutral2">Your best run</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white glow-text-subtle">
                {processedStreakData && processedStreakData.subjectStreaks.size > 0
                  ? Math.max(...[...processedStreakData.subjectStreaks.values()].map((s: any) => s.longestStreak))
                  : 0}
              </div>
            </CardContent>
          </Card>

          <Card className="neo-glass-dark border-dsb-neutral3/30 backdrop-blur-md hover:border-dsb-accent/50 transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-dsb-neutral1">Success Rate</CardTitle>
              <CardDescription className="text-dsb-neutral2">Correct submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white glow-text-subtle">
                {userData.submissionHistory && userData.submissionHistory.length > 0
                  ? Math.round(
                      (userData.submissionHistory.filter((s: any) => s.isCorrect).length /
                        userData.submissionHistory.length) *
                        100,
                    )
                  : 0}
                %
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Heatmap and Subject Streaks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2 neo-glass-dark border-dsb-neutral3/30 backdrop-blur-md hover:border-dsb-accent/50 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-white">Activity Heatmap</CardTitle>
              <CardDescription className="text-dsb-neutral2">
                Your coding activity over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1">
                {processedStreakData &&
                  processedStreakData.activityLog &&
                  Object.entries(processedStreakData.activityLog).flatMap(([year, yearData]: [string, any]) =>
                    Object.entries(yearData.months || {}).flatMap(([month, monthData]: [string, any]) =>
                      Object.entries(monthData || {}).map(([day, activity]: [string, any]) => {
                        const activityLevel =
                          typeof activity === "object"
                            ? Object.values(activity).reduce((sum: number, val: any) => sum + (typeof val === "number" ? val : 0), 0)
                            : typeof activity === "number"
                              ? activity
                              : 0

                        let bgColor
                        if (activityLevel === 0)
                          bgColor = "#1F2937"
                        else if (activityLevel === 1)
                          bgColor = "#065F46"
                        else if (activityLevel === 2)
                          bgColor = "#047857"
                        else bgColor = "#059669"

                        const subjectList =
                          typeof activity === "object"
                            ? Object.entries(activity)
                                .map(([subject, count]) => `${subject}: ${count}`)
                                .join(", ")
                            : ""

                        const tooltip = `${month}/${day}/${year}: ${activityLevel} activities${subjectList ? ` (${subjectList})` : ""}`

                        return (
                          <div
                            key={`${year}-${month}-${day}`}
                            className="w-4 h-4 rounded-sm"
                            style={{ backgroundColor: bgColor }}
                            title={tooltip}
                          />
                        )
                      }),
                    ),
                  )}
              </div>
            </CardContent>
          </Card>

          <Card className="neo-glass-dark border-dsb-neutral3/30 backdrop-blur-md hover:border-dsb-accent/50 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-white">Subject Streaks</CardTitle>
              <CardDescription className="text-dsb-neutral2">
                Your progress by topic
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {processedStreakData &&
                  [...processedStreakData.subjectStreaks.entries()].map(([subject, data]: [string, any]) => (
                    <div key={subject}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-white">{subject}</span>
                        <span className="text-sm text-dsb-neutral2">
                          {data.currentStreak} day{data.currentStreak !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <Progress
                        value={(data.currentStreak / (data.longestStreak || 1)) * 100}
                        className="h-2 bg-dsb-neutral3/50"
                        style={{
                          "--progress-background": "#8B5CF6",
                        } as React.CSSProperties}
                      />
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Submissions and Quizzes */}
        <Tabs defaultValue="submissions" className="mb-8">
          <TabsList className="mb-4 bg-dsb-neutral3/20 border border-dsb-neutral3/30">
            <TabsTrigger
              value="submissions"
              className="text-white data-[state=active]:bg-dsb-accent data-[state=active]:text-black"
            >
              Recent Submissions
            </TabsTrigger>
            <TabsTrigger
              value="quizzes"
              className="text-white data-[state=active]:bg-dsb-accent data-[state=active]:text-black"
            >
              Live Quiz Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="submissions">
            <Card className="neo-glass-dark border-dsb-neutral3/30 backdrop-blur-md hover:border-dsb-accent/50 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-white">Recent Submissions</CardTitle>
                <CardDescription className="text-dsb-neutral2">
                  Your latest problem attempts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userData.submissionHistory && userData.submissionHistory.length > 0 ? (
                    userData.submissionHistory
                      .slice(0, expandedSubmissions ? userData.submissionHistory.length : 5)
                      .map((submission: any, index: number) => {
                        let title = submission.solvedQuestion?.title || "Problem"
                        if (!title && submission.submittedCode) {
                          if (submission.submittedCode.includes("find_max")) {
                            title = "Find Maximum Value"
                          } else if (submission.submittedCode.includes("reverse_list")) {
                            title = "Reverse List"
                          } else if (submission.submittedCode.includes("Festival_Name")) {
                            title = "Festival Data Query"
                          } else if (submission.submittedCode.includes("SELECT")) {
                            title = "SQL Query"
                          }
                        }

                        let difficulty = submission.solvedQuestion?.difficulty || "Medium"
                        if (!submission.solvedQuestion && submission.submittedCode) {
                          if (submission.submittedCode.length < 50) {
                            difficulty = "Easy"
                          } else if (submission.submittedCode.length > 150) {
                            difficulty = "Hard"
                          }
                        }

                        return (
                          <div
                            key={submission._id || index}
                            className="flex items-center justify-between pb-3 last:border-0 border-b border-dsb-neutral3/30"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor: submission.isCorrect ? "#10B981" : "#EF4444",
                                }}
                              ></div>
                              <div>
                                <div className="font-medium text-white">{title}</div>
                                <div className="text-sm text-dsb-neutral2">
                                  {new Date(submission.submittedAt).toLocaleDateString()} •
                                  <Badge
                                    variant="outline"
                                    className={`ml-2 ${
                                      difficulty.toLowerCase() === "easy"
                                        ? "bg-emerald-900/30 border-emerald-500/50 text-emerald-400"
                                        : difficulty.toLowerCase() === "medium"
                                          ? "bg-amber-900/30 border-amber-500/50 text-amber-400"
                                          : "bg-red-900/30 border-red-500/50 text-red-400"
                                    }`}
                                  >
                                    {difficulty}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="text-sm text-dsb-neutral2">
                              {new Date(submission.submittedAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        )
                      })
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-dsb-neutral2">No submissions yet</p>
                    </div>
                  )}

                  {userData.submissionHistory && userData.submissionHistory.length > 5 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedSubmissions(!expandedSubmissions)}
                      className="w-full text-dsb-accent hover:text-white hover:bg-dsb-accent/10"
                    >
                      {expandedSubmissions ? "Show Less" : `Show All (${userData.submissionHistory.length})`}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quizzes">
            <Card className="neo-glass-dark border-dsb-neutral3/30 backdrop-blur-md hover:border-dsb-accent/50 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-white">Live Quiz Performance</CardTitle>
                <CardDescription className="text-dsb-neutral2">
                  Your results from live quizzes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {userData.liveQuiz && userData.liveQuiz.length > 0 ? (
                    userData.liveQuiz.map((quiz: any, index: number) => (
                      <div key={index}>
                        <div className="flex justify-between mb-1">
                          <span className="font-medium text-white">{quiz.subject}</span>
                          <span className="text-sm text-dsb-neutral2">
                            {quiz.scores} / {quiz.totalScores}
                          </span>
                        </div>
                        <Progress
                          value={(quiz.scores / quiz.totalScores) * 100}
                          className="h-2 bg-dsb-neutral3/50"
                          style={{
                            "--progress-background": "#8B5CF6",
                          } as React.CSSProperties}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-dsb-neutral2">No quiz results yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-center text-sm text-dsb-neutral2">
          <p>Keep up the good work! Your next milestone is just around the corner.</p>
        </div>
      </div>
    </DashboardLayout>
  )
}