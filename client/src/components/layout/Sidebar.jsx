import React from "react";
import {
    LayoutDashboard,
    Settings,
    MonitorCog,
    UserPen,
    FileChartColumn,
    Wrench,
    Van,
    X,
    BarChart,
    Users,
    FileText,
    History,
    Wallet
} from "lucide-react";

// import Logo from "../assets/jcblogo.png";
import { NavLink, useNavigate, useLocation } from "react-router-dom";

export default function Sidebar({ open = false, onClose = () => { } }) {
    const navigate = useNavigate();
    const location = useLocation();

    const menu = [
        { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { path: "/rental", label: "Rental", icon: Van },
        { path: "/client", label: "Client", icon: Users },
        { path: "/quotation", label: "Quotation", icon: FileText },
        { path: "/invoicePage", label: "Invoice", icon: FileChartColumn },
        { path: "/payment", label: "Payment", icon: Wallet },
        { path: "/machine", label: "Machines", icon: MonitorCog },
        { path: "/driver", label: "Driver", icon: UserPen },
        { path: "/service", label: "Service", icon: Wrench },
        { path: "/report", label: "Report", icon: BarChart },
        { path: "/settings", label: "Settings", icon: Settings },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={`
          fixed left-0 top-0 z-50 w-64 h-screen bg-[#151515] text-white flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
            >
                {/* Header */}
                <div id="tour-sidebar-header" className="h-20 px-6 text-xl uppercase font-bold border-b border-white/10 flex items-center justify-between">
                    Admin Panel
                    <button className="lg:hidden" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Menu */}
                <nav className="flex-1 px-4 py-5 space-y-2 overflow-y-auto">
                    {menu.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                id={`tour-menu-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                                onClick={onClose}
                                className={({ isActive }) =>
                                    `relative w-full flex items-center gap-3 px-4 py-3 text-md transition-all duration-300 ease-in-out
                  ${isActive
                                        ? "bg-[var(--primary-color)] text-[var(--color-primary)]"
                                        : "text-white/70 hover:bg-white/10 hover:text-white"
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <span
                                            className={`absolute right-0 top-0 h-full w-[3px] rounded-l bg-[var(--color-primary)] transition-all duration-300
                      ${isActive ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0"}`}
                                        />
                                        <Icon size={18} />
                                        {item.label}
                                    </>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>
            </aside>
        </>
    );
}