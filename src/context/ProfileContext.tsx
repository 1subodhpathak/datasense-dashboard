import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { useUser, useAuth } from "@clerk/clerk-react";

export type PortfolioRecord = Record<string, unknown>;

const normalizeSkills = (skills?: unknown[]): string[] => {
  if (!Array.isArray(skills)) return [];
  return skills
    .map((skill) => {
      if (typeof skill === "string") {
        const trimmed = skill.trim();
        return trimmed.length > 0 ? trimmed : null;
      }
      if (skill && typeof skill === "object") {
        const record = skill as Record<string, unknown>;
        const candidate =
          (typeof record.title === "string" && record.title) ||
          (typeof record.name === "string" && record.name) ||
          (typeof record.label === "string" && record.label) ||
          (typeof (record as { skill?: unknown }).skill === "string" && (record as { skill?: string }).skill);
        if (candidate) {
          const trimmedCandidate = candidate.trim();
          return trimmedCandidate.length > 0 ? trimmedCandidate : null;
        }
      }
      return null;
    })
    .filter((value): value is string => Boolean(value));
};

const normalizeRecords = (entries?: unknown[]): PortfolioRecord[] => {
  if (!Array.isArray(entries)) return [];
  return entries
    .map((entry) => {
      if (entry && typeof entry === "object") return entry as PortfolioRecord;
      if (typeof entry === "string") {
        const trimmed = entry.trim();
        return trimmed.length > 0 ? ({ title: trimmed } as PortfolioRecord) : null;
      }
      return null;
    })
    .filter((value): value is PortfolioRecord => Boolean(value));
};

export interface ProfileData {
  avatar: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profession: string;
  company: string;
  showPhone: boolean;
  banner?: string;
  bio?: string;
  skills?: string[];
  credentials?: PortfolioRecord[];
  projects?: PortfolioRecord[];
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
  banner: "",
  bio: "",
  skills: [],
  credentials: [],
  projects: [],
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
  const { user } = useUser();
  const { getToken } = useAuth();

  const [profile, setProfile] = useState<ProfileData | null>(DEFAULT_PROFILE);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=default";
  const defaultBanner = "";

  const fetchProfile = async (clerkId: string, getToken: () => Promise<string>) => {
    if (!clerkId) return;

    try {
      setIsLoading(true);
      setError(null);
      const token = await getToken();
      const response = await axios.get(`https://server.datasenseai.com/battleground-profile/${clerkId}`, {
    //   const response = await axios.get(`http://localhost:4000/battleground-profile/${clerkId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

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
        bio: typeof response.data?.bio === "string" ? response.data.bio : "",
        skills: normalizeSkills(response.data?.skills),
        credentials: normalizeRecords(response.data?.credentials),
        projects: normalizeRecords(response.data?.projects),
      };

      setProfile(fetchedProfile);

      localStorage.setItem("avatar", JSON.stringify(fetchedProfile.avatar));
      localStorage.setItem("profile", JSON.stringify(fetchedProfile));
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch profile");

      const cachedProfile = localStorage.getItem("profile");
      if (cachedProfile) {
        const parsedProfile = JSON.parse(cachedProfile);
        setProfile({
          ...parsedProfile,
          firstName: parsedProfile.firstName || user?.firstName || "",
          lastName: parsedProfile.lastName || user?.lastName || "",
          email: parsedProfile.email || user?.emailAddresses?.[0]?.emailAddress || "",
          bio: typeof parsedProfile.bio === "string" ? parsedProfile.bio : "",
          skills: normalizeSkills(parsedProfile.skills),
          credentials: normalizeRecords(parsedProfile.credentials),
          projects: normalizeRecords(parsedProfile.projects),
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
        await fetchProfile(user.id, async () => {
          if (!getToken) return "";
          const token = await getToken();
          return token ?? "";
        });
      }
    };

    fetchAndSetProfile();
  }, [user]);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        setProfile,
        isLoading,
        fetchProfile,
        error,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};
