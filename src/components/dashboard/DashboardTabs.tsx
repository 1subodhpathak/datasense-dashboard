import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface DashboardTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const DashboardTabs = ({ activeTab, setActiveTab }: DashboardTabsProps) => {
  const navigate = useNavigate();
  const tabs = [
    { id: "overview", label: "Battleground overview" },
    { id: "practice", label: "Practice overview" },
    { id: "challenges", label: "Game History" }
  ];

  const handleTabChange = (tabId: string) => {
    console.log("Tab changed to:", tabId);
    // Change the tab locally
    setActiveTab(tabId);

    // Update the URL with the tab parameter
    navigate(`/dashboard${tabId !== "overview" ? `?tab=${tabId}` : ""}`);
  };

  return (
    <div className="flex justify-center w-full my-6 overflow-hidden">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            className={`dashboard-tab-btn px-4 py-2 rounded-lg outline-none border-none shadow-none transition-all duration-200
              ${activeTab === tab.id
                ? 'text-dsb-accent font-semibold bg-black border-b-2 border-dsb-accent'
                : 'text-dsb-neutral1'}
            `}
            onClick={() => handleTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DashboardTabs;
