import { useAuth } from '../store/auth';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { UserPlus, Database, UserPen, Trash2, Eye } from "lucide-react";
import Button from "../components/ui/Button";
import SearchBar from "../components/ui/SearchBar";
import AddMachineModal from "../components/modals/AddMachineModal";
import EditMachineModel from '../components/modals/EditMachineModel';
import { useToast } from '../store/ToastContext';

import ConfirmModal from "../components/ui/ConfirmModal";


export default function MachineManagement() {
    const { toast } = useToast();
    const { machine, getMachines, token } = useAuth();


    const [openAddMachine, setOpenMachine] = useState(false);
    const [openEditMachine, setOpenEditMachine] = useState(false);
    const [openViewMachine, setOpenViewMachine] = useState(false);
    const [selectedMachine, setSelectedMachine] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [searchParams] = useSearchParams();


    /* ================= SEARCH STATE ================= */
    const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");

    useEffect(() => {
        const query = searchParams.get("search");
        if (query) setSearchTerm(query);
    }, [searchParams]);

    /* ================= FILTERED MACHINE LIST ================= */
    const filteredMachines = Array.isArray(machine)
        ? machine.filter((item) => {
            const query = searchTerm.toLowerCase();
            return (
                item.model?.toLowerCase().includes(query) ||
                item.manufacturer?.toLowerCase().includes(query) ||
                item.vehicleNumber?.toLowerCase().includes(query) ||
                item.status?.toLowerCase().includes(query)
            );
        })
        : [];

    /* ================= PAGINATION ================= */
    const ITEMS_PER_PAGE = 8;
    const [currentPage, setCurrentPage] = useState(1);

    const totalItems = filteredMachines.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    const paginatedMachines = filteredMachines.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [totalItems]);

    // 🔴 DELETE HANDLER
    const handleDeleteMachine = (id) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;

        try {
            const response = await fetch(
                `http://localhost:7000/api/machine/${deleteId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                toast.success("Machine deleted successfully");
                getMachines();
            } else {
                toast.error("Failed to delete machine");
            }
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Error deleting machine");
        }
    };

    return (
        <>


            <div className='flex justify-between mb-4 gap-4'>
                <SearchBar
                    placeholder="Search Machine"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-40 sm:w-64 lg:min-w-96"
                />
                <Button type="addbtn" onClick={() => setOpenMachine(true)}>
                    <UserPlus className="w-4 h-4" />
                    <span className="hidden sm:inline ml-2">Add Machine</span>
                </Button>
            </div>

            {/* ================= DESKTOP TABLE ================= */}
            <div className="hidden md:block w-full overflow-x-auto bg-[var(--bg-card)] rounded-xl border border-white/10 shadow-lg">
                {paginatedMachines.length > 0 ? (
                    <table className="min-w-full border-collapse text-sm">
                        <thead className="bg-white/5 text-[var(--text-muted)] uppercase text-[10px] font-black tracking-widest">
                            <tr className="border-b border-white/10">
                                <th className="px-6 py-4 text-left">#</th>
                                <th className="px-6 py-4 text-left">Model</th>
                                <th className="px-6 py-4 text-left">Vehicle No.</th>
                                <th className="px-6 py-4 text-left">Year</th>
                                <th className="px-6 py-4 text-left">Usage</th>
                                <th className="px-6 py-4 text-left">Rate</th>
                                <th className="px-6 py-4 text-left">Status</th>
                                <th className="px-6 py-4 text-left">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {paginatedMachines.map((item, index) => (
                                <tr
                                    key={item._id}
                                    className={`border-b border-white/5 text-white hover:bg-white/5 transition
                                    ${index % 2 === 0 ? "bg-[var(--bg-card)]" : "bg-[var(--bg-main)]"}`}
                                >
                                    <td className="px-6 py-4 text-[var(--text-muted)]">
                                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                                    </td>
                                    <td className="px-6 py-4 font-medium">{item.model}</td>
                                    <td className="px-6 py-4">{item.vehicleNumber}</td>
                                    <td className="px-6 py-4">{item.vehicleMakeYear}</td>
                                    <td className="px-6 py-4">{item.usageHours} hrs</td>
                                    <td className="px-6 py-4 font-bold text-[var(--color-primary)]">
                                        ₹ {item.rentalRate}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase
                                            ${item.status === "Active"
                                                    ? "bg-green-500/20 text-green-500 border border-green-500/30"
                                                    : "bg-red-500/20 text-red-500 border border-red-500/30"
                                                }`}
                                        >
                                            {item.status}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex justify-start gap-3">
                                            <button
                                                onClick={() => {
                                                    setSelectedMachine(item);
                                                    setOpenViewMachine(true);
                                                }}
                                                className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedMachine(item);
                                                    setOpenEditMachine(true);
                                                }}
                                                className="p-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-xl text-blue-400 hover:text-blue-300 transition-all"
                                            >
                                                <UserPen size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteMachine(item._id)}
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

            {/* ================= MOBILE TABLE ================= */}
            <div className="md:hidden w-full overflow-hidden bg-[var(--bg-card)] rounded-xl border border-white/10 shadow-md">
                {paginatedMachines.length > 0 ? (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[var(--bg-main)] text-[var(--text-muted)] uppercase text-[10px] tracking-wider">
                            <tr>
                                <th className="px-4 py-3 w-10 text-left">#</th>
                                <th className="px-4 py-3">Machine</th>
                                <th className="px-4 py-3 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {paginatedMachines.map((item, index) => (
                                <tr key={item._id} className="hover:bg-white/5 transition">
                                    <td className="px-4 py-4 text-left text-[10px] text-[var(--text-muted)]">
                                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="font-bold text-white">{item.model}</div>
                                        <div className="text-[10px] text-[var(--text-muted)]">{item.vehicleNumber}</div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex justify-start gap-4">
                                            <button
                                                onClick={() => {
                                                    setSelectedMachine(item);
                                                    setOpenViewMachine(true);
                                                }}
                                                className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedMachine(item);
                                                    setOpenEditMachine(true);
                                                }}
                                                className="p-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-xl text-blue-400 hover:text-blue-300 transition-all"
                                            >
                                                <UserPen size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteMachine(item._id)}
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

            {/* ================= MODALS ================= */}
            {openAddMachine && (
                <AddMachineModal onClose={() => setOpenMachine(false)} />
            )}

            {openEditMachine && (
                <EditMachineModel
                    machine={selectedMachine}
                    onClose={() => setOpenEditMachine(false)}
                />
            )}

            {openViewMachine && selectedMachine && (
                <ViewMachineModal
                    machine={selectedMachine}
                    onClose={() => setOpenViewMachine(false)}
                />
            )}

            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Delete Machine"
                message="Are you sure you want to delete this machine? This action cannot be undone."
                confirmText="Delete"
                type="danger"
            />

        </>
    );
}

function ViewMachineModal({ machine, onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[var(--bg-card)] w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white">Machine Details</h3>
                    <button onClick={onClose} className="text-[var(--text-muted)] hover:text-white transition">✕</button>
                </div>
                <div className="p-6 grid grid-cols-2 gap-y-6 gap-x-8">
                    <DetailRow label="Model">{machine.model}</DetailRow>
                    <DetailRow label="Manufacturer">{machine.manufacturer}</DetailRow>
                    <DetailRow label="Vehicle No">{machine.vehicleNumber}</DetailRow>
                    <DetailRow label="Make Year">{machine.vehicleMakeYear}</DetailRow>
                    <DetailRow label="Usage Hours">{machine.usageHours} hrs</DetailRow>
                    <DetailRow label="Rental Rate">₹ {machine.rentalRate}</DetailRow>
                    <DetailRow label="Mileage">{machine.mileage} km/l</DetailRow>
                    <DetailRow label="Status">
                        <span className={machine.status === "Active" ? "text-green-500" : "text-red-500"}>
                            {machine.status}
                        </span>
                    </DetailRow>
                    <DetailRow label="Last Service">{machine.lastServiceDate}</DetailRow>
                    <DetailRow label="Service Limit">{machine.serviceLimitHours} hrs</DetailRow>
                </div>
                <div className="px-6 py-4 border-t border-white/5 bg-white/5 flex justify-end">
                    <Button onClick={onClose} type="primary" className="px-8">Close</Button>
                </div>
            </div>
        </div>
    );
}

function DetailRow({ label, children }) {
    return (
        <div className="flex flex-col gap-1.5 text-sm">
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
            <h2 className="text-xl font-bold text-white mb-2">No Machines Found</h2>
            <p className="text-sm text-[var(--text-muted)] max-w-xs">
                We couldn't find any machine records. Add your first machine to get started.
            </p>
        </div>
    );
}
