import React, { useMemo, useEffect } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area
} from "recharts";
import { useAuth } from "../store/auth";
import * as XLSX from 'xlsx';
import { FileChartColumn, Users, Truck, Activity, TrendingUp, Download } from "lucide-react";
import Button from "../components/ui/Button";

export default function Report() {
    const { machine, driver, invoice, rentals, getRentals } = useAuth();

    useEffect(() => {
        getRentals();
    }, []);

    const handleDownloadReport = () => {
        const wb = XLSX.utils.book_new();

        // 1. Machines Data (All Fields)
        const machines = machine && machine.length > 0 ? machine : [];
        const machineData = machines.length > 0 ? machines.map(m => ({
            "Model": m.model || "N/A",
            "Manufacturer": m.manufacturer || "N/A",
            "Vehicle Number": m.vehicleNumber || "N/A",
            "Make Year": m.vehicleMakeYear || "N/A",
            "Status": m.status || "N/A",
            "Usage Hours": m.usageHours || "0",
            "Mileage": m.mileage || "N/A",
            "Rental Rate": m.rentalRate || "N/A",
            "Last Service": m.lastServiceDate || "N/A",
            "Next Service": m.nextServiceDate || "N/A"
        })) : [{ "Message": "No Machine Data Available" }];

        const wsMachine = XLSX.utils.json_to_sheet(machineData);
        XLSX.utils.book_append_sheet(wb, wsMachine, "Machines");

        // 2. Drivers Data (All Fields)
        const drivers = driver && driver.length > 0 ? driver : [];
        const driverData = drivers.length > 0 ? drivers.map(d => ({
            "First Name": d.firstName || "N/A",
            "Last Name": d.lastName || "N/A",
            "Phone": d.phoneNumber || "N/A",
            "Aadhar Number": d.addharNumber || "N/A",
            "DOB": d.dob || "N/A",
            "Address": d.address || "N/A",
            "License Photo URL": d.licensePhoto || "Pending"
        })) : [{ "Message": "No Driver Data Available" }];

        const wsDriver = XLSX.utils.json_to_sheet(driverData);
        XLSX.utils.book_append_sheet(wb, wsDriver, "Drivers");

        // 3. Invoices Data (All Fields)
        const invoices = invoice && invoice.length > 0 ? invoice : [];
        const invoiceData = invoices.length > 0 ? invoices.map(i => ({
            "Invoice ID": i._id || "N/A",
            "Client Name": i.clientName || "N/A",
            "Client Phone": i.phoneNumber || "N/A",
            "Client Email": i.email || "N/A",
            "Date": i.issueDate || (i.createdAt ? new Date(i.createdAt).toLocaleDateString() : "N/A"),
            "Building": i.buildingName || "N/A",
            "Area": i.area || "N/A",
            "City": i.city || "N/A",
            "State": i.state || "N/A",
            "Pincode": i.pinCode || "N/A",
            "Payment Mode": i.paymentMode || "N/A",
            "Status": i.status || "Pending",
            "Total Amount": Number(i.totalAmount) || 0,
            "Driver Assigned": i.driver || "N/A",
            "Driver Hours": i.driverHours || "N/A",
            "Machine Summary": (i.machines && i.machines.length > 0)
                ? i.machines.map(m => `${m.vehicle} (${m.machineHours}h)`).join(", ")
                : `${i.vehicle || 'N/A'} (${i.machineHours || 0}h)`
        })) : [{ "Message": "No Invoice Data Available" }];

        const wsInvoice = XLSX.utils.json_to_sheet(invoiceData);
        XLSX.utils.book_append_sheet(wb, wsInvoice, "Invoices");

        // 4. Rental History (Derived from Invoices)
        const rentalData = [];
        if (invoices.length > 0) {
            invoices.forEach(inv => {
                const date = inv.issueDate || (inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : "N/A");
                const client = inv.clientName || "N/A";
                const location = `${inv.city || ''}, ${inv.state || ''}`;
                const status = inv.status || "Pending";

                if (inv.machines && inv.machines.length > 0) {
                    inv.machines.forEach(m => {
                        rentalData.push({
                            "Date": date,
                            "Client": client,
                            "Machine": m.vehicle || "N/A",
                            "Hours": m.machineHours || "0",
                            "Price": m.price || "0",
                            "Location": location,
                            "Status": status
                        });
                    });
                } else {
                    rentalData.push({
                        "Date": date,
                        "Client": client,
                        "Machine": inv.vehicle || "N/A",
                        "Hours": inv.machineHours || "0",
                        "Price": inv.totalAmount || "0",
                        "Location": location,
                        "Status": status
                    });
                }
            });
        }

        const finalRentalData = rentalData.length > 0 ? rentalData : [{ "Message": "No Rental Data Available" }];
        const wsRental = XLSX.utils.json_to_sheet(finalRentalData);
        XLSX.utils.book_append_sheet(wb, wsRental, "Rentals");

        // Save File
        XLSX.writeFile(wb, `JCB_Full_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    // --- Mock/Derived Data Preparation ---

    // 1. Machine Usage Report (Real Data derived)
    const machineUsageData = useMemo(() => {
        // Sort machines by usageHours descending and take top 10
        const sorted = [...(machine || [])]
            .sort((a, b) => (Number(b.usageHours) || 0) - (Number(a.usageHours) || 0))
            .slice(0, 10);
        return sorted.map((m) => ({
            name: m.model, // or m.vehicleNumber
            hours: Number(m.usageHours) || 0,
        }));
    }, [machine]);

    // 2. Driver Distribution (Real Data simplified + Mock performance)
    // Since we don't have explicit "driver performance" data in the context shown so far,
    // we'll visualize the number of drivers vs something else, or just mock a performance score distribution.
    // Let's do a mock "Driver Efficiency" based on random assignment for demo purposes
    // or just count drivers by some category if available.
    // For now, let's create a "Driver Status" Pie Chart if status exists, else mock it.
    const driverStatusData = useMemo(() => {
        // Calculate assigned drivers from ongoing rentals
        const ongoingRentals = Array.isArray(rentals) ? rentals.filter(r => r.status === "Ongoing") : [];
        const assignedDriverIds = new Set(ongoingRentals.map(r => r.driver?._id || r.driver).filter(Boolean));

        const assignedCount = assignedDriverIds.size;
        const totalDrivers = Array.isArray(driver) ? driver.length : 0;
        const activeCount = Math.max(0, totalDrivers - assignedCount);

        return [
            { name: "Assigned", value: assignedCount, color: "#ef4444" }, // Red for busy
            { name: "Active", value: activeCount, color: "#10b981" },     // Green for available
        ];
    }, [driver, rentals]);

    // 3. Invoice Status (Real Data derived)
    const invoiceStatusData = useMemo(() => {
        const paid = (invoice || []).filter(i => i.status === "Success").length;
        const pending = (invoice || []).filter(i => i.status === "Pending").length;
        // Mocking a third status if needed, or just use these two
        return [
            { name: "Paid", value: paid, color: "#8b5cf6" }, // Violet
            { name: "Pending", value: pending, color: "#f97316" }, // Orange
        ];
    }, [invoice]);

    // 4. Rental Analytics (Real Data derived)
    const rentalTrendsData = useMemo(() => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const last6Months = [];
        const now = new Date();

        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            last6Months.push({
                name: months[d.getMonth()],
                monthIndex: d.getMonth(),
                year: d.getFullYear(),
                newBookings: 0,
                ongoing: 0
            });
        }

        const rentalList = Array.isArray(rentals) ? rentals : [];

        last6Months.forEach(m => {
            const monthStart = new Date(m.year, m.monthIndex, 1);
            const monthEnd = new Date(m.year, m.monthIndex + 1, 0);

            rentalList.forEach(r => {
                const startDate = new Date(r.startDate);
                const endDate = r.endDate ? new Date(r.endDate) : null;

                // New Bookings: Started in this month
                if (startDate >= monthStart && startDate <= monthEnd) {
                    m.newBookings++;
                }

                // Ongoing: Was active at any point during this month
                // (Started before month end AND (not yet ended OR ended after month start))
                const isOngoing = startDate <= monthEnd && (!endDate || endDate >= monthStart);
                if (isOngoing && r.status === "Ongoing") {
                    m.ongoing++;
                }
            });
        });

        return last6Months;
    }, [rentals]);

    // If no sufficient data, provide some fallbacks
    const finalMachineData = machineUsageData.length > 0 ? machineUsageData : [
        { name: "JCB 3DX", hours: 120 }, { name: "Cat 424", hours: 98 }, { name: "Tata Hitachi", hours: 86 },
        { name: "Komatsu", hours: 65 }, { name: "Terex", hours: 45 }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-10">
            <div className="flex justify-end px-1">
                <Button type="addbtn" onClick={handleDownloadReport}>
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline ml-2">Download Report</span>
                </Button>
            </div>


            {/* Row 1: Machine Performance (Bar Chart) */}
            <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-white/10 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Truck className="text-blue-500" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Machine Usage Report</h2>
                            <p className="text-xs text-[var(--text-muted)]">Operating hours per machine</p>
                        </div>
                    </div>
                </div>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={finalMachineData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9a9a9a', fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9a9a9a', fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ background: '#252525', border: '1px solid #ffffff10', borderRadius: '12px', color: '#fff' }}
                                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                            />
                            <Bar dataKey="hours" name="Hours Used" fill="var(--color-primary)" radius={[6, 6, 0, 0]} barSize={50}>
                                {
                                    finalMachineData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'var(--color-primary)' : '#3b82f6'} />
                                    ))
                                }
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Row 2: Statistics Grid - Driver & Invoice */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Driver Report (Pie Chart) */}
                <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-white/10 shadow-2xl">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-green-500/10 rounded-lg">
                            <Users className="text-green-500" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Driver Status Report</h2>
                            <p className="text-xs text-[var(--text-muted)]">Availability overview</p>
                        </div>
                    </div>
                    <div className="h-[250px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={driverStatusData}
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {driverStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ background: '#252525', borderRadius: '8px', border: '1px solid #ffffff10' }} itemStyle={{ color: '#fff' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-6 mt-4">
                        {driverStatusData.map((entry, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                                <span className="text-sm text-white/70">{entry.name} - {entry.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Invoice Status (Pie Chart) */}
                <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-white/10 shadow-2xl">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                            <TrendingUp className="text-purple-500" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Invoice Status</h2>
                            <p className="text-xs text-[var(--text-muted)]">Payment breakdown</p>
                        </div>
                    </div>
                    <div className="h-[250px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={invoiceStatusData}
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {invoiceStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ background: '#252525', borderRadius: '8px', border: '1px solid #ffffff10' }} itemStyle={{ color: '#fff' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-6 mt-4">
                        {invoiceStatusData.map((entry, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                                <span className="text-sm text-white/70">{entry.name} - {entry.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Row 3: Rental Analytics (Area Chart) */}
            <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-white/10 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-500/10 rounded-lg">
                            <Activity className="text-orange-500" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Rental Activity Trends</h2>
                            <p className="text-xs text-[var(--text-muted)]">New Bookings vs Ongoing Fleet (Monthly)</p>
                        </div>
                    </div>
                </div>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={rentalTrendsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorOngoing" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9a9a9a' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9a9a9a' }} />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                            <Tooltip
                                contentStyle={{ background: '#252525', borderRadius: '8px', border: '1px solid #ffffff10', color: '#fff' }}
                                itemStyle={{ fontWeight: 'bold' }}
                            />
                            <Area type="monotone" dataKey="newBookings" stroke="#10b981" fillOpacity={1} fill="url(#colorNew)" strokeWidth={2} name="New Bookings" />
                            <Area type="monotone" dataKey="ongoing" stroke="#f97316" fillOpacity={1} fill="url(#colorOngoing)" strokeWidth={2} name="Ongoing Fleet" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

