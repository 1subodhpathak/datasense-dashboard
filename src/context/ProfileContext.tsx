import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";

export interface ProfileData {
    avatar: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    profession: string;
    company: string;
    showPhone: boolean;
    banner?: string; // Added banner field from your fetch logic
}

const DEFAULT_PROFILE: ProfileData = {
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=default",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    profession: "",
    company: "",
    showPhone: false,
};

interface ProfileContextType {
    profile: ProfileData | null;
    setProfile: React.Dispatch<React.SetStateAction<ProfileData | null>>;
    isLoading: boolean;
    fetchProfile: (clerkId: string, getToken: () => Promise<string>) => Promise<void>;
    error: string | null;
}

export const ProfileContext = createContext<ProfileContextType>({
    profile: DEFAULT_PROFILE,
    setProfile: () => {},
    isLoading: false,
    fetchProfile: async () => {},
    error: null,
});

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useUser(); // Get the Clerk user object

    const [profile, setProfile] = useState<ProfileData | null>(DEFAULT_PROFILE);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const defaultAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=default";
    const defaultBanner = ""; // You can set your default banner URL here

    const fetchProfile = async (clerkId: string, getToken: () => Promise<string>) => {
        if (!clerkId) return;

        try {
            setIsLoading(true);
            setError(null);
            const token = await getToken();
            const response = await axios.get(
                `https://server.datasenseai.com/battleground-profile/${clerkId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            // Use API data, fallback to Clerk user if missing
            const fetchedProfile: ProfileData = {
                firstName: response.data?.firstname || user?.firstName || "",
                lastName: response.data?.lastname || user?.lastName || "",
                email: response.data?.email || user?.emailAddresses?.[0]?.emailAddress || "",
                phone: response.data?.mobile || "",
                avatar: response.data?.avatar || defaultAvatar,
                banner: response.data?.banner || defaultBanner,
                profession: response.data?.profession || "",
                company: response.data?.company || "",
                showPhone: typeof response.data?.showPhone === "boolean" ? response.data.showPhone : false,
            };

            setProfile(fetchedProfile);

            // Store avatar in localStorage
            localStorage.setItem('avatar', JSON.stringify(fetchedProfile.avatar));
            // Optionally store the whole profile for fallback
            localStorage.setItem('profile', JSON.stringify(fetchedProfile));
        } catch (error) {
            console.error("Error fetching profile:", error);
            setError(error instanceof Error ? error.message : "Failed to fetch profile");

            // Fallback: Try to load from localStorage
            const cachedProfile = localStorage.getItem('profile');
            if (cachedProfile) {
                const parsedProfile = JSON.parse(cachedProfile);
                setProfile({
                    ...parsedProfile,
                    firstName: parsedProfile.firstName || user?.firstName || "",
                    lastName: parsedProfile.lastName || user?.lastName || "",
                    email: parsedProfile.email || user?.emailAddresses?.[0]?.emailAddress || "",
                });
            } else {
                setProfile({
                    ...DEFAULT_PROFILE,
                    firstName: user?.firstName || "",
                    lastName: user?.lastName || "",
                    email: user?.emailAddresses?.[0]?.emailAddress || "",
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const fetchAndSetProfile = async () => {
            if (user && user.id) {
                // Replace getToken with your actual token retrieval logic
                await fetchProfile(user.id, async () => {
                    // Example: get token from Clerk
                    return user.getToken ? await user.getToken() : "";
                });
            }
        };

        fetchAndSetProfile();
        // Only run when user changes
    }, [user]);
    
    return (
        <ProfileContext.Provider 
            value={{ 
                profile, 
                setProfile, 
                isLoading, 
                fetchProfile,
                error 
            }}
        >
            {children}
        </ProfileContext.Provider>
    );
};

// Custom hook for easier usage
export const useProfile = () => {
    const context = useContext(ProfileContext);
    if (context === undefined) {
        throw new Error('useProfile must be used within a ProfileProvider');
    }
    return context;
};