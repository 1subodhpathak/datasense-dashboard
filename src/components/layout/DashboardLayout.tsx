import AppNavbar from "@/components/AppNavbar";
import BackgroundEffects from "@/components/BackgroundEffects";
import ThreeBackground from "../ThreeBackground";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  // Debug log to verify layout rendering
  console.log("DashboardLayout rendering");
  
  return (
    <div className="flex flex-col min-h-screen w-full overflow-hidden"> 
      <AppNavbar />
      <main className="flex-1 pt-16 md:pt-20 bg-[#1f4041] relative z-10"> 
        {/* <BackgroundEffects /> */}
        <ThreeBackground />
        <div className="relative z-10 h-full px-4 py-4 md:px-6 md:py-6 w-full max-w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
