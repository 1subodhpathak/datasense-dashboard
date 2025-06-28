import React, { useContext } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Check, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ProfileContext } from "@/context/ProfileContext";

const DashboardHeader = () => {
  const navigate = useNavigate();
  const { profile } = useContext(ProfileContext);

  // Fallbacks
  const defaultAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=default";
  const defaultBanner = ""; // Set your default banner URL if you have one


  // Add this utility function in both components or create a shared utils file
    const getAvatarType = (avatarUrl: string): 'lorelei' | 'dicebear' | 'uploaded' => {
        if (!avatarUrl) return 'uploaded';
        
        if (avatarUrl.includes('dicebear.com') && avatarUrl.includes('lorelei')) {
            return 'lorelei';
        } else if (avatarUrl.includes('dicebear.com')) {
            return 'dicebear';
        } else {
            return 'uploaded';
        }
    };

  return (
    <div className="relative pt-32 pb-6 flex flex-col items-center justify-center">
      {/* Banner Image */}
      <div className="w-full h-48 absolute top-0 left-0 z-0 overflow-hidden">
        <img
          src={profile.banner || defaultBanner}
          alt="Banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60"></div>
      </div>

      {/* Avatar */}
      <div className="relative z-10 mb-3">
        <div className="size-24 rounded-full border-2 border-dsb-accent overflow-hidden neo-glass-dark">
          <Avatar className="size-full">
            <AvatarImage src={profile.avatar || defaultAvatar} alt="User" />
            <AvatarFallback>
              {profile.firstName ? profile.firstName[0] : "U"}
              {profile.lastName ? profile.lastName[0] : ""}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="absolute bottom-1 right-1 bg-green-500 p-1 rounded-full border-2 border-black">
          <span className="flex size-2 rounded-full bg-green-500"></span>
        </div>
      </div>

      {/* User Info */}
      <div className="text-center z-10">
        <div className="flex items-center justify-center gap-2">
          <h2 className="text-2xl font-medium text-white glow-text-subtle">
            {profile.firstName} {profile.lastName}
          </h2>
          <Badge
            variant="outline"
            className="text-dsb-accent border-dsb-accent/30 h-5 px-1"
          >
            <Check className="size-3 mr-1" />
          </Badge>
          <button
            onClick={() => navigate("/profile-edit")}
            className="ml-2 p-1 rounded-full hover:bg-dsb-accent/10 transition-colors"
            aria-label="Edit Profile"
          >
            <Pencil className="w-5 h-5 text-dsb-neutral1 hover:text-dsb-accent" />
          </button>
        </div>
        <div className="flex flex-col items-center mt-1">
          <div className="flex flex-row items-center justify-center gap-8 text-sm text-dsb-neutral1">
            <span className="flex items-center gap-1">
              <span className="size-2 bg-green-500 rounded-full"></span>
              <span className="text-green-400">Active</span>
            </span>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/50 border border-dsb-neutral3/30">
              <img
                src="/png/fuel.png"
                alt="Fuel"
                className="h-4 w-4 mr-1"
              />
              <span className="font-semibold text-white">12996</span>
            </div>
            <span className="flex items-center gap-1">
              <span className="text-dsb-accent font-semibold">#78</span>
              <span className="text-dsb-neutral2">Rank</span>
            </span>
          </div>
          <span className="w-6 h-0.5 bg-gradient-to-r from-transparent via-dsb-neutral3/40 to-transparent rounded-full mx-2 hidden sm:inline-block"></span>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
