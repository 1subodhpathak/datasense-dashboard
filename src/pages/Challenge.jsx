// DataWars.jsx - Fixed version with better error handling and fallbacks

import React, { useEffect, useState, useMemo } from "react"
import { Maximize2, Minimize2, Moon, Sun } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { CodeEditor } from "../components/challenge/Code-editor"
import { QuestionPanel } from "../components/challenge/Question-panel"
import { Button } from "../components/ui/button"
import { useTheme } from "../lib/theme-context"
import { useWebSocketContext } from "@/util/WebsocketProvider"
import Result from "@/components/challenge/Game-result"
import { useLocation } from "react-router-dom"
import GameStartAnimation from "@/components/challenge/GameStartAnimation"
import ConnectionStatusPopup from "@/components/challenge/ConnectionStatusPopup"
import PlayerAbandoned from "@/components/challenge/PlayerAbondedPopup"
import { useUser } from '@clerk/clerk-react'
import axios from 'axios';

import { createAvatar } from '@dicebear/core';
import { dylan } from '@dicebear/collection';

export default function DataWars() {
  const { isLoaded, isSignedIn, user } = useUser()
  const [time, setTime] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [showIntro, setShowIntro] = useState(true)
  const [playersReady, setPlayersReady] = useState(false)
  const location = useLocation()
  const [userId, setUserId] = useState(null)
  const { data } = location.state || {}
  const [isAbonded, setIsAbonded] = useState(false)
  const [gameStatus, setGameStatus] = useState({
    isWinner: false,
    isOpponentWon: false,
    winnerName: null,
    isTie: false,
    margin: null,
  })
  const [playerData, setPlayerData] = useState(null)
  
  // Add fallback for theme context
  const themeContext = useTheme()
  const theme = themeContext?.theme || 'dark'
  const toggleTheme = themeContext?.toggleTheme || (() => {})

  //Bot states
  const [isBotGame, setIsBotGame] = useState(false);
  const [botTimer, setBotTimer] = useState(null);
  const [isUserWon, setIsUserWon] = useState(false);

  // Add fallback for WebSocket context
  const wsContext = useWebSocketContext()
  const { socket, isConnected } = wsContext || { socket: null, isConnected: false }

  const challengeType = new URLSearchParams(window.location.search).get("challengeType")
  const subject = new URLSearchParams(window.location.search).get("selectedSubject")
  const customTime = new URLSearchParams(window.location.search).get("customTime")

  // Get isBot from URL params
  const isBot = new URLSearchParams(window.location.search).get("isNexus") === "true";

  const handleDataFromChild = (data) => {
    setIsUserWon(data);
  };

  useEffect(() => {
    if(isBot === true && isUserWon){
      setGameStatus({
        isWinner: true,
        isOpponentWon: false,
        winnerName: data?.players[0], // Player's name
        isTie: false,
        margin: "You completed the challenge faster",
      });
    } else {
      console.log(isUserWon)
    }
  }, [isBot, isUserWon])

  // Add error handling for avatar generation
  const generateAvatarUrl = (seed) => {
    try {
      const svg = createAvatar(dylan, { seed, size: 128 }).toString();
      return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
    } catch (error) {
      console.error('Avatar generation failed:', error);
      return '/api/placeholder/128/128'; // Fallback image
    }
  };
  
  const player1Avatar = useMemo(() => generateAvatarUrl(data?.players?.[0] || 'player1'), [data?.players?.[0]]);
  const player2Avatar = useMemo(() => generateAvatarUrl(data?.players?.[1] || 'player2'), [data?.players?.[1]]);

  // Initialize bot game if needed
  useEffect(() => {
    if (isBot) {
      setIsBotGame(true);
      initializeBotGame();
    }
  }, [isBot]);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      setUserId(user.id)
    }
  }, [isLoaded, isSignedIn, user])

  const initializeBotGame = () => {
    // Clear any existing bot timer
    if (botTimer) {
      clearTimeout(botTimer);
    }

    // Random time between 5-15 minutes in milliseconds
    const botDecisionTime = (Math.floor(Math.random() * (15 - 5 + 1)) + 5) * 60 * 1000;
    
    // Random win/lose decision
    const botWillWin = Math.random() < 0.5;

    // Set timer for bot's move
    const timer = setTimeout(() => {
      if (botWillWin) {
        setGameStatus({
          isWinner: false,
          isOpponentWon: true,
          winnerName: data?.players?.[1] || 'Bot', // Bot's name
          isTie: false,
          margin: "Opponent completed the challenge faster!",
        });
      } else {
        setGameStatus({
          isWinner: true,
          isOpponentWon: false,
          winnerName: data?.players?.[0] || 'Player', // Player's name
          isTie: false,
          margin: "You completed the challenge faster!",
        });
      }
    }, botDecisionTime);

    setBotTimer(timer);
  };

  // Cleanup bot timer when component unmounts or game ends
  useEffect(() => {
    return () => {
      if (botTimer) {
        clearTimeout(botTimer);
      }
    };
  }, [botTimer]);

  // Ensure players data is ready
  useEffect(() => {
    if (data?.players?.length >= 2) {
      setPlayersReady(true)
      setPlayerData(data)
    }
  }, [data])

  // WebSocket event handlers with better error handling
  useEffect(() => {
    if (!socket || !isConnected) return;
  
    const handleGameEnded = async (data) => {
      console.log("Game ended event received:", data);
      
      const { isWinner, isOpponentWon, winnerName } = data;
      
      // Update game status
      setGameStatus({
        isWinner,
        isOpponentWon,
        winnerName,
        isTie: !isWinner && !isOpponentWon,
        margin: isWinner ? "You won!" : isOpponentWon ? "Opponent won!" : "It's a tie!"
      });
      
      let result = "none";
      if (isWinner) {
        try {
          result = "won";
        } catch (error) {
          console.error("Failed to credit fuel:", error);
        }
      } else if (isOpponentWon) {
        result = "lost";
      } else {
        result = "tie";
      }
    };
  
    socket.on("gameEnded", handleGameEnded);
  
    return () => {
      socket.off("gameEnded", handleGameEnded);
    };
  }, [socket, isConnected, userId, challengeType, subject]);

  useEffect(() => {
    if (!socket || !isConnected) return;
  
    const handleGameForfeit = async (data) => {
      setIsAbonded(true);  
    };
  
    socket.on("gameForfeited", handleGameForfeit);
  
    return () => {
      socket.off("gameForfeited", handleGameForfeit);
    };
  }, [socket, isConnected, userId]);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullScreen(true)
    } else if (document.exitFullscreen) {
      document.exitFullscreen()
      setIsFullScreen(false)
    }
  }

  // Timer logic with better error handling
  useEffect(() => {
    let mappedChallengeType = 0
    const timeInMinutes = parseInt(customTime) || 10; // Default to 10 minutes

    switch (challengeType) {
      case "Python Bullet Surge - Easy":
      case "Python Bullet Surge - Medium":
      case "Python Bullet Surge - Hard":
        mappedChallengeType = timeInMinutes * 60;
        break;
      case "Python Rapid Sprint - Easy":
        mappedChallengeType = 30 * 60;
        break;
      case "Python Rapid Sprint - Medium":
        mappedChallengeType = 60 * 60;
        break;
      case "Python Rapid Sprint - Hard":
        mappedChallengeType = 90 * 60;
        break;
      case "Python Daily Dash - Easy":
      case "Python Daily Dash - Medium":
        mappedChallengeType = 24 * 60 * 60;
        break;
      case "SQL Bullet Surge - Easy":
        mappedChallengeType = 8 * 60;
        break;
      case "SQL Bullet Surge - Medium":
        mappedChallengeType = 12 * 60;
        break;
      case "SQL Bullet Surge - Hard":
        mappedChallengeType = 20 * 60;
        break;
      case "SQL Rapid Sprint - Easy":
        mappedChallengeType = 30 * 60;
        break;
      case "SQL Rapid Sprint - Medium":
        mappedChallengeType = 45 * 60;
        break;
      case "SQL Rapid Sprint - Hard":
        mappedChallengeType = 60 * 60;
        break;
      case "SQL Daily Dash - Easy":
      case "SQL Daily Dash - Medium":
        mappedChallengeType = 24 * 60 * 60;
        break;
      case "Power Hour":
        mappedChallengeType = 60 * 60;
        break;
      case "Code Marathon":
        mappedChallengeType = 120 * 60;
        break;
      case "Bullet":
        mappedChallengeType = 10 * 60;
        break;
      case "Build your Custom Challenge":
        mappedChallengeType = timeInMinutes * 60;
        break;
      default:
        console.error('Unknown challenge type:', challengeType);
        mappedChallengeType = timeInMinutes * 60; 
    }

    setTime(mappedChallengeType)
  }, [challengeType, customTime])

  useEffect(() => {
    if (timerRunning && time > 0) {
      const interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);

      return () => clearInterval(interval);
    } else if (time === 0 && timerRunning) {
      if (isBotGame) {
        setGameStatus({
          isWinner: false,
          isOpponentWon: true,
          winnerName: data?.players?.[1] || 'Bot',
          isTie: false,
          margin: "Time's up! Bot wins!",
        });
      } else {
        handleGameTie();
      }
    }
  }, [time, timerRunning, isBotGame]);

  const handleComplete = () => {
    console.log("Animation completed, starting game...");
    setShowIntro(false);
    setTimerRunning(true);
    if (isBotGame) {
      initializeBotGame();
    }
  };

  const handleGameTie = () => {
    setGameStatus({
      isWinner: false,
      isOpponentWon: false,
      winnerName: null,
      isTie: true,
      margin: "Time's up!",
    })
    
    if (socket) {
      socket.emit("gameTimeUp", {
        gameId: localStorage.getItem("gameId"),
      })
    }
  }

  const formatTime = (timeInSeconds) => {
    const hours = Math.floor(timeInSeconds / 3600)
    const minutes = Math.floor((timeInSeconds % 3600) / 60)
    const seconds = timeInSeconds % 60

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  // Better loading state with fallback data
  if (!playersReady || !data?.question) {
    return (
      <div className="min-h-screen coderpadBGPrimary flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <h4 className="text-lg">Loading game data...</h4>
        </div>
      </div>
    )
  }

  // Ensure we have player data
  const player1Name = data?.players?.[0] || 'Player 1';
  const player2Name = data?.players?.[1] || 'Player 2';

  return (
    <>
      {showIntro && (
        <GameStartAnimation
          onComplete={handleComplete}
          player1Data={{
            name: player1Name,
            title: "Challenger",
            image: player1Avatar,
          }}
          player2Data={{
            name: player2Name,
            title: "Defender",
            image: player2Avatar,
          }}
        />
      )}

      {isAbonded && <PlayerAbandoned />}
      
      <div 
  className={`min-h-screen flex flex-col relative`}
  style={{
    backgroundColor: theme === "dark" ? "#1E293B" : "#f3f4f6",
    color: theme === "dark" ? "white" : "#111827"
  }}
>
  <div className="flex flex-1 overflow-hidden">
    <main className={`flex-1 p-4 md:p-8 overflow-auto ${isFullScreen ? "pt-0" : ""}`}>
      {(gameStatus.isWinner || gameStatus.isOpponentWon || gameStatus.isTie) && (
        <Result 
          gameStatus={gameStatus} 
          playerData={player1Name} 
          opponentData={player2Name} 
          player1Avatar={player1Avatar} 
          player2Avatar={player2Avatar} 
          userId={userId} 
          challengeType={challengeType}
        />
      )}

      <div 
        className="rounded-xl p-4 md:p-6 shadow-lg relative"
        style={{
          backgroundColor: theme === "dark" ? "#181F27" : "white"
        }}
      >
        {/* Header with player info and controls */}
        <div className="flex flex-col items-center mb-8">
          {/* Centered Player vs Player section */}
          <div className="flex items-center gap-6 md:gap-12 mb-6">
            {/* Player 1 */}
            <div className="text-center">
              <div 
                className="rounded-full px-4 py-1 mb-3 text-sm font-mono"
                style={{
                  backgroundColor: theme === "dark" ? "#13B9A5" : "#f3f4f6",
                  color: theme === "dark" ? "white" : "#111827"
                }}
              >
                {formatTime(time)}
              </div>
              <Avatar 
                className="h-12 w-12 border-2"
                style={{
                  borderColor: theme === "dark" ? "#13B9A5" : "#e5e7eb"
                }}
              >
                <AvatarImage src={player1Avatar} />
                <AvatarFallback>P1</AvatarFallback>
              </Avatar>
              <div className="mt-2 text-sm font-medium">{player1Name}</div>
            </div>

            {/* VS */}
            <div className="text-2xl font-semibold opacity-60">VS</div>

            {/* Player 2 */}
            <div className="text-center">
              <div 
                className="rounded-full px-4 py-1 mb-3 text-sm font-mono"
                style={{
                  backgroundColor: theme === "dark" ? "#13B9A5" : "#f3f4f6",
                  color: theme === "dark" ? "white" : "#111827"
                }}
              >
                {formatTime(time)}
              </div>
              <Avatar 
                className="h-12 w-12 border-2"
                style={{
                  borderColor: theme === "dark" ? "#13B9A5" : "#e5e7eb"
                }}
              >
                <AvatarImage src={player2Avatar}/>
                <AvatarFallback>P2</AvatarFallback>
              </Avatar>
              <div className="mt-2 text-sm font-medium">{player2Name}</div>
            </div>
          </div>

          {/* Controls positioned at top right */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className={`${theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}
              style={{
                backgroundColor: 'transparent',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (theme === "dark") {
                  e.target.style.backgroundColor = "#13B9A5";
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
              }}
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullScreen}
              className={`${theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}
              style={{
                backgroundColor: 'transparent',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (theme === "dark") {
                  e.target.style.backgroundColor = "#13B9A5";
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
              }}
            >
              {isFullScreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[600px]">
          {/* Question Panel */}
          <div className="order-1 lg:order-1">
            {data.question && <QuestionPanel questionData={data.question} />}
          </div>
          
          {/* Code Editor */}
          <div className="order-2 lg:order-2">
            <CodeEditor 
              subject={subject} 
              questionData={data.question} 
              sendDataToParent={handleDataFromChild} 
            />
          </div>
        </div>
      </div>
    </main>
  </div>
</div>
      
      <ConnectionStatusPopup />
    </>
  )
}