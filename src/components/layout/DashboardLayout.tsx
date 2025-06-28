
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import BackgroundEffects from "@/components/BackgroundEffects";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  // Debug log to verify layout rendering
  console.log("DashboardLayout rendering");
  
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen w-full bg-black overflow-hidden"> 
        <AppSidebar />
        <SidebarInset className="p-0 bg-black relative z-10 flex-grow"> 
          <BackgroundEffects />
          <div className="relative z-10 h-full px-4 py-4 md:px-6 md:py-6 w-full max-w-full">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
