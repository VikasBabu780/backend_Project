import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  LayoutDashboard,
  Upload,
  ThumbsUp,
  History,
  Settings,
} from "lucide-react";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/subscriptions", icon: Users, label: "Subscriptions" },
];

const youItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/upload", icon: Upload, label: "Upload Video" },
  { to: "/liked", icon: ThumbsUp, label: "Liked Videos" },
  { to: "/history", icon: History, label: "Watch History" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

function Sidebar({ isOpen }) {
  const { pathname } = useLocation();

  const NavLink = ({ to, icon: Icon, label }) => (
    <Link
      to={to}
      title={!isOpen ? label : undefined}
      className={`flex items-center rounded-[10px] py-2.5 transition-colors
        ${isOpen ? "gap-4.5 px-3" : "justify-center px-0 py-3"}
        ${pathname === to ? "bg-[#272727] font-medium" : "hover:bg-[#272727]"}`}
    >
      <Icon size={20} className="shrink-0" />
      {isOpen && <span className="text-sm whitespace-nowrap">{label}</span>}
    </Link>
  );

  return (
    <aside
      className={`
        fixed top-14 left-0 h-[calc(100vh-56px)]
        bg-[#0f0f0f] text-white
        transition-all duration-300
        overflow-y-auto overflow-x-hidden
        z-50
        ${
          isOpen
            ? "w-55 translate-x-0"
            : "w-18 -translate-x-full md:translate-x-0"
        }
      `}
    >
      <div className="flex flex-col p-2 gap-0.5">
        {navItems.map((item) => (
          <NavLink key={item.to} {...item} />
        ))}

        <hr className="border-[#272727] my-2 mx-1" />

        {isOpen && (
          <p className="text-xs font-medium text-[#aaa] px-3 pb-1 tracking-wide">
            You
          </p>
        )}

        {youItems.map((item) => (
          <NavLink key={item.to} {...item} />
        ))}
      </div>
    </aside>
  );
}

export default Sidebar;
