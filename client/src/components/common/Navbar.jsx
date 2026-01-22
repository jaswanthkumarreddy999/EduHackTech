// src/components/common/Navbar.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Search, Bell, MonitorPlay, Trophy } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import "./Navbar.css";

import logo from "../assets/EduhackTech.jpeg"; // ✅ CORRECT PATH

const Navbar = () => {
  const { mode, toggleMode, primary, bgLight } = useTheme();

  return (
    <nav className="w-full sticky top-0 z-50 backdrop-blur-lg bg-white/80 border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex items-center h-16">
          {/* LEFT — Logo */}
          <div className="flex items-center min-w-fit">
            <Link to="/" className="flex items-center gap-3">
              <img
                src={logo}
                alt="EduHackTech Logo"
                className="w-10 h-10 object-contain"
              />
              <span className="text-xl font-extrabold tracking-tight text-gray-800">
                EduHack<span className={primary}>Tech</span>
              </span>
            </Link>
          </div>

          {/* MIDDLE — Search */}
          <div className="hidden md:flex flex-1 justify-center">
            <div className="relative w-full max-w-lg">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 border border-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                placeholder={
                  mode === "learning"
                    ? "Search courses, skills, mentors..."
                    : "Search hackathons, teams, events..."
                }
              />
            </div>
          </div>

          {/* RIGHT — Actions */}
          <div className="flex items-center gap-4 min-w-fit">
            {/* Notification */}
            <button className="relative p-2 rounded-full hover:bg-gray-100 transition">
              <Bell className="h-6 w-6 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Mode Toggle */}
            <button
              onClick={toggleMode}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 ${bgLight} border-gray-200 hover:shadow-md`}
            >
              {mode === "learning" ? (
                <>
                  <MonitorPlay className={`h-4 w-4 ${primary}`} />
                  <span className={`text-sm font-semibold ${primary}`}>
                    Learning
                  </span>
                </>
              ) : (
                <>
                  <Trophy className={`h-4 w-4 ${primary}`} />
                  <span className={`text-sm font-semibold ${primary}`}>
                    Compete
                  </span>
                </>
              )}
            </button>

            {/* Login */}
            <Link
              to="/login"
              className="flex items-center justify-center px-6 py-2 rounded-full
              text-sm font-semibold text-white bg-blue-600 shadow-md transition-all hover:scale-105 hover:bg-blue-700"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
