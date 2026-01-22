// src/components/common/Navbar.jsx
import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Search, 
  Bell, 
  MonitorPlay, 
  Trophy, 
  LogOut, 
  User, 
  LayoutDashboard, 
  Settings,
  ChevronDown 
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext"; // Import Auth
import "./Navbar.css";

import logo from "../assets/EduhackTech.jpeg";

const Navbar = () => {
  const { mode, toggleMode, primary, bgLight } = useTheme();
  const { user, logoutUser } = useAuth(); // Get user data
  const navigate = useNavigate();

  // Dropdown State
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logoutUser();
    setIsProfileOpen(false);
    navigate("/");
  };

  // Helper: Get Initials from Name
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <nav className="w-full sticky top-0 z-50 backdrop-blur-lg bg-white/80 border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex items-center h-16 justify-between">
          
          {/* LEFT — Logo */}
          <div className="flex items-center min-w-fit">
            <Link to="/" className="flex items-center gap-3">
              <img
                src={logo}
                alt="EduHackTech Logo"
                className="w-10 h-10 object-contain rounded-lg"
              />
              <span className="text-xl font-extrabold tracking-tight text-gray-800 hidden sm:block">
                EduHack<span className={primary}>Tech</span>
              </span>
            </Link>
          </div>

          {/* MIDDLE — Search */}
          <div className="hidden md:flex flex-1 justify-center px-8">
            <div className="relative w-full max-w-lg">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 border border-transparent focus:border-blue-500/50 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all text-sm"
                placeholder={
                  mode === "learning"
                    ? "Search courses, skills, mentors..."
                    : "Search hackathons, teams, events..."
                }
              />
            </div>
          </div>

          {/* RIGHT — Actions */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-fit">
            
            {/* Mode Toggle */}
            <button
              onClick={toggleMode}
              className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border transition-all duration-300 ${bgLight} border-gray-200 hover:shadow-md active:scale-95`}
            >
              {mode === "learning" ? (
                <>
                  <MonitorPlay className={`h-4 w-4 ${primary}`} />
                  <span className={`text-sm font-semibold hidden sm:block ${primary}`}>
                    Learning
                  </span>
                </>
              ) : (
                <>
                  <Trophy className={`h-4 w-4 ${primary}`} />
                  <span className={`text-sm font-semibold hidden sm:block ${primary}`}>
                    Compete
                  </span>
                </>
              )}
            </button>

            {/* Notification (Only show if logged in, optional) */}
            <button className="relative p-2 rounded-full hover:bg-gray-100 transition text-gray-600">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>

            {/* --- AUTH SECTION --- */}
            {user ? (
              // LOGGED IN: Avatar Dropdown
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 focus:outline-none group"
                >
                  <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white group-hover:shadow-lg transition-all">
                    {getInitials(user.name)}
                  </div>
                  {/* Chevron for visual cue */}
                  <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 hidden sm:block ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 origin-top-right">
                    
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-50 mb-1">
                      <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>

                    {/* Menu Items */}
                    <div className="px-2 space-y-1">
                      <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition-colors">
                        <LayoutDashboard size={16} /> Dashboard
                      </Link>
                      <Link to="/profile" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition-colors">
                        <User size={16} /> My Profile
                      </Link>
                      <Link to="/settings" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition-colors">
                        <Settings size={16} /> Settings
                      </Link>
                    </div>

                    <div className="h-px bg-gray-100 my-2 mx-2"></div>
                    
                    <div className="px-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 transition-colors text-left font-medium"
                      >
                        <LogOut size={16} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // NOT LOGGED IN: Login Button
              <Link
                to="/login"
                className="flex items-center justify-center px-6 py-2 rounded-full text-sm font-semibold text-white bg-blue-600 shadow-md transition-all hover:scale-105 hover:bg-blue-700 hover:shadow-lg active:scale-95"
              >
                Login
              </Link>
            )}

          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;