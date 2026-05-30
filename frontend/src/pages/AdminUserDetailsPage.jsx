import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  Users, 
  MapPin, 
  Calendar, 
  CarFront, 
  Clock, 
  DollarSign, 
  ShieldCheck, 
  Mail, 
  Phone, 
  Activity, 
  ChevronRight, 
  TrendingUp, 
  Search, 
  ShieldAlert, 
  UserPlus
} from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

const API = "http://localhost:5000";

const AdminUserDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUserDetails = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const res = await axios.get(`${API}/api/admin/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(res.data);
        } catch (err) {
            console.error("Fetch user details error", err);
            navigate("/admin/users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUserDetails(); }, [id]);

    if (loading) return <div className="flex justify-center p-20 animate-pulse font-black uppercase text-xs tracking-widest">Compiling Profile...</div>;
    if (!data) return <div className="text-center p-20 font-black uppercase text-rose-500">Member Not Found</div>;

    const { user, bookings, vehicles } = data;

    return (
        <div className="w-full max-w-7xl mx-auto pt-8">
            <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-3xl font-black text-primary-500">
                        {user.name.charAt(0)}
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{user.name}</h1>
                            <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                user.role === 'admin' ? 'bg-rose-50 text-rose-500 border-rose-100' :
                                user.role === 'owner' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' :
                                'bg-blue-50 text-blue-500 border-blue-100'
                            }`}>
                                {user.role}
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400">
                           <span className="flex items-center gap-1.5"><Mail size={14}/> {user.email}</span>
                           <span className="flex items-center gap-1.5"><Phone size={14}/> {user.phone || 'No phone recorded'}</span>
                           <span className="flex items-center gap-1.5 font-black uppercase tracking-widest"><Calendar size={14}/> Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                   <Button variant="outline" className="text-[10px] font-black uppercase tracking-widest rounded-2xl">Audit Logs</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: User Stats & Identity */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center">
                                <ShieldAlert size={14} className="mr-2 text-primary-500" /> Identity Status
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">Ownership Verified</span>
                                    {user.isVerifiedOwner ? <CheckCircle className="text-emerald-500" size={18}/> : <XCircle className="text-slate-300" size={18}/>}
                                </div>
                                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">Account Standing</span>
                                    <Badge variant="success" className="text-[10px] py-0.5">Active</Badge>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -right-10 -bottom-10 opacity-5">
                            <Users size={120} />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">Participation Stats</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                                <h4 className="text-2xl font-black text-slate-900 dark:text-white">{bookings.length}</h4>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Bookings</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                                <h4 className="text-2xl font-black text-slate-900 dark:text-white">{vehicles.length}</h4>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fleet Size</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Activity Logs */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Vehicles (if owner) */}
                    {vehicles.length > 0 && (
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center">
                                    <CarFront size={18} className="mr-2 text-primary-500" /> Owned Inventory
                                </h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{vehicles.length} Cars</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {vehicles.map(vehicle => (
                                    <div key={vehicle._id} className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center shrink-0">
                                            <CarFront size={20} className="text-primary-500" />
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <p className="text-sm font-black text-slate-900 dark:text-white uppercase truncate">{vehicle.brand} {vehicle.model}</p>
                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{vehicle.operationalStatus || 'available'}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-black text-slate-900 dark:text-white">Rs. {vehicle.pricePerDay}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Bookings */}
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center">
                                <Activity size={18} className="mr-2 text-indigo-500" /> Rental Activity
                            </h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{bookings.length} Historic Events</p>
                        </div>
                        {bookings.length > 0 ? (
                            <div className="space-y-4">
                                {bookings.map(booking => (
                                    <div key={booking._id} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800 hover:scale-[1.01] transition-transform cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-indigo-500 shadow-sm">
                                                <DollarSign size={16} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-tighter">Transaction #{booking._id.slice(-6)}</p>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-slate-900 dark:text-slate-100">Rs. {booking.totalPrice?.toLocaleString()}</p>
                                            <p className={`text-[10px] font-black uppercase tracking-widest ${
                                                booking.paymentStatus === 'Paid' ? 'text-emerald-500' : 'text-rose-500'
                                            }`}>{booking.paymentStatus}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center p-12 bg-slate-50 dark:bg-slate-800/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-2">No transaction history detected</p>
                                <p className="text-xs text-slate-300 italic">This user has not listed or rented any vehicles yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminUserDetailsPage;
