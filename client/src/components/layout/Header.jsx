import { useState, useRef, useEffect, useMemo } from "react";
import { Menu, Search, Bell, Calendar, Truck, File, User, ArrowRight, FileText, AlertTriangle, CheckCircle2, X, Plus, MessageCircle, LogOut, Settings } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../store/auth";
import CreateQuotation from "../modals/CreateQuotation";
import AddClientModal from "../modals/AddClientModal";
import AddRentalModal from "../modals/AddRentalModal";


export default function Header({ onMenuClick }) {
    const { userData, machine, driver, invoice, logout, getRentals } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const suggestionRef = useRef(null);
    const notificationRef = useRef(null);
    const searchInputRef = useRef(null);
    const createMenuRef = useRef(null);
    const profileMenuRef = useRef(null);
    const [showCreateMenu, setShowCreateMenu] = useState(false);
    const [showQuotationModal, setShowQuotationModal] = useState(false);
    const [showClientModal, setShowClientModal] = useState(false);
    const [showRentalModal, setShowRentalModal] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Reset selected index when search query changes
    useEffect(() => {
        setSelectedIndex(0);
    }, [searchQuery]);


    // Keyboard shortcut (Ctrl + K) to focus search
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                e.preventDefault();
                setShowSearchModal(true);
            }
            if (e.key === "Escape" && showSearchModal) {
                setShowSearchModal(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [showSearchModal]);

    // 👇 Extract first route segment
    const baseRoute = "/" + location.pathname.split("/")[1];

    const pageTitleMap = {
        "/dashboard": "Dashboard",
        "/machine": "Machines Fleet",
        "/driver": "Team Management",
        "/rental": "Rental Logistics",
        "/client": "Client Management",
        "/invoice": "Invoices",
        "/payment": "Transactions",
        "/invoicePage": "Invoice Details",
        "/quotation": "Quotations",
        "/service": "Service & Maintenance",
        "/settings": "System Settings",
        "/contact": "Support Center",
        "/report": "Reports & Analytics",
    };

    const pageTitle = pageTitleMap[baseRoute] || "Dashboard";

    // Handle clicks outside suggestions to close it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
            if (createMenuRef.current && !createMenuRef.current.contains(event.target)) {
                setShowCreateMenu(false);
            }
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        const query = searchQuery.toLowerCase();
        setShowSuggestions(false);

        // 1. Check for explicit keywords
        if (query.includes("machine") || query.includes("jcb") || query.includes("truck")) {
            navigate(`/machine?search=${encodeURIComponent(searchQuery)}`);
            return;
        }
        if (query.includes("driver") || query.includes("person") || query.includes("staff")) {
            navigate(`/driver?search=${encodeURIComponent(searchQuery)}`);
            return;
        }
        if (query.includes("invoice") || query.includes("bill") || query.includes("payment")) {
            navigate(`/invoicePage?search=${encodeURIComponent(searchQuery)}`);
            return;
        }

        // 2. Check for data matches
        const hasDriver = driver?.some(d =>
            d.firstName?.toLowerCase().includes(query) ||
            d.lastName?.toLowerCase().includes(query)
        );
        if (hasDriver) {
            navigate(`/driver?search=${encodeURIComponent(searchQuery)}`);
            return;
        }

        const hasInvoice = invoice?.some(i =>
            i.clientName?.toLowerCase().includes(query) ||
            i.email?.toLowerCase().includes(query) ||
            i.phoneNumber?.includes(query)
        );
        if (hasInvoice) {
            navigate(`/invoicePage?search=${encodeURIComponent(searchQuery)}`);
            return;
        }

        // Default to machine (also covers machine matches)
        navigate(`/machine?search=${encodeURIComponent(searchQuery)}`);
    };

    // Filtered Suggestions
    const suggestions = useMemo(() => {
        if (!searchQuery.trim() || searchQuery.length < 2) return [];
        const query = searchQuery.toLowerCase();

        const machineMatches = machine?.filter(m =>
            m.model?.toLowerCase().includes(query) ||
            m.vehicleNumber?.toLowerCase().includes(query)
        ).map(m => ({ id: m._id, title: m.model, sub: m.vehicleNumber, type: 'machine', icon: <Truck size={14} /> })) || [];

        const driverMatches = driver?.filter(d =>
            d.firstName?.toLowerCase().includes(query) ||
            d.lastName?.toLowerCase().includes(query)
        ).map(d => ({ id: d._id, title: `${d.firstName} ${d.lastName}`, sub: 'Driver', type: 'driver', icon: <User size={14} /> })) || [];

        const invoiceMatches = invoice?.filter(i =>
            i.clientName?.toLowerCase().includes(query) ||
            i.email?.toLowerCase().includes(query) ||
            i.phoneNumber?.includes(query)
        ).map(i => ({ id: i._id, title: i.clientName, sub: `Invoice - ${i.issueDate}`, type: 'invoicePage', icon: <FileText size={14} /> })) || [];

        return [...machineMatches, ...driverMatches, ...invoiceMatches].slice(0, 6);
    }, [searchQuery, machine, driver, invoice]);

    // Maintenance Notifications - Based on Usage Hours vs Service Limit
    const notifications = useMemo(() => {
        if (!machine) return [];

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Filter machines that need service based on usage hours
        const serviceNeeded = machine.filter(m => {
            // Check if service limit hours and usage hours exist
            if (!m.serviceLimitHours || !m.usageHours) return false;

            const serviceLimit = parseFloat(m.serviceLimitHours);
            const usageHours = parseFloat(m.usageHours);

            if (isNaN(serviceLimit) || isNaN(usageHours)) return false;

            // Calculate percentage of service limit used
            const percentageUsed = (usageHours / serviceLimit) * 100;

            // Notify if usage is at or above 90% of service limit (within 10%)
            return percentageUsed >= 90;
        }).map(m => {
            const serviceLimit = parseFloat(m.serviceLimitHours);
            const usageHours = parseFloat(m.usageHours);
            const percentageUsed = ((usageHours / serviceLimit) * 100).toFixed(1);
            const hoursRemaining = serviceLimit - usageHours;

            let status = 'warning';
            let statusColor = 'text-orange-500 bg-orange-50';
            let message = `${hoursRemaining.toFixed(1)}h until service (${percentageUsed}% used)`;

            if (usageHours >= serviceLimit) {
                status = 'overdue';
                statusColor = 'text-red-500 bg-red-50';
                message = `Service overdue by ${Math.abs(hoursRemaining).toFixed(1)}h`;
            } else if (percentageUsed >= 95) {
                status = 'critical';
                statusColor = 'text-red-500 bg-red-50';
                message = `Critical: ${hoursRemaining.toFixed(1)}h remaining`;
            }

            return {
                id: m._id,
                title: m.model,
                sub: m.vehicleNumber,
                message,
                status,
                statusColor,
                usageHours,
                serviceLimit,
                percentageUsed: parseFloat(percentageUsed)
            };
        }).sort((a, b) => b.percentageUsed - a.percentageUsed); // Sort by most critical first

        return serviceNeeded;
    }, [machine]);

    // Show only first 4 notifications in dropdown
    const displayedNotifications = notifications.slice(0, 4);
    const hasMoreNotifications = notifications.length > 4;

    return (
        <header className="h-16 md:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-3 md:px-6 sticky top-0 z-40 transition-all duration-300">
            {/* Left Section */}
            <div className="flex items-center gap-2 md:gap-6 flex-1">
                <div className="flex items-center gap-2 md:gap-4">
                    <button className="lg:hidden text-slate-600 hover:text-[var(--color-primary)] transition" onClick={onMenuClick}>
                        <Menu size={20} />
                    </button>
                    <h1 className="text-sm md:text-lg lg:text-xl uppercase font-medium text-slate-800 tracking-tight whitespace-nowrap">{pageTitle}</h1>
                </div>

                {/* Search - Hidden on mobile */}
                <div className="hidden md:block flex-1 max-w-md relative" ref={suggestionRef}>
                    {/* Search removed from here - moved to modal */}
                </div>


            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2 md:gap-4 lg:gap-4">
                {/* Create Dropdown */}
                <div className="relative" ref={createMenuRef}>
                    <button
                        id="tour-header-create"
                        onClick={() => setShowCreateMenu(!showCreateMenu)}
                        className={`flex items-center gap-1.5 md:gap-2 px-2.5 md:px-4 py-2 rounded-xl md:rounded-2xl text-[11px] md:text-[12px] font-bold shadow-sm border transition-all duration-200
                        ${showCreateMenu
                                ? 'bg-slate-100 border-slate-200 text-[var(--color-primary)]'
                                : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}
                    >
                        <Plus size={14} className={showCreateMenu ? "text-[var(--color-primary)]" : "text-[var(--color-primary)]"} />
                        <span className="hidden sm:inline tracking-wide">Create New</span>
                        <span className="sm:hidden tracking-wide">New</span>
                    </button>

                    {showCreateMenu && (
                        <div className="absolute top-full right-0 mt-3 w-48 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                            <button
                                onClick={() => {
                                    setShowCreateMenu(false);
                                    setShowRentalModal(true);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-[var(--color-primary)] transition-colors text-left"
                            >
                                <Truck size={16} />
                                Rentals
                            </button>
                            <button
                                onClick={() => {
                                    setShowCreateMenu(false);
                                    setShowQuotationModal(true);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-[var(--color-primary)] transition-colors text-left"
                            >
                                <FileText size={16} />
                                Quotation
                            </button>
                            <div className="h-px bg-slate-200" />
                            <button
                                onClick={() => {
                                    setShowCreateMenu(false);
                                    navigate('/Invoice');
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-[var(--color-primary)] transition-colors text-left"
                            >
                                <File size={16} />
                                Invoice
                            </button>
                            <div className="h-px bg-slate-200" />
                            <button
                                onClick={() => {
                                    setShowCreateMenu(false);
                                    setShowClientModal(true);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-[var(--color-primary)] transition-colors text-left"
                            >
                                <User size={16} />
                                Client
                            </button>
                            <div className="h-px bg-slate-200" />
                        </div>
                    )}
                </div>
                {/* Search Button (Icon Only) */}
                <button
                    id="tour-header-search"
                    onClick={() => setShowSearchModal(true)}
                    className="p-2 md:p-2.5 bg-slate-50 border border-slate-100 text-slate-600 hover:bg-slate-100 rounded-xl md:rounded-2xl transition-all duration-200"
                >
                    <Search size={18} />
                </button>

                {/* Notifications */}
                <div className="relative" ref={notificationRef}>
                    <button
                        id="tour-header-notifications"
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`relative p-2 md:p-2.5 border rounded-xl md:rounded-2xl transition-all duration-200 group
                            ${showNotifications ? 'bg-slate-100 border-slate-200 text-[var(--color-primary)]' : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100'}`}
                    >
                        <Bell size={18} className={showNotifications ? "fill-[var(--color-primary)]/20" : ""} />
                        {notifications.length > 0 && (
                            <span className="absolute top-2.5 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white shadow-sm animate-pulse" />
                        )}
                    </button>

                    {/* Notification Dropdown */}
                    {showNotifications && (
                        <div className="absolute top-full right-0 w-80 mt-3 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h3 className="font-bold text-slate-800">Service Alerts</h3>
                                <span className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-[10px] font-black px-2 py-1 rounded-full">
                                    {notifications.length} Alert{notifications.length !== 1 ? 's' : ''}
                                </span>
                            </div>

                            <div className="max-h-[60vh] overflow-y-auto">
                                {displayedNotifications.length > 0 ? (
                                    <>
                                        {displayedNotifications.map((note) => (
                                            <div key={note.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => { setShowNotifications(false); navigate('/service'); }}>
                                                <div className="flex gap-3">
                                                    <div className={`mt-1 p-2 rounded-lg h-fit ${note.statusColor}`}>
                                                        <AlertTriangle size={16} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-bold text-slate-800">{note.title}</p>
                                                        <p className="text-xs text-slate-500 font-medium tracking-wide mb-1">{note.sub}</p>
                                                        <p className={`text-xs font-bold ${note.status === 'overdue' || note.status === 'critical' ? 'text-red-500' : 'text-orange-600'}`}>
                                                            {note.message}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {hasMoreNotifications && (
                                            <div className="p-3 bg-slate-50 border-t border-slate-100">
                                                <button
                                                    onClick={() => {
                                                        setShowNotifications(false);
                                                        navigate('/service');
                                                    }}
                                                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white rounded-xl font-bold text-sm transition-all active:scale-95"
                                                >
                                                    <span>Show More ({notifications.length - 4} more)</span>
                                                    <ArrowRight size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="p-8 text-center text-slate-400">
                                        <CheckCircle2 size={32} className="mx-auto mb-2 opacity-50" />
                                        <p className="text-xs font-bold uppercase tracking-wider">All good!</p>
                                        <p className="text-[10px] mt-1">No machines need service</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* User Profile */}
                <div className="relative" ref={profileMenuRef}>
                    <div className="flex items-center gap-2 md:gap-3 pl-2 md:pl-2 border-l border-slate-200">
                        <div className="text-right hidden lg:block">
                            <p className="text-md font-medium text-slate-900 leading-none">
                                {userData?.fullName || "Admin"}
                            </p>
                            <p className="text-[10px] text-[var(--color-primary)] font-base uppercase tracking-widest mt-1.5 opacity-80">
                                Admin
                            </p>
                        </div>

                        <button
                            id="tour-header-profile"
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className={`w-9 h-9 md:w-11 md:h-11 rounded-xl md:rounded-2xl bg-[var(--color-primary)]/10 border-2 flex items-center justify-center text-[var(--color-primary)] overflow-hidden shadow-md cursor-pointer transition-all hover:scale-105 ${showProfileMenu ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20' : 'border-white hover:border-[var(--color-primary)]/30'
                                }`}
                        >
                            {userData?.profileImage ? (
                                <img src={userData.profileImage} alt="profile" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-xs md:text-sm font-black uppercase">{userData?.fullName?.charAt(0) || "A"}</span>
                            )}
                        </button>
                    </div>

                    {/* Profile Dropdown Menu */}
                    {showProfileMenu && (
                        <div className="absolute top-full right-0 w-56 mt-3 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                            {/* User Info Section */}
                            <div className="p-4 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 border-2 border-[var(--color-primary)]/20 flex items-center justify-center text-[var(--color-primary)] overflow-hidden">
                                        {userData?.profileImage ? (
                                            <img src={userData.profileImage} alt="profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-lg font-black uppercase">{userData?.fullName?.charAt(0) || "A"}</span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-900 truncate">
                                            {userData?.fullName || "Admin"}
                                        </p>
                                        <p className="text-xs text-slate-500 truncate">
                                            {userData?.email || "admin@example.com"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Menu Items */}
                            <div className="p-2">
                                <button
                                    onClick={() => {
                                        setShowProfileMenu(false);
                                        navigate('/settings');
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-[var(--color-primary)] rounded-xl transition-all group"
                                >
                                    <Settings size={18} className="text-slate-400 group-hover:text-[var(--color-primary)] transition-colors" />
                                    <span>Settings</span>
                                </button>

                                <button
                                    onClick={() => {
                                        setShowProfileMenu(false);
                                        navigate('/contact');
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-[var(--color-primary)] rounded-xl transition-all group"
                                >
                                    <MessageCircle size={18} className="text-slate-400 group-hover:text-[var(--color-primary)] transition-colors" />
                                    <span>Contact Us</span>
                                </button>
                            </div>

                            {/* Logout Section */}
                            <div className="border-t border-slate-100 p-2">
                                <button
                                    onClick={() => {
                                        setShowProfileMenu(false);
                                        logout();
                                        navigate('/');
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all group"
                                >
                                    <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Search Modal Overlay */}
            {showSearchModal && (
                <div
                    className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-start justify-center pt-20 px-4 animate-in fade-in duration-200"
                    onClick={() => setShowSearchModal(false)}
                >
                    <div
                        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-slate-900/5"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Search Input Header */}
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (suggestions.length > 0) {
                                    const item = suggestions[selectedIndex];
                                    navigate(`/${item.type}?search=${encodeURIComponent(item.title)}`);
                                } else {
                                    handleSearch(e);
                                }
                                setShowSearchModal(false);
                            }}
                            className="relative border-b border-slate-100"
                        >
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                autoFocus
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search machines, drivers, invoices..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'ArrowDown') {
                                        e.preventDefault();
                                        setSelectedIndex(prev => (prev + 1) % suggestions.length);
                                    } else if (e.key === 'ArrowUp') {
                                        e.preventDefault();
                                        setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
                                    }
                                }}
                                className="w-full pl-14 pr-14 py-4 text-lg text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowSearchModal(false)}
                                    className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl transition-colors"
                                >
                                    <span className="sr-only">Close</span>
                                    <X size={20} />
                                </button>
                            </div>
                        </form>

                        {/* Search Body */}
                        <div className="max-h-[60vh] overflow-y-auto bg-slate-50/50">
                            {suggestions.length > 0 ? (
                                <div className="p-2">
                                    <p className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-widest">Suggestions</p>
                                    {suggestions.map((item, index) => (
                                        <button
                                            key={`${item.type}-${item.id}`}
                                            onClick={() => {
                                                navigate(`/${item.type}?search=${encodeURIComponent(item.title)}`);
                                                setShowSearchModal(false);
                                                setSearchQuery("");
                                            }}
                                            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all group text-left mb-1 border
                                                ${index === selectedIndex
                                                    ? 'bg-slate-100 border-slate-200 shadow-sm'
                                                    : 'bg-transparent border-transparent hover:bg-white hover:border-slate-100 hover:shadow-sm'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 rounded-xl ${item.type === 'machine' ? 'bg-blue-50 text-blue-500' :
                                                    item.type === 'driver' ? 'bg-purple-50 text-purple-500' :
                                                        'bg-green-50 text-green-500'
                                                    }`}>
                                                    {item.icon}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800 group-hover:text-[var(--color-primary)] transition-colors">{item.title}</p>
                                                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{item.sub}</p>
                                                </div>
                                            </div>
                                            <ArrowRight size={16} className={`text-slate-300 transition-all ${index === selectedIndex ? 'text-[var(--color-primary)] translate-x-1' : 'group-hover:text-[var(--color-primary)] group-hover:translate-x-1'}`} />
                                        </button>
                                    ))}
                                </div>
                            ) : searchQuery ? (
                                <div className="p-12 text-center text-slate-400">
                                    <Search size={48} className="mx-auto mb-4 opacity-20" />
                                    <p className="text-sm font-medium">No results found for "{searchQuery}"</p>
                                </div>
                            ) : (
                                <div className="p-12 text-center text-slate-400">
                                    <div className="flex justify-center gap-2 mb-4 opacity-50">
                                        <Truck size={24} />
                                        <User size={24} />
                                        <FileText size={24} />
                                    </div>
                                    <p className="text-sm font-medium">Search for anything...</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-medium px-4">
                            <span>Quick Actions</span>
                            <div className="flex gap-4">
                                <span className="flex items-center gap-1"><kbd className="bg-white border border-slate-200 px-1.5 rounded shadow-sm">↑↓</kbd> Navigate</span>
                                <span className="flex items-center gap-1"><kbd className="bg-white border border-slate-200 px-1.5 rounded shadow-sm">↵</kbd> Select</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showQuotationModal && (
                <CreateQuotation onClose={() => setShowQuotationModal(false)} />
            )}
            {showClientModal && (
                <AddClientModal onClose={() => setShowClientModal(false)} />
            )}
            {showRentalModal && (
                <AddRentalModal
                    onClose={() => setShowRentalModal(false)}
                    editData={null}
                    onUpdate={getRentals}
                />
            )}
        </header>
    );
}
