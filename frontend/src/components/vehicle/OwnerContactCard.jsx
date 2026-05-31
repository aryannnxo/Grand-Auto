import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, MessageSquare } from 'lucide-react';

const OwnerContactCard = ({ vehicle }) => {
  const navigate = useNavigate();
  const owner = vehicle?.owner;

  // Safe fallback if owner is not populated
  const ownerName = owner?.name || 'Owner';
  const firstLetter = ownerName.charAt(0).toUpperCase();
  const isVerified = owner?.isVerifiedOwner || true; // Fallback to true for UI if undefined

  const handleMessageOwner = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate('/login');
      return;
    }
    
    try {
      const res = await axios.post("http://localhost:5000/api/chats/start", 
        { vehicleId: vehicle._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const userRole = localStorage.getItem("userRole");
      const isVerifiedOwner = localStorage.getItem("isVerifiedOwner") === "true";
      let chatPath = "/messages";
      let searchParams = "?chatId=" + res.data._id;
      
      if (userRole === "admin") {
        chatPath = "/admin/messages";
      } else if (isVerifiedOwner) {
        chatPath = "/seller/messages";
      }
      
      navigate(`${chatPath}${searchParams}`);
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to start chat");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 w-full flex flex-col gap-4">
      
      {/* Top section: Avatar and Name */}
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl shrink-0 shadow-sm border border-blue-200">
          {firstLetter}
        </div>
        
        {/* Name & Verification */}
        <div className="flex flex-col">
          <h3 className="text-base font-bold text-slate-900">Hosted by {ownerName}</h3>
          {isVerified && (
            <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 mt-0.5">
              <ShieldCheck size={16} />
              <span>Identity verified</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Divider */}
      <div className="h-px bg-slate-100 w-full my-1"></div>

      {/* Message Button */}
      <button 
        onClick={handleMessageOwner}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-sm rounded-lg transition-colors border border-blue-200 shadow-sm"
      >
        <MessageSquare size={18} />
        Message Owner
      </button>

    </div>
  );
};

export default OwnerContactCard;
