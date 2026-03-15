import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";

function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close sidebar on route change when on mobile
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [location]);

  return (
    <div className="bg-[#0f0f0f] text-white min-h-screen flex flex-col overflow-x-hidden">

      <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1">

        {/* Mobile overlay — tap outside to close */}
        {sidebarOpen && window.innerWidth < 768 && (
          <div
            className="fixed inset-0 top-14 bg-black/60 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <Sidebar isOpen={sidebarOpen} />

        <main
          className={`
            flex-1 transition-all duration-300 min-w-0
            ${sidebarOpen ? "md:ml-55" : "md:ml-18"}
            ml-0
          `}
        >
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default MainLayout;