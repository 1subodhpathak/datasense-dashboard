import { useContext, useMemo, useState, useRef, useEffect } from "react";
import { ProfileContext } from "@/context/ProfileContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Building2, BriefcaseBusiness, Share2, Edit2, Facebook, Linkedin } from "lucide-react";
import { useLocation } from "react-router-dom";
import ProfileEdit from "@/pages/ProfileEdit";

const fallbackAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=default";

const ProfileHero = () => {
  const { profile, isLoading } = useContext(ProfileContext);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const bannerSrc = profile?.banner && profile.banner.trim().length > 0 ? profile.banner : null;
  const avatarSrc = profile?.avatar || fallbackAvatar;

  // Get current portfolio page URL
  const portfolioUrl = useMemo(() => {
    const baseUrl = window.location.origin;
    return `${baseUrl}${location.pathname}`;
  }, [location.pathname]);

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
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(portfolioUrl)}`;
    window.open(shareUrl, "_blank");
    setShowShareMenu(false);
  };

  const handleShareLinkedIn = () => {
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(portfolioUrl)}`;
    window.open(shareUrl, "_blank");
    setShowShareMenu(false);
  };

  const fullName = useMemo(() => {
    const first = profile?.firstName?.trim();
    const last = profile?.lastName?.trim();
    if (first || last) {
      return `${first ?? ""}${first && last ? " " : ""}${last ?? ""}`;
    }
    return "Your Name";
  }, [profile?.firstName, profile?.lastName]);

  if (isLoading) {
    return (
      <section className="overflow-hidden rounded-3xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#32363C] shadow-lg">
        <div className="h-40 w-full bg-gray-200/60 animate-pulse sm:h-48 md:h-56 lg:h-64" />
        <div className="space-y-6 px-6 pb-6 pt-8 md:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="size-28 rounded-2xl bg-gray-200/70 animate-pulse md:size-32" />
              <div className="space-y-3">
                <div className="h-6 w-48 rounded-full bg-gray-200/80 animate-pulse" />
                <div className="h-4 w-72 rounded-full bg-gray-200/70 animate-pulse" />
                <div className="h-4 w-56 rounded-full bg-gray-200/60 animate-pulse" />
              </div>
            </div>
            <div className="h-6 w-64 rounded-full bg-gray-200/60 animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full overflow-hidden rounded-3xl border border-gray-300 dark:border-gray-600/20 bg-white dark:bg-[#32363C] shadow-lg dark:border-gray-600 dark:bg-[#32363C]">
      <div className="h-28 w-full bg-gray-200 sm:h-32 md:h-36 lg:h-40">
        {bannerSrc ? (
          <img src={bannerSrc} alt="Profile banner" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-[#1fb9b9] to-[#137c7c]" />
        )}
      </div>

      <div className="flex flex-col gap-6 px-6 py-6 md:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:gap-6 w-full md:w-auto">
            <Avatar className="size-24 flex-shrink-0 overflow-hidden rounded-full border-4 border-white bg-white shadow-md md:size-28 dark:border-gray-600 dark:bg-[#2f2f2f]">
              <AvatarImage src={avatarSrc} alt={fullName} />
              <AvatarFallback className="bg-gray-200 text-lg font-semibold text-gray-900 dark:bg-[#2f2f2f] dark:text-white">
                {fullName
                  .split(" ")
                  .map((part) => part.charAt(0))
                  .join("") || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 w-full space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white md:text-2xl break-words">{fullName}</h1>
                {/* <Badge className="rounded-full border border-dsb-accent/40 bg-dsb-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-cyan-600 dark:text-cyan-500">
                  Verified
                </Badge> */}
              </div>
              <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-300 break-words">
                {profile?.bio?.trim()
                  ? profile.bio.trim()
                  : "Your bio here..."}
              </p>

              <div className="flex flex-col gap-2 text-sm text-gray-500 dark:text-gray-300">
                {profile?.profession && (
                  <span className="inline-flex items-center gap-2 flex-wrap">
                    <BriefcaseBusiness className="h-4 w-4 flex-shrink-0 text-cyan-600 dark:text-cyan-500" />
                    <span className="break-words">{profile.profession}</span>
                  </span>
                )}
                {profile?.company && (
                  <span className="inline-flex items-center gap-2 flex-wrap">
                    <Building2 className="h-4 w-4 flex-shrink-0 text-cyan-600 dark:text-cyan-500" />
                    <span className="break-words">{profile.company}</span>
                  </span>
                )}
                {profile?.phone && profile.showPhone && (
                  <span className="inline-flex items-center gap-2 flex-wrap">
                    <MapPin className="h-4 w-4 flex-shrink-0 text-cyan-600 dark:text-cyan-500" />
                    <span className="break-words">{profile.phone}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0 md:ml-auto">
            <div className="relative" ref={shareMenuRef}>
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="flex items-center justify-center rounded-lg border border-cyan-600/20 dark:border-cyan-500/20 bg-cyan-600/10 dark:bg-cyan-500/10 p-2 text-cyan-600 dark:text-cyan-500 transition-all hover:bg-cyan-600/20 dark:hover:bg-cyan-500/20 hover:border-cyan-600/40 dark:hover:border-cyan-500/40"
                aria-label="Share profile"
              >
                <Share2 className="h-5 w-5" />
              </button>
              
              {showShareMenu && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full z-50 mt-2 w-48 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-[#32363C] shadow-lg">
                  <div className="p-1">
                    <button
                      onClick={handleShareFacebook}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Facebook className="h-4 w-4 text-[#1877F2]" />
                      Share on Facebook
                    </button>
                    <button
                      onClick={handleShareLinkedIn}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Linkedin className="h-4 w-4 text-[#0077B5]" />
                      Share on LinkedIn
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setIsEditOpen(true)}
              className="flex items-center justify-center rounded-lg border border-cyan-600/20 dark:border-cyan-500/20 bg-cyan-600/10 dark:bg-cyan-500/10 p-2 text-cyan-600 dark:text-cyan-500 transition-all hover:bg-cyan-600/20 dark:hover:bg-cyan-500/20 hover:border-cyan-600/40 dark:hover:border-cyan-500/40"
              aria-label="Edit profile"
            >
              <Edit2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      <ProfileEdit open={isEditOpen} onOpenChange={setIsEditOpen} />
    </section>
  );
};

export default ProfileHero;
