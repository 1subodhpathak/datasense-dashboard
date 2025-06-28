import React, { useEffect, useState } from 'react';
import { useWebSocketContext } from '@/util/WebsocketProvider';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { useTheme } from '@/lib/theme-context';

const ConnectionStatusPopup = () => {
  const { isConnected } = useWebSocketContext();
  const [showPopup, setShowPopup] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    if (!isConnected) {
      setShowPopup(true);
    } else {
      const timer = setTimeout(() => setShowPopup(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isConnected]);

  if (!showPopup) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 flex items-center justify-center p-4 z-50 animate-fade-in-up">
      <div className={`
        max-w-md w-full px-6 py-4 rounded-xl shadow-lg
        transition-all duration-300 ease-in-out
        ${theme === 'dark' 
          ? (isConnected ? 'bg-[#2a2d2e] border border-green-500' : 'bg-[#2a2d2e] border border-red-500')
          : (isConnected ? 'bg-white border border-green-500' : 'bg-white border border-red-500')}
      `}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isConnected ? (
              <Wifi className={`w-6 h-6 ${theme === 'dark' ? 'text-green-400' : 'text-green-500'}`} />
            ) : (
              <WifiOff className={`w-6 h-6 ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`} />
            )}
            <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {isConnected ? 'Connection Restored' : 'Connection Lost'}
            </h2>
          </div>
          {!isConnected && (
            <RefreshCw className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} animate-spin`} />
          )}
        </div>
        <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          {isConnected
            ? "Great news! You're back online. Your game will continue shortly."
            : "We're having trouble connecting to the server. We'll keep trying to reconnect you."}
        </p>
        {!isConnected && (
          <div className={`mt-4 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            <p className="font-semibold mb-1">Troubleshooting tips:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Check your internet connection</li>
              <li>Try refreshing the page</li>
              <li>Contact support if the issue persists</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionStatusPopup;