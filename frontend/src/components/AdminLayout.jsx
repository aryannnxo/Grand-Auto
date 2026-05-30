import React, { useState } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileCheck,
  CarFront,
  Key,
  CreditCard,
  Wrench,
  Search,
  Settings,
  HelpCircle,
  Bell,
  Headset,
  ChevronRight,
  ChevronLeft,
  PlusCircle,
  ChevronDown,
  Shield,
  User
} from "lucide-react";

const AdminLayout = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "Admin";

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : "A";
  };

  const navItems = [
    { path: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/admin/users", icon: Users, label: "Users" },
    { path: "/admin/verification", icon: Shield, label: "Owner Approvals" },
    { path: "/admin/car-verification", icon: FileCheck, label: "Car Approvals" },
    { path: "/seller/add-vehicle", icon: PlusCircle, label: "Add Vehicle" },
    { path: "/admin/cars", icon: CarFront, label: "Fleet" },
    { path: "/admin/rentals", icon: Key, label: "Rentals" },
    { path: "/admin/payments", icon: CreditCard, label: "Payments" },
    { path: "/admin/mechanics", icon: Wrench, label: "Mechanics" }
  ];

  const bottomNavItems = [
    { icon: HelpCircle, label: "Help" }
  ];

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] dark:bg-[#070b14] font-body overflow-hidden selection:bg-primary-500/30">

      {/* Left Sidebar */}
      <aside className={`transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) bg-white dark:bg-[#0f172a] border-r border-slate-200/60 dark:border-white/5 flex flex-col py-8 h-full shrink-0 z-30 relative ${isExpanded ? 'w-72 px-6' : 'w-24 items-center'}`}>
        
        {/* Glow effect for sidebar */}
        <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-primary-500/20 to-transparent"></div>

        <div className={`flex items-center mb-10 ${isExpanded ? 'px-2 gap-3 cursor-pointer' : 'justify-center cursor-pointer'}`} onClick={() => navigate('/')}>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-black text-2xl shrink-0 shadow-lg shadow-primary-500/30 ring-4 ring-primary-500/10 transition-transform hover:scale-105 active:scale-95">
            G
          </div>
          <span className={`font-heading font-black text-2xl text-slate-900 dark:text-white tracking-tight transition-all duration-300 ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 w-0 overflow-hidden'}`}>
            GrandAuto
          </span>
        </div>

        <div className={`flex w-full mb-8 items-center ${isExpanded ? 'px-2 justify-between' : 'justify-center font-black uppercase tracking-widest'}`}>
          <span className={`text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ${!isExpanded && 'hidden'}`}>Management</span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
            className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-all border border-slate-200/50 dark:border-white/5 shadow-sm"
          >
            {isExpanded ? <ChevronLeft size={18} strokeWidth={2.5} /> : <ChevronRight size={18} strokeWidth={2.5} />}
          </button>
        </div>

        <nav className={`flex flex-col gap-2 flex-1 w-full ${!isExpanded && 'items-center'}`}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              title={!isExpanded ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center transition-all duration-300 group relative ${isExpanded ? 'w-full h-12 rounded-2xl px-4 justify-start' : 'w-14 h-14 rounded-2xl justify-center'
                } ${isActive
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25 scale-[1.02] active:scale-100'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              <div className="shrink-0 flex items-center justify-center">
                <item.icon size={20} className={`${isExpanded ? 'group-hover:scale-110 transition-transform' : ''} stroke-[2.2px]`} />
              </div>

              <span className={`font-bold text-[15px] whitespace-nowrap transition-all duration-300 ${isExpanded ? 'opacity-100 ml-4 translate-x-0' : 'opacity-0 w-0 overflow-hidden -translate-x-4'}`}>
                {item.label}
              </span>

              {!isExpanded && (
                <div className="absolute left-full ml-5 px-3 py-2 bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-all translate-x-2 group-hover:translate-x-0 shadow-xl border border-white/5">
                  {item.label}
                </div>
              )}
              
              {isExpanded && (
                <div className={`ml-auto w-1.5 h-1.5 rounded-full bg-white opacity-0 transition-opacity ${isExpanded ? 'group-[.active]:opacity-100' : ''}`}></div>
              )}
            </NavLink>
          ))}
        </nav>

        <div className={`flex flex-col gap-4 w-full mt-auto pt-6 border-t border-slate-100 dark:border-white/5 ${!isExpanded && 'items-center'}`}>
           <div className={`flex items-center gap-3 bg-slate-50 dark:bg-white/5 p-3 rounded-2xl border border-slate-200/50 dark:border-white/5 ${!isExpanded && 'justify-center w-14 h-14'}`}>
              <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0">
                 <User size={20} className="text-slate-500" />
              </div>
              <div className={`${!isExpanded && 'hidden'} overflow-hidden`}>
                 <p className="text-sm font-black text-slate-900 dark:text-white truncate uppercase tracking-tight">{userName}</p>
                 <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Administrator</p>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f4f7fa] dark:bg-[#030712] relative z-10 w-full lg:rounded-l-[3rem] lg:-ml-6 shadow-[-20px_0_40px_rgba(0,0,0,0.03)] dark:shadow-[-20px_0_40px_rgba(0,0,0,0.15)] border-l border-slate-200/80 dark:border-white/5 transition-all duration-500">

        {/* Top Header */}
        <header className="h-24 lg:h-28 px-8 md:px-14 flex items-center justify-between shrink-0 bg-white/50 dark:bg-[#030712]/50 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/5 sticky top-0 z-20">
          <div>
            <h1 className="text-2xl font-black text-slate-900 font-heading tracking-tight dark:text-white uppercase lg:text-3xl">
              Workspace
            </h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 hidden sm:block">Control Center</p>
          </div>

          <div className="flex items-center gap-4 lg:gap-8">
            <div className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-white/5 px-4 py-2 rounded-2xl border border-slate-200 dark:border-white/5">
               <Search size={18} className="text-slate-400" />
               <input type="text" placeholder="Global search..." className="bg-transparent border-none outline-none text-sm font-medium text-slate-600 dark:text-slate-300 placeholder:text-slate-400 w-32 focus:w-48 transition-all" />
            </div>

            <div className="flex items-center gap-4 pl-4 lg:pl-8 border-l border-slate-200 dark:border-white/5">
               <button className="relative w-10 h-10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-primary-500 dark:hover:text-white transition-colors">
                  <Bell size={22} className="stroke-[2.2px]" />
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 border-2 border-white dark:border-[#030712]"></span>
               </button>
               
               <div className="flex items-center gap-3 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer transition-colors border border-transparent hover:border-slate-200 dark:hover:border-white/10 group">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary-500 to-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-md group-hover:scale-105 transition-transform">
                  {getInitials(userName)}
                </div>
                <div className="hidden sm:block">
                  <div className="flex items-center gap-1.5 text-[13px] font-black text-slate-800 dark:text-white uppercase tracking-tight">
                    {userName} <ChevronDown size={14} className="text-slate-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto px-8 md:px-14 py-10 w-full transition-all scroll-smooth">
          <Outlet />
        </main>

      </div>

    </div>
  );
};

export default AdminLayout;
