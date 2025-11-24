import { useContext, useMemo, useState, useRef, useEffect } from "react";
import { ProfileContext, type ProfileData } from "@/context/ProfileContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Building2, BriefcaseBusiness, Share2, Edit2, Facebook, Linkedin, Copy, Mail, Phone } from "lucide-react";
import { useLocation } from "react-router-dom";
import ProfileEdit from "@/pages/ProfileEdit";
import { Button } from "@/components/ui/button";

const fallbackAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=default";

interface ProfileHeroProps {
  profileData?: ProfileData | null;
  isLoadingOverride?: boolean;
  readOnly?: boolean;
  shareUrlOverride?: string;
}

const ProfileHero = ({
  profileData,
  isLoadingOverride,
  readOnly = false,
  shareUrlOverride,
}: ProfileHeroProps) => {
  const { profile: contextProfile, isLoading } = useContext(ProfileContext);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const activeProfile = profileData ?? contextProfile;
  const loadingState = typeof isLoadingOverride === "boolean" ? isLoadingOverride : isLoading;

  const bannerSrc = activeProfile?.banner && activeProfile.banner.trim().length > 0 ? activeProfile.banner : null;
  const avatarSrc = activeProfile?.avatar || fallbackAvatar;

  // Determine shareable URL
  const shareLink = useMemo(() => {
    if (shareUrlOverride) return shareUrlOverride;
    const baseUrl = window.location.origin;
    if (activeProfile?.clerkId) {
      return `${baseUrl}/p/${activeProfile.clerkId}`;
    }
    return `${baseUrl}${location.pathname}`;
  }, [shareUrlOverride, activeProfile?.clerkId, location.pathname]);

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
    };

    if (showShareMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showShareMenu]);

  // Share functions
  const handleShareFacebook = () => {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`;
    window.open(shareUrl, "_blank");
    setShowShareMenu(false);
  };

  const handleShareLinkedIn = () => {
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareLink)}`;
    window.open(shareUrl, "_blank");
    setShowShareMenu(false);
  };

  const handleCopyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      setCopied(false);
    }
  };

  const fullName = useMemo(() => {
    const first = activeProfile?.firstName?.trim();
    const last = activeProfile?.lastName?.trim();
    if (first || last) {
      return `${first ?? ""}${first && last ? " " : ""}${last ?? ""}`;
    }
    return "Your Name";
  }, [activeProfile?.firstName, activeProfile?.lastName]);

  if (loadingState) {
    return (
      <section className="overflow-hidden rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#32363C] shadow-lg">
        <div className="h-32 w-full bg-gray-200/60 animate-pulse" />
        <div className="px-6 pb-6">
          <div className="-mt-12 mb-4 flex items-end justify-between">
             <div className="size-24 rounded-full bg-gray-200/70 animate-pulse border-4 border-white dark:border-[#32363C]" />
          </div>
          <div className="space-y-3">
            <div className="h-6 w-48 rounded-full bg-gray-200/80 animate-pulse" />
            <div className="h-4 w-full rounded-full bg-gray-200/70 animate-pulse" />
            <div className="h-4 w-2/3 rounded-full bg-gray-200/60 animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="group relative w-full overflow-hidden rounded-2xl border border-gray-300 dark:border-gray-600/50 bg-white dark:bg-[#32363C] shadow-lg neo-glass-dark">
      
      {/* 1. Cover Photo Area */}
      <div className="h-36 w-full bg-gray-100 dark:bg-[#2A2F36]">
        {bannerSrc ? (
          <img src={bannerSrc} alt="Profile banner" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-[#1fb9b9] to-[#137c7c]" />
        )}
      </div>

      {/* 2. Main Content Area */}
      <div className="px-6 pb-6">
        
        {/* Top Row: Avatar (Left) and Buttons (Right) */}
        <div className="flex items-end justify-between -mt-12 mb-5">
          {/* Avatar - Overlapping the banner */}
          <Avatar className="size-24 rounded-full border-[4px] border-white bg-white shadow-sm dark:border-[#32363C] dark:bg-[#2f2f2f]">
            <AvatarImage src={avatarSrc} alt={fullName} className="object-cover" />
            <AvatarFallback className="bg-gray-100 text-xl font-bold text-gray-700 dark:bg-[#2f2f2f] dark:text-white">
              {fullName.charAt(0)}
            </AvatarFallback>
          </Avatar>

          {/* Action Buttons - Aligned to the right */}
          <div className="flex gap-2 pb-1">
            <div className="relative" ref={shareMenuRef}>
              <Button
                size="sm"
                onClick={() => setShowShareMenu((prev) => !prev)}
                className="h-9 gap-2 rounded-lg bg-cyan-600/10 px-3 text-xs font-semibold text-cyan-700 shadow-none hover:bg-cyan-600/20 dark:bg-cyan-500/10 dark:text-cyan-400"
              >
                <Share2 className="h-3.5 w-3.5" />
              </Button>

              {/* Dropdown Menu */}
              {showShareMenu && (
                <div className="absolute right-0 top-10 z-20 w-48 rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl dark:border-gray-600 dark:bg-[#2A2F36]">
                  <button
                    onClick={handleShareFacebook}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                  >
                    <Facebook className="h-4 w-4 text-[#1877F2]" />
                    Facebook
                  </button>
                  <button
                    onClick={handleShareLinkedIn}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                  >
                    <Linkedin className="h-4 w-4 text-[#0077B5]" />
                    LinkedIn
                  </button>
                  <button
                    onClick={handleCopyShareLink}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                  >
                    <Copy className="h-4 w-4" />
                    {copied ? "Copied!" : "Copy link"}
                  </button>
                </div>
              )}
            </div>

            {!readOnly && (
              <Button
                size="sm"
                onClick={() => setIsEditOpen(true)}
                className="h-9 gap-2 rounded-lg bg-cyan-600/10 px-3 text-xs font-semibold text-cyan-700 shadow-none hover:bg-cyan-600/20 dark:bg-cyan-500/10 dark:text-cyan-400"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Bottom Section: Text Info */}
        <div className="space-y-4">
          {/* Name & Bio */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white break-words">
              {fullName}
            </h1>
            <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-300 max-w-prose break-words">
              {activeProfile?.bio?.trim() || "Add a bio to tell people about yourself..."}
            </p>
          </div>

          {/* Skills - Horizontal Scrollable or Wrap */}
          {activeProfile?.skills && activeProfile.skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {activeProfile.skills.slice(0, 8).map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600 dark:border-gray-600/50 dark:bg-[#2A2F36] dark:text-gray-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}

          {/* <div className="h-px w-full bg-gray-100 dark:bg-gray-700" /> */}

          {/* Meta Details (Occupation, Company, Location) */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-5 pt-1 text-sm text-gray-600 dark:text-gray-400">
            {activeProfile?.profession && (
              <div className="flex items-center gap-2">
                <BriefcaseBusiness className="h-4 w-4 text-cyan-600 dark:text-cyan-500" />
                <span className="font-medium">{activeProfile.profession}</span>
              </div>
            )}
            {activeProfile?.company && (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-cyan-600 dark:text-cyan-500" />
                <span className="font-medium">{activeProfile.company}</span>
              </div>
            )}
            {activeProfile?.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-cyan-600 dark:text-cyan-500" />
                <span className="font-medium">{activeProfile.email}</span>
              </div>
            )}
            {activeProfile?.phone && activeProfile.showPhone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-cyan-600 dark:text-cyan-500" />
                <span className="font-medium">{activeProfile.phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {!readOnly && <ProfileEdit open={isEditOpen} onOpenChange={setIsEditOpen} />}
    </section>
  );
};

export default ProfileHero;