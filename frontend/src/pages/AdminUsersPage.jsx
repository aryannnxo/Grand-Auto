import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Users, 
  Search, 
  UserCheck, 
  ShieldAlert, 
  Mail, 
  Phone, 
  Calendar, 
  Trash2, 
  Edit3, 
  CheckCircle,
  XCircle,
  Shield,
  CreditCard,
  CarFront
} from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

const API = "http://localhost:5000";

const AdminUsersPage = () => {
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({ total: 0, admins: 0, owners: 0, renters: 0 });
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterRole, setFilterRole] = useState("");
    const navigate = useNavigate();

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const params = new URLSearchParams();
            if (searchQuery) params.append("search", searchQuery);
            if (filterRole) params.append("role", filterRole);

            const res = await axios.get(`${API}/api/admin/users?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data.users);
            setStats(res.data.stats);
        } catch (err) {
            console.error("Fetch users error", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, filterRole]);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to PERMANENTLY delete this user? This cannot be undone.")) return;
        try {
            await axios.delete(`${API}/api/admin/users/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.msg || "Delete failed");
        }
    };

    const handleUpdateRole = async (id, newRole) => {
        try {
            await axios.put(`${API}/api/admin/users/${id}`, { role: newRole }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            fetchUsers();
        } catch (err) {
            alert("Update failed");
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto pt-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest mb-3">
                        <Users size={14} /> Community Governance
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black font-heading text-slate-900 dark:text-white tracking-tight">User Management</h1>
                    <p className="text-slate-500 font-medium mt-2 italic leading-relaxed max-w-xl text-sm">Oversee all platform participants, manage permissions, and audit user accounts to maintain platform integrity.</p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {[
                    { label: "Total Members", value: stats.total, icon: Users, color: "text-slate-500", bg: "bg-slate-50 dark:bg-slate-800" },
                    { label: "Administrators", value: stats.admins, icon: Shield, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-900/10" },
                    { label: "Verified Owners", value: stats.owners, icon: CarFront, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/10" },
                    { label: "Standard Users", value: stats.renters, icon: UserCheck, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/10" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                            <stat.icon size={20} />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-8">
                <div className="w-full lg:w-96">
                    <Input 
                        icon={Search}
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="mb-0 rounded-2xl border-slate-200 dark:border-slate-800"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {['', 'user', 'owner', 'admin'].map(role => (
                        <button 
                            key={role} 
                            onClick={() => setFilterRole(role)}
                            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterRole === role ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md' : 'bg-white dark:bg-slate-900 text-slate-400 border border-slate-100 dark:border-slate-800 hover:bg-slate-50'}`}
                        >
                            {role === '' ? 'All Members' : role + 's'}
                        </button>
                    ))}
                </div>
            </div>

            {/* User List */}
            {loading ? (
                <div className="flex justify-center p-20"><div className="w-10 h-10 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin" /></div>
            ) : users.length === 0 ? (
                <div className="text-center p-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm text-slate-400 font-bold uppercase tracking-widest text-xs">No community members found.</div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {users.map((user, idx) => (
                        <motion.div 
                            key={user._id}
                            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                            className="group bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center gap-6"
                        >
                            <div className="flex items-center gap-4 shrink-0">
                                <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl font-black text-primary-500">
                                    {user.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-tight">
                                        {user.name}
                                        {user.role === 'admin' && <Shield size={16} className="text-rose-500" />}
                                    </h3>
                                    <div className="flex items-center gap-3 text-xs text-slate-400 font-bold">
                                        <span className="flex items-center gap-1"><Mail size={12}/> {user.email}</span>
                                        <span className="flex items-center gap-1 font-black uppercase tracking-tighter"><Calendar size={12}/> Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 lg:ml-auto">
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                    user.role === 'admin' ? 'bg-rose-50 text-rose-500 border-rose-100' :
                                    user.role === 'owner' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' :
                                    'bg-blue-50 text-blue-500 border-blue-100'
                                }`}>
                                    {user.role}
                                </span>
                                {user.isVerifiedOwner && (
                                    <Badge variant="success" className="bg-emerald-500 text-white border-0 shadow-sm text-[10px] py-1">Verified Owner</Badge>
                                )}
                            </div>

                            <div className="flex items-center gap-2 shrink-0 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800 pt-4 lg:pt-0 lg:pl-6 mt-2 lg:mt-0">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => navigate(`/admin/users/${user._id}`)}
                                    className="text-[10px] font-black uppercase tracking-widest border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                                >
                                    Report <Edit3 size={14} className="ml-1.5" />
                                </Button>
                                
                                <select 
                                    className="text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-2 outline-none cursor-pointer focus:ring-1 focus:ring-primary-500"
                                    value={user.role}
                                    onChange={(e) => handleUpdateRole(user._id, e.target.value)}
                                >
                                    <option value="user">Promote standard</option>
                                    <option value="owner">Approve Owner</option>
                                    <option value="admin">Make admin</option>
                                </select>

                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handleDelete(user._id)}
                                    className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl"
                                >
                                    <Trash2 size={18} />
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminUsersPage;
