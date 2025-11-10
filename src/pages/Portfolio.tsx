import DashboardLayout from "@/components/layout/DashboardLayout";
import ProfileHero from "@/components/profile/ProfileHero";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, FileText, FolderGit2, Medal, MessageSquareCode, PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";

const profileTasks = [
  { title: "Add a profile photo", description: "Upload a crisp, professional image so peers recognise you instantly.", action: "Upload photo" },
  { title: "Write your biography", description: "Share a short summary of your strengths, interests, and goals.", action: "Edit bio" },
  { title: "List your top skills", description: "Highlight up to five skills that define your expertise.", action: "Update skills" },
  { title: "Share a credential", description: "Add certificates or recognition that build trust with recruiters.", action: "Add credential" },
];

const projectIdeas = [
  { title: "Customer Churn Dashboard", description: "Power BI project demonstrating retention insights and cohort analysis." },
  { title: "SQL Marketing Pipeline", description: "End-to-end SQL case study on lead quality and campaign performance." },
  { title: "Python Forecasting Toolkit", description: "Notebook that predicts monthly sales with ARIMA and Prophet." },
];

const Portfolio = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <ProfileHero />

        <section className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 rounded-2xl border border-dsb-neutral3/20 bg-white/95 shadow-lg dark:border-dsb-neutral3/30 dark:bg-black/30 neo-glass-dark">
            <CardHeader className="pb-0">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-2xl font-semibold text-white">Portfolio Strength</CardTitle>
                <Badge className="rounded-full border border-dsb-accent/40 bg-dsb-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-dsb-accent">
                  Beginner
                </Badge>
              </div>
              <p className="text-base text-dsb-neutral1">
                Complete these steps to improve your portfolio presence.
              </p>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div>
                <div className="flex items-center justify-between text-sm font-medium uppercase tracking-wide text-dsb-neutral1">
                  <span>Action checklist</span>
                  <span>0% complete</span>
                </div>
                <Progress
                  value={10}
                  className="mt-3 h-2 rounded-full bg-dsb-neutral3/40"
                  indicatorClassName="bg-dsb-accent"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {profileTasks.map((task) => (
                  <div
                    key={task.title}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:border-dsb-accent/40 dark:border-dsb-neutral3/30 dark:bg-black/30"
                  >
                    <h4 className="text-base font-semibold text-white">{task.title}</h4>
                    <p className="mt-2 text-sm leading-relaxed text-dsb-neutral1">{task.description}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 rounded-full border-dsb-neutral3/50 bg-transparent px-4 text-sm text-dsb-neutral1 hover:border-dsb-accent hover:text-white"
                    >
                      {task.action}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-dsb-neutral3/20 bg-white/95 shadow-lg dark:border-dsb-neutral3/30 dark:bg-black/30 neo-glass-dark">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl font-semibold text-white">
                <Medal className="h-5 w-5 text-dsb-accent" />
                Credentials
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-base leading-relaxed text-dsb-neutral1">
              <p className="text-base">
                Showcase certificates, badges, or achievements that prove your capability. Upload PDFs, share credential IDs, and describe the impact.
              </p>
              <div className="space-y-3">
                <div className="rounded-xl border border-dashed border-slate-200 bg-white p-4 text-sm text-dsb-neutral2 dark:border-dsb-neutral3/40 dark:bg-black/30 dark:text-dsb-neutral1">
                  You haven’t shared any credentials yet.
                </div>
                <Button className="w-full rounded-full bg-dsb-accent px-5 py-3 text-base font-semibold text-black hover:bg-dsb-accent/90">
                  Add Credential
                </Button>
              </div>
              <div className="h-px w-full bg-slate-200 dark:bg-dsb-neutral3/40" />
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-dsb-neutral2">Tips</p>
                <ul className="space-y-1 pl-4 text-sm leading-relaxed">
                  <li className="list-disc">Prioritise recognised certifications (Azure, AWS, PMP).</li>
                  <li className="list-disc">Include links or IDs so viewers can verify quickly.</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card className="rounded-2xl border border-dsb-neutral3/20 bg-white/95 shadow-lg dark:border-dsb-neutral3/30 dark:bg-black/30 neo-glass-dark">
            <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2">
                <FolderGit2 className="h-6 w-6 text-dsb-accent" />
                <CardTitle className="text-2xl font-semibold text-white">Projects</CardTitle>
              </div>
              <Button
                size="sm"
                className="bg-dsb-accent px-5 py-2 text-sm font-semibold text-black hover:bg-dsb-accent/90"
              >
                Add new project
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 text-base leading-relaxed text-dsb-neutral1">
              <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-dsb-neutral2 dark:border-dsb-neutral3/40 dark:bg-black/30 dark:text-dsb-neutral1">
                You haven’t created any showcase projects yet. Share artefacts that prove your real-world impact.
              </div>
              <div className="space-y-4">
                {projectIdeas.map((project) => (
                  <div
                    key={project.title}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:border-dsb-accent/40 dark:border-dsb-neutral3/30 dark:bg-black/30"
                  >
                    <h4 className="text-base font-semibold text-white">{project.title}</h4>
                    <p className="mt-1 text-sm leading-relaxed text-dsb-neutral1">{project.description}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-3 gap-2 rounded-full px-4 text-sm font-semibold text-dsb-accent hover:bg-dsb-accent/10"
                    >
                      <PlusCircle className="h-3.5 w-3.5" />
                      Start this project
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-dsb-neutral3/20 bg-white/95 shadow-lg dark:border-dsb-neutral3/30 dark:bg-black/30 neo-glass-dark">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl font-semibold text-white">
                <FileText className="h-6 w-6 text-dsb-accent" />
                Portfolio Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 text-base leading-relaxed text-dsb-neutral1">
              <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-dsb-neutral3/30 dark:bg-black/30">
                <div className="flex items-center justify-between text-sm text-dsb-neutral2 md:text-base dark:text-dsb-neutral1">
                  <span className="font-medium text-white/80">Profile completeness</span>
                  <span className="font-semibold text-white">4 / 10 tasks</span>
                </div>
                <Progress
                  value={40}
                  className="h-2 rounded-full bg-dsb-neutral3/40"
                  indicatorClassName="bg-dsb-accent"
                />
              </div>

              <div className="space-y-2">
                <p className="text-dsb-neutral1">Build credibility by keeping these sections fresh:</p>
                <ul className="space-y-1 pl-4 text-sm leading-relaxed text-dsb-neutral2 dark:text-dsb-neutral1">
                  <li className="list-disc">Refresh your bio with current goals.</li>
                  <li className="list-disc">Highlight your latest wins in the projects section.</li>
                  <li className="list-disc">Share credentials to unlock higher portfolio strength.</li>
                </ul>
              </div>

              <Link
                to="/my-journey"
                className="inline-flex items-center gap-2 text-base font-semibold text-dsb-accent hover:text-white"
              >
                See learning journey
                <ChevronRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <Card className="rounded-2xl border border-dsb-neutral3/20 bg-white/95 shadow-lg dark:border-dsb-neutral3/30 dark:bg-black/30 neo-glass-dark">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl font-semibold text-white">
                <MessageSquareCode className="h-6 w-6 text-dsb-accent" />
                Community Highlights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-base leading-relaxed text-dsb-neutral1">
              <p>Share your expertise by writing breakdowns of your projects. Well-documented stories stand out on your portfolio.</p>
              <Button
                variant="outline"
                className="border-dsb-accent px-5 py-2 text-sm font-semibold text-dsb-accent hover:bg-dsb-accent/10"
              >
                Draft a portfolio story
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-dsb-neutral3/20 bg-white/95 shadow-lg dark:border-dsb-neutral3/30 dark:bg-black/30 neo-glass-dark">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-white">Recommended Next Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-base leading-relaxed text-dsb-neutral1">
              <ul className="space-y-2 pl-5 text-sm leading-relaxed text-dsb-neutral2 dark:text-dsb-neutral1">
                <li className="list-disc">Enroll in “Advanced SQL Joins” to unlock the SQL Specialist credential.</li>
                <li className="list-disc">Publish your latest hackathon solution as a case study.</li>
                <li className="list-disc">Ask for peer feedback on your profile to increase trust.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-dsb-neutral3/20 bg-white/95 shadow-lg dark:border-dsb-neutral3/30 dark:bg-black/30 neo-glass-dark">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-white">Need inspiration?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-base leading-relaxed text-dsb-neutral1">
              <p>Explore top-performing portfolios from the community and borrow storytelling patterns that resonate.</p>
              <Button className="rounded-full bg-dsb-accent px-6 py-3 text-base font-semibold text-black hover:bg-dsb-accent/90">
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
