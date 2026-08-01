import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../../Context/UserContext";

const navItems = [
  { label: "Dashboard", path: "/studio", icon: "▦" },
  { label: "Content", path: "/studio/content", icon: "▶" },
  { label: "Library / Series", path: "/studio/series", icon: "📚" },
  { label: "Featured Banner", path: "/studio/featured", icon: "🖼" },
  { label: "Analytics", path: "/studio/analytics", icon: "📊" },
];

function StudioSidebar() {
  const { User } = useContext(AuthContext);
  const location = useLocation();

  return (
    <div className="hidden md:flex flex-col w-60 shrink-0 bg-white border-r border-gray-200 min-h-screen pt-6">
      <div className="flex items-center gap-3 px-6 pb-6">
        <img
          src={
            User?.photoURL ||
            "https://www.citypng.com/public/uploads/preview/profile-user-round-red-icon-symbol-download-png-11639594337tco5j3n0ix.png"
          }
          className="w-11 h-11 rounded-full object-cover"
          alt="channel"
        />
        <div>
          <p className="text-xs text-gray-500">Your channel</p>
          <p className="font-semibold text-sm text-gray-900">MindTurn Studio</p>
        </div>
      </div>

      <nav className="flex flex-col">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-6 py-3 text-sm font-medium ${
                active
                  ? "bg-gray-100 border-r-4 border-red-600 text-black"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-6 py-4">
        <Link to="/" className="text-xs text-gray-400 hover:text-gray-600">
          ← Back to MindTurn site
        </Link>
      </div>
    </div>
  );
}

export default StudioSidebar;
