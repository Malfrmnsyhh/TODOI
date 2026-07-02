"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  CheckSquare,
  BarChart2,
  Settings,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useTaskStore } from "@/store/taskStore";

interface SidebarProps {
  onNewTask: () => void;
}

export default function Sidebar({ onNewTask }: SidebarProps) {
  const { user } = useTaskStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Get initials from user name (e.g. "John Doe" -> "JD")
  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, active: true },
    { name: "My Tasks", icon: CheckSquare, active: false },
    { name: "Analytics", icon: BarChart2, active: false },
    { name: "Settings", icon: Settings, active: false },
  ];

  return (
    <aside
      className={`h-full flex flex-col border-r border-white/10 bg-[#0b1326] flex-shrink-0 hidden md:flex transition-all duration-300 ease-in-out overflow-hidden ${
        isCollapsed ? "w-20 p-4" : "w-68 p-6"
      }`}
    >
      {/* Brand & Toggle */}
      <div
        className={`flex items-center mb-10 transition-all duration-300 ${isCollapsed ? "justify-center" : "justify-between"}`}
      >
        <h2
          className={`text-xl font-bold text-white whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${
            isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
          }`}
        >
          TODOI
        </h2>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? (
            <PanelLeftOpen size={20} />
          ) : (
            <PanelLeftClose size={20} />
          )}
        </button>
      </div>

      {/* Profile card */}
      <div className="mb-10 flex justify-center">
        <Link
          href="/profile"
          className={`flex items-center rounded-xl glass-panel-light hover:border-indigo-500/40 hover:bg-white/5 transition-all duration-300 group overflow-hidden ${
            isCollapsed ? "p-2 justify-center w-12" : "p-3 w-full gap-3"
          }`}
          title={isCollapsed ? "Edit Profil" : ""}
        >
          {/* Avatar */}
          <div
            className={`${isCollapsed ? "w-8 h-8" : "w-10 h-10"} rounded-full overflow-hidden flex-shrink-0 border-2 border-indigo-500/30 group-hover:border-indigo-500 transition-all duration-300`}
          >
            {user?.photoUrl ? (
              <img
                src={user.photoUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                {getInitials(user?.name)}
              </div>
            )}
          </div>

          {/* Name & tagline */}
          <div
            className={`min-w-0 flex-1 whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${
              isCollapsed ? "w-0 opacity-0" : "opacity-100"
            }`}
          >
            <p className="text-sm font-semibold text-white truncate">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-indigo-400 truncate">
              {user?.bio ? user.bio : "Edit profil →"}
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.name}
            title={isCollapsed ? item.name : ""}
            className={`flex items-center rounded-lg text-sm font-medium transition-all duration-300 overflow-hidden ${
              isCollapsed
                ? "justify-center w-full aspect-square"
                : "w-full px-4 py-3 gap-3"
            } ${
              item.active
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <div className="flex-shrink-0">
              <item.icon size={isCollapsed ? 20 : 18} />
            </div>
            <span
              className={`whitespace-nowrap transition-all duration-300 ease-in-out ${
                isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
              }`}
            >
              {item.name}
            </span>
          </button>
        ))}
      </nav>

      {/* Action Button */}
      <button
        onClick={onNewTask}
        title={isCollapsed ? "Create New Task" : ""}
        className={`mt-auto flex items-center rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 font-semibold overflow-hidden ${
          isCollapsed
            ? "justify-center w-full aspect-square"
            : "w-full px-4 py-3 gap-2"
        }`}
      >
        <div className="flex-shrink-0">
          <Plus size={20} />
        </div>
        <span
          className={`whitespace-nowrap transition-all duration-300 ease-in-out ${
            isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
          }`}
        >
          Create New Task
        </span>
      </button>
    </aside>
  );
}
