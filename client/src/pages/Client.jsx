import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Database, Eye, UserPlus, UserPen, Trash2 } from "lucide-react";
import Button from "../components/ui/Button";
import SearchBar from "../components/ui/SearchBar";
import { useToast } from "../store/ToastContext";

import { useAuth } from "../store/auth";
import AddClientModal from "../components/modals/AddClientModal";
import ConfirmModal from "../components/ui/ConfirmModal";


export default function Client() {
    const { toast } = useToast();
    const { clients, getClients, token } = useAuth();

    const [loading, setLoading] = useState(true);
    const [openViewClient, setOpenViewClient] = useState(false);
    const [openAddModal, setOpenAddModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
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
            await getClients();
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
            const res = await fetch(`http://localhost:7000/api/client/${deleteId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (res.ok) {
                toast.success("Client deleted successfully");
                getClients();
            } else {
                toast.error("Failed to delete client");
            }
        } catch (error) {
            toast.error("Error connecting to server");
        }
    };

    /* ================= FILTERED LIST ================= */
    const filteredClients = Array.isArray(clients) ? clients.filter((item) => {
        const query = searchTerm.toLowerCase();
        return (
            item.clientName?.toLowerCase().includes(query) ||
            item.phoneNumber?.includes(query) ||
            item.email?.toLowerCase().includes(query) ||
            item.city?.toLowerCase().includes(query)
        );
    }) : [];

    /* ================= PAGINATION ================= */
    const ITEMS_PER_PAGE = 8;
    const [currentPage, setCurrentPage] = useState(1);

    const totalItems = filteredClients.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    const paginatedClients = filteredClients.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [totalItems]);

    return (
        <>


            <div className='flex justify-between mb-4 gap-4'>
                <SearchBar
                    placeholder="Search Client"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-40 sm:w-64 lg:min-w-96"
                />
                <Button type="addbtn" onClick={() => {
                    setEditData(null);
                    setOpenAddModal(true);
                }}>
                    <UserPlus className="w-4 h-4" />
                    <span className="hidden sm:inline ml-2">Add Client</span>
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
                        {paginatedClients.length > 0 ? (
                            <table className="min-w-full border-collapse text-sm">
                                <thead className="bg-white/5 text-[var(--text-muted)] uppercase text-[10px] font-black tracking-widest">
                                    <tr className="border-b border-white/10">
                                        <th className="px-6 py-4 text-left">#</th>
                                        <th className="px-6 py-4 text-left">Client Name</th>
                                        <th className="px-6 py-4 text-left">Phone</th>
                                        <th className="px-6 py-4 text-left">Email</th>
                                        <th className="px-6 py-4 text-left">Location</th>
                                        <th className="px-6 py-4 text-left">Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {paginatedClients.map((item, index) => (
                                        <tr
                                            key={item._id}
                                            className={`border-b border-white/5 text-white hover:bg-white/5 transition
                                            ${index % 2 === 0 ? "bg-[var(--bg-card)]" : "bg-[var(--bg-main)]"}`}
                                        >
                                            <td className="px-6 py-4">
                                                {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                                            </td>
                                            <td className="px-6 py-4 font-medium">{item.clientName}</td>
                                            <td className="px-6 py-4">{item.phoneNumber}</td>
                                            <td className="px-6 py-4">{item.email}</td>
                                            <td className="px-6 py-4">{item.city}, {item.state}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-start gap-3">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedClient(item);
                                                            setOpenViewClient(true);
                                                        }}
                                                        className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all"
                                                        title="View Details"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setEditData(item);
                                                            setOpenAddModal(true);
                                                        }}
                                                        className="p-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-xl text-blue-400 hover:text-blue-300 transition-all"
                                                        title="Edit"
                                                    >
                                                        <UserPen size={18} />
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
                        {paginatedClients.length > 0 ? (
                            <table className="w-full text-sm text-left">
                                <thead className="bg-[var(--bg-main)] text-[var(--text-muted)] uppercase text-[10px] tracking-wider">
                                    <tr>
                                        <th className="px-4 py-3">Client</th>
                                        <th className="px-4 py-3 text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {paginatedClients.map((item) => (
                                        <tr key={item._id} className="hover:bg-white/5 transition">
                                            <td className="px-4 py-4">
                                                <div className="font-bold text-white">{item.clientName}</div>
                                                <div className="text-[10px] text-[var(--text-muted)]">{item.phoneNumber}</div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex justify-start gap-4">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedClient(item);
                                                            setOpenViewClient(true);
                                                        }}
                                                        className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setEditData(item);
                                                            setOpenAddModal(true);
                                                        }}
                                                        className="p-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-xl text-blue-400 hover:text-blue-300 transition-all"
                                                    >
                                                        <UserPen size={18} />
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

                    {/* ================= PAGINATION ================= */}
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
                <AddClientModal
                    onClose={() => {
                        setOpenAddModal(false);
                        setEditData(null);
                    }}
                    editData={editData}
                    onUpdate={getClients}
                />
            )}

            {openViewClient && selectedClient && (
                <ViewClientModal
                    client={selectedClient}
                    onClose={() => setOpenViewClient(false)}
                />
            )}

            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Delete Client"
                message="Are you sure you want to delete this client? This action cannot be undone."
                confirmText="Delete"
                type="danger"
            />

        </>
    );
}

function ViewClientModal({ client, onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[var(--bg-card)] w-full max-w-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center shrink-0">
                    <h3 className="text-lg font-bold text-white">Client Details</h3>
                    <button onClick={onClose} className="text-[var(--text-muted)] hover:text-white transition">✕</button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                        <DetailRow label="Client Name">{client.clientName}</DetailRow>
                        <DetailRow label="Contact Person">{client.contactPerson || "---"}</DetailRow>
                        <DetailRow label="Phone Number">{client.phoneNumber}</DetailRow>
                        <DetailRow label="GST Number">{client.gstNumber || "Not Provided"}</DetailRow>
                        <DetailRow label="Email Address" className="sm:col-span-2">{client.email}</DetailRow>

                        <div className="sm:col-span-2 h-px bg-white/5 my-2" />

                        <DetailRow label="Billing Address" className="sm:col-span-2">{client.billingAddress}</DetailRow>
                        <DetailRow label="Shipping Address" className="sm:col-span-2">{client.shippingAddress || "Same as Billing"}</DetailRow>

                        <div className="sm:col-span-2 h-px bg-white/5 my-2" />

                        <DetailRow label="City">{client.city}</DetailRow>
                        <DetailRow label="State">{client.state}</DetailRow>
                        <DetailRow label="Pincode">{client.pincode}</DetailRow>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-white/5 bg-white/5 flex justify-end shrink-0">
                    <Button onClick={onClose} type="primary" className="px-8">Close</Button>
                </div>
            </div>
        </div>
    );
}

function DetailRow({ label, children, className = "" }) {
    return (
        <div className={`flex flex-col gap-1.5 text-sm ${className}`}>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-muted)]">
                {label}
            </span>
            <span className="text-white font-medium">{children}</span>
        </div>
    );
}

function NoData() {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
            <Database className="w-12 h-12 text-[var(--text-muted)] mb-4 opacity-20" />
            <h2 className="text-xl font-bold text-white mb-2">No Clients Found</h2>
            <p className="text-sm text-[var(--text-muted)] max-w-xs">
                We couldn't find any client records. Add your first client to get started.
            </p>
        </div>
    );
}
