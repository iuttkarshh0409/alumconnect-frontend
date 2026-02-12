import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const AnalyticsLayout = () => {
  return (
    <div className="min-h-screen flex bg-[#F9F9F7]">
      <Sidebar />

      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AnalyticsLayout;
