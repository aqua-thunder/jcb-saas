import { useMemo } from "react";
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
    CartesianGrid, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar
} from "recharts";
import { useAuth } from "../store/auth";
import {
    Truck, Users, Wallet, Activity, Calendar as CalendarIcon,
    AlertTriangle, ArrowUpRight, CheckCircle2, MoreHorizontal,
    UserCheck, TrendingUp, Clock
} from "lucide-react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";

export default function Dashboard() {
    const { machine, driver, invoice } = useAuth();

    /* ================= DATA CALCULATIONS ================= */
    const stats = useMemo(() => {
        const totalMachines = machine?.length || 0;
        const activeMachines = machine?.filter(m => m.status === "Active").length || 0;
        const totalDrivers = driver?.length || 0;

        // Revenue calculations from real invoices
        const invArray = invoice || [];
        const totalRevenue = invArray.reduce((acc, curr) => acc + (Number(curr.totalAmount) || 0), 0);

        const actualRevenue = invArray.filter(inv => inv.status === "Success")
            .reduce((acc, curr) => acc + (Number(curr.totalAmount) || 0), 0);

        const potentialRevenue = invArray.filter(inv => inv.status === "Pending")
            .reduce((acc, curr) => acc + (Number(curr.totalAmount) || 0), 0);

        const totalInvoices = invArray.length;

        const avgUsage = totalMachines > 0
            ? Math.round(machine.reduce((acc, curr) => acc + (Number(curr.usageHours) || 0), 0) / totalMachines)
            : 0;

        return { totalMachines, activeMachines, totalDrivers, totalRevenue, actualRevenue, potentialRevenue, totalInvoices, avgUsage };
    }, [machine, driver, invoice]);

    const statusData = useMemo(() => [
        { name: "Active", value: stats.activeMachines, color: "#10b981" },
        { name: "Maintenance", value: stats.totalMachines - stats.activeMachines, color: "#f59e0b" }
    ], [stats]);

    const usageData = useMemo(() => {
        return machine?.slice(0, 8).map(m => ({
            name: m.model.split(' ')[0],
            hours: m.usageHours,
            full: m.model
        })) || [];
    }, [machine]);

    const chartData = [
        { name: "Mon", revenue: 4000 },
        { name: "Tue", revenue: 3000 },
        { name: "Wed", revenue: 5000 },
        { name: "Thu", revenue: 2780 },
        { name: "Fri", revenue: 6890 },
        { name: "Sat", revenue: 8390 },
        { name: "Sun", revenue: 4490 },
    ];

    return (
        <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 sm:gap-4">
                <div>
                    <div className="flex items-center gap-2 text-[var(--text-muted)]">
                        <Activity size={12} className="text-[var(--color-primary)] sm:w-3.5 sm:h-3.5" />
                        <p className="text-xs sm:text-sm">Real-time analytics for your JCB operations.</p>
                    </div>
                </div>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
                <StatCard
                    title="Total Machines"
                    value={stats.totalMachines}
                    icon={<Truck className="text-blue-500" />}
                    trend="+2 Added"
                    color="bg-blue-500/10"
                />
                <StatCard
                    title="Team Driver"
                    value={stats.totalDrivers}
                    icon={<Users className="text-purple-500" />}
                    trend="Active Staff"
                    color="bg-purple-500/10"
                />
                <StatCard
                    title="Average Usage"
                    value={`${stats.avgUsage}h`}
                    icon={<Clock className="text-green-500" />}
                    trend="Per Machine"
                    color="bg-green-500/10"
                />
                <StatCard
                    title="Total Revenue"
                    value={`₹${stats.totalRevenue.toLocaleString()}`}
                    icon={<Wallet className="text-[var(--color-primary)]" />}
                    trend={`${stats.totalInvoices} Invoices`}
                    color="bg-orange-500/10"
                />
            </div>

            {/* Main Visuals Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                {/* Revenue Graph */}
                <div className="lg:col-span-2 bg-[var(--bg-card)] rounded-2xl p-4 sm:p-6 border border-white/10 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-5 sm:opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                        <ArrowUpRight size={100} sm:size={120} strokeWidth={1} className="text-[var(--color-primary)]" />
                    </div>
                    <div className="flex items-center gap-4 mb-6 sm:mb-8">
                        <div className="p-2 bg-[var(--color-primary)]/10 rounded-lg">
                            <TrendingUp className="text-[var(--color-primary)]" size={18} sm:size={20} />
                        </div>
                        <h2 className="text-lg sm:text-xl font-bold text-white uppercase tracking-tight">Rental Performance</h2>
                    </div>
                    <div className="h-64 sm:h-80 w-full font-medium">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9a9a9a', fontSize: 10 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9a9a9a', fontSize: 10 }} />
                                <Tooltip
                                    contentStyle={{ background: '#252525', color: '#fff', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="var(--color-primary)"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRev)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Status Distribution */}
                <div className="bg-[var(--bg-card)] rounded-2xl p-4 sm:p-6 border border-white/10 shadow-2xl flex flex-col">
                    <h2 className="text-lg sm:text-xl font-bold text-white mb-6 sm:mb-8 px-2 border-l-4 border-[var(--color-primary)] uppercase tracking-tight">Fleet Condition</h2>
                    <div className="h-56 sm:h-64 shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    innerRadius={55}
                                    outerRadius={75}
                                    paddingAngle={8}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ background: '#252525', border: '1px solid #ffffff10', borderRadius: 8, fontSize: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-auto">
                        {statusData.map((s, i) => (
                            <div key={i} className="bg-white/5 p-3 sm:p-4 rounded-xl border border-white/5 text-center">
                                <div className="flex flex-col items-center gap-0.5 sm:gap-1 group">
                                    <div className="w-2 h-2 rounded-full mb-1" style={{ backgroundColor: s.color }} />
                                    <span className="text-[9px] sm:text-[10px] uppercase text-[var(--text-muted)] font-black tracking-widest leading-none">{s.name}</span>
                                    <span className="text-xl sm:text-2xl font-black text-white">{s.value}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Row 3: Fleet Usage Bar Chart */}
            <div className="bg-[var(--bg-card)] rounded-2xl p-4 sm:p-6 border border-white/10 shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                    <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-3 uppercase tracking-tight">
                        <Clock className="text-green-500" size={20} /> Heavy Duty Usage (Hours)
                    </h2>
                    <p className="hidden sm:block text-[10px] text-[var(--text-muted)] bg-white/5 px-4 py-1.5 rounded-full border border-white/5 font-bold uppercase tracking-wider">
                        Operating Hours Comparison
                    </p>
                </div>
                <div className="h-56 sm:h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={usageData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9a9a9a', fontSize: 10 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9a9a9a', fontSize: 10 }} />
                            <Tooltip
                                contentStyle={{ background: '#252525', color: '#fff', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '12px' }}
                                itemStyle={{ color: '#fff' }}
                                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                            />
                            <Bar dataKey="hours" radius={[6, 6, 0, 0]} barSize={window.innerWidth < 640 ? 20 : 40}>
                                {usageData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'var(--color-primary)' : '#4ade80'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Row 4: Lists & Alerts */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {/* Recent Machines */}
                <div className="bg-[var(--bg-card)] rounded-2xl p-4 sm:p-6 border border-white/10 shadow-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <Truck size={18} sm:size={22} className="text-blue-500" />
                            <h2 className="text-lg sm:text-xl font-bold text-white uppercase tracking-tight">Latest Fleet</h2>
                        </div>
                        <button className="text-[var(--text-muted)] hover:text-white transition-colors">
                            <MoreHorizontal size={20} />
                        </button>
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                        {machine?.slice(0, 5).map((m, i) => (
                            <div key={i} className="flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-white/5 border border-white/5 group hover:bg-[var(--color-primary)]/5 hover:border-[var(--color-primary)]/20 transition-all duration-300">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Truck size={16} sm:size={20} className="text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs sm:text-sm font-bold text-white group-hover:text-[var(--color-primary)] transition-colors line-clamp-1">{m.model}</p>
                                        <p className="text-[10px] sm:text-[11px] text-[var(--text-muted)] font-mono">{m.vehicleNumber}</p>
                                    </div>
                                </div>
                                <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg shrink-0 ${m.status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>
                                    {m.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Latest Drivers */}
                <div className="bg-[var(--bg-card)] rounded-2xl p-4 sm:p-6 border border-white/10 shadow-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <UserCheck size={18} sm:size={22} className="text-purple-500" />
                            <h2 className="text-lg sm:text-xl font-bold text-white uppercase tracking-tight">Active Team</h2>
                        </div>
                        <button className="text-[var(--text-muted)] hover:text-white transition-colors">
                            <MoreHorizontal size={20} />
                        </button>
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                        {driver?.slice(0, 5).map((d, i) => (
                            <div key={i} className="flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-white/5 border border-white/5 group hover:bg-purple-500/5 hover:border-purple-500/20 transition-all duration-300">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Users size={16} sm:size={20} className="text-purple-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs sm:text-sm font-bold text-white line-clamp-1">{d.firstName} {d.lastName}</p>
                                        <p className="text-[10px] sm:text-[11px] text-[var(--text-muted)]">+91 {d.phoneNumber}</p>
                                    </div>
                                </div>
                                <div className="p-1 sm:p-1.5 bg-purple-500/10 rounded-lg shrink-0">
                                    <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Service Alerts */}
                <div className="bg-[var(--bg-card)] rounded-2xl p-4 sm:p-6 border border-white/10 shadow-2xl relative overflow-hidden md:col-span-2 lg:col-span-1">
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
                    <h2 className="text-lg sm:text-xl font-bold text-white mb-6 flex items-center gap-3 px-2 border-l-4 border-orange-500 uppercase tracking-tight">
                        <AlertTriangle className="text-orange-500" size={18} sm:size={22} /> Alerts
                    </h2>
                    <div className="space-y-3 sm:space-y-4 relative z-10">
                        {machine?.filter(m => m.usageHours > 500).slice(0, 4).map((m, i) => (
                            <div key={i} className="p-3 sm:p-4 rounded-2xl border border-orange-500/20 bg-orange-500/5 flex gap-3 sm:gap-4 ring-1 ring-orange-500/10">
                                <div className="w-1 sm:w-1.5 h-auto bg-orange-500 rounded-full animate-pulse shrink-0" />
                                <div>
                                    <p className="text-xs sm:text-sm font-black text-white leading-tight uppercase line-clamp-1">{m.model}</p>
                                    <p className="text-[10px] sm:text-[11px] text-[var(--text-muted)] mt-1 sm:mt-1.5 font-bold uppercase tracking-wide">Usage: <span className="text-orange-400">{m.usageHours} hrs</span></p>
                                    <p className="hidden sm:block text-[10px] text-orange-200/50 mt-1 font-medium italic">Requires urgent maintenance check</p>
                                </div>
                            </div>
                        ))}
                        {machine?.filter(m => m.usageHours > 500).length === 0 && (
                            <div className="text-center py-8 sm:py-10 text-[var(--text-primary)] opacity-40">
                                <CheckCircle2 size={32} sm:size={40} className="mx-auto mb-3" />
                                <p className="text-xs sm:text-sm font-bold uppercase tracking-widest">Fleet Optimized</p>
                                <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] mt-2 leading-none whitespace-nowrap">No issues detected</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ================== SHARED COMPONENTS ================== */

function CountUp({ value, duration = 2, isCurrency = false }) {
    const count = useMotionValue(0);
    const rounded = useTransform(count, (latest) => {
        const num = Math.round(latest);
        return isCurrency ? `₹${num.toLocaleString()}` : num.toLocaleString();
    });

    useEffect(() => {
        // Extract numeric value if it's a string like "₹1,234"
        const numericValue = typeof value === 'string'
            ? parseFloat(value.replace(/[^\d.]/g, ''))
            : value;

        const controls = animate(count, numericValue, { duration: duration, ease: "easeOut" });
        return controls.stop;
    }, [value, count, duration]);

    return <motion.span>{rounded}</motion.span>;
}

function StatCard({ title, value, icon, trend, color }) {
    const isCurrency = typeof value === 'string' && value.includes('₹');

    return (
        <div className="bg-[var(--bg-card)] rounded-2xl p-4 sm:p-6 border border-white/10 shadow-2xl relative group hover:scale-[1.02] transition-all duration-500 cursor-default overflow-hidden">
            <div className="flex justify-between items-start mb-4 sm:mb-5">
                <div className={`p-2.5 sm:p-3.5 rounded-2xl ${color} group-hover:rotate-6 transition-transform duration-500 shadow-lg`}>
                    {icon}
                </div>
                <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-tighter text-green-400 bg-green-500/10 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg border border-green-500/20">
                    {trend}
                </div>
            </div>
            <div>
                <p className="text-[10px] sm:text-[11px] uppercase font-black tracking-widest text-[var(--text-muted)] mb-1 sm:mb-1.5 opacity-70 leading-none">{title}</p>
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    <CountUp value={value} isCurrency={isCurrency} />
                </h3>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-primary)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    );
}
