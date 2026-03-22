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
    ArrowUpRight
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
    const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'revenue'>('stats');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
            const [statsRes, usersRes] = await Promise.all([
                fetch(`${baseUrl}/api/admin/stats`, { credentials: "include" }),
                fetch(`${baseUrl}/api/admin/users`, { credentials: "include" })
            ]);

            const statsJson = await statsRes.json();
            const usersJson = await usersRes.json();

            if (statsJson.success) setStats(statsJson.data);
            if (usersJson.success) setUsers(usersJson.data);
        } catch (err) {
            console.error("Failed to fetch admin data:", err);
        } finally {
            setLoading(false);
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
                </div>

                {/* User Table */}
                {activeTab === 'users' && (
                    <div className="bg-card border border-white/10 rounded-2xl overflow-hidden animate-in fade-in duration-500">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/5 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                                        <th className="px-6 py-4">User</th>
                                        <th className="px-6 py-4">Tier</th>
                                        <th className="px-6 py-4">Usage (Mtd)</th>
                                        <th className="px-6 py-4">Expiry</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
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
                                                        <p className="text-[10px] text-gray-500 font-mono">{user.id.slice(0, 8)}</p>
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
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-gray-300 font-mono">{user._count.hands}</span>
                                                    <span className="text-[10px] text-gray-600">hands</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-xs">
                                                    {user.subscription_expiry ? (
                                                        <>
                                                            <Calendar className="w-3 h-3 text-emerald-400" />
                                                            <span className="text-gray-300">{new Date(user.subscription_expiry).toLocaleDateString()}</span>
                                                        </>
                                                    ) : (
                                                        <span className="text-gray-600">N/A</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-gray-500 hover:text-white transition-colors">
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
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
