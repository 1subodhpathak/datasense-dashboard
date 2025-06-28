import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import ChallengeOptions from "@/components/ChallengeOptions";
import DifficultySelector from "@/components/DifficultySelector";
import SkillCategorySelector from "@/components/SkillCategorySelector";
import CustomizeOptions from "@/components/CustomizeOptions";
import PlayerStats from "@/components/PlayerStats";
import ChallengePreview from "@/components/ChallengePreview";
import ActionButtons from "@/components/ActionButtons";
import { useIsMobile } from "@/hooks/use-mobile";
import DashboardLayout from "@/components/layout/DashboardLayout";
import OnboardingTour from "@/components/Onboarding/OnboardingTour";
import { HelpCircle } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { useWebSocketContext } from "@/util/WebsocketProvider";
import { useNotification } from "@/hooks/NotificationProvider";

type ChallengeType = "bullet_surge" | "rapid_sprint" | "daily_dash";
type Difficulty = "beginner" | "intermediate" | "advanced";
type SkillCategory = "sql" | "python" | "non_coding";

const ONBOARDING_KEY = 'data-sense-arena-onboarding-completed';

const Start = () => {
  // Existing states with localStorage persistence
  
  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeType | null>(() => {
    const saved = localStorage.getItem("selectedChallengeType");
    return saved as ChallengeType || null;
  });
  
  const [selectedTime, setSelectedTime] = useState<number | null>(() => {
    const saved = localStorage.getItem("selectedTime");
    return saved ? Number.parseInt(saved) : null;
  });
  
  const [difficulty, setDifficulty] = useState<Difficulty>(() => {
    const saved = localStorage.getItem("selectedDifficulty");
    return (saved as Difficulty) || "beginner";
  });
  
  const [topic, setTopic] = useState(() => {
    return localStorage.getItem("selectedTopic") || "sql";
  });
  
  const [showCustomize, setShowCustomize] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem("soundEnabled");
    return saved ? saved === "true" : true;
  });
  
  // Fixed: Ensure skillCategory is always a single string value with 'sql' as default
  const [skillCategory, setSkillCategory] = useState<SkillCategory>(() => {
    const saved = localStorage.getItem("skillCategory");
    // Ensure we return a valid SkillCategory or default to "sql"
    if (saved === "sql" || saved === "python" || saved === "non_coding") {
      return saved as SkillCategory;
    }
    return "sql"; // Default to SQL
  });
  
  const [questionCount, setQuestionCount] = useState(() => {
    const saved = localStorage.getItem("questionCount");
    return saved ? Number.parseInt(saved) : 0;
  });
  
  const [timer, setTimer] = useState(() => {
    const saved = localStorage.getItem("customTimer");
    return saved ? Number.parseInt(saved) : 0;
  });
  
  const [easyCount, setEasyCount] = useState(0);
  const [mediumCount, setMediumCount] = useState(0);
  const [hardCount, setHardCount] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // Socket and game states
  const [gameId, setGameId] = useState("");
  const [lobbyStatus, setLobbyStatus] = useState("idle");
  const [isSearching, setIsSearching] = useState(false);
  const [searchTime, setSearchTime] = useState(0);
  const [error, setError] = useState("");
  const [alertMessage, setAlertMessage] = useState<{ title: string; description: string } | null>(null);
  
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { user } = useUser();
  const { socket, isConnected } = useWebSocketContext();
  const { showSuccess, showError, showWarning, showInfo } = useNotification();
  
  const [clerkId, setClerkId] = useState<string>("");
  const [playerName, setPlayerName] = useState<string>("");

  // Persist states to localStorage
  useEffect(() => {
    if (selectedChallenge) localStorage.setItem("selectedChallengeType", selectedChallenge);
    if (selectedTime) localStorage.setItem("selectedTime", selectedTime.toString());
    localStorage.setItem("selectedDifficulty", difficulty);
    localStorage.setItem("selectedTopic", topic);
    localStorage.setItem("soundEnabled", soundEnabled.toString());
    localStorage.setItem("skillCategory", skillCategory);
    localStorage.setItem("questionCount", questionCount.toString());
    localStorage.setItem("customTimer", timer.toString());
  }, [selectedChallenge, selectedTime, difficulty, topic, soundEnabled, skillCategory, questionCount, timer]);

  // Search timer
  useEffect(() => {
    let searchTimer: NodeJS.Timeout;
    if (isSearching) {
      searchTimer = setInterval(() => {
        setSearchTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(searchTimer);
  }, [isSearching]);

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem(ONBOARDING_KEY);
    if (!hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  // Set clerkId and playerName from Clerk user
  useEffect(() => {
    if (user) {
      setClerkId(user.id);
      setPlayerName(user.fullName || user.username || user.primaryEmailAddress?.emailAddress || "");
    }
  }, [user]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const onRoomCreated = (data: any) => {
      console.log("Room created:", data);
      setLobbyStatus("waiting");
      setGameId(data.gameId);
      setAlertMessage({
        title: "Game Created Successfully!",
        description: "Share the Game ID with your friend to start playing.",
      });
    };

    const onPlayerJoined = (data: any) => {
      if (data.gameId === gameId) {
        setLobbyStatus("starting");
        setAlertMessage({
          title: "Player Joined!",
          description: "Game starting soon...",
        });
      }
    };

    const onGameStart = async (data: any) => {
      if (!selectedChallenge || !topic) {
        setError("Please select both challenge type and subject");
        return;
      }

      const botParam = data.isBot ? '&isNexus=true' : '';
      navigate(
        `/challenge?gameId=${data.gameId}&challengeType=${data.challengeType || selectedChallenge}&selectedSubject=${data.subject || topic}&customTime=${data.customTime || selectedTime}${botParam}`,
        { state: { data } }
      );
    };

    const onError = (data: any) => {
      setLobbyStatus("idle");
      setError(data.message);
      setAlertMessage({
        title: "Error",
        description: data.message,
      });
      setIsSearching(false);
    };

    const onSearchingForPlayer = (data: any) => {
      setIsSearching(true);
      setError("");
    };

    const onSearchCancelled = () => {
      setIsSearching(false);
      setSearchTime(0);
    };

    socket.on("roomCreated", onRoomCreated);
    socket.on("playerJoined", onPlayerJoined);
    socket.on("gameStart", onGameStart);
    socket.on("error", onError);
    socket.on('searchingForPlayer', onSearchingForPlayer);
    socket.on('searchCancelled', onSearchCancelled);

    return () => {
      socket.off("roomCreated", onRoomCreated);
      socket.off("playerJoined", onPlayerJoined);
      socket.off("gameStart", onGameStart);
      socket.off("error", onError);
      socket.off('searchingForPlayer');
      socket.off('searchCancelled');
    };
  }, [socket, gameId, navigate, topic, selectedTime, clerkId, selectedChallenge]);

  const handleOnboardingClose = () => {
    setShowOnboarding(false);
    localStorage.setItem(ONBOARDING_KEY, 'true');
  };

  const handleChallengeSelect = (type: ChallengeType) => {
    setSelectedChallenge(type);
    setSelectedTime(null);
  };

  // Fixed: Ensure skillCategory handler accepts single value
  const handleSkillCategoryChange = (category: SkillCategory) => {
    setSkillCategory(category);
  };

  // Selection is complete when challenge type, time, difficulty and skill are selected
  const isSelectionComplete = selectedChallenge !== null && selectedTime !== null && difficulty && !!skillCategory;

  const handleStartChallenge = () => {
    if (!isSelectionComplete) return;
    navigate("/challenge");
  };

  const handleReset = () => {
    setSelectedChallenge(null);
    setSelectedTime(null);
    setDifficulty("beginner");
    setShowCustomize(false);
    setSkillCategory("sql"); // Reset to SQL default
    setQuestionCount(0);
    
    // Clear localStorage
    localStorage.removeItem("selectedChallengeType");
    localStorage.removeItem("selectedTime");
    localStorage.removeItem("selectedDifficulty");
    localStorage.removeItem("selectedTopic");
    localStorage.removeItem("skillCategory");
    localStorage.removeItem("questionCount");
    localStorage.removeItem("customTimer");
  };

  const handleHelpClick = () => {
    setShowOnboarding(true);
  };

  // Auto-update timer and difficulty distribution when questionCount changes
  useEffect(() => {
    if (questionCount > 0) {
      setTimer(questionCount * 4);
      setEasyCount(Math.round(questionCount * 0.4));
      setMediumCount(Math.round(questionCount * 0.35));
      setHardCount(questionCount - Math.round(questionCount * 0.4) - Math.round(questionCount * 0.35));
    }
  }, [questionCount]);

  // Difficulty distribution handlers
  const handleEasyChange = (val: number) => {
    let easy = val;
    let medium = mediumCount;
    let hard = questionCount - easy - medium;
    if (hard < 0) {
      medium += hard;
      hard = 0;
    }
    setEasyCount(easy);
    setMediumCount(medium);
    setHardCount(hard);
  };

  const handleMediumChange = (val: number) => {
    let medium = val;
    let easy = easyCount;
    let hard = questionCount - easy - medium;
    if (hard < 0) {
      easy += hard;
      hard = 0;
    }
    setMediumCount(medium);
    setEasyCount(easy);
    setHardCount(hard);
  };

  const handleHardChange = (val: number) => {
    let hard = val;
    let easy = easyCount;
    let medium = questionCount - easy - hard;
    if (medium < 0) {
      easy += medium;
      medium = 0;
    }
    setHardCount(hard);
    setEasyCount(easy);
    setMediumCount(medium);
  };

  const isValid = easyCount + mediumCount + hardCount === questionCount;
  
  const setBalanced = () => {
    setEasyCount(Math.round(questionCount * 0.4));
    setMediumCount(Math.round(questionCount * 0.35));
    setHardCount(questionCount - Math.round(questionCount * 0.4) - Math.round(questionCount * 0.35));
  };
  
  const setEasyFocused = () => {
    setEasyCount(Math.round(questionCount * 0.7));
    setMediumCount(Math.round(questionCount * 0.2));
    setHardCount(questionCount - Math.round(questionCount * 0.7) - Math.round(questionCount * 0.2));
  };
  
  const setHardcore = () => {
    setEasyCount(Math.round(questionCount * 0.1));
    setMediumCount(Math.round(questionCount * 0.3));
    setHardCount(questionCount - Math.round(questionCount * 0.1) - Math.round(questionCount * 0.3));
  };

  const renderActionButtons = () => (
    <div data-tour="start">
      <ActionButtons
        challengeType={selectedChallenge}
        time={selectedTime}
        difficulty={difficulty}
        userId={clerkId}
        playerName={playerName}
        subject={topic}
        isSelectionComplete={isSelectionComplete}
        onStartChallenge={handleStartChallenge}
        onReset={handleReset}
        isSearching={isSearching}
        searchTime={searchTime}
        alertMessage={alertMessage}
        onAlertClose={() => setAlertMessage(null)}
      />
    </div>
  );

  return (
    <DashboardLayout>
      <div className="relative min-h-screen flex flex-col lg:flex-row p-4 md:p-6 gap-6 overflow-hidden">
        {/* Main Section */}
        <main className="relative z-10 flex-1 lg:w-[70%] space-y-6 md:space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-4xl font-bold text-white bg-gradient-to-r from-dsb-accent to-white bg-clip-text text-transparent">
              Choose Your Challenge
            </h1>

            <button
              onClick={handleHelpClick}
              className="p-2 rounded-full bg-[#1a1f2e]/80 hover:bg-[#1a1f2e] border border-[#00E2CA]/20 hover:border-[#00E2CA]/40 transition-all duration-300 group"
            >
              <HelpCircle className="w-5 h-5 text-[#00E2CA]/60 group-hover:text-[#00E2CA]" />
              <span className="sr-only">Show Help</span>
            </button>
          </div>

          <div data-tour="challenges">
            <ChallengeOptions
              selectedChallenge={selectedChallenge}
              onChallengeSelect={handleChallengeSelect}
              onTimeSelect={setSelectedTime}
            />
          </div>

          <div className="bg-black/50 backdrop-blur-md rounded-xl p-5 md:p-7 space-y-6 md:space-y-8 border border-dsb-accent/20 shadow-[0_0_20px_rgba(0,226,202,0.1)]">
            <div data-tour="difficulty">
              <DifficultySelector
                difficulty={difficulty}
                onChange={setDifficulty}
              />
            </div>

            <div data-tour="skills">
              <SkillCategorySelector
                skillCategory={skillCategory}
                onChange={handleSkillCategoryChange}
              />
            </div>

            {/* <div data-tour="customize">
              <CustomizeOptions
                questionCount={questionCount}
                timer={timer}
                soundEnabled={soundEnabled}
                showCustomize={showCustomize}
                onQuestionCountChange={val => setQuestionCount(val)}
                onTimerChange={setTimer}
                onSoundEnabledChange={setSoundEnabled}
                onShowCustomizeChange={setShowCustomize}
              />
            </div> */}
          </div>

          {/* Error/Alert Messages */}
          {/* {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg">
              {error}
            </div>
          )} */}

          {/* {isSearching && (
            <div className="bg-blue-100 text-blue-700 p-3 rounded-lg">
              Searching for opponent... ({Math.floor(searchTime / 60)}:{(searchTime % 60).toString().padStart(2, '0')})
            </div>
          )} */}

          {/* Mobile action buttons appear after the main section */}
          {isMobile && (
            <div className="mt-6">
              {renderActionButtons()}
            </div>
          )}
        </main>

        {/* Sidebar */}
        {!isMobile ? (
          <aside className="bg-black/60 backdrop-blur-xl rounded-xl lg:w-[30%] p-5 md:p-7 space-y-6 md:space-y-8 flex flex-col relative z-10 border border-dsb-neutral3/40 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <div className="flex-1 space-y-6 md:space-y-8">
              <PlayerStats level={4} streak={3} />

              {selectedChallenge && (
                <div data-tour="preview">
                  <ChallengePreview
                    selectedChallenge={selectedChallenge}
                    selectedTime={selectedTime}
                    difficulty={difficulty}
                    skillCategories={skillCategory}
                    questionCount={questionCount}
                  />
                </div>
              )}
            </div>

            {renderActionButtons()}
          </aside>
        ) : (
          <aside className="bg-black/60 backdrop-blur-xl rounded-xl p-5 md:p-7 space-y-6 md:space-y-8 relative z-10 border border-dsb-neutral3/40 shadow-[0_0_30px_rgba(0,0,0,0.5)] mt-4">
            <PlayerStats level={4} streak={3} />

            {selectedChallenge && (
              <div data-tour="preview">
                <ChallengePreview
                  selectedChallenge={selectedChallenge}
                  selectedTime={selectedTime}
                  difficulty={difficulty}
                  skillCategories={skillCategory}
                  questionCount={questionCount}
                />
              </div>
            )}
          </aside>
        )}
      </div>

      <OnboardingTour isOpen={showOnboarding} onClose={handleOnboardingClose} />
    </DashboardLayout>
  );
};

export default Start;