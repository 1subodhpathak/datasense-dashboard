import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, ArrowLeft, Clock, Users, Copy, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useWebSocketContext } from "@/util/WebsocketProvider";
import { useNavigate } from "react-router-dom";

interface ActionButtonsProps {
  isSelectionComplete: boolean;
  onStartChallenge: () => void;
  onReset: () => void;
  subject: string;
  difficulty: string;
  userId: string;
  playerName: string;
  time: number | null;
  challengeType: string | null;
  isSearching?: boolean;
  searchTime?: number;
  alertMessage?: { title: string; description: string } | null;
  onAlertClose?: () => void;
}

const ActionButtons = ({
  isSelectionComplete,
  onStartChallenge,
  onReset,
  subject,
  difficulty: propDifficulty,
  userId,
  playerName,
  time,
  challengeType,
  isSearching = false,
  searchTime = 0,
  alertMessage,
  onAlertClose,
}: ActionButtonsProps) => {
  const [isStarting, setIsStarting] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [error, setError] = useState<string>("");
  const [gameId, setGameId] = useState("");
  const [lobbyStatus, setLobbyStatus] = useState("idle");
  const [showCreateGame, setShowCreateGame] = useState(false);
  const [showJoinGame, setShowJoinGame] = useState(false);
  const [joinGameId, setJoinGameId] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { socket, isConnected } = useWebSocketContext();


   useEffect(() => {
    console.log("=== ActionButtons Props Debug ===");
    console.log("subject:", subject, typeof subject);
    console.log("userId:", userId, typeof userId);
    console.log("playerName:", playerName, typeof playerName);
    console.log("time:", time, typeof time);
    console.log("challengeType:", challengeType, typeof challengeType);
    console.log("difficulty:", propDifficulty, typeof propDifficulty);
    console.log("isSelectionComplete:", isSelectionComplete);
    console.log("socket:", !!socket);
    console.log("isConnected:", isConnected);
    console.log("================================");
  }, [subject, userId, playerName, time, challengeType, propDifficulty, isSelectionComplete, socket, isConnected]);


  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handlePlayerFound = (data: any) => {
      setIsStarting(false);
      localStorage.setItem("gameData", JSON.stringify(data));
      const botParam = data.isBot ? '&isNexus=true' : '';

      console.log(data)

      navigate(
        `/challenge?gameId=${data.gameId}&challengeType=${data.challengeType}&selectedSubject=${data.subject}&customTime=${data.customTime}${botParam}`,
        { state: { data } }
      );
    };

    const handleRoomCreated = (data: any) => {
      setIsCreating(false);
      setLobbyStatus("waiting");
      setGameId(data.gameId);
    };

    const handleRoomJoined = (data: any) => {
      setIsJoining(false);
      localStorage.setItem("gameData", JSON.stringify(data));

      console.log(data)
      
      // Use the same URL format as handlePlayerFound
      const botParam = data.isBot ? '&isNexus=true' : '';
      navigate(
        `/challenge?gameId=${data.gameId}&challengeType=${data.challengeType || challengeType}&selectedSubject=${data.subject || subject}&customTime=${data.customTime || time}${botParam}`,
        { state: { data } }
      );
    };

    const handleError = (data: any) => {
      setError(data.message || "An error occurred");
      setIsCreating(false);
      setIsJoining(false);
      setLobbyStatus("idle");
    };

    const handleGameStarted = (data: any) => {
      localStorage.setItem("gameData", JSON.stringify(data));
      navigate(`/challenge/${data.gameId}`);
    };

    socket.on("playerFound", handlePlayerFound);
    socket.on("roomCreated", handleRoomCreated);
    socket.on("gameStart", handleRoomJoined);
    socket.on("error", handleError);
    socket.on("gameStarted", handleGameStarted);

    return () => {
      socket.off("playerFound", handlePlayerFound);
      socket.off("roomCreated", handleRoomCreated);
      socket.off("gameStart", handleRoomJoined);
      socket.off("error", handleError);
      socket.off("gameStarted", handleGameStarted);
    };
  }, [socket, navigate, challengeType, subject, time]);

  // Get difficulty based on challenge type and time
  const getDifficulty = () => {
    let difficulty = "medium";
    
    if (challengeType === "bullet_surge") {
      if (time && time <= 5) difficulty = "easy";
      else if (time && time >= 15) difficulty = "advanced";
      else difficulty = "medium";
    } else if (challengeType === "rapid_sprint") {
      if (time && time <= 30) difficulty = "easy";
      else if (time && time >= 60) difficulty = "advanced";
      else difficulty = "medium";
    } else {
      difficulty = propDifficulty;
    }
    
    return difficulty;
  };

  // Handle multiplayer search
  const handleSearch = () => {
    setError("");
    
    // Check subscription status
    const subscriptionStatus = localStorage.getItem("subscriptionStatus");
    if (subscriptionStatus && subscriptionStatus.includes("User not subscribed")) {
      if (onAlertClose) {
        // Use parent's alert system if available
        return;
      }
      setError("Subscription required to access this feature");
      return;
    }

    if (!socket || !isConnected) {
      setError("Connection error. Please try again.");
      return;
    }

    const difficulty = getDifficulty();
    const challengeTypeString = challengeType === "bullet_surge" ? "Bullet Surge" : 
                              challengeType === "rapid_sprint" ? "Rapid Sprint" : 
                              challengeType || "Bullet Surge";

    // Emit socket event to find player
    socket.emit("findPlayer", {
      subject,
      difficulty,
      userId,
      playerName,
      time,
      challengeType: challengeTypeString,
    });
  };

  // Cancel multiplayer search
  const handleCancel = () => {
    if (socket) {
      socket.emit("cancelSearch");
    }
    setIsStarting(false);
    setCountdown(null);
  };

  // Create a private game
  const handleCreateGame = () => {
 
    if (!socket || !isConnected || !subject) {
      setError("Please fill in all required fields");
      return;
    }

    setIsCreating(true);
    const generatedGameId = "GAME" + Math.random().toString(36).substr(2, 6).toUpperCase();
    setGameId(generatedGameId);

    // Store game info in localStorage
    localStorage.setItem(
      "currentGame",
      JSON.stringify({
        gameId: generatedGameId,
        isHost: true,
        challengeDuration: time,
        selectedSubject: subject,
        difficulty: getDifficulty(),
        playerName,
      })
    );

    const challengeTypeString = challengeType === "bullet_surge" ? "Bullet Surge" : 
                              challengeType === "rapid_sprint" ? "Rapid Sprint" : 
                              "Bullet Surge";

    socket.emit("createRoom", {
      gameId: generatedGameId,
      clerkId: userId,
      subject,
      challengeType: challengeTypeString,
      challengeDuration: time,
      difficulty: getDifficulty(),
      playerName,
    });
  };

  // Join a private game
  const handleJoinGame = () => {
     
    if (!joinGameId || !socket || !isConnected || !subject) {
      setError("Please fill in all required fields");
      return;
    }
    
    setIsJoining(true);

    localStorage.setItem(
      "currentGame",
      JSON.stringify({
        gameId: joinGameId,
        isHost: false,
        challengeDuration: time,
        selectedSubject: subject,
        difficulty: getDifficulty(),
        playerName,
      })
    );

    socket.emit("joinRoom", {
      gameId: joinGameId,
      clerkId: userId,
      subject,
      difficulty: getDifficulty(),
      playerName,
    });
  };

  // Copy game ID to clipboard
  const handleCopyGameId = async () => {
    try {
      await navigator.clipboard.writeText(gameId);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy game ID:', err);
    }
  };


  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Reset forms and states
  const resetForms = () => {
    setShowCreateGame(false);
    setShowJoinGame(false);
    setJoinGameId("");
    setError("");
    setLobbyStatus("idle");
    setGameId("");
  };

  return (
    <div className="space-y-4">


      {!isMobile && (
        <Button
          variant="outline"
          className="w-full border-dsb-neutral3 text-dsb-neutral1 hover:text-white hover:bg-dsb-neutral3 backdrop-blur-md group"
          onClick={onReset}
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:translate-x-[-2px] transition-transform" />
          Back
        </Button>
      )}



      {/* Error Message */}
      {error && error !== "Game not found" && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">
          <div className="flex justify-between items-start">
            <span>{error}</span>
            <button onClick={() => setError("")}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

     {/* Alert Message */}
        {alertMessage && alertMessage.description !== "Game not found" && (
          <div className="bg-blue-100 text-blue-700 p-3 rounded-lg">
            <div className="flex justify-between items-start">
          <div>
            <strong className="block">{alertMessage.title}</strong>
            <span className="text-sm">{alertMessage.description}</span>
          </div>
          {onAlertClose && (
            <button onClick={onAlertClose} className="ml-2">
              <X className="w-4 h-4" />
            </button>
          )}
            </div>
          </div>
        )}

        {/* Search Status */}
      {isSearching && (
        <div className="bg-blue-100 text-blue-700 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 animate-spin" />
              <span>Searching for opponent...</span>
            </div>
            <span className="font-mono">{formatTime(searchTime)}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            className="w-full"
          >
            Cancel Search
          </Button>
        </div>
      )}

      {/* Game ID Display */}
      {gameId && lobbyStatus === "waiting" && (
        <div className="bg-green-100 text-green-700 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <strong>Game Created!</strong>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyGameId}
              className="text-xs"
            >
              <Copy className="w-3 h-3 mr-1" />
              {copySuccess ? "Copied!" : "Copy ID"}
            </Button>
          </div>
          <div className="font-mono text-lg">{gameId}</div>
          <div className="text-sm mt-1">Share this ID with your friend to start playing</div>
          <Button
            variant="outline"
            size="sm"
            onClick={resetForms}
            className="w-full mt-2"
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Main Action Buttons */}
      {!showCreateGame && !showJoinGame && lobbyStatus === "idle" && (
        <>
          {/* Single Player Start */}
          <Button
            className={cn(
              "w-full h-12 bg-gradient-to-r from-dsb-accent/80 to-dsb-accentDark/90 hover:from-dsb-accent hover:to-dsb-accentDark text-white font-medium flex gap-3 justify-center items-center shadow-[0_0_20px_rgba(0,226,202,0.25)] border border-dsb-accent/30",
              !isSelectionComplete &&
                "opacity-50 cursor-not-allowed from-gray-500/80 to-gray-700/90 border-gray-500/30 shadow-none",
              isSelectionComplete && !isStarting && "animate-pulse-subtle"
            )}
             disabled={!isSelectionComplete || isSearching}
              onClick={handleSearch}
          >
            {isStarting ? (
              <span className="text-2xl font-bold animate-pulse">{countdown}</span>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white" />
                Start Solo Challenge
              </>
            )}
          </Button>

          {/* Multiplayer Options */}
          <div className="grid grid-cols-1 gap-2">


            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
                disabled={!isSelectionComplete}
                onClick={() => setShowCreateGame(true)}
              >
                Create Game
              </Button>
              
              <Button
                variant="outline" 
                className="border-green-500 text-green-400 hover:bg-green-500/10"
                disabled={!isSelectionComplete}
                onClick={() => setShowJoinGame(true)}
              >
                Join Game
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Create Game Form */}
      {showCreateGame && (
        <div className="space-y-3 p-4 bg-black/30 rounded-lg border border-purple-500/30">
          <h3 className="text-lg font-semibold text-purple-400">Create Private Game</h3>
          <p className="text-sm text-gray-300">
            Create a private game and share the ID with your friend
          </p>
          
          <div className="space-y-2">
            <Button
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              onClick={handleCreateGame}
              disabled={isCreating || !isSelectionComplete}
            >
              {isCreating ? (
                <Clock className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Users className="w-4 h-4 mr-2" />
              )}
              {isCreating ? "Creating..." : "Create Game"}
            </Button>
            
            <Button
              variant="outline"
              className="w-full text-white"
              onClick={() => setShowCreateGame(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Join Game Form */}
      {showJoinGame && (
        <div className="space-y-3 p-4 bg-black/30 rounded-lg border border-green-500/30">
          <h3 className="text-lg font-semibold text-green-400">Join Private Game</h3>
          <p className="text-sm text-gray-300">
            Enter the game ID shared by your friend
          </p>
          
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Enter Game ID (e.g., GAMEABC123)"
              value={joinGameId}
              onChange={(e) => setJoinGameId(e.target.value.toUpperCase())}
              className="w-full p-3 bg-black/50 border border-green-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
              maxLength={10}
            />
            
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              onClick={handleJoinGame}
              disabled={isJoining || !joinGameId || !isSelectionComplete}
            >
              {isJoining ? (
                <Clock className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Users className="w-4 h-4 mr-2" />
              )}
              {isJoining ? "Joining..." : "Join Game"}
            </Button>
            
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowJoinGame(false)}
              disabled={isJoining}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionButtons;