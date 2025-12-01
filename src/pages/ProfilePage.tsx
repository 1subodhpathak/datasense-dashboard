import React, { useState } from "react";
import {
  FaGithub,
  FaLinkedin,
  FaSun,
  FaMoon,
  FaMapMarkerAlt,
  FaCommentDots,
  FaTimes,
} from "react-icons/fa";
import DashboardLayout from "@/components/layout/DashboardLayout";

// TypeScript interfaces
interface Profile {
  name: string;
  title: string;
  location: string;
  summary: string;
  story: string;
}

interface ChatMessage {
  sender: 'bot' | 'user';
  text: string;
}

interface NewSkill {
  group: string;
  value: string;
}

interface PreviousState {
  profile: Profile;
  coreSkills: string[];
  technicalSkills: string[];
  softSkills: string[];
}

export default function ProfilePage() {
  const [chatOpen, setChatOpen] = useState(true);
  const [editMode, setEditMode] = useState(false);

  // Core profile state
  const [profile, setProfile] = useState({
    name: "Your Full Name",
    title: "AI / Data Engineer · DataSense",
    location: "Jaipur, India",
    summary:
      "Passionate about building real-world AI systems and solving complex problems using data. Focused on creating scalable solutions that make impact.",
    story:
      "My journey began with curiosity around systems. DataSense became the place where I built, broke and rebuilt real solutions for the world.",
  });

  // Images
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);


  // Skills as editable lists
  const [coreSkills, setCoreSkills] = useState([
    "Problem Solving",
    "System Thinking",
    "Analytics",
  ]);

  const [technicalSkills, setTechnicalSkills] = useState([
    "SQL",
    "Python",
    "LangGraph",
    "Azure",
  ]);

  const [softSkills, setSoftSkills] = useState([
    "Leadership",
    "Communication",
    "Adaptability",
  ]);

  const [newSkill, setNewSkill] = useState({
    group: "core",
    value: "",
  });


  // Simple undo (one level)
  const [previousState, setPreviousState] = useState<PreviousState | null>(null);

  // Resume upload
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [resumeParsingNote, setResumeParsingNote] = useState<string | null>(null);

  // Chatbot state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      sender: "bot",
      text:
        "Hi, this is DataSense ChatBot 🤖. How may I help you? Choose from options below:\n1. Improve my profile\n2. Prepare for interviews\n3. Find matching jobs\n4. Update skills",
    },
  ]);
  const [chatInput, setChatInput] = useState("");

  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = () => {
    if (!newSkill.value.trim()) return;
    const value = newSkill.value.trim();

    if (editMode) {
      setPreviousState({
        profile,
        coreSkills,
        technicalSkills,
        softSkills,
      });
    }

    if (newSkill.group === "core") {
      setCoreSkills((prev) => [...prev, value]);
    } else if (newSkill.group === "technical") {
      setTechnicalSkills((prev) => [...prev, value]);
    } else {
      setSoftSkills((prev) => [...prev, value]);
    }

    setNewSkill((prev) => ({ ...prev, value: "" }));
  };

  const handleRemoveSkill = (
    group: string,
    index: number
  ) => {
    setPreviousState({
      profile,
      coreSkills,
      technicalSkills,
      softSkills,
    });

    if (group === "core") {
      setCoreSkills((prev) => prev.filter((_, i) => i !== index));
    } else if (group === "technical") {
      setTechnicalSkills((prev) => prev.filter((_, i) => i !== index));
    } else {
      setSoftSkills((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleToggleEdit = async () => {
    if (!editMode) {
      // Entering edit mode: snapshot for undo
      setPreviousState({
        profile,
        coreSkills,
        technicalSkills,
        softSkills,
      });
      setEditMode(true);
      return;
    }

    // Leaving edit mode: simulate save to backend
    try {
      await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile,
          skills: { coreSkills, technicalSkills, softSkills },
          coverImageUrl,
          profileImageUrl,
        }),
      });
      console.log("Profile saved to backend (mock).");
    } catch (err) {
      console.error("Failed to save profile", err);
    }

    setEditMode(false);
  };

  const handleUndo = () => {
    if (!previousState) return;
    setProfile(previousState.profile);
    setCoreSkills(previousState.coreSkills);
    setTechnicalSkills(previousState.technicalSkills);
    setSoftSkills(previousState.softSkills);
  };

  const handleChatSend = () => {
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = { sender: "user", text: chatInput };
    let botReply =
      "Hi, this is DataSense ChatBot 🤖. How may I help you? Choose from below options:\n1. Improve my profile\n2. Prepare for interviews\n3. Find matching jobs\n4. Update skills";

    const lower = chatInput.toLowerCase();
    if (lower.includes("hi") || lower.includes("hello")) {
      botReply =
        "Hi, this is DataSense ChatBot 🤖. How may I help you? Choose from below options:\n1. Improve my profile\n2. Prepare for interviews\n3. Find matching jobs\n4. Update skills";
    }

    const botMsg: ChatMessage = { sender: "bot", text: botReply };
    setChatMessages((prev) => [
      ...prev,
      userMsg,
      botMsg,
    ]);
    setChatInput("");
  };

  const handleQuickOption = (text: string) => {
    const userMsg: ChatMessage = { sender: "user", text };
    const botMsg: ChatMessage = {
      sender: "bot",
      text: `Great choice: ${text}. Feature coming soon 🚀`,
    };
    setChatMessages((prev) => [
      ...prev,
      userMsg,
      botMsg,
    ]);
  };

  const onCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCoverImageUrl(url);
  };

  const onProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setProfileImageUrl(url);
  };

  const onResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResumeFileName(file.name);
    // Mock parse: in real app, send to backend for AI parsing
    setResumeParsingNote(
      "Resume uploaded. In production, this will be parsed by AI to auto-fill title, summary, skills, and experience."
    );
  };

  return (
    <DashboardLayout>
      <div className="bg-slate-50 text-slate-900 min-h-screen p-6 font-sans pb-32">
        {/* Hidden file inputs for images and resume */}
        <input
          id="cover-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onCoverUpload}
        />
        <input
          id="profile-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onProfileImageUpload}
        />
        <input
          id="resume-upload"
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={onResumeUpload}
        />

        {/* Cover Section - DataSense Style */}
        <div className="relative w-full rounded-2xl overflow-hidden shadow-md mb-14 border border-emerald-200 bg-white">
          <div className="h-80 bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
            {coverImageUrl ? (
              <img
                src={coverImageUrl}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <button
                className="bg-white text-emerald-700 px-5 py-2 rounded-lg text-sm font-semibold shadow"
                onClick={() => document.getElementById("cover-upload")?.click()}
              >
                Upload Cover
              </button>
            )}
          </div>

          {/* Profile picture - square */}
          <div className="absolute left-8 -bottom-12">
            <div
              className="w-32 h-32 rounded-md border-4 border-white shadow-md bg-slate-200 flex items-center justify-center text-sm text-slate-600 overflow-hidden cursor-pointer"
              onClick={() => document.getElementById("profile-upload")?.click()}
            >
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                "Upload"
              )}
            </div>
          </div>
        </div>

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6 mt-10">
          <div>
            {editMode ? (
              <div className="space-y-3 max-w-xl">
                <input
                  name="name"
                  value={profile.name}
                  onChange={handleProfileChange}
                  className="border border-emerald-200 p-2 rounded w-full text-lg font-semibold"
                />
                <input
                  name="title"
                  value={profile.title}
                  onChange={handleProfileChange}
                  className="border border-emerald-200 p-2 rounded w-full text-sm"
                />
                <input
                  name="location"
                  value={profile.location}
                  onChange={handleProfileChange}
                  className="border border-emerald-200 p-2 rounded w-full text-sm"
                />
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-slate-900">{profile.name}</h1>
                <p className="text-slate-600 mt-1">{profile.title}</p>

                <div className="flex items-center gap-2 mt-2 text-sm text-slate-600">
                  <FaMapMarkerAlt className="text-emerald-600" /> {profile.location}
                </div>
              </>
            )}

            <span className="inline-block mt-3 px-4 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
              OPEN TO WORK
            </span>
          </div>

          <div className="flex flex-col items-end gap-3">
            <button
              className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700"
              onClick={() => document.getElementById("resume-upload")?.click()}
            >
              Upload Resume
            </button>
            {resumeFileName && (
              <p className="text-xs text-slate-500 max-w-xs text-right">
                Uploaded: <span className="font-semibold">{resumeFileName}</span>
                <br />
                {resumeParsingNote}
              </p>
            )}
          </div>
        </div>

        {/* ABOUT */}
        <section className="mt-12 grid md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl border border-emerald-200">
            <h2 className="text-lg font-semibold mb-2 text-slate-900">
              Professional Summary
            </h2>
            {editMode ? (
              <textarea
                name="summary"
                value={profile.summary}
                onChange={handleProfileChange}
                className="border border-emerald-200 p-2 rounded w-full text-sm"
                rows={4}
              />
            ) : (
              <p className="text-slate-600 text-sm leading-relaxed">
                {profile.summary}
              </p>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl border border-emerald-200">
            <h2 className="text-lg font-semibold mb-2 text-slate-900">My Story</h2>
            {editMode ? (
              <textarea
                name="story"
                value={profile.story}
                onChange={handleProfileChange}
                className="border border-emerald-200 p-2 rounded w-full text-sm"
                rows={4}
              />
            ) : (
              <p className="text-slate-600 text-sm leading-relaxed">
                {profile.story}
              </p>
            )}
          </div>
        </section>

        {/* PROFILE INSIGHTS */}
        <section className="mt-16 grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-emerald-200 text-center">
            <h3 className="font-semibold mb-3 text-slate-800">Profile Strength</h3>
            <div className="w-28 h-28 mx-auto flex items-center justify-center rounded-full border-4 border-emerald-500">
              <span className="text-2xl font-bold text-emerald-700">78%</span>
            </div>
            <p className="text-xs text-slate-600 mt-3">Complete 2 more sections</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-emerald-200">
            <h3 className="font-semibold mb-2 text-slate-800">Profile Views</h3>
            <p className="text-3xl font-bold text-emerald-600">1,248</p>
            <p className="text-xs text-slate-600 mt-1">Last 30 days</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-emerald-200">
            <h3 className="font-semibold mb-2 text-slate-800">Search Appearances</h3>
            <p className="text-3xl font-bold text-teal-600">342</p>
            <p className="text-xs text-slate-600 mt-1">Recruiter searches</p>
          </div>
        </section>

        {/* SKILLS */}
        <section className="mt-16">
          <h2 className="text-xl font-semibold mb-6 text-slate-900">
            Skills Dashboard
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Core skills */}
            <div className="bg-white p-6 rounded-xl border border-emerald-200">
              <h3 className="mb-4 font-semibold">Core Skills</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {coreSkills.map((skill, index) => (
                  <span
                    key={`${skill}-${index}`}
                    className="px-3 py-1 rounded-full text-xs bg-emerald-50 text-emerald-800 flex items-center gap-2"
                  >
                    {skill}
                    {editMode && (
                      <button
                        className="text-[10px] text-slate-500"
                        onClick={() => handleRemoveSkill("core", index)}
                      >
                        ✕
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>

            {/* Technical skills */}
            <div className="bg-white p-6 rounded-xl border border-emerald-200">
              <h3 className="mb-4 font-semibold">Technical Skills</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {technicalSkills.map((skill, index) => (
                  <span
                    key={`${skill}-${index}`}
                    className="px-3 py-1 rounded-full text-xs bg-emerald-50 text-emerald-800 flex items-center gap-2"
                  >
                    {skill}
                    {editMode && (
                      <button
                        className="text-[10px] text-slate-500"
                        onClick={() => handleRemoveSkill("technical", index)}
                      >
                        ✕
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>

            {/* Soft skills */}
            <div className="bg-white p-6 rounded-xl border border-emerald-200">
              <h3 className="mb-4 font-semibold">Soft Skills</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {softSkills.map((skill, index) => (
                  <span
                    key={`${skill}-${index}`}
                    className="px-3 py-1 rounded-full text-xs bg-emerald-50 text-emerald-800 flex items-center gap-2"
                  >
                    {skill}
                    {editMode && (
                      <button
                        className="text-[10px] text-slate-500"
                        onClick={() => handleRemoveSkill("soft", index)}
                      >
                        ✕
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Add skill row */}
          {editMode && (
            <div className="mt-4 flex flex-wrap gap-2 items-center bg-white p-4 rounded-xl border border-emerald-200">
              <select
                value={newSkill.group}
                onChange={(e) =>
                  setNewSkill((prev) => ({
                    ...prev,
                    group: e.target.value,
                  }))
                }
                className="border border-emerald-200 rounded px-2 py-1 text-sm"
              >
                <option value="core">Core</option>
                <option value="technical">Technical</option>
                <option value="soft">Soft</option>
              </select>
              <input
                value={newSkill.value}
                onChange={(e) =>
                  setNewSkill((prev) => ({ ...prev, value: e.target.value }))
                }
                className="border border-emerald-200 rounded px-2 py-1 text-sm flex-1 min-w-[200px]"
                placeholder="Add a new skill"
              />
              <button
                onClick={handleAddSkill}
                className="bg-emerald-600 text-white text-sm px-4 py-1.5 rounded-lg"
              >
                Add Skill
              </button>
            </div>
          )}
        </section>

        {/* COMING SOON – ADVANCED PROFILE BLOCKS */}
        <section className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            "Matched Job Roles",
            "Skill Gap Analysis",
            "Resume Score",
            "Top Performing Skill",
            "Newest Learning",
            "AI Recommendations",
            "Recruiter Saves",
            "Badges Earned",
            "Weekly Profile Report",
            "Community Rank",
            "Profile Completion Tasks",
            "Interview Readiness Score",
            "Career Path Prediction",
            "ATS Compatibility",
            "Peer Comparison",
          ].map((item) => (
            <div
              key={item}
              className="bg-white p-6 rounded-xl border border-emerald-200"
            >
              <h3 className="font-semibold text-slate-900 mb-1">{item}</h3>
              <p className="text-xs text-slate-500">Coming soon</p>
            </div>
          ))}
        </section>

        {/* GAMIFICATION (XP + Level) */}
        <section className="mt-16 bg-white p-6 rounded-xl border border-emerald-200">
          <h3 className="font-semibold mb-2 text-slate-900">
            Gamification (XP + Level)
          </h3>
          <p className="text-slate-600">Level 7 – DataSense Pro</p>
          <div className="h-2 mt-2 bg-emerald-100 rounded-full">
            <div className="h-full w-2/3 bg-emerald-600 rounded-full" />
          </div>
          <p className="text-xs text-slate-500 mt-1">680 / 1000 XP</p>
        </section>

        {/* AI RECOMMENDATIONS */}
        <section className="mt-16 bg-white p-6 rounded-xl border border-emerald-200">
          <h3 className="font-semibold mb-4">AI Recommendations</h3>
          <ul className="list-disc ml-4 text-sm text-slate-600 space-y-1">
            <li>Add a portfolio Github link</li>
            <li>Highlight system design projects</li>
            <li>Add cloud certifications</li>
          </ul>
        </section>

        {/* WEEKLY REPORT */}
        <section className="mt-16 bg-white p-6 rounded-xl border border-emerald-200">
          <h3 className="font-semibold mb-2">Weekly Profile Report</h3>
          <p className="text-slate-600 text-sm">Your profile grew 26% this week.</p>
        </section>

        {/* MINI ATS */}
        <section className="mt-16 bg-white p-6 rounded-xl border border-emerald-200">
          <h3 className="font-semibold mb-4 text-slate-900">
            Matched Jobs (Mini ATS)
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {["AI Engineer", "Data Analyst", "Backend Developer"].map((role) => (
              <div
                key={role}
                className="p-4 border border-emerald-200 rounded-lg hover:shadow-sm"
              >
                <h4 className="font-semibold text-emerald-700">{role}</h4>
                <p className="text-xs text-slate-600">Match score: 86%</p>
              </div>
            ))}
          </div>
        </section>

        {/* FLOATING EDIT + UNDO BUTTONS */}
        <div className="fixed bottom-6 flex gap-3 items-center">
          <button
            onClick={handleToggleEdit}
            className="bg-emerald-600 text-white px-6 py-3 rounded-full shadow hover:bg-emerald-700 text-sm font-semibold"
          >
            {editMode ? "Save Profile" : "Edit Profile"}
          </button>
          {editMode && (
            <button
              onClick={handleUndo}
              className="px-4 py-2 rounded-full border border-emerald-300 text-emerald-700 text-xs bg-white"
            >
              Undo Changes
            </button>
          )}
        </div>

        {/* CHATBOT */}
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 bg-white border-2 border-emerald-400 text-emerald-700 px-4 py-2 rounded-full shadow flex items-center gap-2"
        >
          <FaCommentDots /> Career Bot
        </button>

        {chatOpen && (
          <div className="fixed bottom-24 right-6 w-80 bg-white border border-emerald-200 rounded-xl shadow-lg flex flex-col">
            <div className="p-3 flex justify-between items-center border-b">
              <div>
                <p className="font-semibold text-slate-900">DataSense Career Bot</p>
                <p className="text-xs text-emerald-700">Ask me anything</p>
              </div>
              <button onClick={() => setChatOpen(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="p-3 text-sm text-slate-600 overflow-y-auto max-h-60 space-y-2">
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`p-2 rounded text-sm whitespace-pre-line ${msg.sender === "bot"
                    ? "bg-emerald-50 text-emerald-800"
                    : "bg-slate-100 text-slate-800 ml-auto"
                    }`}
                >
                  {msg.text}
                </div>
              ))}

              <div className="flex flex-wrap gap-2 mt-2">
                {["Improve my profile", "Prepare for interviews", "Find matching jobs", "Update skills"].map(
                  (option) => (
                    <button
                      key={option}
                      onClick={() => handleQuickOption(option)}
                      className="text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-700"
                    >
                      {option}
                    </button>
                  )
                )}
              </div>
            </div>
            <div className="p-3 flex gap-2 border-t">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleChatSend()}
                className="flex-1 border border-emerald-200 px-3 py-1 rounded text-sm"
                placeholder="Type your question..."
              />
              <button
                onClick={handleChatSend}
                className="bg-emerald-600 text-white px-3 rounded"
              >
                Send
              </button>
            </div>
          </div>
        )}

        <div className="mt-24 text-center text-xs text-slate-500">
          © DataSense Profile System
        </div>
      </div>
    </DashboardLayout>
  );
}
