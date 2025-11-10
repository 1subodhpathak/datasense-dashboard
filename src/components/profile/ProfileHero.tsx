import { useContext, useMemo, useState } from "react";
import { ProfileContext } from "@/context/ProfileContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Building2, BriefcaseBusiness, PencilLine } from "lucide-react";
import ProfileEdit from "@/pages/ProfileEdit";

const fallbackAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=default";

const ProfileHero = () => {
  const { profile, isLoading } = useContext(ProfileContext);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const bannerSrc = profile?.banner && profile.banner.trim().length > 0 ? profile.banner : null;
  const avatarSrc = profile?.avatar || fallbackAvatar;

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
      <section className="overflow-hidden rounded-3xl border border-dsb-neutral3/20 bg-white/95 shadow-lg dark:border-white/10 dark:bg-black/40">
        <div className="h-40 w-full bg-slate-200/60 animate-pulse sm:h-48 md:h-56 lg:h-64" />
        <div className="space-y-6 px-6 pb-6 pt-8 md:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="size-28 rounded-2xl bg-slate-200/70 animate-pulse md:size-32" />
              <div className="space-y-3">
                <div className="h-6 w-48 rounded-full bg-slate-200/80 animate-pulse" />
                <div className="h-4 w-72 rounded-full bg-slate-200/70 animate-pulse" />
                <div className="h-4 w-56 rounded-full bg-slate-200/60 animate-pulse" />
              </div>
            </div>
            <div className="h-6 w-64 rounded-full bg-slate-200/60 animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-dsb-neutral3/20 bg-white/95 shadow-lg dark:border-white/10 dark:bg-black/40">
      <div className="h-40 w-full bg-slate-200 sm:h-48 md:h-56 lg:h-64">
        {bannerSrc ? (
          <img src={bannerSrc} alt="Profile banner" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-[#1fb9b9] to-[#137c7c]" />
        )}
      </div>

      <div className="flex flex-col gap-8 px-6 pb-6 pt-8 md:flex-row md:items-center md:justify-between md:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:gap-6">
            <div className="relative">
              <Avatar className="size-28 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-md md:size-32 dark:border-slate-800 dark:bg-slate-900">
                <AvatarImage src={avatarSrc} alt={fullName} />
                <AvatarFallback className="bg-slate-200 text-lg font-semibold text-slate-900 dark:bg-slate-700 dark:text-white">
                  {fullName
                    .split(" ")
                    .map((part) => part.charAt(0))
                    .join("") || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="mt-2 inline-flex items-center rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-semibold text-emerald-950 shadow dark:text-emerald-950">
                Active
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl dark:text-white">{fullName}</h1>
                <Badge className="rounded-full border border-dsb-accent/40 bg-dsb-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-dsb-accent">
                  Verified
                </Badge>
              </div>
              <p className="max-w-2xl text-base leading-relaxed text-dsb-neutral2 dark:text-white/70">
                Keep your profile up to date so peers can discover your expertise and collaboration interests.
              </p>

              <div className="flex flex-wrap gap-4 text-sm text-dsb-neutral2 dark:text-white/70">
                {profile?.profession && (
                  <span className="inline-flex items-center gap-2">
                    <BriefcaseBusiness className="h-4 w-4 text-dsb-accent" />
                    {profile.profession}
                  </span>
                )}
                {profile?.company && (
                  <span className="inline-flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-dsb-accent" />
                    {profile.company}
                  </span>
                )}
                {profile?.phone && profile.showPhone && (
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-dsb-accent" />
                    {profile.phone}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-4 md:items-end">
          <div className="grid grid-cols-3 gap-4 rounded-2xl border border-dsb-neutral3/20 bg-white/90 p-4 text-left text-slate-900 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-white">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-dsb-neutral2 dark:text-white/60">Battleground XP</p>
              <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">12,996</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-dsb-neutral2 dark:text-white/60">Rank</p>
              <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">#78</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-dsb-neutral2 dark:text-white/60">Practice streak</p>
              <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">7 days</p>
            </div>
          </div>

          <Button
            className="flex items-center gap-2 bg-dsb-accent px-6 py-2 text-sm font-semibold text-black hover:bg-dsb-accent/90 dark:text-black"
            onClick={() => setIsEditOpen(true)}
          >
            <PencilLine className="h-4 w-4" />
            Edit Profile
          </Button>
        </div>
      </div>
      <ProfileEdit open={isEditOpen} onOpenChange={setIsEditOpen} />
    </section>
  );
};

export default ProfileHero;
