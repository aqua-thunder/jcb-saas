import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";
import GuidedTour from "../ui/GuidedTour";

export default function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="h-screen bg-[#f8fafc] flex overflow-hidden">

            {/* Sidebar */}
            <Sidebar
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* Main Area */}
            <div className="flex-1 flex flex-col lg:ml-64">

                {/* Header (VISIBLE ON ALL PAGES) */}
                <Header onMenuClick={() => setSidebarOpen(true)} />

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6 pb-10">
                    <Outlet />
                </main>

                {/* Footer (VISIBLE ON ALL PAGES) */}
                <Footer />

            </div>

            {/* Guided Tour for First Time Users */}
            <GuidedTour />
        </div>
    );
}
