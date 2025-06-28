
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <DashboardLayout>
      <div className="min-h-screen flex items-center justify-center">
        <div className="neo-glass-dark p-12 rounded-xl text-center">
          <h1 className="text-4xl font-bold mb-4 text-dsb-accent glow-text">404</h1>
          <p className="text-xl text-white mb-6">Oops! Page not found</p>
          <a href="/" className="text-dsb-accent hover:text-dsb-accentLight underline">
            Return to Dashboard
          </a>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NotFound;
