import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";

const UnifiedDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // For now, just switch tabs. Full integration can be done later
  };

  return (
    <DashboardLayout>
      <div className="relative z-10 p-4 md:p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white glow-text-subtle mb-2">
            Dashboard
          </h1>
          <p className="text-dsb-neutral1">
            Complete analytics and insights overview
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="mb-6 neo-glass-dark grid w-full max-w-md grid-cols-2">
            <TabsTrigger
              value="overview"
              className="text-white transition-colors data-[state=active]:bg-dsb-accent/20 data-[state=active]:text-dsb-accent hover:bg-dsb-accent/10 hover:text-dsb-accent"
              onClick={() => navigate("/battleground")}
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="practice"
              className="text-white transition-colors data-[state=active]:bg-dsb-accent/20 data-[state=active]:text-dsb-accent hover:bg-dsb-accent/10 hover:text-dsb-accent"
              onClick={() => navigate("/practice-dashboard")}
            >
              Practice Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-0">
            <div className="w-full text-center py-12">
              <div className="neo-glass-dark p-6 rounded-xl border border-dsb-neutral3/30">
                <p className="text-white mb-4">Click "Overview" tab to view battleground dashboard</p>
                <button
                  onClick={() => navigate("/battleground")}
                  className="text-dsb-accent font-semibold bg-black hover:bg-dsb-accent hover:text-black border-0 px-4 py-2 rounded-lg"
                >
                  Go to Overview Dashboard
                </button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="practice" className="mt-0">
            <div className="w-full text-center py-12">
              <div className="neo-glass-dark p-6 rounded-xl border border-dsb-neutral3/30">
                <p className="text-white mb-4">Click "Practice Analytics" tab to view practice dashboard</p>
                <button
                  onClick={() => navigate("/practice-dashboard")}
                  className="text-dsb-accent font-semibold bg-black hover:bg-dsb-accent hover:text-black border-0 px-4 py-2 rounded-lg"
                >
                  Go to Practice Dashboard
                </button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default UnifiedDashboard;
