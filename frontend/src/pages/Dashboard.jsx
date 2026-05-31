import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PlusCircle, CarFront, LogOut, MessageSquare, ArrowLeft } from "lucide-react";
import Navbar from "../components/Navbar";
import { Button } from "../components/ui/Button";
import ChatPage from "./ChatPage";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMessages, setShowMessages] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("view") === "messages") {
      setShowMessages(true);
    } else {
      setShowMessages(false);
    }
  }, [location.search]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    navigate("/login");
  };

  if (showMessages) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-body relative flex flex-col h-screen overflow-hidden">
        <Navbar variant="dark" />
        <div className="pt-24 px-4 md:px-6 max-w-[1400px] mx-auto w-full flex-1 flex flex-col pb-6 h-full">
          <div className="mb-4">
            <Button variant="outline" onClick={() => navigate("/dashboard")} className="bg-white border-slate-200">
              <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
            </Button>
          </div>
          <div className="flex-1 overflow-hidden">
            <ChatPage isNested={true} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-body relative">
      <Navbar variant="dark" />
      <div className="pt-32 pb-12 px-6 max-w-lg mx-auto">
        <div className="glass-panel p-8 sm:p-12 rounded-[2.5rem] text-center shadow-premium relative overflow-hidden mt-8">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500/10 rounded-full blur-2xl pointer-events-none" />
          <h1 className="text-3xl font-bold font-heading text-slate-900 dark:text-white mb-2">Owner Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">Manage your vehicles and rental operations effortlessly.</p>
          
          <div className="flex flex-col gap-4">
            <Button variant="primary" size="lg" onClick={() => navigate("/seller/add-vehicle")} className="w-full shadow-lg h-14 text-lg">
              <PlusCircle size={22} className="mr-2" /> Add New Vehicle
            </Button>
            <Button variant="secondary" size="lg" onClick={() => navigate("/vehicles")} className="w-full bg-white dark:bg-slate-800 h-14 text-lg">
              <CarFront size={22} className="mr-2" /> View My Vehicles
            </Button>
            <Button variant="secondary" size="lg" onClick={() => navigate("/dashboard?view=messages")} className="w-full bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 dark:border-blue-900/30 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 h-14 text-lg">
              <MessageSquare size={22} className="mr-2" /> Messages
            </Button>
            <div className="w-full h-px bg-slate-200 dark:bg-slate-800 my-2" />
            <Button variant="outline" size="lg" onClick={handleLogout} className="w-full text-rose-500 border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:border-rose-900/50 dark:text-rose-400 dark:hover:bg-rose-900/20 h-14 text-lg">
              <LogOut size={22} className="mr-2" /> Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
