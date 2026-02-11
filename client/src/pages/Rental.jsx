import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Database, Eye, Plus, Pencil, Trash2, Calendar, User, Truck } from "lucide-react";
import Button from "../components/ui/Button";
import SearchBar from "../components/ui/SearchBar";
import { useToast } from "../store/ToastContext";

import { useAuth } from "../store/auth";
import AddRentalModal from "../components/modals/AddRentalModal";
import ConfirmModal from "../components/ui/ConfirmModal";


export default function Rental() {
    const { toast } = useToast();
    const { rentals, getRentals, token } = useAuth();

    const [loading, setLoading] = useState(true);
    const [openAddModal, setOpenAddModal] = useState(false);
    const [editData, setEditData] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [searchParams] = useSearchParams();


    /* ================= SEARCH STATE ================= */
    const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");

    useEffect(() => {
        const query = searchParams.get("search");
        if (query) setSearchTerm(query);
    }, [searchParams]);

    useEffect(() => {
        const fetch = async () => {
            await getRentals();
            setLoading(false);
        };
        fetch();
    }, []);

    /* ================= ACTIONS ================= */
    const handleDelete = (id) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;

        try {
            const res = await fetch(`http://localhost:7000/api/rental/${deleteId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (res.ok) {
                toast.success("Rental deleted successfully");
                getRentals();
            } else {
                toast.error("Failed to delete rental");
            }
        } catch (error) {
            toast.error("Error connecting to server");
        }
    };

    /* ================= FILTERED LIST ================= */
    const filteredRentals = Array.isArray(rentals) ? rentals.filter((item) => {
        const query = searchTerm.toLowerCase();
        return (
            item.client?.clientName?.toLowerCase().includes(query) ||
            item.machine?.model?.toLowerCase().includes(query) ||
            item.machine?.vehicleNumber?.toLowerCase().includes(query) ||
            item.driver?.firstName?.toLowerCase().includes(query) ||
            item.driver?.lastName?.toLowerCase().includes(query) ||
            item.status?.toLowerCase().includes(query) ||
            item.site?.toLowerCase().includes(query)
        );
    }) : [];

    /* ================= PAGINATION ================= */
    const ITEMS_PER_PAGE = 8;
    const [currentPage, setCurrentPage] = useState(1);

    const totalItems = filteredRentals.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    const paginatedRentals = filteredRentals.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [totalItems]);

    const getStatusColor = (status) => {
        switch (status) {
            case "Pending": return "bg-orange-500/10 text-orange-500 border-orange-500/20";
            case "Ongoing": return "bg-green-500/10 text-green-500 border-green-500/20";
            case "Completed": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
            case "Cancelled": return "bg-red-500/10 text-red-500 border-red-500/20";
            default: return "bg-slate-500/10 text-slate-500 border-slate-500/20";
        }
    };

    return (
        <>


            <div className='flex justify-between mb-4 gap-4'>
                <SearchBar
                    placeholder="Search Rental"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-40 sm:w-64 lg:min-w-96"
                />
                <Button type="addbtn" onClick={() => {
                    setEditData(null);
                    setOpenAddModal(true);
                }}>
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline ml-2">Assign Machine</span>
                </Button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 bg-[var(--bg-card)] rounded-2xl border border-white/10 shadow-xl">
                    <div className="w-10 h-10 border-4 border-[var(--color-primary)]/30 border-t-[var(--color-primary)] rounded-full animate-spin mb-4" />
                    <p className="text-[var(--text-muted)] font-bold uppercase tracking-widest text-[10px]">Loading Records...</p>
                </div>
            ) : (
                <>
                    {/* ================= DESKTOP TABLE ================= */}
                    <div className="hidden md:block w-full overflow-x-auto shadow-lg bg-[var(--bg-card)] rounded-xl border border-white/10">
                        {paginatedRentals.length > 0 ? (
                            <table className="min-w-full border-collapse text-sm">
                                <thead className="bg-white/5 text-[var(--text-muted)] uppercase text-[10px] font-black tracking-widest">
                                    <tr className="border-b border-white/10">
                                        <th className="px-6 py-4 text-left">#</th>
                                        <th className="px-6 py-4 text-left">Client</th>
                                        <th className="px-6 py-4 text-left">Machine</th>
                                        <th className="px-6 py-4 text-left">Driver</th>
                                        <th className="px-6 py-4 text-left">Start Date</th>
                                        <th className="px-6 py-4 text-left">Site</th>
                                        <th className="px-6 py-4 text-left">Status</th>
                                        <th className="px-6 py-4 text-left">Actions</th>

                                    </tr>
                                </thead>

                                <tbody>
                                    {paginatedRentals.map((item, index) => (
                                        <tr
                                            key={item._id}
                                            className={`border-b border-white/5 text-white hover:bg-white/5 transition
                                            ${index % 2 === 0 ? "bg-[var(--bg-card)]" : "bg-[var(--bg-main)]"}`}
                                        >
                                            <td className="px-6 py-4">
                                                {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                                            </td>
                                            <td className="px-6 py-4 font-medium">
                                                <div className="flex items-center gap-2">
                                                    {item.client?.clientName || "Unknown Client"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {item.machine ? `${item.machine.model} (${item.machine.vehicleNumber})` : "Unknown Machine"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {item.driver ? `${item.driver.firstName} ${item.driver.lastName}` : "Unknown Driver"}
                                            </td>
                                            <td className="px-6 py-4 text-[var(--text-muted)]">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={14} />
                                                    {new Date(item.startDate).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Database size={14} className="text-[var(--color-primary)]" />
                                                    {item.site || "N/A"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(item.status)}`}>
                                                    {item.status || "Ongoing"}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex justify-start gap-3">
                                                    <button
                                                        onClick={() => {
                                                            setEditData(item);
                                                            setOpenAddModal(true);
                                                        }}
                                                        className="p-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-xl text-blue-400 hover:text-blue-300 transition-all"
                                                        title="Edit"
                                                    >
                                                        <Pencil size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item._id)}
                                                        className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-red-400 hover:text-red-300 transition-all"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <NoData />
                        )}
                    </div>

                    {/* ================= MOBILE TABLE ================= */}
                    <div className="md:hidden w-full overflow-hidden bg-[var(--bg-card)] rounded-xl border border-white/10 shadow-md">
                        {paginatedRentals.length > 0 ? (
                            <table className="w-full text-sm text-left">
                                <thead className="bg-[var(--bg-main)] text-[var(--text-muted)] uppercase text-[10px] tracking-wider">
                                    <tr>
                                        <th className="px-4 py-3">Rental Details</th>
                                        <th className="px-4 py-3 text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {paginatedRentals.map((item) => (
                                        <tr key={item._id} className="hover:bg-white/5 transition">
                                            <td className="px-4 py-4">
                                                <div className="font-bold text-white">{item.client?.clientName}</div>
                                                <div className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                                                    <Truck size={10} /> {item.machine?.model}
                                                </div>
                                                <div className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                                                    <User size={10} /> {item.driver?.firstName} {item.driver?.lastName}
                                                </div>
                                                <div className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                                                    <Calendar size={10} /> {new Date(item.startDate).toLocaleDateString()} - {item.endDate ? new Date(item.endDate).toLocaleDateString() : "Present"}
                                                </div>
                                                <div className="text-[10px] text-[var(--text-muted)] flex items-center gap-1 uppercase font-bold text-[var(--color-primary)]">
                                                    <Database size={10} /> Site: {item.site || "N/A"}
                                                </div>
                                                <div className="mt-2">
                                                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${getStatusColor(item.status)}`}>
                                                        {item.status || "Ongoing"}
                                                    </span>
                                                </div>

                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex justify-start gap-4">
                                                    <button
                                                        onClick={() => {
                                                            setEditData(item);
                                                            setOpenAddModal(true);
                                                        }}
                                                        className="p-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-xl text-blue-400 hover:text-blue-300 transition-all"
                                                    >
                                                        <Pencil size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item._id)}
                                                        className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-red-400 hover:text-red-300 transition-all"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <NoData />
                        )}
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

            {/* ================= MODALS ================= */}
            {openAddModal && (
                <AddRentalModal
                    onClose={() => {
                        setOpenAddModal(false);
                        setEditData(null);
                    }}
                    editData={editData}
                    onUpdate={getRentals}
                />
            )}

            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Delete Rental Assignment"
                message="Are you sure you want to delete this rental assignment? This action cannot be undone."
                confirmText="Delete"
                type="danger"
            />

        </>
    );
}

function NoData() {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
            <Database className="w-12 h-12 text-[var(--text-muted)] mb-4 opacity-20" />
            <h2 className="text-xl font-bold text-white mb-2">No Rental Assignments Found</h2>
            <p className="text-sm text-[var(--text-muted)] max-w-xs">
                We couldn't find any rental records. Assign a driver and machine to a client to get started.
            </p>
        </div>
    );
}
