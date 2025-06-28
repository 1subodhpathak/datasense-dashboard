import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const WebSocketContext = createContext(null);
const RECONNECTION_TIMEOUT = 30000;

export const WebSocketProvider = ({ url, children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [userId, setUserId] = useState(null);
  const [gameId, setGameId] = useState(null);
  const [reconnectionTimer, setReconnectionTimer] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const currentGameRef = useRef(null);
  const lastSocketId = useRef(null);

  // Function to get the most recent game data
  const getCurrentGameData = () => {
    const savedGame = localStorage.getItem("currentGame");
    if (savedGame) {
      try {
        const parsedGame = JSON.parse(savedGame);
        currentGameRef.current = parsedGame;
        return parsedGame;
      } catch (e) {
        console.error('Error parsing saved game data:', e);
        return null;
      }
    }
    return null;
  };

  // Initialize persistent data
  useEffect(() => {
    const persistentUserId = localStorage.getItem('userId') || `user_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('userId', persistentUserId);
    setUserId(persistentUserId);

    const currentGame = getCurrentGameData();
    if (currentGame?.gameId) {
      setGameId(currentGame.gameId);
    }
  }, []);

  // Handle internet connection status
  useEffect(() => {
    const handleOnline = () => {
      console.log('Internet connection restored');
      setIsOnline(true);
      
      // Always get fresh game data from localStorage
      const currentGame = getCurrentGameData();
      
      // Attempt to rejoin game if we have an active game
      if (socket && currentGame) {
        const previousId = lastSocketId.current || socket.id;
        console.log('Attempting to rejoin game after connection restored:', {
          ...currentGame,
          userId,
          previousSocketId: previousId
        });
        
        socket.emit('rejoinGame', {
          ...currentGame,
          userId,
          previousSocketId: previousId
        });
      }
    };

    const handleOffline = () => {
      console.log('Internet connection lost');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [socket, userId]);

  useEffect(() => {
    if (!userId || !isOnline) return;

    const socketInstance = io(url, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      auth: { userId }
    });

    const handleConnect = () => {
      console.log('Connected to Socket.IO server');
      setIsConnected(true);

      // Always get fresh game data from localStorage
      const currentGame = getCurrentGameData();
      
      if (currentGame) {
        const previousId = lastSocketId.current || socketInstance.id;
        console.log('Attempting to rejoin game with data:', {
          ...currentGame,
          userId,
          previousSocketId: previousId
        });

        socketInstance.emit('rejoinGame', {
          ...currentGame,
          userId,
          previousSocketId: previousId
        });
      }

      if (reconnectionTimer) {
        clearTimeout(reconnectionTimer);
        setReconnectionTimer(null);
      }
    };

    const handleDisconnect = () => {
      console.log('Disconnected from Socket.IO server');
      lastSocketId.current = socketInstance.id;
      setIsConnected(false);

      const timer = setTimeout(() => {
        const currentGame = getCurrentGameData();
        if (currentGame?.gameId) {
          socketInstance.emit('forfeitGame', {
            gameId: currentGame.gameId,
            userId
          });
        }
      }, RECONNECTION_TIMEOUT);

      setReconnectionTimer(timer);
    };

    socketInstance.on('connect', handleConnect);
    socketInstance.on('disconnect', handleDisconnect);
    socketInstance.on('playerReconnected', (data) => console.log('Player reconnected:', data));
    socketInstance.on('playerDisconnected', (data) => console.log('Player disconnected:', data));
    socketInstance.on('gameForfeited', (data) => console.log('Game forfeited:', data));
    socketInstance.on('message', setLastMessage);

    setSocket(socketInstance);

    return () => {
      if (reconnectionTimer) {
        clearTimeout(reconnectionTimer);
      }
      socketInstance.off('connect', handleConnect);
      socketInstance.off('disconnect', handleDisconnect);
      socketInstance.off('playerReconnected');
      socketInstance.off('playerDisconnected');
      socketInstance.off('gameForfeited');
      socketInstance.off('message');
      socketInstance.disconnect();
      lastSocketId.current = socketInstance.id;
    };
  }, [userId, url, isOnline]);

  const value = {
    sendMessage: (message) => socket?.emit('message', { ...message, userId }),
    lastMessage,
    isConnected,
    isOnline,
    socket,
    userId,
    gameId,
    joinGame: (newGameId) => {
      setGameId(newGameId);
      socket?.emit('joinGame', { gameId: newGameId, userId, socketId: socket.id });
    },
    leaveGame: () => {
      if (socket && gameId) {
        socket.emit('leaveGame', { gameId, userId });
        setGameId(null);
        localStorage.removeItem('currentGame');
        currentGameRef.current = null;
      }
    }
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};
