"use client"

import { useEffect, useState } from "react"
import axios from 'axios'

const Result = ({ gameStatus, playerData, opponentData, player1Avatar, player2Avatar, userId, challengeType }) => {
  const [fetchedPlayerData, setFetchedPlayerData] = useState(null)
  const [fetchedOpponentData, setFetchedOpponentData] = useState(null)
  const [apiCallsComplete, setApiCallsComplete] = useState(false)

  // Function to update leaderboard
const updateLeaderboardScore = async (userId, playerName, challengeType, gameStatus) => {
  try {
    // Convert challengeType format (e.g., "Bullet Surge" to "bullet-surge")
    const formattedGameType = challengeType
      .toLowerCase()
      .replace(/\s+/g, '-');
    
    // Determine result and XP
    let result, xpChange;
    
    if (gameStatus.isWinner) {
      result = 'win';
      xpChange = 1200;
    } else if (gameStatus.isOpponentWon) {
      result = 'lose';
      xpChange = 800;
    } else if (gameStatus.isTie) {
      result = 'draw';
      xpChange = 1000;
    } else {
      return { success: false };
    }
    
    // API call
    const response = await fetch(`https://server.datasenseai.com/battleground-leaderboard/update${formattedGameType}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clerkId: userId,
        name: playerName,
        result,
        xpChange
      })
    });
    
    const data = await response.json();
    return { success: true, data };
    
  } catch (error) {
    console.error('Leaderboard update error:', error);
    return { success: false };
  }
};
  
  useEffect(() => {
    // Handle game result API calls
    const saveGameResults = async () => {
      try {
        console.log("Starting API calls for game results...")
      
        if (!userId) {
          console.error("User ID not found in storage")
          return
        }
        
        // Determine result
        let result = "none"
        if (gameStatus.isWinner) {
          result = "won"
        } else if (gameStatus.isOpponentWon) {
          result = "lost"
        } else if (gameStatus.isTie) {
          result = "tie"
        }
        
        // Get challenge info from URL or localStorage
        const challengeType = new URLSearchParams(window.location.search).get("challengeType") || 
                             localStorage.getItem("challengeType")
        const subject = new URLSearchParams(window.location.search).get("selectedSubject") || 
                       localStorage.getItem("selectedSubject")
        
        // Prepare game data
        const gameData = {
          gametype: challengeType,
          playernames: [playerData, opponentData], 
          subject: subject, 
          result: result
        }
        
        console.log("Game data prepared:", gameData)
        
        // 1. Update game history
        const historyResponse = await fetch("https://server.datasenseai.com/game-history/update-game-history", {
          method: "POST", 
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clerkId: userId,
            gameData: gameData,
          }),
        })
        
        const historyResult = await historyResponse.json()
        console.log("Game history saved:", historyResult)
        
        // 2. Credit fuel if player won
        if (gameStatus.isWinner) {
          try {
            const fuelResponse = await axios.post('https://server.datasenseai.com/fuel-engine/credit', {
              clerkId: userId,
              key: 'datawar-credit',
            })
            
            console.log('Fuel credit response:', fuelResponse.data)
          } catch (error) {
            console.error("Error crediting fuel:", error)
          }
        }
        
        setApiCallsComplete(true)
        console.log("All API calls completed successfully")

        try {
          const leaderboardResult = await updateLeaderboardScore(
            userId,
            playerData,
            challengeType || 
              new URLSearchParams(window.location.search).get("challengeType") || 
              localStorage.getItem("challengeType"),
            gameStatus
          );
          
          if (leaderboardResult.success) {
            console.log("Leaderboard updated successfully");
          }
        } catch (error) {
          console.error("Error updating leaderboard:", error);
        }


      } catch (error) {
        console.error("Error in game result API calls:", error)
      }
    }
    
    // Execute API calls once when component mounts
    if (!apiCallsComplete) {
      saveGameResults()
    }
  }, [gameStatus, playerData, opponentData, apiCallsComplete])

  // Use fetched data if available, otherwise fall back to props
  const currentData = {
    player: {
      username: fetchedPlayerData?.username || playerData || "You",
      avatar: fetchedPlayerData?.avatar || player1Avatar || "/placeholder.svg?height=40&width=40",
      score: fetchedPlayerData?.score || 0,
      ratingChange: gameStatus.isTie ? 0 : gameStatus.isWinner ? 12 : -8,
      testCasesPassed: fetchedPlayerData?.testCasesPassed || 5,
      totalTestCases: fetchedPlayerData?.totalTestCases || 9,
    },
    opponent: {
      username: fetchedOpponentData?.username || opponentData || "Opponent",
      avatar: fetchedOpponentData?.avatar || player2Avatar || "/placeholder.svg?height=40&width=40",
      score: fetchedOpponentData?.score || 0,
      ratingChange: gameStatus.isTie ? 0 : gameStatus.isWinner ? -8 : 12,
    },
    winner: gameStatus.winnerName,
    isTie: gameStatus.isTie,
  }

  const isWinner = gameStatus.isWinner

  return (
    <div className="fixed inset-0 bg-gray-900 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden max-w-md w-full">
        {/* Header section */}
        <div className="relative py-6 text-center">
          {/* Win banner */}
          <div className="mx-auto relative w-4/5">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500/20 border-2 border-cyan-400 rounded-lg"></div>
              <div className="relative z-10 py-4 text-center text-white">
                {gameStatus.isTie ? (
                  <h2 className="text-3xl font-bold">It's a Tie!</h2>
                ) : (
                  <h2 className="text-3xl font-bold">{currentData.winner} Won!</h2>
                )}
                {gameStatus.margin && <p className="text-sm mt-1">{gameStatus.margin}</p>}
              </div>

              {/* Hexagon edge accents */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-cyan-400 rounded-full p-1">
                <span className="text-lg">+</span>
              </div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-cyan-400 rounded-full p-1">
                <span className="text-lg">+</span>
              </div>
            </div>
          </div>
        </div>

        {/* Player avatars */}
        <div className="flex justify-between items-center px-12 py-6">
          <PlayerInfo
            player={currentData.player}
            isWinner={isWinner}
            playerAvatar={player1Avatar}
            customClass={isWinner ? "cyan-avatar winner-avatar" : "cyan-avatar"}
          />

          <div className="flex flex-col items-center">
            <svg
              className="text-yellow-400"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
            </svg>
          </div>

          <PlayerInfo
            player={currentData.opponent}
            isWinner={!isWinner && !currentData.isTie}
            playerAvatar={player2Avatar}
            customClass={!isWinner && !currentData.isTie ? "cyan-avatar winner-avatar" : "cyan-avatar"}
          />
        </div>

        {/* Rating info */}
        <div className="text-center mb-6">
          <p className="text-gray-400 mb-2">Rapid Sprint Rating</p>
          <div className="flex items-center justify-center">
            <span className="text-4xl font-bold text-white">865</span>
            <span className={`ml-2 text-xl font-semibold ${isWinner ? 'text-green-400' : 'text-red-400'}`}>
              {isWinner ? '+12' : '-8'}
            </span>
          </div>
        </div>

        {/* Test cases and errors */}
        <div className="flex justify-between px-6 pb-6">
          <div className="bg-blue-500/30 rounded-md px-6 py-3 text-center flex-1 mr-2">
            <p className="text-xl font-bold text-white">{currentData.player.testCasesPassed}/{currentData.player.totalTestCases}</p>
            <p className="text-xs text-gray-300">Test cases passed</p>
          </div>
          <div className="bg-red-500/30 rounded-md px-6 py-3 text-center flex-1 ml-2">
            <p className="text-xl font-bold text-white">0</p>
            <p className="text-xs text-gray-300">Errors</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 px-6 pb-6">
          <button 
            onClick={() => window.location.href = '/'}
            className="py-3 px-4 bg-[#29498d] text-white rounded-md hover:bg-[#1e3a70] transition-colors"
          >
            Go back to home
          </button>
        </div>
        
        {/* Add custom styles */}
        <style jsx>{`
          .cyan-avatar {
            position: relative;
          }
          .cyan-avatar::before {
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
            border: 2px solid #2dd4bf;
            border-radius: 50%;
            z-index: -1;
          }
          .winner-avatar::before {
            border: 4px solid #2dd4bf;
            background: linear-gradient(to bottom, #0d9488, #14b8a6);
          }
          .cyan-avatar::after {
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            z-index: -1;
          }
        `}</style>
      </div>
    </div>
  )
}

const PlayerInfo = ({ player, isWinner, playerAvatar, customClass }) => (
  <div className="flex flex-col items-center">
    <div className={`relative ${customClass}`}>
      <div className="w-20 h-20 rounded-full relative">
        {/* Tick marks around circle */}
        <div className="absolute inset-0 rounded-full">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1.5 bg-cyan-200"
              style={{
                top: "50%",
                left: "50%",
                transform: `rotate(${i * 30}deg) translateY(-10px) translateX(-50%)`,
              }}
            />
          ))}
        </div>

        <img
          src={playerAvatar || "/placeholder.svg?height=60&width=60"}
          alt={player.username}
          className="w-16 h-16 rounded-full object-cover absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        />
        
        {isWinner && (
          <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1 z-10">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        )}
      </div>
      <span className="mt-2 block text-center font-medium text-white">{player.username}</span>
    </div>
  </div>
)

export default Result