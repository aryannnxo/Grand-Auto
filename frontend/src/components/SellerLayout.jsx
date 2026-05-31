import React, { useState } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CarFront,
  Key,
  Inbox,
  Search,
  Settings,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  PlusCircle,
  User,
  MessageSquare
} from "lucide-react";

const SellerLayout = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const userName = localStorage.getItem("userName") || "Seller";

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : "S";
  };

  const navItems = [
    { path: "/seller/dashboard", icon: LayoutDashboard, label: "Overview" },
    { path: "/seller/fleet", icon: CarFront, label: "My Fleet" },
    { path: "/seller/add-vehicle", icon: PlusCircle, label: "Add Car" },
    { path: "/seller/bookings", icon: Inbox, label: "Incoming Bookings" },
    { path: "/seller/messages", icon: MessageSquare, label: "Messages" },
    { path: "/profile", icon: User, label: "My Profile" },
  ];

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 font-body overflow-hidden">

      {/* Left Sidebar */}
      <aside className={`transition-all duration-300 ease-in-out bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex flex-col py-6 h-full shrink-0 z-20 overflow-hidden ${isExpanded ? 'w-64 px-4' : 'w-20 lg:w-24 items-center'}`}>

        <div className={`flex items-center mb-8 ${isExpanded ? 'px-2 gap-3 cursor-pointer' : 'justify-center cursor-pointer'}`} onClick={() => navigate('/')}>
          <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center text-white font-black text-xl shrink-0 shadow-md shadow-primary-500/20">
            G
          </div>
          <span className={`font-heading font-black text-xl text-slate-800 dark:text-white whitespace-nowrap transition-all duration-300 overflow-hidden ${isExpanded ? 'opacity-100 translate-x-0 w-auto ml-2' : 'opacity-0 -translate-x-4 w-0'}`}>
            GrandAuto
          </span>
        </div>

        <div className={`flex w-full mb-6 border-b border-slate-100 dark:border-slate-800 pb-4 ${isExpanded ? 'px-4 justify-between items-center' : 'justify-center items-center'}`}>
          <span className={`text-[10px] font-bold text-slate-400 uppercase tracking-widest ${!isExpanded && 'hidden'}`}>Seller Hub</span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800/80 flex items-center justify-center text-slate-500 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors shadow-sm border border-slate-200 dark:border-slate-700"
          >
            {isExpanded ? <ChevronLeft size={16} strokeWidth={3} /> : <ChevronRight size={16} strokeWidth={3} />}
          </button>
        </div>

        <div className={`flex flex-col gap-3 flex-1 w-full ${!isExpanded && 'items-center'}`}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center transition-all duration-200 group relative ${isExpanded ? 'w-full h-12 rounded-2xl px-4 justify-start' : 'w-12 h-12 rounded-2xl justify-center'
                } ${isActive
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20 scale-[1.02]'
                  : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300'
                }`
              }
            >
              <div className="shrink-0 flex items-center justify-center">
                <item.icon size={20} className="stroke-[2.5px]" />
              </div>

              <span className={`font-bold text-sm whitespace-nowrap transition-all duration-300 ${isExpanded ? 'opacity-100 ml-4' : 'opacity-0 w-0 overflow-hidden text-[0px]'}`}>
                {item.label}
              </span>

              {!isExpanded && (
                <div className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                  {item.label}
                </div>
              )}
            </NavLink>
          ))}
        </div>

        <div className={`flex flex-col gap-3 w-full mb-4 ${!isExpanded && 'items-center'}`}>
           <button className={`flex items-center transition-all duration-200 group relative ${isExpanded ? 'w-full h-12 rounded-2xl px-4 justify-start' : 'w-12 h-12 rounded-2xl justify-center'} text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300`}>
              <Settings size={20} className="stroke-[2.5px]" />
              <span className={`font-bold text-sm whitespace-nowrap transition-all duration-300 ${isExpanded ? 'opacity-100 ml-4' : 'opacity-0 w-0 overflow-hidden text-[0px]'}`}>Settings</span>
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f4f5f7] dark:bg-slate-950 relative z-10 w-full lg:rounded-l-[2rem] lg:-ml-2 shadow-[-10px_0_20px_rgba(0,0,0,0.02)] border-l border-slate-200 dark:border-slate-800 transition-all duration-300">

        {/* Top Header */}
        <header className="h-20 lg:h-24 px-8 md:px-12 flex items-center justify-between shrink-0 border-b border-slate-100 dark:border-slate-800/50">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
              Seller Hub / {(() => {
                const p = location.pathname;
                if (p.includes("add-vehicle")) return "Add Vehicle";
                if (p.includes("edit-vehicle")) return "Edit Vehicle";
                if (p.includes("fleet")) return "My Fleet";
                if (p.includes("bookings")) return "Bookings";
                if (p.includes("messages")) return "Messages";
                return "Overview";
              })()}
            </p>
            <h1 className="text-xl font-bold text-slate-800 lg:text-2xl font-heading tracking-tight dark:text-white">
              {(() => {
                const p = location.pathname;
                if (p.includes("add-vehicle")) return "Add Vehicle";
                if (p.includes("edit-vehicle")) return "Edit Vehicle";
                if (p.includes("fleet")) return "My Fleet";
                if (p.includes("bookings")) return "Incoming Bookings";
                if (p.includes("messages")) return "Messages";
                return "Seller Dashboard";
              })()}
            </h1>
          </div>

          <div className="flex items-center gap-4 lg:gap-6">
            <button onClick={() => navigate('/seller/messages')} className="relative w-10 h-10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-primary-500 dark:hover:text-white transition-colors" title="Messages">
              <MessageSquare size={22} className="stroke-[2.2px]" />
            </button>
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 pl-1 pr-3 py-1 rounded-full border border-slate-200 dark:border-slate-800 cursor-pointer hover:shadow-sm transition-shadow">
              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-sm">
                {getInitials(userName)}
              </div>
              <div className="flex items-center gap-1 text-sm font-bold text-slate-700 dark:text-slate-300">
                {userName} <span className="text-[10px]">▼</span>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto px-8 md:px-12 pb-12 w-full transition-all">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SellerLayout;
