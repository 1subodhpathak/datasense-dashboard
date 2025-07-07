import { Toaster } from "@/components/ui/toaster";
import { Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
// import Start from "./pages/Start";
import Dashboard from "./pages/Dashboard";
import Community from "./pages/Community";
import Leaderboard from "./pages/Leaderboard";
import SqlJourney from "./pages/SqlJourney";
import NotFound from "./pages/NotFound";
import Badges from "./pages/Badges";
import { ThemeProvider } from './lib/theme-context'
import Profile from "./pages/Profile";
import Challenge from "./pages/Challenge";
import ProfileEdit from "./pages/ProfileEdit";
import { ProfileProvider } from "@/context/ProfileContext";
import { useUser, RedirectToSignIn } from '@clerk/clerk-react';
import { WebSocketProvider } from './util/WebsocketProvider'
import { NotificationProvider } from "@/hooks/NotificationProvider";
import axios from 'axios';
import DashboardPractice from "./pages/DashboardPractice";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isLoaded, isSignedIn } = useUser();

  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Redirect to sign-in page if not authenticated
  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }

  return children;
};

const App = () => {
  // Create a new QueryClient instance within the component function
  // This ensures it has the correct React context
  const [queryClient] = useState(() => new QueryClient());
  const { isLoaded, isSignedIn, user } = useUser();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      const clerkId = user.id;
      axios.post('https://server.datasenseai.com/user-streak/update-activity', { clerkId })
        .then(response => {
          console.log('Activity updated:', response.data);
        })
        .catch(error => {
          console.error('Error updating activity:', error);
        });
    }
  }, [user, isLoaded, isSignedIn]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <ProfileProvider>
            <WebSocketProvider url="https://server.datasenseai.com/">
              {/* Wrap NotificationProvider here */}
              <NotificationProvider>
                <BrowserRouter>
                  <Routes>
                    {/* Public route - accessible without login */}
                    {/* {  <Route path="/" element={<iframe src="/home.html" style={{ width: '100%', height: '100vh', border: 'none' }} title="External Page" />} /> } */}
                    
                    {/* Protected routes - require authentication */}
                    <Route 
                      path="/" 
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/practice-dashboard" 
                      element={
                        <ProtectedRoute>
                          <DashboardPractice />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/badges" 
                      element={
                        <ProtectedRoute>
                          <Badges />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/challenge" 
                      element={
                        <ProtectedRoute>
                          <Challenge />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/community" 
                      element={
                        <ProtectedRoute>
                          <Community />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/leaderboard" 
                      element={
                        <ProtectedRoute>
                          <Leaderboard />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/sql-journey" 
                      element={
                        <ProtectedRoute>
                          <SqlJourney />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/profile" 
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/profile-edit" 
                      element={
                        <ProtectedRoute>
                          <ProfileEdit />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </NotificationProvider>
            </WebSocketProvider>
          </ProfileProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;