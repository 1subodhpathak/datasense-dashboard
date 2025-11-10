import DashboardLayout from "@/components/layout/DashboardLayout";

const Resources = () => {
  return (
    <DashboardLayout>
      <div className="relative z-10 p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white glow-text-subtle mb-2">
            Resources
          </h1>
          <p className="text-dsb-neutral1">
            Upload and download resources
          </p>
        </div>

        {/* Placeholder Content */}
        <div className="neo-glass-dark p-6 rounded-xl border border-dsb-neutral3/30">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📁</div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Resources Coming Soon
            </h2>
            <p className="text-dsb-neutral1">
              Upload and download functionality will be available here once the backend is configured.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Resources;
