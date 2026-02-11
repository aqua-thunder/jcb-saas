import React, { useState, useEffect } from "react";
import { useAuth } from "../store/auth";
import { Database, Wallet, CirclePlus, X, Search, ArrowRight, IndianRupee, CheckCircle2 } from "lucide-react";
import SearchBar from "../components/ui/SearchBar";
import Button from "../components/ui/Button";
import { formatDate } from "../utils/formatDate";
import { formatInvoiceNo } from "../utils/formatInvoiceNo";
import { useToast } from "../store/ToastContext";


const getMethodStyle = (method) => {
    switch (method?.toLowerCase()) {
        case 'cash':
            return 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10 shadow-[0_0_15px_-3px_rgba(16,185,129,0.1)]';
        case 'upi':
            return 'border-sky-500/50 text-sky-400 bg-sky-500/10 shadow-[0_0_15px_-3px_rgba(56,189,248,0.1)]';
        case 'bank transfer':
            return 'border-indigo-500/50 text-indigo-400 bg-indigo-500/10 shadow-[0_0_15px_-3px_rgba(99,102,241,0.1)]';
        case 'cheque':
            return 'border-orange-500/50 text-orange-400 bg-orange-500/10 shadow-[0_0_15px_-3px_rgba(251,146,60,0.1)]';
        default:
            return 'border-white/10 text-[var(--text-muted)] bg-white/5';
    }
};

export default function Payment() {
    const { toast } = useToast();
    const { token, clients, getClients, invoice, getInvoices, settings } = useAuth();


    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Make Payment Sidebar States
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [clientSearchTerm, setClientSearchTerm] = useState("");
    const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [openPaymentModal, setOpenPaymentModal] = useState(false);
    const [currentSelectedInvoice, setCurrentSelectedInvoice] = useState(null);

    // Bulk Payment States
    const [bulkAmount, setBulkAmount] = useState("");
    const [bulkMethod, setBulkMethod] = useState("Cash");
    const [bulkDate, setBulkDate] = useState(new Date().toISOString().split('T')[0]);
    const [isSettling, setIsSettling] = useState(false);

    // Fetch/Refresh data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await Promise.all([getInvoices(), getClients()]);
            setLoading(false);
        };
        fetchData();
    }, [token]);

    useEffect(() => {
        if (invoice) {
            setInvoices(invoice);
        }
    }, [invoice]);

    // Flatten and filter payments for the history table
    const allPayments = invoices.flatMap(inv =>
        (inv.payments || []).map(payment => ({
            ...payment,
            clientName: inv.clientName,
            invoiceNo: inv.invoiceNo,
            invoiceId: inv._id
        }))
    ).sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (dateB - dateA !== 0) return dateB - dateA;
        // Tie-breaker: Latest added record (using _id comparison)
        return (b._id || "").localeCompare(a._id || "");
    });

    const filteredPayments = allPayments.filter((p) =>
        p.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.invoiceNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.method?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination Logic for history
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentPayments = filteredPayments.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    // Logic for Pending Invoices of selected client
    const pendingInvoices = selectedClient ? invoices.filter(inv => {
        if (inv.clientName !== selectedClient.clientName) return false;
        const totalPaid = (inv.payments || []).reduce((sum, p) => sum + p.amount, 0);
        const totalTax = inv.totalTax !== undefined ? inv.totalTax : ((inv.totalAmount || 0) * 0.18);
        const totalAmount = inv.grandTotal || ((inv.totalAmount || 0) + (inv.tcs || 0) - (inv.discount || 0) + totalTax);
        return (totalAmount - totalPaid) > 0.01; // Using small threshold for float comparison
    }).sort((a, b) => a.invoiceNo.localeCompare(b.invoiceNo, undefined, { numeric: true, sensitivity: 'base' })) : [];

    // Calculate total outstanding for selected client
    const totalClientOutstanding = pendingInvoices.reduce((sum, inv) => {
        const totalPaid = (inv.payments || []).reduce((sum, p) => sum + p.amount, 0);
        const totalTax = inv.totalTax !== undefined ? inv.totalTax : ((inv.totalAmount || 0) * 0.18);
        const totalAmount = inv.grandTotal || ((inv.totalAmount || 0) + (inv.tcs || 0) - (inv.discount || 0) + totalTax);
        return sum + (totalAmount - totalPaid);
    }, 0);

    const handlePaymentSubmit = async (id, paymentData) => {
        try {
            const response = await fetch(`http://localhost:7000/api/invoice/${id}/payment`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(paymentData),
            });

            if (response.ok) {
                toast.success("Payment recorded successfully");
                await getInvoices(); // Refresh invoices
                setOpenPaymentModal(false);
            } else {
                toast.error("Failed to record payment");
            }
        } catch (error) {
            console.error("Payment submission error:", error);
            toast.error("Error recording payment");
        }
    };

    const handleAutoSettle = async () => {
        if (!bulkAmount || parseFloat(bulkAmount) <= 0) {
            toast.warning("Please enter a valid amount");
            return;
        }

        setIsSettling(true);
        let remaining = parseFloat(bulkAmount);
        const sorted = [...pendingInvoices]; // Already sorted by invoiceNo in ascending order above

        try {
            for (const inv of sorted) {
                if (remaining <= 0.01) break;

                const totalPaid = (inv.payments || []).reduce((sum, p) => sum + p.amount, 0);
                const totalTax = inv.totalTax !== undefined ? inv.totalTax : ((inv.totalAmount || 0) * 0.18);
                const totalAmount = inv.grandTotal || ((inv.totalAmount || 0) + (inv.tcs || 0) - (inv.discount || 0) + totalTax);
                const outstanding = totalAmount - totalPaid;

                const payAmount = Math.min(remaining, outstanding);

                const response = await fetch(`http://localhost:7000/api/invoice/${inv._id}/payment`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        date: bulkDate,
                        method: bulkMethod,
                        amount: payAmount,
                        note: "Automated Bulk Payment"
                    }),
                });

                if (response.ok) {
                    remaining -= payAmount;
                } else {
                    toast.error(`Failure on ${inv.invoiceNo}`);
                    break;
                }
            }
            toast.success("Bulk settlement complete");
            setBulkAmount("");
            await getInvoices();
        } catch (err) {
            toast.error("Settlement error occurred");
        } finally {
            setIsSettling(false);
        }
    };

    return (
        <div className="animate-in fade-in duration-500">


            <div className="flex justify-between items-center mb-6 gap-4">

                {/* LEFT: Search Bar */}
                <SearchBar
                    placeholder="Search Payments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-64 lg:min-w-80"
                />

                {/* RIGHT: Button */}
                <Button
                    type="addbtn"
                    onClick={() => setIsSidebarOpen(true)}
                    className="flex items-center justify-center whitespace-nowrap"
                >
                    <CirclePlus className="w-5 h-5" />
                    {/* Hide text on mobile */}
                    <span className="ml-2 hidden sm:inline">Make Payment</span>
                </Button>

            </div>


            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 bg-[var(--bg-card)] rounded-2xl border border-white/10 shadow-xl">
                    <div className="w-10 h-10 border-4 border-[var(--color-primary)]/30 border-t-[var(--color-primary)] rounded-full animate-spin mb-4" />
                    <p className="text-[var(--text-muted)] font-bold uppercase tracking-widest text-[10px]">Loading Records...</p>
                </div>
            ) : filteredPayments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-[var(--bg-card)] rounded-lg border border-white/10">
                    <Database className="w-8 h-8 mb-3 text-[var(--text-muted)]" />
                    <h2 className="font-semibold text-white">No Payments Found</h2>
                    <p className="text-sm text-[var(--text-muted)]">
                        There are no recorded payment transactions.
                    </p>
                </div>
            ) : (
                <>
                    {/* DESKTOP TABLE */}
                    <div className="hidden md:block w-full overflow-x-auto shadow-lg bg-[var(--bg-card)] rounded-xl border border-white/10">
                        <table className="min-w-full border-collapse text-sm">
                            <thead className="bg-white/5 text-[var(--text-muted)] uppercase text-[10px] font-black tracking-widest">
                                <tr className="border-b border-white/10 ">
                                    <th className="px-6 py-6 text-left">Receipt No.</th>
                                    <th className="px-6 py-6 text-left">Client Name</th>
                                    <th className="px-6 py-6 text-left">Invoice No</th>
                                    <th className="px-6 py-6 text-left">Date</th>
                                    <th className="px-6 py-6 text-left">Method</th>
                                    <th className="px-6 py-6 text-left">Amount</th>
                                    <th className="px-6 py-6 text-left">Note</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentPayments.map((payment, index) => {
                                    const receiptNo = formatInvoiceNo(
                                        settings.billing?.paymentPrefix || "PAY-",
                                        settings.billing?.paymentSuffix || "",
                                        String(indexOfFirstItem + index + 1).padStart(3, '0'),
                                        payment.date
                                    );
                                    return (
                                        <tr
                                            key={index}
                                            className={`border-b border-white/5 text-white hover:bg-white/5 transition
                                            ${index % 2 === 0 ? "bg-[var(--bg-card)]" : "bg-[var(--bg-main)]"}`}
                                        >
                                            <td className="px-6 py-6 text-xs font-bold text-sky-400 font-mono">
                                                {receiptNo}
                                            </td>
                                            <td className="px-6 py-4 font-medium">{payment.clientName}</td>
                                            <td className="px-6 py-4 text-[var(--color-primary)] uppercase font-bold text-xs tracking-wider">
                                                {payment.invoiceNo}
                                            </td>
                                            <td className="px-6 py-4">{formatDate(payment.date, settings?.billing?.dateFormat)}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${getMethodStyle(payment.method)}`}>
                                                    {payment.method}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-green-400">₹ {payment.amount.toFixed(2)}</td>
                                            <td className="px-6 py-4 text-xs text-[var(--text-muted)] italic truncate max-w-[150px]" title={payment.note}>
                                                {payment.note || "-"}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* MOBILE VIEW */}
                    <div className="md:hidden w-full space-y-4">
                        {currentPayments.map((payment, index) => {
                            const receiptNo = formatInvoiceNo(
                                settings.billing?.paymentPrefix || "PAY-",
                                settings.billing?.paymentSuffix || "",
                                String(indexOfFirstItem + index + 1).padStart(3, '0'),
                                payment.date
                            );
                            return (
                                <div key={index} className="bg-[var(--bg-card)] p-4 rounded-xl border border-white/10 shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="text-white font-bold">{payment.clientName}</h4>
                                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 font-mono font-bold tracking-tight">{receiptNo}</span>
                                            </div>
                                            <p className="text-[10px] text-[var(--color-primary)] font-bold uppercase tracking-wider">{payment.invoiceNo}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-green-400 font-bold">₹ {payment.amount.toFixed(2)}</div>
                                            <div className="text-[10px] text-[var(--text-muted)]">{formatDate(payment.date, settings?.billing?.dateFormat)}</div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center pt-3 border-t border-white/5 mt-2">
                                        <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold tracking-widest ${getMethodStyle(payment.method)}`}>{payment.method}</span>
                                        {payment.note && <p className="text-[10px] text-[var(--text-muted)] italic truncate max-w-[150px]">{payment.note}</p>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* PAGINATION */}
                    {totalPages > 1 && (
                        <div className="flex justify-end items-center gap-2 mt-6">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-3 py-1 bg-[var(--bg-card)] border border-white/10 rounded-lg text-[var(--text-muted)] disabled:opacity-50 hover:bg-white/5 transition"
                            >
                                Prev
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => handlePageChange(i + 1)}
                                    className={`px-3 py-1 rounded-lg transition ${currentPage === i + 1
                                        ? "bg-[var(--color-primary)] text-white"
                                        : "bg-[var(--bg-card)] border border-white/10 text-[var(--text-muted)] hover:bg-white/5"
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 bg-[var(--bg-card)] border border-white/10 rounded-lg text-[var(--text-muted)] disabled:opacity-50 hover:bg-white/5 transition"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* MAKE PAYMENT SIDEPANEL */}
            {isSidebarOpen && (
                <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity" onClick={() => setIsSidebarOpen(false)} />

                    {/* Sidebar */}
                    <div className="fixed inset-y-0 right-0 z-[70] w-full md:w-[500px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out overflow-y-auto custom-scrollbar flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center relative">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                    <IndianRupee className="text-[var(--color-primary)]" size={20} />
                                    Make Payment
                                </h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Settle Outstanding Invoices</p>
                            </div>
                            <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all border border-slate-200 group">
                                <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                            </button>
                        </div>

                        <div className="p-6 flex-1 space-y-8">
                            {/* Search Client */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Search Client</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        <Search size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        value={clientSearchTerm}
                                        onChange={(e) => {
                                            setClientSearchTerm(e.target.value);
                                            setIsClientDropdownOpen(true);
                                        }}
                                        onClick={() => setIsClientDropdownOpen(true)}
                                        placeholder="Search by name or number..."
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:border-[var(--color-primary)] focus:bg-white outline-none transition-all placeholder:text-slate-400"
                                    />
                                    {clientSearchTerm && (
                                        <button
                                            onClick={() => { setClientSearchTerm(""); setSelectedClient(null); }}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}

                                    {isClientDropdownOpen && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setIsClientDropdownOpen(false)}></div>
                                            <div className="absolute top-full left-0 right-0 mt-3 max-h-64 overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-2xl z-20 custom-scrollbar animate-in fade-in zoom-in-95 duration-200">
                                                {clients?.filter(c => {
                                                    const term = clientSearchTerm.toLowerCase();
                                                    return c.clientName?.toLowerCase().includes(term) || c.phoneNumber?.includes(term);
                                                }).length > 0 ? (
                                                    clients.filter(c => {
                                                        const term = clientSearchTerm.toLowerCase();
                                                        return c.clientName?.toLowerCase().includes(term) || c.phoneNumber?.includes(term);
                                                    }).map(c => (
                                                        <div
                                                            key={c._id}
                                                            onClick={() => {
                                                                setSelectedClient(c);
                                                                setClientSearchTerm(c.clientName);
                                                                setIsClientDropdownOpen(false);
                                                            }}
                                                            className="p-4 hover:bg-[var(--color-primary)]/5 cursor-pointer border-b border-slate-100 last:border-0 transition-all flex items-center justify-between group"
                                                        >
                                                            <div>
                                                                <div className="text-sm font-bold text-slate-900 group-hover:text-[var(--color-primary)] transition-colors">{c.clientName}</div>
                                                                <div className="text-[10px] text-slate-400 font-bold">{c.phoneNumber}</div>
                                                            </div>
                                                            <ArrowRight size={14} className="text-slate-300 group-hover:text-[var(--color-primary)] transition-all transform group-hover:translate-x-1" />
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="p-6 text-center text-xs text-slate-500 uppercase font-bold tracking-widest">No clients found</div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Pending Invoices */}
                            {selectedClient && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {/* Total Client Outstanding Card */}
                                    <div className="bg-orange-50 border border-orange-100 p-5 rounded-3xl mb-6 shadow-sm">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Total Client Outstanding</span>
                                            <IndianRupee size={14} className="text-orange-300" />
                                        </div>
                                        <div className="text-2xl font-black text-orange-600 font-mono">₹ {totalClientOutstanding.toFixed(2)}</div>
                                    </div>

                                    {/* Bulk Payment Form */}
                                    <div className="bg-slate-50 border border-slate-200 p-5 rounded-3xl mb-8">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4 ml-1">Lump-sum Payment (Auto-Settle)</label>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase ml-1">Date</span>
                                                    <input
                                                        type="date"
                                                        value={bulkDate}
                                                        onChange={(e) => setBulkDate(e.target.value)}
                                                        className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs focus:border-[var(--color-primary)] outline-none transition-all font-bold"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase ml-1">Method</span>
                                                    <select
                                                        value={bulkMethod}
                                                        onChange={(e) => setBulkMethod(e.target.value)}
                                                        className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs focus:border-[var(--color-primary)] outline-none transition-all cursor-pointer font-bold appearance-none text-center"
                                                    >
                                                        <option value="Cash">Cash</option>
                                                        <option value="UPI">UPI</option>
                                                        <option value="Bank Transfer">Bank Transfer</option>
                                                        <option value="Cheque">Cheque</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <span className="text-[9px] font-bold text-slate-400 uppercase ml-1">Paid Amount</span>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                                                    <input
                                                        type="number"
                                                        placeholder="Enter total amount received"
                                                        value={bulkAmount}
                                                        onChange={(e) => setBulkAmount(e.target.value)}
                                                        className="w-full pl-8 pr-3 py-3 rounded-2xl bg-white border border-slate-200 text-sm focus:border-[var(--color-primary)] outline-none transition-all font-black placeholder:text-slate-300"
                                                    />
                                                </div>
                                            </div>

                                            <button
                                                onClick={handleAutoSettle}
                                                disabled={isSettling || !bulkAmount}
                                                className="w-full bg-[var(--color-primary)] text-black font-black py-4 rounded-2xl shadow-lg shadow-[var(--color-primary)]/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 uppercase tracking-widest text-[10px]"
                                            >
                                                {isSettling ? "Processing..." : "Apply Lump-sum Payment"}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-end px-1 border-t border-slate-100 pt-6">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest"> Pending Invoices ({pendingInvoices.length})</label>
                                    </div>

                                    <div className="space-y-3">
                                        {pendingInvoices.length > 0 ? (
                                            pendingInvoices.map((inv) => {
                                                const totalPaid = (inv.payments || []).reduce((sum, p) => sum + p.amount, 0);
                                                const totalTax = inv.totalTax !== undefined ? inv.totalTax : ((inv.totalAmount || 0) * 0.18);
                                                const totalAmount = inv.grandTotal || ((inv.totalAmount || 0) + (inv.tcs || 0) - (inv.discount || 0) + totalTax);
                                                const outstanding = totalAmount - totalPaid;

                                                return (
                                                    <div
                                                        key={inv._id}
                                                        onClick={() => { setCurrentSelectedInvoice(inv); setOpenPaymentModal(true); }}
                                                        className="bg-slate-50 p-4 rounded-2xl border border-slate-200 hover:border-[var(--color-primary)]/50 cursor-pointer transition-all group relative overflow-hidden"
                                                    >
                                                        <div className="absolute top-0 right-0 p-2 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-bl-xl opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <IndianRupee size={12} />
                                                        </div>
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <div className="text-[10px] text-[var(--color-primary)] font-black tracking-widest uppercase mb-1">{inv.invoiceNo}</div>
                                                                <div className="text-xs text-slate-500 font-medium">{formatDate(inv.issueDate, settings?.billing?.dateFormat)}</div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Outstanding</div>
                                                                <div className="text-sm font-black text-red-400">₹ {outstanding.toFixed(2)}</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-between items-center pt-3 border-t border-slate-200 mt-1">
                                                            <div className="text-[10px] text-slate-400 uppercase font-bold">Total Bill: ₹{totalAmount.toFixed(2)}</div>
                                                            <div className="text-[10px] text-green-600 uppercase font-bold">Paid: ₹{totalPaid.toFixed(2)}</div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="bg-green-50 p-10 rounded-3xl border border-green-100 text-center flex flex-col items-center">
                                                <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center text-green-600 mb-4">
                                                    <CheckCircle2 size={24} />
                                                </div>
                                                <h3 className="text-slate-900 font-bold">All Clear!</h3>
                                                <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest mt-1">No outstanding invoices for this client</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {openPaymentModal && currentSelectedInvoice && (
                <PaymentModal
                    invoice={currentSelectedInvoice}
                    onClose={() => setOpenPaymentModal(false)}
                    onSubmit={handlePaymentSubmit}
                />
            )}
        </div>
    );
}



function PaymentModal({ invoice, onClose, onSubmit }) {
    const [paymentData, setPaymentData] = useState({
        date: new Date().toISOString().split('T')[0],
        method: "Cash",
        amount: "",
        note: ""
    });

    const totalPaid = (invoice.payments || []).reduce((sum, p) => sum + p.amount, 0);
    const totalTax = invoice.totalTax !== undefined ? invoice.totalTax : ((invoice.totalAmount || 0) * 0.18);
    const totalAmount = invoice.grandTotal || ((invoice.totalAmount || 0) + (invoice.tcs || 0) - (invoice.discount || 0) + totalTax);
    const outstanding = totalAmount - totalPaid;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!paymentData.amount || paymentData.amount <= 0) {
            alert("Please enter a valid amount");
            return;
        }
        onSubmit(invoice._id, { ...paymentData, amount: parseFloat(paymentData.amount) });
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-300"
            onClick={onClose}
        >
            <div
                className="bg-white w-full max-w-md rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
                    <div>
                        <h3 className="text-slate-900 font-black text-lg uppercase tracking-wider">Record Payment</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Settling Invoice: {invoice.invoiceNo}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-slate-900">
                            <span className="text-[10px] uppercase font-black text-slate-500 block mb-1 tracking-widest">Total Bill</span>
                            <span className="font-black text-lg font-mono">₹ {totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                            <span className="text-[10px] uppercase font-black text-red-500/60 block mb-1 tracking-widest">Outstanding</span>
                            <span className="text-red-600 font-black text-lg font-mono">₹ {outstanding.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Date</label>
                                <input
                                    type="date"
                                    required
                                    value={paymentData.date}
                                    onChange={(e) => setPaymentData({ ...paymentData, date: e.target.value })}
                                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:border-[var(--color-primary)] outline-none transition-all font-bold"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Method</label>
                                <select
                                    value={paymentData.method}
                                    onChange={(e) => setPaymentData({ ...paymentData, method: e.target.value })}
                                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:border-[var(--color-primary)] outline-none transition-all cursor-pointer font-bold appearance-none"
                                >
                                    <option value="Cash">Cash</option>
                                    <option value="UPI">UPI</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="Cheque">Cheque</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount to Pay</label>
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-900 font-black text-lg">₹</span>
                                <input
                                    type="number"
                                    required
                                    placeholder="0.00"
                                    max={outstanding}
                                    value={paymentData.amount}
                                    onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                                    className="w-full pl-10 pr-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:border-[var(--color-primary)] outline-none transition-all font-black text-xl placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Note (Optional)</label>
                            <textarea
                                placeholder="Ref no, Received by..."
                                value={paymentData.note}
                                onChange={(e) => setPaymentData({ ...paymentData, note: e.target.value })}
                                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:border-[var(--color-primary)] outline-none transition-all h-24 resize-none text-sm placeholder:text-slate-400 shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-4 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all border border-slate-200 uppercase tracking-widest text-xs"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-3 px-4 py-4 rounded-2xl bg-[var(--color-primary)] text-black font-black hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-[var(--color-primary)]/20 uppercase tracking-widest text-xs"
                        >
                            Confirm Payment
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
