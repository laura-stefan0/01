import { Home, Search, Heart, BookOpen, User } from "lucide-react";
import { NavLink } from "react-router-dom";

/**
 * Navigation Bar Component for React Router
 * Provides persistent navigation with active link highlighting
 * Only shows on first-level routes, not on nested subpages
 */
export function Navbar() {
  const navItems = [
    {
      id: "home",
      label: "Home", 
      icon: Home,
      to: "/"
    },
    {
      id: "discover",
      label: "Discover",
      icon: Search, 
      to: "/discover"
    },
    {
      id: "saved",
      label: "Saved",
      icon: Heart,
      to: "/saved"
    },
    {
      id: "resources", 
      label: "Resources",
      icon: BookOpen,
      to: "/resources"
    },
    {
      id: "profile",
      label: "Profile",
      icon: User,
      to: "/profile"
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[1002] pb-safe w-full">
      <div className="max-w-sm mx-auto px-4">
        <div className="flex items-center justify-around py-3 px-2 pb-safe">
          {navItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center py-3 px-1 rounded-lg transition-colors min-w-0 flex-1 ${
                  isActive
                    ? "text-[#E11D48]" // Active color (#E11D48)
                    : "text-[#94A3B8]" // Inactive (#94A3B8)
                }`
              }
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium truncate">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}