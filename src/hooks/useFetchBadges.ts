import { useState, useEffect } from "react";

/**
 * Custom hook to fetch and parse user badges data
 * @param {string} clerkId - The user's Clerk ID
 * @returns {Object} - Object containing badges data and loading state
 */
export const useFetchBadges = (clerkId) => {
  const [badgesData, setBadgesData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBadges = async () => {
      // Don't attempt to fetch if clerkId is not available
      if (!clerkId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // const response = await fetch(`https://server.datasenseai.com/badges/${clerkId}`);
         const response = await fetch(`https://server.datasenseai.com/badges/user_2lKkXWVoveHzII1387GjAFGbFn9`);
        if (response.status === 404) {
          // Handle 404 with fallback data
          console.log("Badges not found, using fallback data");
          // Provide minimal fallback data structure
          setBadgesData({
            success: true,
            clerkId: clerkId,
            badges: [
              {
                category: "Query Explorer",
                badges: [
                  {
                    name: "SQL Freshman",
                    achieved: false,
                    progress: 0,
                    description: "Solved 10 SQL questions"
                  }
                ],
                achievedBadges: 0,
                totalBadges: 1,
                overallProgress: 0
              }
            ]
          });
        } else if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        } else {
          // Parse successful response
          const data = await response.json();
          setBadgesData(data);
        }
      } catch (err) {
        console.error("Error fetching badges:", err);
        setError(err.message || "Failed to fetch badges");
        
        // Fallback to empty data structure on any error
        setBadgesData({
          success: false,
          clerkId: clerkId,
          badges: [],
          error: err.message
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBadges();
  }, [clerkId]);

  // Calculate overall stats across all categories
  const stats = badgesData ? {
    totalAchievedBadges: badgesData.badges?.reduce((total, category) => 
      total + (category.achievedBadges || 0), 0) || 0,
    totalBadges: badgesData.badges?.reduce((total, category) => 
      total + (category.totalBadges || 0), 0) || 0,
    overallProgress: badgesData.badges?.length > 0 
      ? Math.round(badgesData.badges.reduce((sum, category) => 
        sum + (category.overallProgress || 0), 0) / badgesData.badges.length)
      : 0
  } : { totalAchievedBadges: 0, totalBadges: 0, overallProgress: 0 };

  return {
    badgesData,
    isLoading,
    error,
    stats
  };
};