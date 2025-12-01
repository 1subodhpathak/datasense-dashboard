import { useContext, useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProfileHero from "@/components/profile/ProfileHero";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { ChevronRight, FileText, FolderGit2, Medal, MessageSquareCode, PlusCircle, Camera, Trash2, Save, Loader2, AlertCircle, Check, Upload, Shuffle, Grid, X } from "lucide-react";
import { Link } from "react-router-dom";
import { ProfileContext, type ProfileData, type PortfolioRecord } from "@/context/ProfileContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useUser, useAuth } from "@clerk/clerk-react";

type PortfolioExtras = {
  bio?: string;
  skills?: unknown[];
  credentials?: unknown[];
  projects?: unknown[];
};

const FALLBACK_AVATAR = "https://api.dicebear.com/7.x/avataaars/svg?seed=default";
const DEFAULT_AVATAR = "https://api.dicebear.com/7.x/avataaars/svg?seed=default";
const DEFAULT_BANNER = "/placeholder.svg?height=400&width=1200";
const MAX_SELECTED_SKILLS = 6;

const API_ENDPOINT = "https://server.datasenseai.com/battleground-profile";
// const API_ENDPOINT = "http://localhost:4000/battleground-profile";

const TECHNICAL_SKILLS_OPTIONS = [
  "Python",
  "Python Libraries",
  "R",
  "SQL",
  "MySQL",
  "PostgreSQL",
  "Excel",
  "Tableau",
  "Power BI",
  "Looker Studio",
  "Visual Studio Code",
  "Google Colab",
  "Google Kubernetes",
  "Git & GitHub",
  "GitLab",
  "Postman",
  "MongoDB",
  "Snowflake",
  "Databricks",
  "BigQuery",
  "AWS",
  "Azure",
  "Google Cloud Platform",
  "Docker",
  "Apache Spark",
  "Hadoop",
  "Airflow",
  "Figma",
  "PyCharm",
  "Node.js"
] as const;

const CORE_SKILLS_OPTIONS = [
  "Problem Solving",
  "Critical Thinking",
  "Data Analysis",
  "Strategic Planning",
  "Project Management",
  "Research",
  "Decision Making",
  "System Design",
  "Business Intelligence",
  "Optimization"
] as const;

const SOFT_SKILLS_OPTIONS = [
  "Communication",
  "Teamwork",
  "Leadership",
  "Adaptability",
  "Time Management",
  "Creativity",
  "Emotional Intelligence",
  "Collaboration",
  "Mentoring",
  "Presentation"
] as const;

const profileTasks = [
  { id: "photo", title: "Add a profile photo", description: "Upload a crisp, professional image so peers recognise you instantly.", action: "Upload photo" },
  { id: "bio", title: "Write your biography", description: "Share a short summary of your strengths, interests, and goals.", action: "Edit bio" },
  { id: "skills", title: "List your top skills", description: "Highlight up to five skills that define your expertise.", action: "Update skills" },
  { id: "credential", title: "Share a credential", description: "Add certificates or recognition that build trust with recruiters.", action: "Add credential" },
] as const;

type ProfileTaskId = typeof profileTasks[number]["id"];
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

// Mock avatar styles for the modal
const avatarStyles = [
  { name: "avataaars", preview: "https://api.dicebear.com/7.x/avataaars/svg?seed=style1" },
  { name: "bottts", preview: "https://api.dicebear.com/7.x/bottts/svg?seed=style2" },
  { name: "identicon", preview: "https://api.dicebear.com/7.x/identicon/svg?seed=style3" },
  { name: "pixel-art", preview: "https://api.dicebear.com/7.x/pixel-art/svg?seed=style4" },
  { name: "lorelei", preview: "https://api.dicebear.com/7.x/lorelei/svg?seed=style5" },
  { name: "adventurer", preview: "https://api.dicebear.com/7.x/adventurer/svg?seed=style6" },
];

const Portfolio = () => {
  const { profile, setProfile: setContextProfile } = useContext(ProfileContext);
  const { user } = useUser();
  const { getToken } = useAuth();
  const extendedProfile = (profile ?? null) as (ProfileData & PortfolioExtras) | null;

  // Edit mode state
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Profile editing states
  const [editBio, setEditBio] = useState("");
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");

  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editProfession, setEditProfession] = useState("");
  const [editCompany, setEditCompany] = useState("");
  // Work status: 'open_to_work' | 'working'
  const [editWorkStatus, setEditWorkStatus] = useState<"open_to_work" | "working">("open_to_work");

  // New Skills State
  const [editCoreSkills, setEditCoreSkills] = useState<string[]>([]);
  const [editTechnicalSkills, setEditTechnicalSkills] = useState<string[]>([]);
  const [editSoftSkills, setEditSoftSkills] = useState<string[]>([]);
  const [newSkillCategory, setNewSkillCategory] = useState<"core" | "technical" | "soft">("core");

  // Avatar modal state
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  // Computed values
  const hasProfilePhoto = useMemo(() => {
    const avatar = extendedProfile?.avatar?.trim();
    if (!avatar) return false;
    return avatar !== "" && avatar !== FALLBACK_AVATAR;
  }, [extendedProfile?.avatar]);

  const biography = useMemo(() => (extendedProfile?.bio ?? "").trim(), [extendedProfile?.bio]);



  const normalizedCoreSkills = useMemo(() => {
    return Array.isArray(extendedProfile?.coreSkills) ? extendedProfile.coreSkills : [];
  }, [extendedProfile?.coreSkills]);

  const normalizedTechnicalSkills = useMemo(() => {
    return Array.isArray(extendedProfile?.technicalSkills) ? extendedProfile.technicalSkills : [];
  }, [extendedProfile?.technicalSkills]);

  const normalizedSoftSkills = useMemo(() => {
    return Array.isArray(extendedProfile?.softSkills) ? extendedProfile.softSkills : [];
  }, [extendedProfile?.softSkills]);

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
      const base = { id: task.id, title: task.title, description: task.description, action: task.action };
      if (task.id === "photo") {
        const completed = hasProfilePhoto;
        return { ...base, completed, summary: completed ? "Profile photo uploaded" : "No profile photo yet" };
      }
      if (task.id === "bio") {
        const completed = biography.length > 0;
        return { ...base, completed, summary: completed ? biographyPreview : "Biography not added" };
      }
      if (task.id === "skills") {
        const totalSkills = normalizedCoreSkills.length + normalizedTechnicalSkills.length + normalizedSoftSkills.length;
        const completed = totalSkills > 0;
        return {
          ...base, completed,
          summary: completed ? `${totalSkills} skill${totalSkills === 1 ? "" : "s"} added` : "No skills added yet",
          highlights: completed ? [...normalizedCoreSkills, ...normalizedTechnicalSkills, ...normalizedSoftSkills] : undefined
        };
      }
      if (task.id === "credential") {
        const completed = normalizedCredentials.length > 0;
        return {
          ...base, completed,
          summary: completed ? `${normalizedCredentials.length} credential${normalizedCredentials.length === 1 ? "" : "s"} shared` : "No credentials shared yet",
          highlights: completed ? normalizedCredentials : undefined
        };
      }
      return { ...base, completed: false, summary: "" };
    });
  }, [biography, hasProfilePhoto, normalizedCredentials, normalizedCoreSkills, normalizedTechnicalSkills, normalizedSoftSkills]);

  const totalTasks = profileChecklist.length;
  const completedTasks = profileChecklist.filter((task) => task.completed).length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const tasksRemaining = totalTasks - completedTasks;
  const portfolioLevel = completionPercentage >= 75 ? "Showcase Ready" : completionPercentage >= 40 ? "Developing" : "Beginner";
  const summaryLabel = `${completedTasks} / ${totalTasks} task${totalTasks === 1 ? "" : "s"}`;

  // Handle edit mode toggle
  const handleToggleEdit = () => {
    if (!editMode) {
      // Entering edit mode
      setEditBio(biography);
      setEditFirstName(extendedProfile?.firstName || "");
      setEditLastName(extendedProfile?.lastName || "");
      setEditCoreSkills(normalizedCoreSkills);
      setEditTechnicalSkills(normalizedTechnicalSkills);
      setEditSoftSkills(normalizedSoftSkills);
      setEditEmail(extendedProfile?.email || "");
      setEditPhone(extendedProfile?.phone || "");
      setEditProfession(extendedProfile?.profession || "");
      setEditCompany(extendedProfile?.company || "");
      setEditWorkStatus(extendedProfile?.workStatus === "working" ? "working" : "open_to_work");
      setEditMode(true);
    } else {
      // Save changes
      handleSaveProfile();
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setError(null);
    try {
      const token = await getToken();
      const clerkId = user?.id;

      if (!clerkId) {
        throw new Error("User ID not found");
      }

      const formData = new FormData();
      formData.append('firstname', editFirstName);
      formData.append('lastname', editLastName);
      formData.append('email', editEmail);
      formData.append('mobile', editPhone);
      formData.append('profession', editProfession);
      formData.append('company', editCompany);
      formData.append('showPhone', extendedProfile?.showPhone ? "true" : "false");
      formData.append('bio', editBio);

      formData.append('skills', JSON.stringify(editTechnicalSkills));
      formData.append('coreSkills', JSON.stringify(editCoreSkills));
      formData.append('technicalSkills', JSON.stringify(editTechnicalSkills));
      formData.append('softSkills', JSON.stringify(editSoftSkills));
      formData.append('workStatus', editWorkStatus);

      const response = await fetch(`${API_ENDPOINT}/${clerkId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Update context locally to reflect changes immediately
      if (setContextProfile && profile) {
        setContextProfile({
          ...profile,
          firstName: editFirstName,
          lastName: editLastName,
          bio: editBio,
          email: editEmail,
          phone: editPhone,
          profession: editProfession,
          company: editCompany,
          coreSkills: editCoreSkills,
          technicalSkills: editTechnicalSkills,
          softSkills: editSoftSkills,
          skills: editTechnicalSkills,
          workStatus: editWorkStatus
        });
      }

      setSuccess("Profile updated successfully!");
      setTimeout(() => {
        setSuccess(null);
        setEditMode(false);
      }, 1500);
    } catch (err) {
      console.error(err);
      setError("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditBio("");
    setEditFirstName("");
    setEditLastName("");

    setEditCoreSkills([]);
    setEditTechnicalSkills([]);
    setEditSoftSkills([]);
    setEditEmail("");
    setEditPhone("");
    setEditProfession("");
    setEditCompany("");
    setEditWorkStatus("open_to_work");
    setError(null);
  };

  const handleToggleNewSkill = (skill: string, category: "core" | "technical" | "soft") => {
    const setFn = category === "core" ? setEditCoreSkills : category === "technical" ? setEditTechnicalSkills : setEditSoftSkills;

    setFn(prev => {
      if (prev.includes(skill)) {
        return prev.filter(s => s !== skill);
      }
      if (prev.length >= MAX_SELECTED_SKILLS) {
        return prev;
      }
      return [...prev, skill];
    });
  };

  const inputClass = "h-11 rounded-xl border border-gray-300 dark:border-gray-600/40 bg-white dark:bg-[#32363C] text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-cyan-600 dark:focus:border-cyan-500 focus:ring-0";

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-24">
        {/* Success/Error Messages */}
        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-600 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-200">
            <AlertCircle className="mt-0.5 h-5 w-5" />
            <p>{error}</p>
          </div>
        )}
        {success && (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-sm text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-200">
            <Check className="mt-0.5 h-5 w-5" />
            <p>{success}</p>
          </div>
        )}

        <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
          <div className="w-full lg:w-[40%] lg:flex-shrink-0">
            <div className="flex flex-col gap-5">
              {/* Profile Hero - Editable in edit mode */}
              {editMode ? (
                <Card className="rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#32363C] shadow-lg neo-glass-dark p-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Profile</h3>

                    {/* Cover Photo Upload Section */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Cover Photo</label>
                      <div className="relative h-32 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600/40">
                        {extendedProfile?.banner && extendedProfile.banner.trim().length > 0 ? (
                          <img src={extendedProfile.banner} alt="Cover" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-r from-cyan-500 to-teal-600" />
                        )}
                        <Button size="sm" className="absolute bottom-2 right-2 bg-white/90 text-gray-900 hover:bg-white">
                          <Camera className="h-4 w-4 mr-2" />
                          Upload
                        </Button>
                      </div>
                    </div>

                    {/* Profile Photo Section */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Profile Photo</label>
                      <div className="flex items-center gap-4">
                        <Avatar className="size-20 rounded-full border-4 border-white dark:border-[#32363C]">
                          <AvatarImage src={extendedProfile?.avatar || DEFAULT_AVATAR} />
                          <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            onClick={() => setShowAvatarModal(true)}
                          >
                            <Grid className="h-3 w-3 mr-1" />
                            Avatar Styles
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs">
                            <Shuffle className="h-3 w-3 mr-1" />
                            Randomize
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs">
                            <Upload className="h-3 w-3 mr-1" />
                            Upload
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* First Name and Last Name */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                        <Input
                          value={editFirstName}
                          onChange={(e) => setEditFirstName(e.target.value)}
                          className={inputClass}
                          placeholder="First Name"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                        <Input
                          value={editLastName}
                          onChange={(e) => setEditLastName(e.target.value)}
                          className={inputClass}
                          placeholder="Last Name"
                        />
                      </div>
                    </div>

                    {/* Email and Phone */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email address</label>
                        <Input
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          className={inputClass}
                          placeholder="Email address"
                          type="email"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone number</label>
                        <Input
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          className={inputClass}
                          placeholder="Phone number"
                          type="tel"
                        />
                      </div>
                    </div>
                    {/* Show Phone Toggle */}
                    <div className="flex items-center gap-3 rounded-2xl border border-gray-200 dark:border-gray-600/40 bg-white dark:bg-[#32363C] p-4 text-sm text-gray-600 dark:text-gray-300 mt-4">
                      <input
                        type="checkbox"
                        checked={extendedProfile?.showPhone ?? false}
                        onChange={(e) => {
                          if (setContextProfile && extendedProfile) {
                            setContextProfile({
                              ...extendedProfile,
                              showPhone: e.target.checked,
                            });
                          }
                        }}
                        id="showPhone"
                        className="size-4 rounded border border-gray-300 text-cyan-600 focus:ring-cyan-600 dark:border-gray-600 dark:bg-transparent"
                      />
                      <label htmlFor="showPhone" className="cursor-pointer">
                        Make my phone number visible to other users.
                      </label>
                    </div>

                    {/* Profession and Company */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Profession</label>
                        <Input
                          value={editProfession}
                          onChange={(e) => setEditProfession(e.target.value)}
                          className={inputClass}
                          placeholder="e.g. Product Analyst"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Company / Institution</label>
                        <Input
                          value={editCompany}
                          onChange={(e) => setEditCompany(e.target.value)}
                          className={inputClass}
                          placeholder="e.g. Datasense AI"
                        />
                      </div>
                    </div>

                    {/* Work status */}
                    <div className="mt-3">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Work status</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditWorkStatus("open_to_work")}
                          className={`px-3 py-2 rounded-lg text-sm font-medium ${editWorkStatus === "open_to_work"
                            ? "bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-600/10 dark:text-emerald-300"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"}`
                          }
                        >
                          Open to work
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditWorkStatus("working")}
                          className={`px-3 py-2 rounded-lg text-sm font-medium ${editWorkStatus === "working"
                            ? "bg-cyan-50 border border-cyan-200 text-cyan-800 dark:bg-cyan-600/10 dark:text-cyan-300"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"}`
                          }
                        >
                          Working
                        </button>
                      </div>
                    </div>

                    {/* Bio */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label>
                      <textarea
                        value={editBio}
                        onChange={(e) => setEditBio(e.target.value)}
                        className="min-h-[100px] w-full rounded-xl border border-gray-300 dark:border-gray-600/40 bg-white dark:bg-[#32363C] px-4 py-3 text-sm text-gray-900 dark:text-white focus:border-cyan-600 dark:focus:border-cyan-500 focus:outline-none"
                        placeholder="Share a short summary of your strengths, interests, and goals."
                      />
                    </div>


                  </div>
                </Card>
              ) : (
                <>
                  {/* Use ProfileHero component when not editing */}
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
                          You haven't shared any credentials yet.
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
                        <ul className="space-y-1 pl-4 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                          <li className="list-disc">Refresh your bio with current goals.</li>
                          <li className="list-disc">Highlight your latest wins in the projects section.</li>
                          <li className="list-disc">Share credentials to unlock higher portfolio strength.</li>
                        </ul>
                      </div>

                      <Link
                        to="/my-journey"
                        className="inline-flex items-center gap-2 text-base font-semibold text-cyan-600 dark:text-cyan-500 hover:text-gray-900 dark:hover:text-white"
                      >
                        See learning journey
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </CardContent>
                  </Card>
                </>
              )}
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
                          className={`rounded-lg px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${task.completed
                            ? "border-cyan-600/40 dark:border-cyan-500/40 bg-cyan-600/10 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-500"
                            : "border-gray-300 dark:border-gray-600/60 bg-transparent text-gray-600 dark:text-gray-300"
                            }`}
                        >
                          {task.completed ? "Complete" : "Pending"}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{task.description}</p>
                      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{task.summary}</p>
                    </div>
                  ))}
                </div>
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
                      {(editMode ? editCoreSkills : normalizedCoreSkills).map((skill, index) => (
                        <span
                          key={`${skill}-${index}`}
                          className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400"
                        >
                          {skill}
                          {editMode && (
                            <button
                              onClick={() => handleToggleNewSkill(skill, "core")}
                              className="ml-1 text-emerald-700 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-200"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </span>
                      ))}
                      {(editMode ? editCoreSkills : normalizedCoreSkills).length === 0 && (
                        <span className="text-xs text-gray-500 italic">No skills added</span>
                      )}
                    </div>
                  </div>

                  {/* Technical Skills */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Technical Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {(editMode ? editTechnicalSkills : normalizedTechnicalSkills).map((skill, index) => (
                        <span
                          key={`${skill}-${index}`}
                          className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400"
                        >
                          {skill}
                          {editMode && (
                            <button
                              onClick={() => handleToggleNewSkill(skill, "technical")}
                              className="ml-1 text-blue-700 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </span>
                      ))}
                      {(editMode ? editTechnicalSkills : normalizedTechnicalSkills).length === 0 && (
                        <span className="text-xs text-gray-500 italic">No skills added</span>
                      )}
                    </div>
                  </div>

                  {/* Soft Skills */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Soft Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {(editMode ? editSoftSkills : normalizedSoftSkills).map((skill, index) => (
                        <span
                          key={`${skill}-${index}`}
                          className="inline-flex items-center gap-1 rounded-md border border-purple-200 bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-400"
                        >
                          {skill}
                          {editMode && (
                            <button
                              onClick={() => handleToggleNewSkill(skill, "soft")}
                              className="ml-1 text-purple-700 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-200"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </span>
                      ))}
                      {(editMode ? editSoftSkills : normalizedSoftSkills).length === 0 && (
                        <span className="text-xs text-gray-500 italic">No skills added</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Add Skills Section (Edit Mode Only) */}
                {editMode && (
                  <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-700">
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Add Skills</h4>
                      <div className="flex gap-2">
                        {(["core", "technical", "soft"] as const).map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setNewSkillCategory(cat)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${newSkillCategory === cat
                              ? "bg-cyan-600 text-white dark:bg-cyan-500"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                              }`}
                          >
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-2">
                      {(newSkillCategory === "core" ? CORE_SKILLS_OPTIONS : newSkillCategory === "technical" ? TECHNICAL_SKILLS_OPTIONS : SOFT_SKILLS_OPTIONS).map((skill) => {
                        const currentList = newSkillCategory === "core" ? editCoreSkills : newSkillCategory === "technical" ? editTechnicalSkills : editSoftSkills;
                        const isSelected = currentList.includes(skill);
                        const disabled = !isSelected && currentList.length >= MAX_SELECTED_SKILLS;

                        return (
                          <button
                            key={skill}
                            onClick={() => handleToggleNewSkill(skill, newSkillCategory)}
                            disabled={disabled}
                            className={`rounded-lg border px-3 py-2 text-xs font-medium text-left transition ${isSelected
                              ? "border-cyan-600 bg-cyan-600/15 text-cyan-700 dark:border-cyan-500 dark:bg-cyan-500/15 dark:text-cyan-200"
                              : "border-gray-200 text-gray-600 hover:border-cyan-600/50 dark:border-gray-600/60 dark:text-gray-300"
                              } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
                          >
                            {skill}
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Select a category above, then click skills to add/remove. Max {MAX_SELECTED_SKILLS} per category.
                    </p>
                  </div>
                )}
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
                  You haven't created any showcase projects yet. Share artefacts that prove your real-world impact.
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
              <ul className="space-y-2 pl-5 text-sm leading-relaxed">
                <li className="list-disc">Enroll in "Advanced SQL Joins" to unlock the SQL Specialist credential.</li>
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

        {/* Fixed Edit Button at Bottom */}
        <div className="fixed bottom-6 right-3 z-50 flex gap-3 items-center">
          {editMode ? (
            <>
              <Button
                onClick={handleCancelEdit}
                // variant="outline"
                className="rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white/95 dark:bg-[#32363C] px-6 py-3 text-base font-semibold text-black shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleToggleEdit}
                disabled={saving}
                className="rounded-lg bg-cyan-600 dark:bg-cyan-500 px-6 py-3 text-base font-semibold text-white/95 shadow-lg hover:bg-cyan-700 dark:hover:bg-cyan-600 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Profile
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button
              onClick={handleToggleEdit}
              className="rounded-lg bg-cyan-600 dark:bg-cyan-500 px-6 py-3 text-base font-semibold text-white/95 shadow-lg hover:bg-cyan-700 dark:hover:bg-cyan-600"
            >
              Edit Profile
            </Button>
          )}
        </div>

        {/* Avatar Styles Modal */}
        <Dialog open={showAvatarModal} onOpenChange={setShowAvatarModal}>
          <DialogContent className="max-w-2xl border border-gray-300 dark:border-gray-600 bg-white/95 p-6 shadow-2xl dark:bg-[#08090A]">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Choose avatar style</h3>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-4">
              {avatarStyles.map((style) => (
                <button
                  key={style.name}
                  onClick={() => {
                    // Handle avatar style selection
                    setShowAvatarModal(false);
                  }}
                  className="rounded-2xl border-2 border-gray-300 dark:border-gray-600 p-3 transition hover:border-cyan-600 dark:hover:border-cyan-500"
                >
                  <div className="aspect-square overflow-hidden rounded-xl bg-white/80 p-4 dark:bg-white/5">
                    <img src={style.preview} alt={style.name} className="h-full w-full object-contain" />
                  </div>
                  <p className="mt-2 text-center text-sm font-semibold capitalize text-gray-900 dark:text-white">
                    {style.name.replace("-", " ")}
                  </p>
                </button>
              ))}
            </div>
            <div className="mt-6 flex flex-col gap-2">
              <Button className="bg-cyan-600 dark:bg-cyan-500 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 dark:hover:bg-cyan-600">
                Regenerate avatar
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAvatarModal(false)}
                className="border-gray-300 dark:border-gray-600 bg-white px-4 py-2 text-sm font-semibold text-gray-900 dark:bg-white/10 dark:text-white"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout >
  );
};

export default Portfolio;
