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
        <div className="w-full max-w-7xl mx-auto pt-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">User Management</h1>
                    <p className="text-slate-500 text-sm mt-1">Oversee all platform participants, manage permissions, and audit user accounts to maintain platform integrity.</p>
                </div>
            </div>

            {/* Quick Stats */}
            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                    { label: "Total Members", value: stats.total, icon: Users, color: "text-slate-600", bg: "bg-slate-100 dark:bg-slate-800" },
                    { label: "Administrators", value: stats.admins, icon: Shield, color: "text-rose-600", bg: "bg-rose-100 dark:bg-rose-900/30" },
                    { label: "Verified Owners", value: stats.owners, icon: CarFront, color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
                    { label: "Standard Users", value: stats.renters, icon: UserCheck, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                        <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-full flex items-center justify-center`}>
                            <stat.icon size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase">{stat.label}</p>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters & Search */}
            {/* Filters & Search */}
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-6">
                <div className="w-full lg:w-96">
                    <Input 
                        icon={Search}
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="mb-0 rounded-md border-slate-200 dark:border-slate-800"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {['', 'user', 'owner', 'admin'].map(role => (
                        <button 
                            key={role} 
                            onClick={() => setFilterRole(role)}
                            className={`px-4 py-2 rounded-md text-sm transition-all ${filterRole === role ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900' : 'bg-white dark:bg-slate-900 text-slate-600 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'}`}
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
                <div className="grid grid-cols-1 gap-3">
                    {users.map((user, idx) => (
                        <motion.div 
                            key={user._id}
                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.02 }}
                            className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center gap-4"
                        >
                            <div className="flex items-center gap-4 shrink-0">
                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-bold text-primary-600">
                                    {user.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                        {user.name}
                                        {user.role === 'admin' && <Shield size={14} className="text-rose-500" />}
                                    </h3>
                                    <div className="flex items-center gap-3 text-xs text-slate-500">
                                        <span className="flex items-center gap-1"><Mail size={12}/> {user.email}</span>
                                        <span className="flex items-center gap-1"><Calendar size={12}/> Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 lg:ml-auto">
                                <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
                                    user.role === 'admin' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                                    user.role === 'owner' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                    'bg-blue-50 text-blue-600 border-blue-200'
                                }`}>
                                    {user.role}
                                </span>
                                {user.isVerifiedOwner && (
                                    <Badge variant="success" className="bg-emerald-100 text-emerald-700 border-0 shadow-sm text-xs py-0.5">Verified Owner</Badge>
                                )}
                            </div>

                            <div className="flex items-center gap-2 shrink-0 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 pt-3 lg:pt-0 lg:pl-4 mt-2 lg:mt-0">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => navigate(`/admin/users/${user._id}`)}
                                    className="text-xs border-slate-200 dark:border-slate-700 rounded-md"
                                >
                                    Report <Edit3 size={14} className="ml-1.5" />
                                </Button>
                                
                                <select 
                                    className="text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-md p-1.5 outline-none cursor-pointer focus:ring-1 focus:ring-primary-500"
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
                                    className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md"
                                >
                                    <Trash2 size={16} />
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
