import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import ProfileHero from "@/components/profile/ProfileHero";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Medal, FileText, FolderGit2, MessageSquareCode } from "lucide-react";
import type { ProfileData } from "@/context/ProfileContext";
import DashboardLayout from "@/components/layout/DashboardLayout";

type ChecklistItem = {
  id: "photo" | "bio" | "skills" | "credential";
  title: string;
  description: string;
  action: string;
  completed: boolean;
  summary: string;
  highlights?: string[];
};

type PortfolioExtras = {
  bio?: string;
  skills?: string[];
  credentials?: string[];
  projects?: string[];
  coreSkills?: string[];
  technicalSkills?: string[];
  softSkills?: string[];
  workStatus?: "open_to_work" | "working";
};

const profileTasks = [
  {
    id: "photo",
    title: "Add a profile photo",
    description: "Upload a crisp, professional image so peers recognise you instantly.",
    action: "Upload photo",
  },
  {
    id: "bio",
    title: "Write your biography",
    description: "Share a short summary of your strengths, interests, and goals.",
    action: "Edit bio",
  },
  {
    id: "skills",
    title: "List your top skills",
    description: "Highlight up to five skills that define your expertise.",
    action: "Update skills",
  },
  {
    id: "credential",
    title: "Share a credential",
    description: "Add certificates or recognition that build trust with recruiters.",
    action: "Add credential",
  },
] as const;

const projectIdeas = [
  { title: "Customer Churn Dashboard", description: "Power BI project demonstrating retention insights and cohort analysis." },
  { title: "SQL Marketing Pipeline", description: "End-to-end SQL case study on lead quality and campaign performance." },
  { title: "Python Forecasting Toolkit", description: "Notebook that predicts monthly sales with ARIMA and Prophet." },
];

// const API_BASE_URL = "https://server.datasenseai.com";
const API_BASE_URL = "http://localhost:4000";

const DEFAULT_AVATAR = "https://api.dicebear.com/7.x/avataaars/svg?seed=default";

const PublicPortfolio = () => {
  const { clerkId } = useParams<{ clerkId: string }>();
  const [profile, setProfile] = useState<(ProfileData & PortfolioExtras) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clerkId) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE_URL}/battleground-profile/public/${clerkId}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("This profile could not be found.");
          }
          throw new Error("Failed to load profile.");
        }
        const data = await response.json();
        const convertedProfile: ProfileData & PortfolioExtras = {
          avatar: data.avatar || DEFAULT_AVATAR,
          banner: data.banner || "",
          firstName: data.firstname || "",
          lastName: data.lastname || "",
          email: data.email || "",
          phone: data.phone || "",
          profession: data.profession || "",
          company: data.company || "",
          showPhone: Boolean(data.showPhone),
          bio: data.bio || "",
          skills: Array.isArray(data.skills) ? data.skills : [],
          credentials: Array.isArray(data.credentials) ? data.credentials : [],
          projects: Array.isArray(data.projects) ? data.projects : [],
          coreSkills: Array.isArray(data.coreSkills) ? data.coreSkills : [],
          technicalSkills: Array.isArray(data.technicalSkills) ? data.technicalSkills : [],
          softSkills: Array.isArray(data.softSkills) ? data.softSkills : [],
          clerkId: data.clerkId || clerkId,
          workStatus: data.workStatus === "working" ? "working" : "open_to_work",
        };
        setProfile(convertedProfile);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load this profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [clerkId]);

  const hasProfilePhoto = useMemo(() => {
    const avatar = profile?.avatar?.trim();
    if (!avatar) return false;
    return avatar !== "" && avatar !== DEFAULT_AVATAR;
  }, [profile?.avatar]);

  const biography = useMemo(() => (profile?.bio ?? "").trim(), [profile?.bio]);

  const normalizedSkills = useMemo(() => {
    if (!Array.isArray(profile?.skills)) return [];
    return profile.skills.filter((skill) => typeof skill === "string" && skill.trim().length > 0);
  }, [profile?.skills]);

  const normalizedCredentials = useMemo(() => {
    if (!Array.isArray(profile?.credentials)) return [] as string[];
    return (profile?.credentials as unknown[])
      .map((credential) => {
        if (typeof credential === "string") {
          const trimmed = credential.trim();
          return trimmed.length > 0 ? trimmed : null;
        }
        if (credential && typeof credential === "object") {
          const record = credential as Record<string, unknown>;
          const candidate =
            (typeof record.title === "string" && record.title) ||
            (typeof record.name === "string" && record.name) ||
            (typeof (record as { badgeName?: unknown }).badgeName === "string" && (record as { badgeName?: string }).badgeName) ||
            (typeof (record as { credential?: unknown }).credential === "string" && (record as { credential?: string }).credential) ||
            (typeof (record as { credentialName?: unknown }).credentialName === "string" && (record as { credentialName?: string }).credentialName);
          if (candidate) {
            const trimmedCandidate = candidate.trim();
            return trimmedCandidate.length > 0 ? trimmedCandidate : null;
          }
        }
        return null;
      })
      .filter((credential): credential is string => Boolean(credential));
  }, [profile?.credentials]);

  const normalizedCoreSkills = useMemo(() => {
    if (!Array.isArray(profile?.coreSkills)) return [];
    return profile.coreSkills.filter((skill) => typeof skill === "string" && skill.trim().length > 0);
  }, [profile?.coreSkills]);

  const normalizedTechnicalSkills = useMemo(() => {
    if (!Array.isArray(profile?.technicalSkills)) return [];
    return profile.technicalSkills.filter((skill) => typeof skill === "string" && skill.trim().length > 0);
  }, [profile?.technicalSkills]);

  const normalizedSoftSkills = useMemo(() => {
    if (!Array.isArray(profile?.softSkills)) return [];
    return profile.softSkills.filter((skill) => typeof skill === "string" && skill.trim().length > 0);
  }, [profile?.softSkills]);

  const profileChecklist = useMemo<ChecklistItem[]>(() => {
    const biographyPreview = biography.length > 120 ? `${biography.slice(0, 117)}…` : biography;

    return profileTasks.map((task) => {
      const base = {
        id: task.id,
        title: task.title,
        description: task.description,
        action: task.action,
      };

      if (task.id === "photo") {
        const completed = hasProfilePhoto;
        return {
          ...base,
          completed,
          summary: completed ? "Profile photo uploaded" : "No profile photo yet",
        };
      }

      if (task.id === "bio") {
        const completed = biography.length > 0;
        return {
          ...base,
          completed,
          summary: completed ? biographyPreview : "Biography not added",
        };
      }

      if (task.id === "skills") {
        const completed = normalizedSkills.length > 0;
        return {
          ...base,
          completed,
          summary: completed
            ? `${normalizedSkills.length} skill${normalizedSkills.length === 1 ? "" : "s"} added`
            : "No skills added yet",
          highlights: completed ? normalizedSkills : undefined,
        };
      }

      if (task.id === "credential") {
        const completed = normalizedCredentials.length > 0;
        return {
          ...base,
          completed,
          summary: completed
            ? `${normalizedCredentials.length} credential${normalizedCredentials.length === 1 ? "" : "s"} shared`
            : "No credentials shared yet",
          highlights: completed ? normalizedCredentials : undefined,
        };
      }

      return {
        ...base,
        completed: false,
        summary: "",
      };
    });
  }, [biography, hasProfilePhoto, normalizedCredentials, normalizedSkills]);

  const totalTasks = profileChecklist.length;
  const completedTasks = profileChecklist.filter((task) => task.completed).length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const tasksRemaining = totalTasks - completedTasks;
  const portfolioLevel = completionPercentage >= 75 ? "Showcase Ready" : completionPercentage >= 40 ? "Developing" : "Beginner";
  const summaryLabel = `${completedTasks} / ${totalTasks} task${totalTasks === 1 ? "" : "s"}`;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
          <div className="w-full lg:w-[40%] lg:flex-shrink-0">
            <div className="flex flex-col gap-5">
              <ProfileHero
                profileData={profile ?? undefined}
                isLoadingOverride={loading}
                readOnly
                shareUrlOverride={typeof window !== "undefined" ? window.location.href : undefined}
              />
              {/* <ProfileHero/> */}
              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
                  {error}
                </div>
              ) : (
                <>
                  <Card className="rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#32363C] shadow-lg neo-glass-dark">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-2xl font-semibold text-gray-900 dark:text-white">
                        <Medal className="h-5 w-5 text-cyan-600 dark:text-cyan-500" />
                        Credentials
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-base leading-relaxed text-gray-600 dark:text-gray-300">
                      {normalizedCredentials.length > 0 ? (
                        <ul className="space-y-2 text-gray-700 dark:text-gray-200">
                          {normalizedCredentials.map((credential) => (
                            <li key={credential} className="rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-600">
                              {credential}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-500 dark:border-gray-600 dark:bg-[#2A2F36] dark:text-gray-300">
                          No credentials shared yet.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  {/* Skills Dashboard Card */}
                  <Card className="rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#32363C] shadow-lg neo-glass-dark">
                    <CardHeader>
                      <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white">Skills Dashboard</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-6 md:grid-cols-3">
                        {/* Core Skills */}
                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-900 dark:text-white">Core Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            {normalizedCoreSkills.length > 0 ? normalizedCoreSkills.map((skill, index) => (
                              <span
                                key={`${skill}-${index}`}
                                className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400"
                              >
                                {skill}
                              </span>
                            )) : (
                              <span className="text-xs text-gray-500 italic">No skills added</span>
                            )}
                          </div>
                        </div>
                        {/* Technical Skills */}
                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-900 dark:text-white">Technical Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            {normalizedTechnicalSkills.length > 0 ? normalizedTechnicalSkills.map((skill, index) => (
                              <span
                                key={`${skill}-${index}`}
                                className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400"
                              >
                                {skill}
                              </span>
                            )) : (
                              <span className="text-xs text-gray-500 italic">No skills added</span>
                            )}
                          </div>
                        </div>
                        {/* Soft Skills */}
                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-900 dark:text-white">Soft Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            {normalizedSoftSkills.length > 0 ? normalizedSoftSkills.map((skill, index) => (
                              <span
                                key={`${skill}-${index}`}
                                className="inline-flex items-center gap-1 rounded-md border border-purple-200 bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-400"
                              >
                                {skill}
                              </span>
                            )) : (
                              <span className="text-xs text-gray-500 italic">No skills added</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#32363C] shadow-lg neo-glass-dark">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-2xl font-semibold text-gray-900 dark:text-white">
                        <FileText className="h-6 w-6 text-cyan-600 dark:text-cyan-500" />
                        Portfolio Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5 text-base leading-relaxed text-gray-600 dark:text-gray-300">
                      <div className="space-y-3 rounded-xl border border-gray-200 dark:border-gray-600/30 bg-white dark:bg-[#2A2F36] p-5 shadow-sm">
                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 md:text-base">
                          <span className="font-medium text-gray-900 dark:text-white/80">Profile completeness</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{summaryLabel}</span>
                        </div>
                        <Progress value={completionPercentage} className="h-2 rounded-full bg-gray-200 dark:bg-black/40" indicatorClassName="bg-cyan-600 dark:bg-cyan-500" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-gray-600 dark:text-gray-300">Build credibility by keeping these sections fresh:</p>
                        <ul className="space-y-1 pl-4 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                          <li className="list-disc">Refresh your bio with current goals.</li>
                          <li className="list-disc">Highlight your latest wins in the projects section.</li>
                          <li className="list-disc">Share credentials to unlock higher portfolio strength.</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
          {!error && (
            <section className="w-full lg:w-[60%] lg:flex-shrink-0 space-y-5">
              <Card className="rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#32363C] shadow-lg neo-glass-dark">
                <CardHeader className="pb-0">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white">Portfolio Strength</CardTitle>
                    <Badge className="rounded-lg border border-cyan-600/40 dark:border-cyan-500/40 bg-cyan-600/10 dark:bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-600 dark:text-cyan-500">
                      {portfolioLevel}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Complete these steps to improve your portfolio presence.</p>
                </CardHeader>
                <CardContent className="space-y-5 pt-6">
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                      <span>Action checklist</span>
                      <span>{completionPercentage}% complete</span>
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {tasksRemaining === 0 ? "All set – every item is complete" : `${tasksRemaining} task${tasksRemaining === 1 ? "" : "s"} left (${summaryLabel})`}
                    </p>
                    <Progress value={completionPercentage} className="mt-3 h-2 rounded-full bg-gray-200 dark:bg-black/40" indicatorClassName="bg-cyan-600 dark:bg-cyan-500" />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {profileChecklist.map((task) => (
                      <div
                        key={task.id}
                        className="rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#32363C] p-4 shadow-lg transition-all duration-300"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="text-base font-semibold text-gray-900 dark:text-white">{task.title}</h4>
                          <Badge
                            className={`rounded-lg px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${task.completed
                                ? "border-cyan-600/40 bg-cyan-600/10 text-cyan-600 dark:border-cyan-500/40 dark:bg-cyan-500/10 dark:text-cyan-300"
                                : "border-gray-300 bg-transparent text-gray-600 dark:border-gray-600 dark:text-gray-300"
                              }`}
                          >
                            {task.completed ? "Complete" : "Pending"}
                          </Badge>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{task.description}</p>
                        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{task.summary}</p>
                        {task.id !== "skills" && task.highlights && task.highlights.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {task.highlights.slice(0, 5).map((item) => (
                              <span
                                key={item}
                                className="inline-flex items-center rounded-lg border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 dark:border-gray-600 dark:text-gray-300"
                              >
                                {item}
                              </span>
                            ))}
                            {task.highlights.length > 5 && (
                              <span className="inline-flex items-center rounded-lg border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 dark:border-gray-600 dark:text-gray-300">
                                +{task.highlights.length - 5} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#32363C] shadow-lg neo-glass-dark">
                <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-2">
                    <FolderGit2 className="h-6 w-6 text-cyan-600 dark:text-cyan-500" />
                    <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white">Projects</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500 dark:border-gray-600 dark:bg-[#2A2F36] dark:text-gray-300">
                    No showcase projects yet. Check out our recommended ideas below.
                  </div>
                  <div className="space-y-4">
                    {projectIdeas.map((project) => (
                      <div
                        key={project.title}
                        className="rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#32363C] p-4 shadow-lg transition-all duration-300 hover:border-cyan-600/40"
                      >
                        <h4 className="text-base font-semibold text-gray-900 dark:text-white">{project.title}</h4>
                        <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{project.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>
          )}
        </div>

        {!error && (
          <section className="grid gap-5 lg:grid-cols-3">
            <Card className="rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#32363C] shadow-lg neo-glass-dark">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl font-semibold text-gray-900 dark:text-white">
                  <MessageSquareCode className="h-6 w-6 text-cyan-600 dark:text-cyan-500" />
                  Community Highlights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                <p>Share your expertise by writing breakdowns of your projects. Well-documented stories stand out on your portfolio.</p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#32363C] shadow-lg neo-glass-dark">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white">Recommended Next Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                <ul className="space-y-2 pl-5 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                  <li className="list-disc">Enroll in “Advanced SQL Joins” to unlock the SQL Specialist credential.</li>
                  <li className="list-disc">Publish your latest hackathon solution as a case study.</li>
                  <li className="list-disc">Ask for peer feedback on your profile to increase trust.</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#32363C] shadow-lg neo-glass-dark">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white">Need inspiration?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                <p>Explore top-performing portfolios from the community and borrow storytelling patterns that resonate.</p>
              </CardContent>
            </Card>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PublicPortfolio;