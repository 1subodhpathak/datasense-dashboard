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

// --- Add TypeScript types ---
type SubjectStreak = {
  currentStreak: number
  longestStreak: number
  lastActiveDate?: string | null
}

type SubjectStreaksMap = Map<string, SubjectStreak>

type ActivityLog = {
  [year: string]: {
    months: {
      [month: string]: {
        [day: string]: number | { [subject: string]: number }
      }
    }
  }
}

type StreakData = {
  subjectStreaks: SubjectStreaksMap
  activityLog: ActivityLog
}

export default function PracticeDashboard() {
  const { isLoaded, isSignedIn, user } = useUser()
  const [userData, setUserData] = useState<any>(null)
  const [streakData, setStreakData] = useState<StreakData | null>(null)
  const [totalQuestions, setTotalQuestions] = useState(100)
  const [loading, setLoading] = useState(true)
  const [expandedSolved, setExpandedSolved] = useState(false)
  const [expandedSubmissions, setExpandedSubmissions] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [userChecked, setUserChecked] = useState(false)

  // Create mock data functions
  function generateActivityLog() {
    const today = new Date()
    const activityLog = {}

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
      username: "CodeMaster",
      email: "codemaster@example.com",
      profileImageUrl: "/placeholder.svg?height=40&width=40",
      fuel: 75,
      isPremium: true,
      solved: [
        { _id: "1", title: "SQL Basics", difficulty: "easy" },
        { _id: "2", title: "Array Manipulation", difficulty: "medium" },
        { _id: "3", title: "Graph Traversal", difficulty: "hard" },
        { _id: "4", title: "String Reversal", difficulty: "easy" },
        { _id: "5", title: "Binary Search", difficulty: "medium" },
        { _id: "6", title: "Tree Height", difficulty: "hard" },
        { _id: "7", title: "SQL Joins", difficulty: "medium" },
        { _id: "8", title: "Sorting Algorithms", difficulty: "easy" },
        { _id: "9", title: "Dynamic Programming", difficulty: "hard" },
        { _id: "10", title: "Recursion Basics", difficulty: "easy" }
      ],
      submissionHistory: [
        {
          _id: "a",
          isCorrect: true,
          submittedCode: "SELECT * FROM users;",
          submittedAt: new Date(Date.now() - 3600000).toISOString(),
          solvedQuestion: { title: "SQL Basics", difficulty: "easy" }
        },
        {
          _id: "b",
          isCorrect: false,
          submittedCode: "def reverse_list(lst): return lst[::-1]",
          submittedAt: new Date(Date.now() - 86400000).toISOString(),
          solvedQuestion: { title: "String Reversal", difficulty: "easy" }
        },
        {
          _id: "c",
          isCorrect: true,
          submittedCode: "function binarySearch(arr, x) { /* ... */ }",
          submittedAt: new Date(Date.now() - 172800000).toISOString(),
          solvedQuestion: { title: "Binary Search", difficulty: "medium" }
        }
      ],
      liveQuiz: [
        { subject: "Algorithms", scores: 85, totalScores: 100 },
        { subject: "Data Structures", scores: 70, totalScores: 100 },
        { subject: "System Design", scores: 60, totalScores: 100 }
      ]
    }
  }

  function createMockStreakData(): StreakData {
    return {
      subjectStreaks: new Map([
        ["Algorithms", { currentStreak: 7, longestStreak: 14 }],
        ["Data Structures", { currentStreak: 3, longestStreak: 10 }],
        ["System Design", { currentStreak: 0, longestStreak: 5 }],
      ]),
      activityLog: generateActivityLog(),
    }
  }

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
            setShowProfileModal(false);
            setUserChecked(true);
          } else {
            setShowProfileModal(false);
            setUserChecked(true);
          }
        });
    }
  }, [isLoaded, isSignedIn, user, userChecked]);

  // Fetch dashboard data
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) {
      console.log('User not loaded or signed in, setting loading to false')
      setLoading(false)
      return
    }
    
    if (showProfileModal === true) {
      console.log('Profile modal is showing, setting loading to false')
      setLoading(false)
      return
    }

    if (!userChecked) {
      console.log('User not checked yet, waiting...')
      return;
    }

    const backendUserId = user.id;
    console.log('Fetching data for user:', user.id)

    setLoading(true);
    const fetchData = async () => {
      try {
        console.log('Starting API calls...')
        const [userDataResponse, streakDataResponse] = await Promise.allSettled([
          axios.get(`https://server.datasenseai.com/practice-dashboard/${backendUserId}`),
          axios.get(`https://server.datasenseai.com/question-attempt/streak/${backendUserId}`),
        ])

        let processedUserData = null
        let processedStreakData = null

        if (userDataResponse.status === "fulfilled" && userDataResponse.value.data) {
          console.log('API success for userData')
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
          console.log('API failed for userData, using mock data')
          processedUserData = createMockUserData()
        }

        if (streakDataResponse.status === "fulfilled" && streakDataResponse.value.data) {
          console.log('API success for streakData')
          const apiStreakData = streakDataResponse.value.data;
          
          // Convert the API response to the expected format
          const subjectStreaksMap = new Map()
          if (apiStreakData.subjectStreaks) {
            Object.entries(apiStreakData.subjectStreaks).forEach(([subject, data]) => {
              subjectStreaksMap.set(subject, {
                currentStreak: (data as SubjectStreak).currentStreak || 0,
                longestStreak: (data as SubjectStreak).longestStreak || 0,
                lastActiveDate: (data as SubjectStreak).lastActiveDate || null,
              })
            })
          }
          
          processedStreakData = {
            subjectStreaks: subjectStreaksMap,
            activityLog: apiStreakData.activityLog || generateActivityLog(),
          };
        } else {
          console.log('API failed for streakData, using mock data')
          processedStreakData = createMockStreakData();
        }

        console.log('Setting userData:', processedUserData)
        console.log('Setting streakData:', processedStreakData)
        
        setUserData(processedUserData)
        setStreakData(processedStreakData)
        
        console.log('Setting loading to false')
        setLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        console.log('Exception occurred, using mock data')
        const mockUserData = createMockUserData()
        const mockStreakData = createMockStreakData()
        
        console.log('Setting mock userData:', mockUserData)
        console.log('Setting mock streakData:', mockStreakData)
        
        setUserData(mockUserData)
        setStreakData(mockStreakData)
        setLoading(false)
      }
    }

    fetchData()
  }, [isLoaded, isSignedIn, user, showProfileModal, userChecked])

  // Debug logs
  console.log('Current state:', { 
    loading, 
    userData: !!userData, 
    streakData: !!streakData, 
    showProfileModal, 
    userChecked,
    isLoaded,
    isSignedIn,
    hasUser: !!user
  })

  // Early returns for different states
  if (!isLoaded) {
    console.log('Clerk not loaded yet')
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-dsb-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-lg text-white">Loading authentication...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!isSignedIn || !user) {
    console.log('User not signed in')
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-lg text-white">Please sign in to view your practice dashboard.</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (loading) {
    console.log('Still loading data')
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

  // If modal is open, show modal
  if (showProfileModal) {
    console.log('Showing profile modal')
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

  // Force set mock data if missing - this ensures we always have data to render
  if (!userData) {
    console.log('Force setting mock userData')
    setUserData(createMockUserData())
  }
  
  if (!streakData) {
    console.log('Force setting mock streakData')
    setStreakData(createMockStreakData())
  }

  // If we still don't have data after setting mock data, show loading
  if (!userData || !streakData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-lg text-white">Preparing dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  console.log('Rendering main dashboard content')

  return (
    <DashboardLayout>
      <div className="relative z-10 min-h-screen">
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
                    {userData.solved.slice(0, expandedSolved ? userData.solved.length : 3).map((question) => (
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
                  {streakData && streakData.subjectStreaks.size > 0
                    ? Math.max(...[...streakData.subjectStreaks.values()].map((s) => s.currentStreak))
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
                {streakData && streakData.subjectStreaks.size > 0
                  ? Math.max(...[...streakData.subjectStreaks.values()].map((s) => s.longestStreak))
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
                      (userData.submissionHistory.filter((s) => s.isCorrect).length /
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
                {streakData &&
                  streakData.activityLog &&
                  Object.entries(streakData.activityLog).flatMap(([year, yearData]) =>
                    Object.entries((yearData as { months: Record<string, any> }).months || {}).flatMap(([month, monthData]) =>
                      Object.entries(monthData as Record<string, any> || {}).map(([day, activity]) => {
                        const activityLevel =
                          typeof activity === "object"
                            ? Object.values(activity as Record<string, number>).reduce((sum, val) => sum + (typeof val === "number" ? val : 0), 0)
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
                            ? Object.entries(activity as Record<string, number>)
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
                {streakData &&
                  [...streakData.subjectStreaks.entries()].map(([subject, data]) => (
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
                      .map((submission, index) => {
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
                    userData.liveQuiz.map((quiz, index) => (
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