import { useAuth } from '../store/auth';
import { useState } from 'react';
import { Settings, Wrench, CheckCircle2, AlertTriangle, Clock, History, Calendar, X, IndianRupee } from "lucide-react";
import { formatDate } from '../utils/formatDate';
import Button from "../components/ui/Button";
import { useToast } from '../store/ToastContext';

import ConfirmModal from "../components/ui/ConfirmModal";


export default function ServiceManagement() {
    const { toast } = useToast();
    const { machine, getMachines, token, settings } = useAuth();

    const [loading, setLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('add'); // 'add' or 'show'
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmId, setConfirmId] = useState(null);


    // Maintenance Log State
    const [logForm, setLogForm] = useState({
        machineId: "",
        date: "",
        items: [{ description: "", rs: "" }]
    });

    const handleAddItem = () => {
        setLogForm(prev => ({
            ...prev,
            items: [...prev.items, { description: "", rs: "" }]
        }));
    };

    const handleRemoveItem = (index) => {
        if (logForm.items.length === 1) return;
        setLogForm(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...logForm.items];
        newItems[index][field] = value;
        setLogForm(prev => ({ ...prev, items: newItems }));
    };
    const [maintenanceLogs, setMaintenanceLogs] = useState([]);
    const [logsLoading, setLogsLoading] = useState(false);

    // Searchable Dropdown State for "Add Log"
    const [addTerm, setAddTerm] = useState("");
    const [isAddDropdownOpen, setIsAddDropdownOpen] = useState(false);

    // Searchable Dropdown State for "Show Logs"
    const [searchTerm, setSearchTerm] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Fetch logs when machine is selected in "Show Logs" tab or when tab changes
    const fetchLogs = async (machineId) => {
        if (!machineId) return;
        setLogsLoading(true);
        try {
            const response = await fetch(`http://localhost:7000/api/maintenance-log/${machineId}`);
            if (response.ok) {
                const data = await response.json();
                setMaintenanceLogs(data.logs || []);
            } else {
                setMaintenanceLogs([]);
            }
        } catch (error) {
            console.error("Error fetching logs:", error);
            setMaintenanceLogs([]);
        } finally {
            setLogsLoading(false);
        }
    };

    const handleLogSubmit = async () => {
        if (!logForm.machineId || !logForm.date || !logForm.items.some(item => item.description.trim())) {
            toast.error("Please fill in machine, date, and at least one description");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("http://localhost:7000/api/maintenance-log/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(logForm)
            });

            if (response.ok) {
                toast.success("Log added successfully");
                setLogForm({ machineId: "", date: "", items: [{ description: "", rs: "" }] });
                setAddTerm(""); // Clear search term after successful add
                // If currently viewing logs for this machine, refresh them
                if (activeTab === 'show') {
                    fetchLogs(logForm.machineId);
                }
            } else {
                toast.error("Failed to add log");
            }
        } catch (error) {
            console.error("Error adding log:", error);
            toast.error("Server error");
        } finally {
            setLoading(false);
        }
    };

    const { criticalFleet, upcomingFleet, healthyFleet } = (() => {
        const total = Array.isArray(machine) ? machine : [];
        const critical = [];
        const upcoming = [];
        const healthy = [];

        total.forEach(m => {
            const usage = parseFloat(m.usageHours || 0);
            const limit = parseFloat(m.serviceLimitHours || 500);
            const usagePercent = (usage / limit) * 100;

            if (usagePercent >= 90) {
                critical.push(m);
            } else if (usagePercent >= 70) {
                upcoming.push(m);
            } else {
                healthy.push(m);
            }
        });

        return { criticalFleet: critical, upcomingFleet: upcoming, healthyFleet: healthy };
    })();

    // Machines that need attention (display in table)
    const alertFleet = [...criticalFleet, ...upcomingFleet];

    const handleServiceComplete = (id) => {
        setConfirmId(id);
        setShowConfirmModal(true);
    };

    const confirmService = async () => {
        if (!confirmId) return;

        setLoading(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            const response = await fetch(`http://localhost:7000/api/machine/${confirmId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    usageHours: 0,
                    lastServiceDate: today
                }),
            });

            if (response.ok) {
                toast.success("Service record updated successfully");
                getMachines();
            } else {
                toast.error("Failed to update service record");
            }
        } catch (error) {
            console.error("Service update error:", error);
            toast.error("Error connecting to server");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">


            <div className="flex justify-end px-1">
                <Button type="addbtn" onClick={() => setIsSidebarOpen(true)}>
                    <Settings className="w-4 h-4" />
                    <span className="hidden sm:inline ml-2">Maintenance Machine Logs</span>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-white/10 shadow-lg group hover:border-red-500/30 transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-red-500/10 rounded-xl group-hover:bg-red-500/20 transition-colors">
                            <AlertTriangle className="text-red-500 w-6 h-6 animate-pulse" />
                        </div>
                        <span className="text-[10px] font-black text-red-500/50 uppercase tracking-widest">10% Left</span>
                    </div>
                    <div className="text-3xl font-black text-white">
                        {criticalFleet.length}
                    </div>
                    <div className="text-[var(--text-muted)] text-xs uppercase font-black mt-1 tracking-wider">Critical Service</div>
                </div>

                <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-white/10 shadow-lg group hover:border-orange-500/30 transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-orange-500/10 rounded-xl group-hover:bg-orange-500/20 transition-colors">
                            <Clock className="text-orange-500 w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-black text-orange-500/50 uppercase tracking-widest">30% Left</span>
                    </div>
                    <div className="text-3xl font-black text-white">
                        {upcomingFleet.length}
                    </div>
                    <div className="text-[var(--text-muted)] text-xs uppercase font-black mt-1 tracking-wider">Upcoming Service</div>
                </div>

                <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-white/10 shadow-lg group hover:border-green-500/30 transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-green-500/10 rounded-xl group-hover:bg-green-500/20 transition-colors">
                            <CheckCircle2 className="text-green-500 w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-black text-green-500/50 uppercase tracking-widest">Safe</span>
                    </div>
                    <div className="text-3xl font-black text-white">
                        {healthyFleet.length}
                    </div>
                    <div className="text-[var(--text-muted)] text-xs uppercase font-black mt-1 tracking-wider">Healthy Fleet</div>
                </div>
            </div>

            {/* Service Table */}
            <div className="bg-[var(--bg-card)] rounded-2xl border border-white/10 shadow-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5 bg-[var(--bg-main)] flex justify-between items-center">
                    <h3 className="text-sm font-black uppercase tracking-widest text-[var(--color-primary)]">Maintenance Log</h3>
                    <div className="flex gap-2">
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-red-400 bg-red-400/5 px-2 py-1 rounded-md border border-red-400/10">
                            Critical: {criticalFleet.length}
                        </span>
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-orange-400 bg-orange-400/5 px-2 py-1 rounded-md border border-orange-400/10">
                            Warning: {upcomingFleet.length}
                        </span>
                    </div>
                </div>

                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto">
                    {alertFleet.length > 0 ? (
                        <table className="min-w-full text-left">
                            <thead className="bg-[var(--bg-main)] text-[var(--text-muted)] uppercase text-[10px] tracking-widest font-black">
                                <tr className="border-b border-white/10">
                                    <th className="px-6 py-4">Machine</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Progress</th>
                                    <th className="px-6 py-4">Available Hours</th>
                                    <th className="px-6 py-4">Last Service</th>
                                    <th className="px-6 py-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {alertFleet.map((item, index) => {
                                    const usage = parseFloat(item.usageHours || 0);
                                    const limit = parseFloat(item.serviceLimitHours || 500);
                                    const progress = Math.min((usage / limit) * 100, 100);
                                    const hoursLeft = Math.max(limit - usage, 0);
                                    const isCritical = progress >= 90;

                                    return (
                                        <tr key={item._id} className="hover:bg-white/5 transition text-sm">
                                            <td className="px-6 py-5">
                                                <div className="font-bold text-white">{item.manufacturer} {item.model}</div>
                                                <div className="text-[10px] text-[var(--text-muted)] font-mono">{item.vehicleNumber}</div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter ${isCritical ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-orange-500/20 text-orange-500 border border-orange-500/30'}`}>
                                                    {isCritical ? 'Critical' : 'Upcoming'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 w-48">
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex justify-between text-[10px] font-bold">
                                                        <span className={isCritical ? 'text-red-500' : 'text-orange-500'}>
                                                            {progress.toFixed(0)}% Used
                                                        </span>
                                                        <span className="text-[var(--text-muted)]">{usage}/{limit}</span>
                                                    </div>
                                                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full transition-all duration-1000 ${isCritical ? 'bg-red-500' : 'bg-orange-500'}`}
                                                            style={{ width: `${progress}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className={`font-mono font-bold ${isCritical ? 'text-red-400' : 'text-orange-400'}`}>
                                                    {hoursLeft.toFixed(1)} hrs left
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2 text-[var(--text-muted)]">
                                                    <Calendar size={13} className="opacity-50" />
                                                    {item.lastServiceDate ? formatDate(item.lastServiceDate, settings?.billing?.dateFormat) : 'Not recorded'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <Button
                                                    onClick={() => handleServiceComplete(item._id)}
                                                    disabled={loading}
                                                    className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all
                                                        ${isCritical
                                                            ? 'bg-red-600  text-white shadow-xl shadow-red-600/20'
                                                            : 'bg-orange-500  text-white shadow-xl shadow-orange-500/20'}`}
                                                >
                                                    {loading ? 'Updating...' : 'Service Done'}
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <div className="py-20 flex flex-col items-center justify-center text-center">
                            <CheckCircle2 className="w-16 h-16 text-green-500/20 mb-4" />
                            <h3 className="text-xl font-bold text-white">Fleet is Optimized</h3>
                            <p className="text-[var(--text-muted)] max-w-xs text-sm mt-1">
                                No machines currently require urgent maintenance.
                            </p>
                        </div>
                    )}
                </div>

                {/* Mobile View */}
                <div className="md:hidden p-4 space-y-4">
                    {alertFleet.length > 0 ? (
                        alertFleet.map((item) => {
                            const usage = parseFloat(item.usageHours || 0);
                            const limit = parseFloat(item.serviceLimitHours || 500);
                            const progress = Math.min((usage / limit) * 100, 100);
                            const hoursLeft = Math.max(limit - usage, 0);
                            const isCritical = progress >= 90;

                            return (
                                <div key={item._id} className="bg-[var(--bg-main)]/50 p-5 rounded-xl border border-white/5">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="font-bold text-white text-lg">{item.manufacturer} {item.model}</div>
                                            <div className="text-xs text-[var(--text-muted)] font-mono mt-0.5">{item.vehicleNumber}</div>
                                        </div>
                                        <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter ${isCritical ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-orange-500/20 text-orange-500 border border-orange-500/30'}`}>
                                            {isCritical ? 'Critical' : 'Upcoming'}
                                        </span>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex justify-between text-[10px] font-bold">
                                                <span className={isCritical ? 'text-red-500' : 'text-orange-500'}>
                                                    {progress.toFixed(0)}% Used
                                                </span>
                                                <span className="text-[var(--text-muted)]">{usage}/{limit} hours</span>
                                            </div>
                                            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-1000 ${isCritical ? 'bg-red-500' : 'bg-orange-500'}`}
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 py-2 border-y border-white/5">
                                            <div>
                                                <div className="text-xs text-[var(--text-muted)] mb-1">Available</div>
                                                <div className={`font-mono font-bold ${isCritical ? 'text-red-400' : 'text-orange-400'}`}>
                                                    {hoursLeft.toFixed(1)} hrs
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs text-[var(--text-muted)] mb-1">Last Service</div>
                                                <div className="font-mono text-white text-sm">
                                                    {item.lastServiceDate ? formatDate(item.lastServiceDate, settings?.billing?.dateFormat) : 'N/A'}
                                                </div>
                                            </div>
                                        </div>

                                        <Button
                                            onClick={() => handleServiceComplete(item._id)}
                                            disabled={loading}
                                            className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all
                                                ${isCritical
                                                    ? 'bg-red-600 active:bg-red-700 text-white shadow-lg shadow-red-600/20'
                                                    : 'bg-orange-500 active:bg-orange-600 text-white shadow-lg shadow-orange-500/20'}`}
                                        >
                                            {loading ? 'Updating...' : 'Mark Complete'}
                                        </Button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-10 flex flex-col items-center justify-center text-center">
                            <CheckCircle2 className="w-12 h-12 text-green-500/20 mb-3" />
                            <h3 className="text-lg font-bold text-white">All Good!</h3>
                            <p className="text-[var(--text-muted)] text-xs mt-1">No urgent maintenance.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Sidebar for Maintenance Logs */}
            {isSidebarOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 transition-opacity"
                        onClick={() => setIsSidebarOpen(false)}
                    />

                    {/* Sidebar */}
                    <div className="fixed inset-y-0 right-0 z-[70] w-full md:w-[550px] bg-white border-l border-gray-200 shadow-2xl transform transition-transform duration-300 ease-in-out overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-black text-slate-800 uppercase tracking-wider">Maintenance Logs</h2>
                                <button
                                    onClick={() => setIsSidebarOpen(false)}
                                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <span className="sr-only">Close</span>
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Tabs - Settings Style */}
                            <div className="flex gap-8 mb-6 border-b border-gray-200">
                                <button
                                    onClick={() => setActiveTab('add')}
                                    className={`pb-3 px-1 text-sm font-medium tracking-wider transition-all relative ${activeTab === 'add'
                                        ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]'
                                        : 'text-slate-400 hover:text-slate-600'
                                        }`}
                                >
                                    Add Log
                                </button>
                                <button
                                    onClick={() => setActiveTab('show')}
                                    className={`pb-3 px-1 text-sm font-medium tracking-wider transition-all relative ${activeTab === 'show'
                                        ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]'
                                        : 'text-slate-400 hover:text-slate-600'
                                        }`}
                                >
                                    Show Logs
                                </button>
                            </div>

                            {/* Tab Content */}
                            {activeTab === 'add' ? (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Machine</label>

                                            {/* Custom Searchable Dropdown for Add Log */}
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={addTerm}
                                                    onChange={(e) => {
                                                        setAddTerm(e.target.value);
                                                        setIsAddDropdownOpen(true);
                                                    }}
                                                    onClick={() => setIsAddDropdownOpen(true)}
                                                    placeholder="Search or Select Machine..."
                                                    className="w-full p-3 pr-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:border-[var(--color-primary)] focus:bg-white focus:outline-none transition-colors shadow-sm"
                                                />
                                                {addTerm ? (
                                                    <div
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-600 z-30 p-1"
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // Prevent dropdown toggle
                                                            setAddTerm("");
                                                            setLogForm({ ...logForm, machineId: "" });
                                                        }}
                                                    >
                                                        <X size={16} />
                                                    </div>
                                                ) : (
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                                    </div>
                                                )}

                                                {isAddDropdownOpen && (
                                                    <>
                                                        <div className="fixed inset-0 z-10" onClick={() => setIsAddDropdownOpen(false)}></div>
                                                        <div className="absolute top-full left-0 right-0 mt-2 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl z-20">
                                                            {machine?.filter(m => {
                                                                if (!addTerm) return true;
                                                                const term = addTerm.toLowerCase();
                                                                return (
                                                                    m.model?.toLowerCase().includes(term) ||
                                                                    m.manufacturer?.toLowerCase().includes(term) ||
                                                                    m.vehicleNumber?.toLowerCase().includes(term)
                                                                );
                                                            }).length > 0 ? (
                                                                machine.filter(m => {
                                                                    if (!addTerm) return true;
                                                                    const term = addTerm.toLowerCase();
                                                                    return (
                                                                        m.model?.toLowerCase().includes(term) ||
                                                                        m.manufacturer?.toLowerCase().includes(term) ||
                                                                        m.vehicleNumber?.toLowerCase().includes(term)
                                                                    );
                                                                }).map(m => (
                                                                    <div
                                                                        key={m._id}
                                                                        onClick={() => {
                                                                            setAddTerm(`${m.manufacturer} - ${m.model} (${m.vehicleNumber})`);
                                                                            setLogForm({ ...logForm, machineId: m._id });
                                                                            setIsAddDropdownOpen(false);
                                                                        }}
                                                                        className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 transition-colors"
                                                                    >
                                                                        <div className="text-sm font-bold text-slate-800">{m.manufacturer} {m.model}</div>
                                                                        <div className="text-xs text-slate-500">{m.vehicleNumber}</div>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <div className="p-4 text-center text-xs text-slate-500">No machines found</div>
                                                            )}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Service Date</label>
                                            <input
                                                type="date"
                                                value={logForm.date}
                                                onChange={(e) => setLogForm({ ...logForm, date: e.target.value })}
                                                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:border-[var(--color-primary)] focus:bg-white focus:outline-none transition-colors shadow-sm"
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Maintenance Items</label>
                                                <button
                                                    onClick={handleAddItem}
                                                    className="text-[10px] font-bold text-[var(--color-primary)] hover:underline"
                                                >
                                                    + Add More
                                                </button>
                                            </div>

                                            {logForm.items.map((item, index) => (
                                                <div key={index} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 relative group">
                                                    {logForm.items.length > 1 && (
                                                        <button
                                                            onClick={() => handleRemoveItem(index)}
                                                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    )}
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Description {index + 1}</label>
                                                        <textarea
                                                            rows="2"
                                                            value={item.description}
                                                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                            placeholder="What was maintained?"
                                                            className="w-full p-2.5 rounded-lg bg-white border border-slate-200 text-slate-800 focus:border-[var(--color-primary)] focus:outline-none transition-colors resize-none text-sm"
                                                        ></textarea>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Result / Rs.</label>
                                                        <input
                                                            type="text"
                                                            value={item.rs}
                                                            onChange={(e) => handleItemChange(index, 'rs', e.target.value)}
                                                            placeholder="Result or Cost"
                                                            className="w-full p-2.5 rounded-lg bg-white border border-slate-200 text-slate-800 focus:border-[var(--color-primary)] focus:outline-none transition-colors text-sm"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="pt-2">
                                            <Button
                                                type="savebtn"
                                                onClick={handleLogSubmit}
                                                disabled={loading}
                                            >
                                                {loading ? "Saving..." : "Save Maintenance Log"}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Machine to View Logs</label>

                                            {/* Custom Searchable Dropdown */}
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={searchTerm}
                                                    onChange={(e) => {
                                                        setSearchTerm(e.target.value);
                                                        setIsDropdownOpen(true);
                                                    }}
                                                    onClick={() => setIsDropdownOpen(true)}
                                                    placeholder="Search or Select Machine..."
                                                    className="w-full p-3 pr-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:border-[var(--color-primary)] focus:bg-white focus:outline-none transition-colors shadow-sm"
                                                />
                                                {searchTerm ? (
                                                    <div
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-600 z-30 p-1"
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // Prevent dropdown toggle
                                                            setSearchTerm("");
                                                            setMaintenanceLogs([]);
                                                        }}
                                                    >
                                                        <X size={16} />
                                                    </div>
                                                ) : (
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                                    </div>
                                                )}

                                                {isDropdownOpen && (
                                                    <>
                                                        {/* Invisible backdrop to close dropdown on click outside */}
                                                        <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)}></div>

                                                        <div className="absolute top-full left-0 right-0 mt-2 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl z-20">
                                                            {machine?.filter(m => {
                                                                if (!searchTerm) return true;
                                                                const term = searchTerm.toLowerCase();
                                                                return (
                                                                    m.model?.toLowerCase().includes(term) ||
                                                                    m.manufacturer?.toLowerCase().includes(term) ||
                                                                    m.vehicleNumber?.toLowerCase().includes(term)
                                                                );
                                                            }).length > 0 ? (
                                                                machine.filter(m => {
                                                                    if (!searchTerm) return true;
                                                                    const term = searchTerm.toLowerCase();
                                                                    return (
                                                                        m.model?.toLowerCase().includes(term) ||
                                                                        m.manufacturer?.toLowerCase().includes(term) ||
                                                                        m.vehicleNumber?.toLowerCase().includes(term)
                                                                    );
                                                                }).map(m => (
                                                                    <div
                                                                        key={m._id}
                                                                        onClick={() => {
                                                                            setSearchTerm(`${m.manufacturer} - ${m.model} (${m.vehicleNumber})`);
                                                                            fetchLogs(m._id);
                                                                            setIsDropdownOpen(false);
                                                                        }}
                                                                        className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 transition-colors"
                                                                    >
                                                                        <div className="text-sm font-bold text-slate-800">{m.manufacturer} {m.model}</div>
                                                                        <div className="text-xs text-slate-500">{m.vehicleNumber}</div>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <div className="p-4 text-center text-xs text-slate-500">No machines found</div>
                                                            )}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {logsLoading ? (
                                            <div className="py-10 text-center text-slate-400">Loading logs...</div>
                                        ) : maintenanceLogs.length > 0 ? (
                                            /* Sort logs: Oldest to Newest */
                                            [...maintenanceLogs].sort((a, b) => new Date(a.date) - new Date(b.date)).map((log, index) => (
                                                <div key={index} className="bg-slate-50 rounded-xl p-4 border border-slate-100 border-l-4 border-l-[var(--color-primary)] relative shadow-sm hover:shadow-md transition-all">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <div className="font-bold text-slate-800 text-[11px] uppercase tracking-tight flex items-center gap-1.5">
                                                            <Wrench size={14} className="text-[var(--color-primary)]" />
                                                            Maintenance Log #{index + 1}<span className="text-slate-400 font-medium">({formatDate(log.date, settings?.billing?.dateFormat)})</span>
                                                        </div>
                                                    </div>
                                                    <div className="mt-4 space-y-3">
                                                        {(log.items || []).map((item, i) => (
                                                            <div key={i} className="flex flex-col border-b border-slate-100 last:border-0 pb-2 last:pb-0">
                                                                <div className="flex justify-between items-start gap-4">
                                                                    <p className="text-sm text-slate-600 leading-relaxed flex-1">
                                                                        <span className="font-bold text-slate-400 mr-2">{i + 1}.</span>
                                                                        {item.description}
                                                                    </p>
                                                                    {item.rs && (
                                                                        <span className="text-[10px] font-mono font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded uppercase shrink-0 flex items-center gap-0.5">
                                                                            <IndianRupee size={10} />{item.rs}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {!log.items && log.description && (
                                                            <p className="text-sm text-slate-600 leading-relaxed">
                                                                {log.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-10 text-center">
                                                <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                                <p className="text-slate-500 text-sm">No logs found for this machine.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            <ConfirmModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={confirmService}
                title="Complete Service"
                message="Are you sure you want to mark this service as completed? This will reset usage hours to 0. This action cannot be undone."
                confirmText="Complete"
                type="warning"
            />
        </div>
    );
}