// GameStartAnimation.jsx - Complete version with custom color scheme

import React, { useState, useEffect, useCallback } from 'react';
import { Swords } from 'lucide-react';

// Simple CSS-in-JS animations as fallback if framer-motion fails
const styles = {
  fadeIn: {
    animation: 'fadeIn 0.5s ease-in-out',
  },
  scaleIn: {
    animation: 'scaleIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
  countdownNumber: {
    animation: 'countdownPulse 1s ease-in-out',
  }
};

// Add CSS keyframes
const injectStyles = () => {
  if (typeof document === 'undefined') return;
  
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerHTML = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes scaleIn {
      from { transform: scale(0); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    @keyframes countdownPulse {
      0% { transform: scale(2); opacity: 0; }
      50% { transform: scale(1.2); opacity: 1; }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 1; }
    }
    @keyframes slideInLeft {
      from { transform: translateX(-100px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideInRight {
      from { transform: translateX(100px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes glow {
      0% { box-shadow: 0 0 10px rgba(0, 226, 202, 0.3); }
      50% { box-shadow: 0 0 30px rgba(0, 226, 202, 0.6); }
      100% { box-shadow: 0 0 10px rgba(0, 226, 202, 0.3); }
    }
    @keyframes tealPulse {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 0.8; }
    }
  `;
  document.head.appendChild(styleSheet);
};

// Check if framer-motion is available
let motion = null;
let AnimatePresence = null;

try {
  const framerMotion = require('framer-motion');
  motion = framerMotion.motion;
  AnimatePresence = framerMotion.AnimatePresence;
} catch (error) {
  console.warn('Framer Motion not available, using fallback animations');
}

function useCountdown(initialTime, onComplete) {
  const [count, setCount] = useState(initialTime);
  const [phase, setPhase] = useState('countdown');
  const [showMain, setShowMain] = useState(false);

  // Memoize onComplete to prevent unnecessary re-renders
  const stableOnComplete = useCallback(onComplete, []);

  useEffect(() => {
    let timer;

    if (phase === 'countdown') {
      if (count > 0) {
        timer = setTimeout(() => setCount(prev => prev - 1), 1000);
      } else {
        setShowMain(true);
        setPhase('vs');
      }
    } else if (phase === 'vs') {
      timer = setTimeout(() => {
        setPhase('complete');
        // Use setTimeout to ensure state updates are complete
        setTimeout(() => {
          if (stableOnComplete) {
            stableOnComplete();
          }
        }, 100);
      }, 3000); // Reduced timing for better UX
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [count, phase, stableOnComplete]);

  return { count, showMain, phase };
}

// Fallback PlayerCard component without framer-motion
const PlayerCardFallback = ({ player, position, delay = 0 }) => (
  <div 
    className="flex flex-col items-center"
    style={{
      animation: `${position === 'left' ? 'slideInLeft' : 'slideInRight'} 1.2s ease-out ${delay}s both`
    }}
  >
    <div className="relative w-24 h-24 md:w-32 md:h-32">
      <div 
        className="absolute inset-0 rounded-full"
        style={{ 
          backgroundColor: 'rgba(0, 226, 202, 0.2)',
          animation: 'tealPulse 1.5s infinite' 
        }}
      />
      <div 
        className="absolute inset-0 rounded-full border-2"
        style={{ borderColor: '#00E2CA' }}
      />
      <div 
        className="absolute inset-1 rounded-full overflow-hidden"
        style={{ backgroundColor: '#2D3748' }}
      >
        <img 
          src={player.image || "/api/placeholder/128/128"}
          alt={player.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = `data:image/svg+xml;base64,${btoa(`
              <svg width="128" height="128" xmlns="http://www.w3.org/2000/svg">
                <rect width="128" height="128" fill="#2D3748"/>
                <text x="64" y="70" text-anchor="middle" fill="#A0AEC0" font-size="48">?</text>
              </svg>
            `)}`;
          }}
        />
      </div>
    </div>
    <div 
      className="mt-4 text-center"
      style={{ animation: `fadeIn 0.5s ease-in-out ${delay + 0.8}s both` }}
    >
      <h3 className="font-bold text-lg md:text-xl" style={{ color: '#A0AEC0' }}>{player.name}</h3>
      <p className="text-sm md:text-base" style={{ color: '#00E2CA' }}>{player.title}</p>
    </div>
  </div>
);

// Framer Motion PlayerCard component
const PlayerCardMotion = ({ player, position }) => (
  <motion.div 
    className="flex flex-col items-center"
    initial={{ x: position === 'left' ? -100 : 100, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ type: "spring", bounce: 0.4, duration: 1.2 }}
  >
    <div className="relative w-24 h-24 md:w-32 md:h-32">
      <motion.div 
        className="absolute inset-0 rounded-full"
        style={{ backgroundColor: 'rgba(0, 226, 202, 0.2)' }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <div 
        className="absolute inset-0 rounded-full border-2"
        style={{ borderColor: '#00E2CA' }}
      />
      <div 
        className="absolute inset-1 rounded-full overflow-hidden"
        style={{ backgroundColor: '#2D3748' }}
      >
        <img 
          src={player.image || "/api/placeholder/128/128"}
          alt={player.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = `data:image/svg+xml;base64,${btoa(`
              <svg width="128" height="128" xmlns="http://www.w3.org/2000/svg">
                <rect width="128" height="128" fill="#2D3748"/>
                <text x="64" y="70" text-anchor="middle" fill="#A0AEC0" font-size="48">?</text>
              </svg>
            `)}`;
          }}
        />
      </div>
    </div>
    <motion.div 
      className="mt-4 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
    >
      <h3 className="font-bold text-lg md:text-xl" style={{ color: '#A0AEC0' }}>{player.name}</h3>
      <p className="text-sm md:text-base" style={{ color: '#00E2CA' }}>{player.title}</p>
    </motion.div>
  </motion.div>
);

export default function GameStartAnimation({ onComplete, player1Data, player2Data }) {
  const { count, showMain, phase } = useCountdown(3, onComplete);
  
  // Inject CSS styles for fallback animations
  useEffect(() => {
    injectStyles();
  }, []);

  // Provide default player data
  const player1 = player1Data || {
    name: "Player One",
    title: "Challenger",
    image: "/api/placeholder/128/128"
  };
  
  const player2 = player2Data || {
    name: "Player Two", 
    title: "Defender",
    image: "/api/placeholder/128/128"
  };

  // Use appropriate PlayerCard component based on framer-motion availability
  const PlayerCard = motion ? PlayerCardMotion : PlayerCardFallback;

  // Countdown phase
  if (!showMain) {
    if (motion && AnimatePresence) {
      return (
        <div className="fixed inset-0 z-50 w-screen h-screen" style={{ backgroundColor: '#0D1219' }}>
          <div className="w-full h-full flex items-center justify-center p-4">
            <AnimatePresence mode="wait">
              <motion.div
                key="countdown"
                className="fixed inset-0 flex items-center justify-center"
                style={{ backgroundColor: 'rgba(13, 18, 25, 0.95)' }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <motion.span
                  key={count}
                  initial={{ scale: 2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                  className="text-8xl md:text-9xl font-bold tracking-wider"
                  style={{
                    color: '#56F0E0',
                    textShadow: '0 0 30px rgba(0, 226, 202, 0.8)',
                    filter: 'drop-shadow(0 0 10px rgba(0, 226, 202, 0.5))'
                  }}
                >
                  {count || 'GO!'}
                </motion.span>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      );
    } else {
      // Fallback countdown without framer-motion
      return (
        <div className="fixed inset-0 z-50 w-screen h-screen" style={{ backgroundColor: '#0D1219' }}>
          <div className="w-full h-full flex items-center justify-center p-4">
            <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(13, 18, 25, 0.95)' }}>
              <span
                key={count}
                className="text-8xl md:text-9xl font-bold tracking-wider"
                style={{
                  ...styles.countdownNumber,
                  color: '#56F0E0',
                  textShadow: '0 0 30px rgba(0, 226, 202, 0.8)',
                  filter: 'drop-shadow(0 0 10px rgba(0, 226, 202, 0.5))'
                }}
              >
                {count || 'GO!'}
              </span>
            </div>
          </div>
        </div>
      );
    }
  }

  // Main vs screen phase
  if (motion && AnimatePresence) {
    return (
      <div className="fixed inset-0 z-50 w-screen h-screen" style={{ backgroundColor: '#0D1219' }}>
        <div className="w-full h-full flex items-center justify-center p-4 overflow-hidden">
          <AnimatePresence>
            {phase === 'vs' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-6xl mx-auto relative"
              >
                {/* Background effects */}
                <motion.div
                  className="absolute inset-0 rounded-3xl"
                  style={{
                    background: 'linear-gradient(90deg, rgba(0, 226, 202, 0.1) 0%, transparent 50%, rgba(0, 184, 171, 0.1) 100%)'
                  }}
                  animate={{ 
                    background: [
                      'linear-gradient(90deg, rgba(0, 226, 202, 0.1) 0%, transparent 50%, rgba(0, 184, 171, 0.1) 100%)',
                      'linear-gradient(90deg, rgba(0, 184, 171, 0.1) 0%, transparent 50%, rgba(0, 226, 202, 0.1) 100%)',
                      'linear-gradient(90deg, rgba(0, 226, 202, 0.1) 0%, transparent 50%, rgba(0, 184, 171, 0.1) 100%)'
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                />

                <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 items-center p-8">
                  {/* Player 1 */}
                  <PlayerCard player={player1} position="left" />

                  {/* VS Section */}
                  <motion.div 
                    className="flex flex-col items-center justify-center"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ 
                      type: "spring",
                      bounce: 0.6,
                      duration: 1.5,
                      delay: 0.5
                    }}
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      className="mb-4"
                    >
                      <Swords className="w-12 h-12 md:w-16 md:h-16" style={{ color: '#00E2CA' }} />
                    </motion.div>
                    <motion.h2 
                      className="text-4xl md:text-6xl font-bold tracking-wider"
                      style={{
                        color: '#56F0E0',
                        textShadow: '0 0 20px rgba(0, 226, 202, 0.5)',
                        background: 'linear-gradient(45deg, #56F0E0, #00E2CA, #00B8AB)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}
                      animate={{ 
                        scale: [1, 1.1, 1],
                        textShadow: [
                          '0 0 20px rgba(0, 226, 202, 0.5)',
                          '0 0 30px rgba(0, 226, 202, 0.8)',
                          '0 0 20px rgba(0, 226, 202, 0.5)'
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      VS
                    </motion.h2>
                  </motion.div>

                  {/* Player 2 */}
                  <PlayerCard player={player2} position="right" />
                </div>

                {/* Battle ready text */}
                <motion.div
                  className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2 }}
                >
                  <p className="text-lg md:text-xl font-medium tracking-wide" style={{ color: '#A0AEC0' }}>
                    Get Ready to Battle!
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  } else {
    // Fallback VS screen without framer-motion
    return (
      <div className="fixed inset-0 z-50 w-screen h-screen" style={{ backgroundColor: '#0D1219' }}>
        <div className="w-full h-full flex items-center justify-center p-4 overflow-hidden">
          <div 
            className="w-full max-w-6xl mx-auto relative"
            style={styles.fadeIn}
          >
            {/* Background effects */}
            <div
              className="absolute inset-0 rounded-3xl"
              style={{ 
                background: 'linear-gradient(90deg, rgba(0, 226, 202, 0.1) 0%, transparent 50%, rgba(0, 184, 171, 0.1) 100%)',
                animation: 'glow 3s infinite' 
              }}
            />

            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 items-center p-8">
              {/* Player 1 */}
              <PlayerCardFallback player={player1} position="left" delay={0} />

              {/* VS Section */}
              <div 
                className="flex flex-col items-center justify-center"
                style={{ ...styles.scaleIn, animationDelay: '0.5s' }}
              >
                <div
                  className="mb-4"
                  style={{ animation: 'spin 8s linear infinite' }}
                >
                  <Swords className="w-12 h-12 md:w-16 md:h-16" style={{ color: '#00E2CA' }} />
                </div>
                <h2 
                  className="text-4xl md:text-6xl font-bold tracking-wider"
                  style={{
                    color: '#56F0E0',
                    textShadow: '0 0 20px rgba(0, 226, 202, 0.5)',
                    background: 'linear-gradient(45deg, #56F0E0, #00E2CA, #00B8AB)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    animation: 'pulse 2s infinite'
                  }}
                >
                  VS
                </h2>
              </div>

              {/* Player 2 */}
              <PlayerCardFallback player={player2} position="right" delay={0.2} />
            </div>

            {/* Battle ready text */}
            <div
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
              style={{ ...styles.fadeIn, animationDelay: '2s' }}
            >
              <p className="text-lg md:text-xl font-medium tracking-wide" style={{ color: '#A0AEC0' }}>
                Get Ready to Battle!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}