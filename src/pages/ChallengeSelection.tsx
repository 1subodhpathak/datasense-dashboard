
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/sonner";
import DashboardLayout from '@/components/layout/DashboardLayout';
import ChallengeCard from '@/components/ChallengeCard';

// Define the Challenge type since @/types is missing
interface Challenge {
  _id: string;
  title: string;
  description: string;
  difficulty: string;
  timeEstimate: number;
  image?: string;
  topics: string[];
}

// Mock function to replace missing getAllChallenges from @/lib/actions/challenge.actions
const getAllChallenges = async (): Promise<Challenge[]> => {
  // Simulating API call with setTimeout
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          _id: '1',
          title: 'SQL Basics',
          description: 'Learn the fundamentals of SQL queries',
          difficulty: 'beginner',
          timeEstimate: 30,
          image: '/lovable-uploads/5a5c8059-fada-4396-93e4-07063e40a868.png',
          topics: ['SQL', 'Database']
        },
        {
          _id: '2',
          title: 'Advanced Joins',
          description: 'Master complex SQL joins and relationships',
          difficulty: 'advanced',
          timeEstimate: 60,
          image: '/lovable-uploads/24253064-f0e2-4198-a2dd-cfc4df78faa3.png',
          topics: ['SQL', 'Joins']
        },
        {
          _id: '3',
          title: 'Data Analysis with Python',
          description: 'Analyze data using Python and pandas',
          difficulty: 'intermediate',
          timeEstimate: 45,
          image: '/lovable-uploads/b2c0d5dd-de06-4329-9ccf-7bf284ef14a6.png',
          topics: ['Python', 'Data Analysis']
        }
      ]);
    }, 1000);
  });
};

const ChallengeSelection = () => {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState<Challenge[] | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Mocking authentication state
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const fetchedChallenges = await getAllChallenges();
        setChallenges(fetchedChallenges);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch challenges:", error);
        toast("Failed to fetch challenges. Please try again later.", {
          description: "There was an error loading the challenges.",
        });
        setIsLoading(false);
      }
    };

    fetchChallenges();
  }, []);

  useEffect(() => {
    // Simulate auth check - in a real app, this would check a token or session
    const checkAuth = () => {
      const isAuth = localStorage.getItem('isAuthenticated') === 'true';
      setIsAuthenticated(isAuth || true); // Default to true for demo purposes
      setIsLoading(false);
    };
    
    checkAuth();
  }, [navigate]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full">
          <Skeleton className="w-[300px] h-[400px]" />
        </div>
      </DashboardLayout>
    );
  }

  if (!isAuthenticated) {
    // Navigate would happen in useEffect in a real app
    return null;
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold text-center mb-6">
          Select a Challenge
        </h1>
        {challenges === null ? (
          <div className="challenge-grid">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="p-4 rounded-lg shadow-md">
                <Skeleton className="w-full h-40 mb-2" />
                <Skeleton className="w-3/4 h-6 mb-1" />
                <Skeleton className="w-1/2 h-4" />
              </div>
            ))}
          </div>
        ) : challenges.length > 0 ? (
          <div className="challenge-grid">
            {challenges.map((challenge) => (
              <ChallengeCard 
                key={challenge._id} 
                name={challenge.title}
                timeOptions={[15, 30, 45]} 
                icon={<img src={challenge.image || "/placeholder.svg"} alt={challenge.title} className="h-8 w-8" />}
                selected={false}
                onClick={() => {}}
                onTimeSelect={() => {}}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500">
            No challenges available at the moment.
          </div>
        )}
      </div>
      <style>
        {`
    .challenge-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
    }
    @media (min-width: 1024px) {
      .challenge-grid {
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      }
    }
  `}
      </style>
    </DashboardLayout>
  );
};

export default ChallengeSelection;
