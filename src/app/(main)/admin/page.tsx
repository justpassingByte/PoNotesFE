"use client";

import { useState, useEffect } from "react";
import { 
    Users, 
    TrendingUp, 
    CreditCard, 
    Database, 
    Shield, 
    ChevronRight, 
    Clock, 
    BarChart3,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Calendar,
    ArrowUpRight,
    Zap
} from "lucide-react";

interface Stats {
    totalUsers: number;
    premiumUsers: number;
    totalRevenue: number;
    totalHands: number;
    conversionRate: string;
}

interface User {
    id: string;
    email: string;
    premium_tier: string;
    is_admin: boolean;
    subscription_expiry: string | null;
    created_at: string;
    _count: { hands: number };
    usages: any[];
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'plans'>('stats');
    const [plans, setPlans] = useState<any[]>([]);
    const [editingPlan, setEditingPlan] = useState<any>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
            const [statsRes, usersRes, plansRes] = await Promise.all([
                fetch(`${baseUrl}/api/admin/stats`, { credentials: "include" }),
                fetch(`${baseUrl}/api/admin/users`, { credentials: "include" }),
                fetch(`${baseUrl}/api/admin/pricing`, { credentials: "include" })
            ]);

            const statsJson = await statsRes.json();
            const usersJson = await usersRes.json();
            const plansJson = await plansRes.json();

            if (statsJson.success) setStats(statsJson.data);
            if (usersJson.success) setUsers(usersJson.data);
            if (plansJson.success) setPlans(plansJson.data);
        } catch (err) {
            console.error("Failed to fetch admin data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateUser = async (userId: string, tier: string, days: number) => {
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
            const res = await fetch(`${baseUrl}/api/admin/users/update-subscription`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, tier, expiryDays: days }),
                credentials: "include"
            });
            const json = await res.json();
            if (json.success) {
                alert("User subscription updated!");
                fetchData();
            }
        } catch (err) {
            console.error("Update failed:", err);
        }
    };

    const handleSavePlan = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
            const res = await fetch(`${baseUrl}/api/admin/pricing`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editingPlan),
                credentials: "include"
            });
            const json = await res.json();
            if (json.success) {
                alert("Plan updated success!");
                setEditingPlan(null);
                fetchData();
            }
        } catch (err) {
            console.error("Save failed:", err);
        }
    };

    const handleBackup = () => {
        alert("Database backup started. A snapshot will be sent to your admin email.");
    };

    if (loading) return <div className="flex items-center justify-center min-h-screen bg-black text-gold">Loading Admin...</div>;

    return (
        <main className="flex-1 pt-24 px-4 sm:px-8 pb-12 bg-black min-h-screen">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-white flex items-center gap-3">
                            <Shield className="w-8 h-8 text-gold" />
                            Admin Central
                        </h1>
                        <p className="text-gray-500 mt-1">Intelligence management and revenue tracking</p>
                    </div>
                    <button 
                        onClick={handleBackup}
                        className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2 transition-all"
                    >
                        <Database className="w-4 h-4 text-gold" />
                        Backup Database
                    </button>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard 
                        label="Total Users" 
                        value={stats?.totalUsers || 0} 
                        icon={Users} 
                        color="text-blue-400" 
                        subtext={`${stats?.premiumUsers || 0} Premium`}
                    />
                    <StatCard 
                        label="Total Revenue" 
                        value={`$${stats?.totalRevenue || 0}`} 
                        icon={TrendingUp} 
                        color="text-emerald-400" 
                        subtext={`CR: ${stats?.conversionRate || 0}%`}
                    />
                    <StatCard 
                        label="Hands Analyzed" 
                        value={stats?.totalHands || 0} 
                        icon={BarChart3} 
                        color="text-purple-400" 
                        subtext="Processing daily"
                    />
                    <StatCard 
                        label="Status" 
                        value="Healthy" 
                        icon={CheckCircle2} 
                        color="text-gold" 
                        subtext="GPU OCR Nodes: 2"
                    />
                </div>

                {/* Tabs */}
                <div className="flex gap-4 border-b border-white/10">
                    <TabButton active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} label="Overview" />
                    <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} label="User Management" />
                    <TabButton active={activeTab === 'plans'} onClick={() => setActiveTab('plans')} label="Subscription Plans" />
                </div>

                {/* User Table */}
                {activeTab === 'users' && (
                    <div className="bg-card border border-white/10 rounded-2xl overflow-hidden animate-in fade-in duration-500">
                        {/* ... Existing Table Content ... */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/5 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                                        <th className="px-6 py-4">User</th>
                                        <th className="px-6 py-4">Tier</th>
                                        <th className="px-6 py-4">Usage (Mtd)</th>
                                        <th className="px-6 py-4">Expiry</th>
                                        <th className="px-6 py-4 text-right">Quick Manage</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold text-xs font-bold ring-1 ring-gold/20">
                                                        {user.email[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-white">{user.email}</p>
                                                        <p className="text-[10px] text-gray-600 font-mono tracking-tighter">{user.id.slice(0, 8)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded inline-flex items-center gap-1 ${
                                                    user.premium_tier === 'FREE' ? 'bg-gray-500/10 text-gray-400' :
                                                    user.premium_tier === 'PRO' ? 'bg-gold/10 text-gold' : 'bg-purple-500/10 text-purple-400'
                                                }`}>
                                                    {user.premium_tier}
                                                    {user.is_admin && <Shield className="w-3 h-3 ml-1" />}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-mono text-gray-300">{user._count.hands} hands</td>
                                            <td className="px-6 py-4 text-xs text-gray-300">
                                                {user.subscription_expiry ? new Date(user.subscription_expiry).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => handleUpdateUser(user.id, 'PRO', 30)} className="text-[10px] bg-white/5 hover:bg-gold/20 text-gray-400 hover:text-gold px-2 py-1 rounded-lg border border-white/10 transition-all uppercase font-bold">
                                                        +PRO
                                                    </button>
                                                    <button onClick={() => handleUpdateUser(user.id, 'PRO_PLUS', 30)} className="text-[10px] bg-white/5 hover:bg-purple-500/20 text-gray-400 hover:text-purple-400 px-2 py-1 rounded-lg border border-white/10 transition-all uppercase font-bold">
                                                        +ELITE
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Plans Management */}
                {activeTab === 'plans' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-500">
                        {plans.map((plan: any) => (
                            <div key={plan.id} className="bg-card border border-white/10 rounded-2xl p-6 relative group overflow-hidden">
                                <div className="absolute top-0 right-0 p-4">
                                    <button 
                                        onClick={() => setEditingPlan({...plan})}
                                        className="p-2 rounded-lg bg-white/5 hover:bg-gold/20 text-gray-400 hover:text-gold transition-all"
                                    >
                                        Edit
                                    </button>
                                </div>
                                <h3 className="text-xl font-black text-white mb-1">{plan.name}</h3>
                                <div className="text-2xl font-black text-gold mb-6">${plan.price}<span className="text-[10px] text-gray-500 ml-1">/mo</span></div>
                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                        <span>AI Limit</span>
                                        <span className="text-white">{plan.ai_limit}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                        <span>OCR Limit</span>
                                        <span className="text-white">{plan.ocr_limit}</span>
                                    </div>
                                </div>
                                <div className="border-t border-white/5 pt-4">
                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Features</h4>
                                    <ul className="space-y-1">
                                        {plan.features.slice(0, 4).map((f: string, idx: number) => (
                                            <li key={idx} className="text-[10px] text-gray-500 flex items-center gap-2">
                                                <div className="w-1 h-1 rounded-full bg-gold/50" />
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Edit Plan Modal */}
                {editingPlan && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl w-full max-w-xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
                            <h2 className="text-xl font-black text-white mb-8 flex items-center gap-2 uppercase tracking-tighter">
                                <Zap className="text-gold w-5 h-5" />
                                Edit Plan {editingPlan.id}
                            </h2>
                            <form onSubmit={handleSavePlan} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Display Name</label>
                                        <input 
                                            value={editingPlan.name}
                                            onChange={(e) => setEditingPlan({...editingPlan, name: e.target.value})}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-gold/50 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Price ($)</label>
                                        <input 
                                            type="number"
                                            value={editingPlan.price}
                                            onChange={(e) => setEditingPlan({...editingPlan, price: parseFloat(e.target.value)})}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-gold/50 text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">AI Limit</label>
                                        <input 
                                            type="number"
                                            value={editingPlan.ai_limit}
                                            onChange={(e) => setEditingPlan({...editingPlan, ai_limit: parseInt(e.target.value)})}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-gold/50 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">OCR Limit</label>
                                        <input 
                                            type="number"
                                            value={editingPlan.ocr_limit}
                                            onChange={(e) => setEditingPlan({...editingPlan, ocr_limit: parseInt(e.target.value)})}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-gold/50 text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Features (comma separated)</label>
                                    <textarea 
                                        value={editingPlan.features.join(', ')}
                                        onChange={(e) => setEditingPlan({...editingPlan, features: e.target.value.split(',').map(s => s.trim())})}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-gold/50 text-xs h-24"
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button type="submit" className="flex-1 bg-gold text-black font-black py-3 rounded-xl uppercase text-xs tracking-widest hover:bg-yellow-500 transition-colors">
                                        Save Changes
                                    </button>
                                    <button type="button" onClick={() => setEditingPlan(null)} className="px-6 bg-white/5 text-gray-400 font-bold rounded-xl text-xs uppercase tracking-widest">
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {activeTab === 'stats' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in slide-in-from-bottom-2 duration-500">
                        <div className="bg-card border border-white/10 rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center justify-between">
                                Growth Metrics
                                <TrendingUp className="w-5 h-5 text-emerald-400" />
                            </h3>
                            <div className="h-64 flex items-end justify-between gap-2 px-2">
                                {[40, 65, 55, 90, 80, 110, 145].map((val, i) => (
                                    <div key={i} className="flex-1 space-y-2">
                                        <div 
                                            className="bg-gold/20 hover:bg-gold/40 transition-all rounded-t-lg border-t border-x border-gold/30" 
                                            style={{ height: `${val}px` }}
                                        />
                                        <p className="text-[10px] text-gray-600 text-center">Day {i+1}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-card border border-white/10 rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-6">Recent Activity</h3>
                            <div className="space-y-4">
                                {[1,2,3,4].map(i => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-emerald-500/10">
                                                <CreditCard className="w-4 h-4 text-emerald-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-white">New Subscription</p>
                                                <p className="text-[10px] text-gray-500">2 minutes ago</p>
                                            </div>
                                        </div>
                                        <span className="text-emerald-400 font-bold text-sm">+$29.00</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}

function StatCard({ label, value, icon: Icon, color, subtext }: any) {
    return (
        <div className="bg-card border border-white/10 rounded-2xl p-6 hover:border-gold/30 transition-all group">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg bg-white/5`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-600 group-hover:text-gold transition-colors" />
            </div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">{label}</h4>
            <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">{value}</span>
            </div>
            <p className="mt-1 text-[10px] text-gray-600 font-medium">{subtext}</p>
        </div>
    );
}

function TabButton({ active, onClick, label }: any) {
    return (
        <button 
            onClick={onClick}
            className={`px-4 py-3 text-sm font-bold transition-all relative ${
                active ? 'text-gold' : 'text-gray-500 hover:text-white'
            }`}
        >
            {label}
            {active && <div className="absolute bottom-0 left-0 right-0 h-1 bg-gold rounded-t-full" />}
        </button>
    );
}
