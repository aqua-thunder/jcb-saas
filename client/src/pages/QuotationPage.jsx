import React, { useState, useEffect } from "react";
import { useAuth } from "../store/auth";
import { useSearchParams } from "react-router-dom";
import { CirclePlus, Database, Eye, Trash2, Download, FileText, Pencil } from "lucide-react";
import Button from "../components/ui/Button";
import SearchBar from "../components/ui/SearchBar";
import CreateQuotation from "../components/modals/CreateQuotation";
import { useToast } from "../store/ToastContext";
import { formatInvoiceNo } from "../utils/formatInvoiceNo";

import html2pdf from "html2pdf.js";
import ConfirmModal from "../components/ui/ConfirmModal";


export default function QuotationPage() {
    const { toast } = useToast();
    const { token, settings } = useAuth();

    const [quotations, setQuotations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedQuotation, setSelectedQuotation] = useState(null);
    const [editData, setEditData] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);


    /* ================= SEARCH STATE ================= */
    const [searchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");

    useEffect(() => {
        const query = searchParams.get("search");
        if (query) setSearchTerm(query);
    }, [searchParams]);

    const fetchQuotations = async () => {
        try {
            setLoading(true);
            const res = await fetch("http://localhost:7000/api/quotation", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();

            if (data.success) {
                setQuotations(data.quotations);
            } else {
                // If API doesn't exist yet, we'll keep empty or use mock for now
                console.warn("API returned error or not found", data);
            }
        } catch (error) {
            console.error("Failed to fetch quotations", error);
            // toast.error("Failed to connect to server");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuotations();
    }, []);

    const filteredQuotations = quotations.filter((q) =>
        q.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.phoneNumber?.includes(searchTerm)
    );

    /* ================= PAGINATION ================= */
    const ITEMS_PER_PAGE = 8;
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(filteredQuotations.length / ITEMS_PER_PAGE);
    const paginatedQuotations = filteredQuotations.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [filteredQuotations.length]);

    const handleDeleteQuotation = (id) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;

        try {
            const response = await fetch(`http://localhost:7000/api/quotation/${deleteId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                toast.success("Quotation deleted successfully");
                setQuotations(quotations.filter((q) => q._id !== deleteId));
                setShowDeleteModal(false);
            } else {
                toast.error("Failed to delete quotation");
            }
        } catch (error) {
            console.error("Delete error:", error);
            // Simulate delete for demo
            setQuotations(quotations.filter((q) => q._id !== deleteId));
            toast.info("Deleted from view (simulation)");
            setShowDeleteModal(false);
        }
    };

    const handleDownloadQuotation = (q, idx = 0) => {
        const dateObj = new Date(q.date);
        const formattedDate = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');

        const qNo = q.quotationNo || formatInvoiceNo(
            settings.billing?.quotationPrefix || "QT-",
            settings.billing?.quotationSuffix || "",
            String(idx + 1).padStart(3, '0'),
            q.date
        );

        const machines = q.machines || [];
        const total = machines.reduce((sum, m) => sum + (parseFloat(m.hours || 0) * parseFloat(m.rate || 0)), 0);

        const htmlContent = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; padding: 20px; font-size: 13px; line-height: 1.6; background: #fff;">
                <div style="width: 100%; max-width: 800px; margin: auto; border: 1px solid #e2e8f0; padding: 40px; background: #fff;">
                    <div style="display: flex; justify-content: space-between; border-bottom: 3px solid #ff9100; padding-bottom: 20px; margin-bottom: 30px;">
                        <div style="flex: 1;">
                            <h1 style="color: #ff9100; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -1px;">JCB SAAS</h1>
                            <p style="margin: 5px 0 0; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase;">Heavy Equipment Rental Services</p>
                        </div>
                        <div style="background: #ff9100; color: #fff; padding: 8px 20px; border-radius: 4px; font-weight: 800; text-transform: uppercase; height: fit-content; margin-top: 10px;">Quotation</div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; display: flex; justify-content: space-between;">
                        <div style="flex: 1;">
                            <h3 style="margin: 0 0 10px; font-size: 11px; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px;">Quoted To:</h3>
                            <p style="font-size: 16px; color: #ff9100; margin: 2px 0; font-weight: 600;">${q.clientName}</p>
                            <p style="margin: 2px 0; font-weight: 600; color: #1e293b;">Phone: ${q.phoneNumber}</p>
                            <p style="margin: 2px 0; font-weight: 600; color: #1e293b;">Email: ${q.email || 'N/A'}</p>
                        </div>
                        <div style="flex: 1; text-align: right;">
                            <h3 style="margin: 0 0 10px; font-size: 11px; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px;">Quotation Details:</h3>
                            <p style="margin: 2px 0; font-weight: 600; color: #1e293b;">Date: ${formattedDate}</p>
                            <p style="margin: 2px 0; font-weight: 600; color: #1e293b;">Time: ${q.time || 'N/A'}</p>
                            <p style="margin: 2px 0; font-weight: 600; color: #1e293b;">Quotation No: ${qNo}</p>
                        </div>
                    </div>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                        <thead>
                            <tr style="background: #f8fafc;">
                                <th style="border-bottom: 2px solid #e2e8f0; padding: 12px 15px; text-align: left; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700;">Description</th>
                                <th style="border-bottom: 2px solid #e2e8f0; padding: 12px 15px; text-align: right; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700;">Est. Hours</th>
                                <th style="border-bottom: 2px solid #e2e8f0; padding: 12px 15px; text-align: right; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700;">Rate / Hr</th>
                                <th style="border-bottom: 2px solid #e2e8f0; padding: 12px 15px; text-align: right; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700;">Total Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${machines.map(m => `
                                <tr>
                                    <td style="padding: 15px; border-bottom: 1px solid #f1f5f9; color: #334155;"><span style="font-weight: 700;">${m.machine}</span></td>
                                    <td style="padding: 15px; border-bottom: 1px solid #f1f5f9; color: #334155; text-align: right;">${m.hours} Hrs</td>
                                    <td style="padding: 15px; border-bottom: 1px solid #f1f5f9; color: #334155; text-align: right;">₹${parseFloat(m.rate).toLocaleString()}</td>
                                    <td style="padding: 15px; border-bottom: 1px solid #f1f5f9; color: #334155; text-align: right; font-weight: 700;">₹${(parseFloat(m.hours) * parseFloat(m.rate)).toLocaleString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div style="display: flex; justify-content: flex-end; margin-top: 20px;">
                        <div style="width: 250px;">
                            <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                                <span>Subtotal:</span>
                                <span style="font-weight: 700;">₹${total.toLocaleString()}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 10px 0; border-top: 2px solid #ff9100; margin-top: 5px; padding-top: 15px;">
                                <span style="font-weight: 700;">Grand Total:</span>
                                <span style="font-size: 18px; color: #ff9100; font-weight: 800;">₹${total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Quotation - ${q.clientName}</title>
                    <style>
                        @page { margin: 20mm; }
                        body { margin: 0; padding: 0; }
                    </style>
                </head>
                <body>
                    ${htmlContent}
                    <script>
                        window.onload = function() {
                            window.print();
                        };
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <div className="space-y-4 font-[var(--font-body)]">
            <div className='flex justify-between items-center mb-3 gap-4'>
                <SearchBar
                    placeholder="Search Quotations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full max-w-xs"
                />
                <Button
                    type="addbtn"
                    onClick={() => {
                        setEditData(null);
                        setShowCreateModal(true);
                    }}
                    className="shadow-lg shadow-[var(--color-primary)]/10"
                >
                    <CirclePlus className="w-4 h-4" />
                    <span className="hidden sm:inline ml-2">Create Quotation</span>
                    <span className="sm:hidden ml-2">New</span>
                </Button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 bg-[var(--bg-card)] rounded-2xl border border-white/10 shadow-xl">
                    <div className="w-10 h-10 border-4 border-[var(--color-primary)]/30 border-t-[var(--color-primary)] rounded-full animate-spin mb-4" />
                    <p className="text-[var(--text-muted)] font-bold uppercase tracking-widest text-[10px]">Loading Records...</p>
                </div>
            ) : filteredQuotations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 bg-[var(--bg-card)] rounded-2xl border border-white/10 shadow-xl">
                    <div className="p-4 bg-white/5 rounded-full mb-4">
                        <Database className="w-10 h-10 text-[var(--text-muted)] opacity-50" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">No Quotations Found</h2>
                    <p className="text-sm text-[var(--text-muted)] max-w-xs text-center">
                        You haven't created any quotations yet. Start by generating a new one.
                    </p>
                </div>
            ) : (
                <>
                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-hidden bg-[var(--bg-card)] rounded-2xl border border-white/10 shadow-2xl">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 text-[var(--text-muted)] uppercase text-[10px] font-black tracking-widest border-b border-white/10">
                                    <th className="px-6 py-4">Quotation No.</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Client Name</th>
                                    <th className="px-6 py-4">Machine(s)</th>
                                    <th className="px-6 py-4">Total Est.</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-white divide-y divide-white/5">
                                {paginatedQuotations.map((q, index) => {
                                    const total = q.machines?.reduce((s, m) => s + (parseFloat(m.hours || 0) * parseFloat(m.rate || 0)), 0) || 0;
                                    const qNo = q.quotationNo || formatInvoiceNo(
                                        settings.billing?.quotationPrefix || "QT-",
                                        settings.billing?.quotationSuffix || "",
                                        String((currentPage - 1) * ITEMS_PER_PAGE + index + 1).padStart(3, '0'),
                                        q.date
                                    );
                                    return (
                                        <tr key={q._id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-4 text-sm font-medium text-[var(--color-primary)] font-mono">{qNo}</td>
                                            <td className="px-6 py-4 text-sm font-medium">{new Date(q.date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-white">{q.clientName}</div>
                                                <div className="text-[10px] text-[var(--text-muted)]">{q.phoneNumber}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-slate-300">
                                                    {q.machines?.[0]?.machine} {q.machines?.length > 1 ? `(+${q.machines.length - 1} more)` : ''}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-black text-[var(--color-primary)]">₹ {total.toLocaleString()}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => { setSelectedQuotation(q); setShowViewModal(true); }}
                                                        className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all"
                                                        title="View Details"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setEditData(q);
                                                            setShowCreateModal(true);
                                                        }}
                                                        className="p-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-xl text-blue-400 hover:text-blue-300 transition-all"
                                                        title="Edit Quotation"
                                                    >
                                                        <Pencil size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDownloadQuotation(q, (currentPage - 1) * ITEMS_PER_PAGE + index)}
                                                        className="p-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-xl text-blue-400 hover:text-blue-300 transition-all"
                                                        title="Print PDF"
                                                    >
                                                        <Download size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteQuotation(q._id)}
                                                        className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-red-400 hover:text-red-300 transition-all"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile View */}
                    <div className="md:hidden space-y-4">
                        {paginatedQuotations.map((q, index) => {
                            const total = q.machines?.reduce((s, m) => s + (parseFloat(m.hours || 0) * parseFloat(m.rate || 0)), 0) || 0;
                            const qNo = formatInvoiceNo(
                                settings.billing?.quotationPrefix || "QT-",
                                settings.billing?.quotationSuffix || "",
                                String((currentPage - 1) * ITEMS_PER_PAGE + index + 1).padStart(3, '0'),
                                q.date
                            );
                            return (
                                <div key={q._id} className="bg-[var(--bg-card)] p-5 rounded-2xl border border-white/10 shadow-lg">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{new Date(q.date).toLocaleDateString()}</p>
                                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-mono font-bold tracking-tight">{qNo}</span>
                                            </div>
                                            <h4 className="text-lg font-bold text-white">{q.clientName}</h4>
                                            <p className="text-sm text-[var(--text-muted)]">{q.phoneNumber}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-black text-[var(--color-primary)]">₹ {total.toLocaleString()}</p>
                                            <p className="text-[10px] text-[var(--text-muted)] font-bold">{q.machines?.length} Machines</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 pt-4 border-t border-white/5">
                                        <button
                                            onClick={() => { setSelectedQuotation(q); setShowViewModal(true); }}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 rounded-xl text-sm font-bold text-white"
                                        >
                                            <Eye size={16} /> View
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditData(q);
                                                setShowCreateModal(true);
                                            }}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-500/10 rounded-xl text-sm font-bold text-blue-400"
                                        >
                                            <Pencil size={16} /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleDownloadQuotation(q, (currentPage - 1) * ITEMS_PER_PAGE + index)}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-500/10 rounded-xl text-sm font-bold text-blue-400"
                                        >
                                            <Download size={16} /> PDF
                                        </button>
                                        <button
                                            onClick={() => handleDeleteQuotation(q._id)}
                                            className="p-3 bg-red-500/10 rounded-xl text-red-400"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {/* PAGINATION */}
                    {totalPages > 1 && (
                        <div className="flex justify-end items-center gap-2 mt-8">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 bg-[var(--bg-card)] border border-white/10 rounded-lg text-[var(--text-muted)] disabled:opacity-50 hover:bg-white/5 transition"
                            >
                                Prev
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-3 py-1 rounded-lg transition ${currentPage === page
                                        ? "bg-[var(--color-primary)] text-white"
                                        : "bg-[var(--bg-card)] border border-white/10 text-[var(--text-muted)] hover:bg-white/5"
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 bg-[var(--bg-card)] border border-white/10 rounded-lg text-[var(--text-muted)] disabled:opacity-50 hover:bg-white/5 transition"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <CreateQuotation
                    editData={editData}
                    onClose={() => {
                        setShowCreateModal(false);
                        setEditData(null);
                        fetchQuotations(); // Refresh list after creation/update
                    }}
                />
            )}

            {/* View Modal */}
            {showViewModal && selectedQuotation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
                    <div className="bg-[var(--bg-card)] w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                        <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <h3 className="font-bold text-white text-lg flex items-center gap-2">
                                <FileText className="text-[var(--color-primary)]" size={20} />
                                Quotation Details
                                <span className="text-[10px] bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-2 py-1 rounded font-mono ml-2">
                                    {formatInvoiceNo(
                                        settings.billing?.quotationPrefix || "QT-",
                                        settings.billing?.quotationSuffix || "",
                                        String(quotations.findIndex(q => q._id === selectedQuotation._id) + 1).padStart(3, '0'),
                                        selectedQuotation.date
                                    )}
                                </span>
                            </h3>
                            <button onClick={() => setShowViewModal(false)} className="text-slate-400 hover:text-white">✕</button>
                        </div>
                        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Client</p>
                                    <p className="text-white font-bold">{selectedQuotation.clientName}</p>
                                    <p className="text-sm text-slate-400">{selectedQuotation.phoneNumber}</p>
                                    <p className="text-sm text-slate-400">{selectedQuotation.email || 'No Email'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Date & Time</p>
                                    <p className="text-white font-bold">{new Date(selectedQuotation.date).toLocaleDateString('en-US', { dateStyle: 'long' })}</p>
                                    <p className="text-xs text-slate-400 font-bold">{selectedQuotation.time || 'N/A'}</p>
                                    {selectedQuotation.hours && <p className="text-[10px] text-orange-400 font-black mt-1 uppercase tracking-tight">Est. {selectedQuotation.hours} Hours Total</p>}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Machine Breakdown</p>
                                {selectedQuotation.machines?.map((m, i) => (
                                    <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                                        <div>
                                            <p className="text-white font-bold">{m.machine}</p>
                                            <p className="text-xs text-slate-400">{m.hours} Hours @ ₹{parseFloat(m.rate).toLocaleString()}/hr</p>
                                        </div>
                                        <p className="text-[var(--color-primary)] font-black">₹ {(parseFloat(m.hours) * parseFloat(m.rate)).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                                <p className="text-lg font-bold text-white">Grand Total</p>
                                <p className="text-2xl font-black text-[var(--color-primary)]">
                                    ₹ {selectedQuotation.machines?.reduce((s, m) => s + (parseFloat(m.hours || 0) * parseFloat(m.rate || 0)), 0).toLocaleString()}
                                </p>
                            </div>
                        </div>
                        <div className="p-4 bg-white/5 border-t border-white/10 flex justify-end gap-3">
                            <Button
                                onClick={() => {
                                    const idx = quotations.findIndex(q => q._id === selectedQuotation._id);
                                    handleDownloadQuotation(selectedQuotation, idx);
                                }}
                                type="downloadbtn"
                            >
                                <Download size={16} className="mr-2" /> Download PDF
                            </Button>
                            <Button onClick={() => setShowViewModal(false)} type="addbtn">Close</Button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Delete Quotation"
                message="Are you sure you want to delete this quotation? This action cannot be undone."
                confirmText="Delete"
                type="danger"
            />
        </div>
    );
}
