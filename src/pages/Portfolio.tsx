import { useContext, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProfileHero from "@/components/profile/ProfileHero";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, FileText, FolderGit2, Medal, MessageSquareCode, PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { ProfileContext, type ProfileData } from "@/context/ProfileContext";

type PortfolioExtras = {
  bio?: string;
  skills?: unknown[];
  credentials?: unknown[];
  projects?: unknown[];
};

const FALLBACK_AVATAR = "https://api.dicebear.com/7.x/avataaars/svg?seed=default";

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

type ProfileTaskConfig = typeof profileTasks[number];
type ProfileTaskId = ProfileTaskConfig["id"];
type ChecklistItem = {
  id: ProfileTaskId;
  title: string;
  description: string;
  action: string;
  completed: boolean;
  summary: string;
  highlights?: string[];
};

const projectIdeas = [
  { title: "Customer Churn Dashboard", description: "Power BI project demonstrating retention insights and cohort analysis." },
  { title: "SQL Marketing Pipeline", description: "End-to-end SQL case study on lead quality and campaign performance." },
  { title: "Python Forecasting Toolkit", description: "Notebook that predicts monthly sales with ARIMA and Prophet." },
];

const Portfolio = () => {
  const { profile } = useContext(ProfileContext);
  const extendedProfile = (profile ?? null) as (ProfileData & PortfolioExtras) | null;

  const hasProfilePhoto = useMemo(() => {
    const avatar = extendedProfile?.avatar?.trim();
    if (!avatar) return false;
    return avatar !== "" && avatar !== FALLBACK_AVATAR;
  }, [extendedProfile?.avatar]);

  const biography = useMemo(() => (extendedProfile?.bio ?? "").trim(), [extendedProfile?.bio]);

  const normalizedSkills = useMemo(() => {
    if (!Array.isArray(extendedProfile?.skills)) return [] as string[];

    return (extendedProfile?.skills as unknown[])
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
      .filter((skill): skill is string => Boolean(skill));
  }, [extendedProfile?.skills]);

  const normalizedCredentials = useMemo(() => {
    if (!Array.isArray(extendedProfile?.credentials)) return [] as string[];

    return (extendedProfile?.credentials as unknown[])
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
  }, [extendedProfile?.credentials]);

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
              <ProfileHero />
              <Card className="rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#32363C] shadow-lg neo-glass-dark">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl font-semibold text-gray-900 dark:text-white">
                    <Medal className="h-5 w-5 text-cyan-600 dark:text-cyan-500" />
                    Credentials
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-base leading-relaxed text-gray-600 dark:text-gray-300">
                  <p className="text-base">
                    Showcase certificates, badges, or achievements that prove your capability. Upload PDFs, share credential IDs, and describe the impact.
                  </p>
                  <div className="space-y-3">
                    <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-600/40 bg-white dark:bg-[#32363C] p-4 text-sm text-gray-500 dark:text-gray-400">
                      You haven’t shared any credentials yet.
                    </div>
                    <Button className="w-full rounded-lg bg-cyan-600 dark:bg-cyan-500 px-5 py-3 text-base font-semibold text-white/95 hover:bg-cyan-700 dark:hover:bg-cyan-600">
                      Add Credential
                    </Button>
                  </div>
                  <div className="h-px w-full bg-gray-200 dark:bg-gray-600/40" />
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Tips</p>
                    <ul className="space-y-1 pl-4 text-sm leading-relaxed">
                      <li className="list-disc">Prioritise recognised certifications (Azure, AWS, PMP).</li>
                      <li className="list-disc">Include links or IDs so viewers can verify quickly.</li>
                    </ul>
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
              <div className="space-y-3 rounded-xl border border-gray-200 dark:border-gray-600/30 bg-white dark:bg-[#32363C] p-5 shadow-sm">
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 md:text-base">
                  <span className="font-medium text-gray-900 dark:text-white/80">Profile completeness</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{summaryLabel}</span>
                </div>
                <Progress
                  value={completionPercentage}
                  className="h-2 rounded-full bg-gray-200 dark:bg-black/40"
                  indicatorClassName="bg-cyan-600 dark:bg-cyan-500"
                />
              </div>

              <div className="space-y-2">
                <p className="text-gray-600 dark:text-gray-300">Build credibility by keeping these sections fresh:</p>
                <ul className="space-y-1 pl-4 text-sm leading-relaxed text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-300">
                  <li className="list-disc">Refresh your bio with current goals.</li>
                  <li className="list-disc">Highlight your latest wins in the projects section.</li>
                  <li className="list-disc">Share credentials to unlock higher portfolio strength.</li>
                </ul>
              </div>

              <Link
                to="/my-journey"
                className="inline-flex items-center gap-2 text-base font-semibold text-cyan-600 dark:text-cyan-500 hover:text-gray-900 dark:text-white"
              >
                See learning journey
                <ChevronRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
            </div>
          </div>
          <section className="w-full lg:w-[60%] lg:flex-shrink-0 space-y-5">
            <Card className="rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#32363C] shadow-lg neo-glass-dark">
              <CardHeader className="pb-0">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white">Portfolio Strength</CardTitle>
                  <Badge className="rounded-lg border border-cyan-600/40 dark:border-cyan-500/40 bg-cyan-600/10 dark:bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-600 dark:text-cyan-500">
                    {portfolioLevel}
                  </Badge>
                </div>
                <p className="text-base text-gray-600 dark:text-gray-300">
                  Complete these steps to improve your portfolio presence.
                </p>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div>
                  <div className="flex items-center justify-between text-sm font-medium uppercase tracking-wide text-gray-600 dark:text-gray-300">
                    <span>Action checklist</span>
                    <span>{completionPercentage}% complete</span>
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {tasksRemaining === 0 ? "All set – every item is complete" : `${tasksRemaining} task${tasksRemaining === 1 ? "" : "s"} left (${summaryLabel})`}
                  </p>
                  <Progress
                    value={completionPercentage}
                    className="mt-3 h-2 rounded-full bg-gray-200 dark:bg-black/40"
                    indicatorClassName="bg-cyan-600 dark:bg-cyan-500"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {profileChecklist.map((task) => (
                    <div
                      key={task.title}
                      className="rounded-xl border border-gray-200 dark:border-gray-600/30 bg-white dark:bg-[#32363C] p-4 shadow-sm transition-all duration-300 hover:border-cyan-600/40 dark:hover:border-cyan-500/40"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="text-base font-semibold text-gray-900 dark:text-white">{task.title}</h4>
                        <Badge
                          className={`rounded-lg px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                            task.completed
                              ? "border-cyan-600/40 dark:border-cyan-500/40 bg-cyan-600/10 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-500"
                              : "border-gray-300 dark:border-gray-600/60 bg-transparent text-gray-600 dark:text-gray-300"
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
                              className="inline-flex items-center rounded-lg border border-gray-300 dark:border-gray-600/60 px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-300"
                            >
                              {item}
                            </span>
                          ))}
                          {task.highlights.length > 5 && (
                            <span className="inline-flex items-center rounded-lg border border-gray-300 dark:border-gray-600/60 px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-300">
                              +{task.highlights.length - 5} more
                            </span>
                          )}
                        </div>
                      )}
                      {/* <Button
                        variant="outline"
                        size="sm"
                        className="mt-4 rounded-lg border-gray-300 dark:border-gray-600/50 bg-transparent px-4 text-sm text-gray-600 dark:text-gray-300 hover:border-cyan-600/40 dark:hover:border-cyan-500/40 hover:text-gray-900 dark:hover:text-white"
                      >
                        {task.action}
                      </Button> */}
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
              <Button
                size="sm"
                className="bg-cyan-600 dark:bg-cyan-500 px-5 py-2 text-sm font-semibold text-white/95 rounded-lg hover:bg-cyan-700 dark:hover:bg-cyan-600"
              >
                Add new project
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 text-base leading-relaxed text-gray-600 dark:text-gray-300">
              <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-600/40 bg-white dark:bg-[#32363C] p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                You haven’t created any showcase projects yet. Share artefacts that prove your real-world impact.
              </div>
              <div className="space-y-4">
                {projectIdeas.map((project) => (
                  <div
                    key={project.title}
                    className="rounded-xl border border-gray-200 dark:border-gray-600/30 bg-white dark:bg-[#32363C] p-4 shadow-sm transition-all duration-300 hover:border-cyan-600/40 dark:hover:border-cyan-500/40"
                  >
                    <h4 className="text-base font-semibold text-gray-900 dark:text-white">{project.title}</h4>
                    <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{project.description}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-3 gap-2 rounded-lg px-4 text-sm font-semibold text-cyan-600 dark:text-cyan-500 hover:bg-cyan-700 dark:hover:bg-cyan-600/10"
                    >
                      <PlusCircle className="h-3.5 w-3.5" />
                      Start this project
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          </section>
        </div>

        <section className="grid gap-5 lg:grid-cols-2 lg:items-start">


        </section>

        <section className="grid gap-5 lg:grid-cols-3 lg:items-start">
          <Card className="rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#32363C] shadow-lg neo-glass-dark">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl font-semibold text-gray-900 dark:text-white">
                <MessageSquareCode className="h-6 w-6 text-cyan-600 dark:text-cyan-500" />
                Community Highlights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-base leading-relaxed text-gray-600 dark:text-gray-300">
              <p>Share your expertise by writing breakdowns of your projects. Well-documented stories stand out on your portfolio.</p>
              <Button className="rounded-lg bg-cyan-600 dark:bg-cyan-500 px-5 py-2 text-sm font-semibold text-white/95 hover:bg-cyan-700 dark:hover:bg-cyan-600">
                Draft a portfolio story
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#32363C] shadow-lg neo-glass-dark">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white">Recommended Next Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-base leading-relaxed text-gray-600 dark:text-gray-300">
              <ul className="space-y-2 pl-5 text-sm leading-relaxed text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-300">
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
            <CardContent className="space-y-3 text-base leading-relaxed text-gray-600 dark:text-gray-300">
              <p>Explore top-performing portfolios from the community and borrow storytelling patterns that resonate.</p>
              <Button className="rounded-lg bg-cyan-600 dark:bg-cyan-500 px-6 py-3 text-base font-semibold text-white/95 hover:bg-cyan-700 dark:hover:bg-cyan-600">
                Browse exemplar portfolios
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default Portfolio;
