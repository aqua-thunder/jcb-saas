import {
    UserPlus, Database, UserPen, Trash2, Eye, EyeOff
} from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../store/auth";
import Button from "../components/ui/Button";
import SearchBar from "../components/ui/SearchBar";
import AddDriverModel from "../components/modals/AddDriverModel";
import EditDriverModel from "../components/modals/EditDriverModel";
import { useToast } from "../store/ToastContext";

import ConfirmModal from "../components/ui/ConfirmModal";


export default function DriverManagement() {
    const { toast } = useToast();
    const { driver, getDriver, token } = useAuth();


    const [openAddDriver, setOpenDriver] = useState(false);
    const [openEditDriver, setOpenEditDriver] = useState(false);
    const [openViewDriver, setOpenViewDriver] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [searchParams] = useSearchParams();


    /* ================= SEARCH STATE ================= */

    const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");

    useEffect(() => {
        const query = searchParams.get("search");
        if (query) setSearchTerm(query);
    }, [searchParams]);

    /* ================= FILTERED DRIVER LIST ================= */

    const filteredDrivers = Array.isArray(driver)
        ? driver.filter((item) => {
            const query = searchTerm.toLowerCase();
            return (
                item.firstName?.toLowerCase().includes(query) ||
                item.lastName?.toLowerCase().includes(query) ||
                item.phoneNumber?.toString().includes(query) ||
                item.addharNumber?.toString().includes(query)
            );
        })
        : [];


    /* ================= PAGINATION ================= */
    const ITEMS_PER_PAGE = 8;
    const [currentPage, setCurrentPage] = useState(1);

    const totalItems = filteredDrivers.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    const paginatedDrivers = filteredDrivers.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );


    useEffect(() => {
        setCurrentPage(1);
    }, [totalItems]);



    const handleDeleteDriver = (id) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;

        try {
            const response = await fetch(`http://localhost:7000/api/driver/${deleteId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.ok) {
                toast.success("Driver deleted successfully");
                getDriver();
            } else {
                toast.error("Failed to delete driver");
            }
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Error deleting driver");
        }
    };

    return (
        <>


            {/* Add Driver */}
            <div className="flex justify-between mb-4 gap-4">
                <SearchBar
                    placeholder="Search Driver"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-40 sm:w-64 lg:min-w-96"
                />
                <Button type="addbtn" onClick={() => setOpenDriver(true)}>
                    <UserPlus className="w-4 h-4" />
                    <span className="hidden sm:inline ml-2">Add Driver</span>
                </Button>
            </div>

            {/* ================= DESKTOP TABLE ================= */}
            <div className="hidden md:block w-full overflow-x-auto shadow-lg bg-[var(--bg-card)] rounded-xl border border-white/10">
                {paginatedDrivers.length > 0 ? (
                    <table className="min-w-full border-collapse text-sm">
                        <thead className="bg-white/5 text-[var(--text-muted)] uppercase text-[10px] font-black tracking-widest">
                            <tr className="border-b border-white/10">
                                <th className="px-6 py-4 text-left">#</th>
                                <th className="px-6 py-4 text-left">First Name</th>
                                <th className="px-6 py-4 text-left">Last Name</th>
                                <th className="px-6 py-4 text-left">Phone</th>
                                <th className="px-6 py-4 text-left">Aadhar</th>
                                <th className="px-6 py-4 text-left">DOB</th>
                                <th className="px-6 py-4 text-left">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {paginatedDrivers.map((item, index) => (
                                <tr
                                    key={item._id}
                                    className={`border-b border-white/5 text-white hover:bg-white/5 transition
                                    ${index % 2 === 0 ? "bg-[var(--bg-card)]" : "bg-[var(--bg-main)]"}`}
                                >
                                    <td className="px-6 py-4">
                                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                                    </td>
                                    <td className="px-6 py-4 font-medium">{item.firstName}</td>
                                    <td className="px-6 py-4 font-medium">{item.lastName}</td>
                                    <td className="px-6 py-4">{item.phoneNumber}</td>
                                    <td className="px-6 py-4">{item.addharNumber}</td>
                                    <td className="px-6 py-4">{item.dob}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-start gap-3">
                                            <button
                                                onClick={() => {
                                                    setSelectedDriver(item);
                                                    setOpenViewDriver(true);
                                                }}
                                                className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedDriver(item);
                                                    setOpenEditDriver(true);
                                                }}
                                                className="p-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-xl text-blue-400 hover:text-blue-300 transition-all"
                                            >
                                                <UserPen size={18} />
                                            </button>
                                            <button onClick={() => handleDeleteDriver(item._id)}
                                                className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-red-400 hover:text-red-300 transition-all">
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
                {paginatedDrivers.length > 0 ? (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[var(--bg-main)] text-[var(--text-muted)] uppercase text-[10px] tracking-wider">
                            <tr>
                                <th className="px-4 py-3">Driver</th>
                                <th className="px-4 py-3 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {paginatedDrivers.map((item) => (
                                <tr key={item._id} className="hover:bg-white/5 transition">
                                    <td className="px-4 py-4">
                                        <div className="font-bold text-white">{item.firstName} {item.lastName}</div>
                                        <div className="text-[10px] text-[var(--text-muted)]">{item.phoneNumber}</div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex justify-start gap-4">
                                            <button
                                                onClick={() => {
                                                    setSelectedDriver(item);
                                                    setOpenViewDriver(true);
                                                }}
                                                className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedDriver(item);
                                                    setOpenEditDriver(true);
                                                }}
                                                className="p-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-xl text-blue-400 hover:text-blue-300 transition-all"
                                            >
                                                <UserPen size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteDriver(item._id)}
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
            {openAddDriver && <AddDriverModel onClose={() => setOpenDriver(false)} />}

            {openEditDriver && (
                <EditDriverModel
                    driver={selectedDriver}
                    onClose={() => setOpenEditDriver(false)}
                />
            )}

            {openViewDriver && selectedDriver && (
                <ViewDriverModal
                    driver={selectedDriver}
                    onClose={() => setOpenViewDriver(false)}
                />
            )}

            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Delete Driver"
                message="Are you sure you want to delete this driver? This action cannot be undone."
                confirmText="Delete"
                type="danger"
            />

        </>
    );
}

/* ================= VIEW MODAL ================= */
function ViewDriverModal({ driver, onClose }) {
    const [isRevealed, setIsRevealed] = useState(false);

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[var(--bg-card)] w-full max-w-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center shrink-0">
                    <h3 className="text-lg font-bold text-white">Driver Details</h3>
                    <button onClick={onClose} className="text-[var(--text-muted)] hover:text-white transition">✕</button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar overflow-y-hidden">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                        <DetailRow label="First Name">{driver.firstName}</DetailRow>
                        <DetailRow label="Last Name">{driver.lastName}</DetailRow>
                        <DetailRow label="Phone Number">{driver.phoneNumber}</DetailRow>
                        <DetailRow label="Aadhar Number">{driver.addharNumber}</DetailRow>
                        <DetailRow label="Date of Birth">{driver.dob}</DetailRow>
                        <DetailRow label="Full Address">{driver.address}</DetailRow>
                    </div>

                    {driver.licensePhoto && (
                        <div className="w-full flex flex-col items-center justify-center mb-4 mt-8">
                            <div className="relative w-full max-w-md h-56 sm:h-72 rounded-2xl overflow-hidden border border-white/10 bg-black/30 flex items-center justify-center shadow-lg mx-auto group">
                                <img
                                    src={driver.licensePhoto}
                                    alt="Driver License"
                                    className={`w-full h-full object-contain p-2 transition-all duration-500 transform ${isRevealed ? 'blur-0 scale-100' : 'blur-xl scale-110 opacity-50'
                                        }`}
                                />

                                {/* Reveal Button */}
                                {!isRevealed && (
                                    <button
                                        onClick={() => setIsRevealed(true)}
                                        className="absolute inset-0 z-10 flex flex-col items-center justify-center text-white/80 hover:text-white transition-all hover:scale-105"
                                    >
                                        <Eye size={40} className="mb-2 drop-shadow-xl" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-black/60 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
                                            View License
                                        </span>
                                    </button>
                                )}

                                {/* Hide Button */}
                                {isRevealed && (
                                    <button
                                        onClick={() => setIsRevealed(false)}
                                        className="absolute top-3 right-3 z-10 p-2 bg-black/60 hover:bg-red-500/80 rounded-full text-white/70 hover:text-white transition-all backdrop-blur-md border border-white/10"
                                        title="Hide Image"
                                    >
                                        <EyeOff size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 border-t border-white/5 bg-white/5 flex justify-end shrink-0">
                    <Button onClick={onClose} type="primary" className="px-8">Close</Button>
                </div>
            </div>
        </div>
    );
}

/* ================= HELPERS ================= */
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
            <h2 className="text-xl font-bold text-white mb-2">No Drivers Found</h2>
            <p className="text-sm text-[var(--text-muted)] max-w-xs">
                We couldn't find any driver records. Add your first driver to get started.
            </p>
        </div>
    );
}
