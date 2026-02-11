import Button from "../ui/Button";
import Input from "../ui/Input";
import { useState, useEffect } from "react";
import { useAuth } from "../../store/auth";
import { useToast } from "../../store/ToastContext";

import { Search, ChevronRight, ChevronLeft, User, FileText, CheckCircle2, Truck, UserCheck, MapPin, Calendar, Clock } from "lucide-react";

export default function AddRentalModal({ onClose, editData = null, onUpdate = null }) {
    const { toast } = useToast();

    const { token, machine: allMachine = [], driver: allDrivers = [], clients = [] } = useAuth();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);

    // Step 1: Client Selection States
    const [searchClient, setSearchClient] = useState("");
    const [selectedClient, setSelectedClient] = useState(null);

    // Step 2: Quotation Selection States
    const [quotations, setQuotations] = useState([]);
    const [loadingQuotes, setLoadingQuotes] = useState(false);
    const [selectedQuotation, setSelectedQuotation] = useState(null);

    // Step 3: Assignment States
    const [rental, setRental] = useState({
        client: "",
        machine: "", // Actual Machine ID
        driver: "",  // Driver ID
        startDate: new Date().toISOString().split('T')[0],
        startTime: "",
        hours: "",
        fuel: "",
        site: "",
        status: "Ongoing"
    });

    const [selectedQuoteMachine, setSelectedQuoteMachine] = useState(null); // The machine selected from the quotation list
    const [searchMachine, setSearchMachine] = useState("");
    const [searchDriver, setSearchDriver] = useState("");
    const [isMachineDropdownOpen, setIsMachineDropdownOpen] = useState(false);
    const [isDriverDropdownOpen, setIsDriverDropdownOpen] = useState(false);
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const statusOptions = ["Pending", "Ongoing", "Completed"];

    // Fetch Quotations when Step 2 is reached or Client changes
    useEffect(() => {
        if (token && selectedClient) {
            fetchQuotations();
        }
    }, [selectedClient, token]);

    const fetchQuotations = async () => {
        setLoadingQuotes(true);
        try {
            const res = await fetch("http://localhost:7000/api/quotation", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                // Filter quotes for the selected client and exclude those already converted
                const clientQuotes = data.quotations.filter(q =>
                    (q.clientName === selectedClient.clientName ||
                        q.phoneNumber === selectedClient.phoneNumber) &&
                    q.status !== "Converted"
                );
                setQuotations(clientQuotes);
            }
        } catch (error) {
            console.error("Failed to fetch quotations:", error);
            toast.error("Error loading quotations");
        } finally {
            setLoadingQuotes(false);
        }
    };

    // Populate edit data
    useEffect(() => {
        if (editData) {
            // If editing, we skip the 3-step selection and go straight to assignment
            // For now, let's just populate step 3 and keep it simple
            setStep(3);
            setRental({
                ...editData,
                client: editData.client?._id || editData.client,
                machine: editData.machine?._id || editData.machine,
                driver: editData.driver?._id || editData.driver,
                startDate: editData.startDate ? new Date(editData.startDate).toISOString().split('T')[0] : "",
                startTime: editData.startTime || "",
                hours: editData.hours || "",
                fuel: editData.fuel || "",
                site: editData.site || "",
                status: editData.status || "Ongoing"
            });
            if (editData.client) setSelectedClient(editData.client);
            if (editData.machine) setSearchMachine(`${editData.machine.manufacturer} ${editData.machine.model} - ${editData.machine.vehicleNumber}`);
            if (editData.driver) setSearchDriver(`${editData.driver.firstName} ${editData.driver.lastName}`);
        }
    }, [editData]);

    const handleNext = (overrideClient = null, overrideQuote = null) => {
        if (step === 1 && !selectedClient && !overrideClient) {
            toast.warning("Please select a client first");
            return;
        }

        if (step === 2 && !selectedQuotation && !overrideQuote && quotations.length > 0) {
            toast.warning("Please select a quotation");
            return;
        }

        // ⭐ AUTO SELECT MACHINE WHEN MOVING FROM STEP 2 → STEP 3
        if (step === 2) {
            // If no quotations default to manual entry mode
            if (quotations.length === 0) {
                setSelectedQuotation(null);
                setSelectedQuoteMachine(null);
            }
            autoSelectMachineFromQuotation();
        }

        setStep(step + 1);
    };


    const handleBack = () => setStep(step - 1);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!rental.machine || !rental.driver || !rental.site) {
            toast.error("Please fill all assignment details");
            return;
        }

        setLoading(true);
        try {
            const url = editData
                ? `http://localhost:7000/api/rental/${editData._id}`
                : `http://localhost:7000/api/rental`;
            const method = editData ? "PUT" : "POST";

            const payload = {
                ...rental,
                quotation: selectedQuotation?._id || null
            };

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                toast.success(editData ? "Rental updated successfully" : "Rental created successfully");
                if (onUpdate) await onUpdate();
                onClose();
            } else {
                const data = await response.json();
                toast.error(data.message || "Failed to save rental");
            }
        } catch (error) {
            toast.error("Error connecting to server");
        } finally {
            setLoading(false);
        }
    };

    // Filtered lists
    const filteredClients = clients.filter(c =>
        c.clientName.toLowerCase().includes(searchClient.toLowerCase()) ||
        c.phoneNumber.includes(searchClient)
    );

    const filteredMachines = allMachine.filter(m =>
        m.model.toLowerCase().includes(searchMachine.toLowerCase()) ||
        m.vehicleNumber.toLowerCase().includes(searchMachine.toLowerCase()) ||
        m.manufacturer?.toLowerCase().includes(searchMachine.toLowerCase())
    );

    const filteredDrivers = allDrivers.filter(d =>
        (d.firstName + " " + d.lastName).toLowerCase().includes(searchDriver.toLowerCase())
    );



    // Auto select machine from quotation

    const autoSelectMachineFromQuotation = () => {
        if (!selectedQuotation) return;

        // Sync general fields from quotation
        setRental(prev => ({
            ...prev,
            site: selectedQuotation.siteName || prev.site,
            startDate: selectedQuotation.rentalDate || selectedQuotation.date || prev.startDate,
            startTime: selectedQuotation.time || prev.startTime,
            hours: selectedQuotation.hours || prev.hours
        }));

        if (selectedQuoteMachine) return;

        const quoteMachine = selectedQuotation.machines?.[0];
        if (!quoteMachine) return;

        setSelectedQuoteMachine(quoteMachine);

        const matchedMachine = allMachine.find(m =>
            `${m.manufacturer} ${m.model}`.toLowerCase().includes(
                quoteMachine.machine.toLowerCase()
            )
        );

        if (matchedMachine) {
            setRental(prev => ({
                ...prev,
                machine: matchedMachine._id,
                hours: quoteMachine.hours || "",
            }));

            setSearchMachine(
                `${matchedMachine.manufacturer} ${matchedMachine.model} - ${matchedMachine.vehicleNumber}`
            );
        }
    };


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-2 sm:px-4">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in duration-300 overflow-hidden">

                {/* Progress Header */}
                <div className="bg-slate-50 border-b border-gray-100 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                            {editData ? "Edit Assignment" : "Assign Machine"}
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-all text-slate-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                        </button>
                    </div>

                    {/* Stepper */}
                    {!editData && (
                        <div className="flex items-center justify-center gap-4 sm:gap-8">
                            {[
                                { s: 1, label: "Client", icon: User },
                                { s: 2, label: "Quotation", icon: FileText },
                                { s: 3, label: "Assign", icon: CheckCircle2 }
                            ].map((item) => (
                                <div key={item.s} className="flex flex-col items-center gap-2 group">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${step === item.s
                                        ? "bg-orange-500 text-white shadow-lg shadow-orange-200 ring-4 ring-orange-50"
                                        : step > item.s ? "bg-green-500 text-white" : "bg-white text-slate-400 border border-slate-200"
                                        }`}>
                                        <item.icon size={18} strokeWidth={2.5} />
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${step === item.s ? "text-orange-500" : "text-slate-400"
                                        }`}>
                                        {item.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {/* STEP 1: SELECT CLIENT */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="text-center space-y-2">
                                <h3 className="text-lg font-bold text-slate-800">Choose a Client</h3>
                                <p className="text-sm text-slate-500 font-medium">Select the client for whom the rental is being created</p>
                            </div>

                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search by name or phone..."
                                    value={searchClient}
                                    onChange={(e) => setSearchClient(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-orange-500 focus:bg-white outline-none transition-all font-bold text-slate-700 placeholder:text-slate-400"
                                />
                                <Search className="absolute left-4 top-4.5 text-slate-400" size={20} />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2">
                                {filteredClients.map(c => (
                                    <button
                                        key={c._id}
                                        onClick={() => {
                                            setSelectedClient(c);
                                            setRental(prev => ({ ...prev, client: c._id }));
                                            handleNext(c);
                                        }}
                                        className={`p-4 rounded-xl border-2 transition-all text-left flex items-center gap-3 ${selectedClient?._id === c._id
                                            ? "border-orange-500 bg-orange-50 text-orange-700"
                                            : "border-slate-100 hover:border-orange-200 bg-white"
                                            }`}
                                    >
                                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 group-hover:bg-white transition-colors">
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm text-slate-800">{c.clientName}</div>
                                            <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider font-mono">{c.phoneNumber}</div>
                                        </div>
                                    </button>
                                ))}
                                {filteredClients.length === 0 && (
                                    <div className="col-span-2 py-10 text-center text-slate-400 italic">No clients found matching your search.</div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* STEP 2: SELECT QUOTATION */}
                    {/* STEP 2: SELECT QUOTATION */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">

                            {/* Client Summary */}
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">
                                            Selected Client
                                        </div>
                                        <div className="font-bold text-slate-800 leading-tight">
                                            {selectedClient?.clientName}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setStep(1)}
                                    className="text-[10px] font-black uppercase tracking-widest text-orange-500 hover:text-orange-700 underline"
                                >
                                    Change
                                </button>
                            </div>

                            {/* Header */}
                            {/* Header */}
                            {quotations.length > 0 && (
                                <div className="text-center space-y-2">
                                    <h3 className="text-lg font-bold text-slate-800">Select Quotation</h3>
                                    <p className="text-sm text-slate-500 font-medium">
                                        Choose an approved quotation or continue manually
                                    </p>
                                </div>
                            )}

                            {/* Quotations Content */}
                            {loadingQuotes ? (
                                <div className="py-20 flex flex-col items-center gap-4">
                                    <div className="w-10 h-10 border-4 border-slate-100 border-t-orange-500 rounded-full animate-spin" />
                                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                                        Fetching Quotes...
                                    </span>
                                </div>
                            ) : quotations.length === 0 ? (
                                <div className="py-5 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                    <FileText size={48} className="mx-auto text-slate-300 mb-4" />
                                    <p className="text-slate-500 font-bold">
                                        No quotations found for this client
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        You can continue with manual assignment
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Quotation List */}
                                    <div className="space-y-3">
                                        {quotations.map(q => (
                                            <button
                                                key={q._id}
                                                onClick={() => {
                                                    setSelectedQuotation(q);
                                                    setRental(prev => ({
                                                        ...prev,
                                                        site: q.siteName || "",
                                                        startDate: q.rentalDate || q.date || prev.startDate,
                                                        startTime: q.time || prev.startTime,
                                                        hours: q.hours || prev.hours
                                                    }));
                                                }}
                                                className={`w-full p-5 rounded-2xl border-2 transition-all text-left flex items-center justify-between group
                                ${selectedQuotation?._id === q._id
                                                        ? "border-orange-500 bg-orange-50"
                                                        : "border-slate-100 hover:border-orange-200 bg-white"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-orange-500">
                                                        <FileText size={24} />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-800">
                                                            QT-{q._id.toString().slice(-6).toUpperCase()}
                                                        </div>
                                                        <div className="text-xs text-slate-500 font-medium">
                                                            {q.date} • {q.machines?.length} Machine(s)
                                                        </div>
                                                        {q.siteName && (
                                                            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 mt-1">
                                                                <MapPin size={10} /> {q.siteName}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <ChevronRight
                                                    className={`transition-transform ${selectedQuotation?._id === q._id
                                                        ? "text-orange-500 translate-x-1"
                                                        : "text-slate-300"
                                                        }`}
                                                />
                                            </button>
                                        ))}
                                    </div>

                                    {/* Quotation Machine Selection */}
                                    {selectedQuotation && (
                                        <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in duration-300">
                                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 pb-2 border-b border-slate-200">
                                                Select a machine from the quotation
                                            </h4>

                                            <div className="space-y-2">
                                                {selectedQuotation.machines.map((tm, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => {
                                                            setSelectedQuoteMachine(tm);

                                                            const matchedMachine = allMachine.find(m =>
                                                                `${m.manufacturer} ${m.model}`
                                                                    .toLowerCase()
                                                                    .includes(tm.machine.toLowerCase())
                                                            );

                                                            if (matchedMachine) {
                                                                setRental(prev => ({
                                                                    ...prev,
                                                                    machine: matchedMachine._id,
                                                                    hours: tm.hours || selectedQuotation.hours || "",
                                                                    startDate: selectedQuotation.rentalDate || selectedQuotation.date || prev.startDate,
                                                                    startTime: selectedQuotation.time || prev.startTime
                                                                }));

                                                                setSearchMachine(
                                                                    `${matchedMachine.manufacturer} ${matchedMachine.model} - ${matchedMachine.vehicleNumber}`
                                                                );
                                                            }

                                                            handleNext();
                                                        }}
                                                        className="w-full p-4 bg-white hover:bg-orange-500 hover:text-white rounded-xl border border-slate-200 transition-all flex justify-between items-center group"
                                                    >
                                                        <span className="font-bold text-sm">{tm.machine}</span>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-[10px] font-black bg-slate-100 text-slate-600 px-2 py-1 rounded group-hover:bg-orange-600 group-hover:text-white transition-colors">
                                                                {tm.hours} HRS
                                                            </span>
                                                            <ChevronRight size={16} />
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* ✅ SKIP OPTION Removed - Handled by Main Button */}
                        </div>
                    )}

                    {/* STEP 3: ASSIGNMENT */}
                    {step === 3 && (
                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                            {/* Summary Card */}
                            {!editData && (
                                <div className="p-5 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-orange-500 shadow-sm">
                                            <Truck size={24} />
                                        </div>
                                        <div>
                                            <div className="font-black text-slate-800 leading-tight">{selectedQuoteMachine?.machine || "Manual Assignment"}</div>
                                            <div className="text-xs font-medium text-slate-400">For {selectedClient?.clientName}</div>
                                            {selectedQuotation && (
                                                <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-orange-600">
                                                    <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(selectedQuotation.rentalDate || selectedQuotation.date).toLocaleDateString()}</span>
                                                    <span className="flex items-center gap-1"><Clock size={12} /> {selectedQuotation.time || 'N/A'}</span>
                                                    <span className="flex items-center gap-1 font-black underline decoration-orange-300 decoration-2">Est. {selectedQuotation.hours || '0'} Hrs</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <button onClick={() => setStep(2)} className="text-[10px] font-black uppercase tracking-widest text-orange-500 hover:text-orange-700 underline">Change</button>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {/* Machine Search */}
                                    {selectedQuotation ? (
                                        <div className="space-y-2 relative">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                                Selected Machine (From Quotation)
                                            </label>

                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={searchMachine}
                                                    readOnly
                                                    className="w-full px-5 py-4 bg-slate-100 border border-slate-200
                        rounded-2xl font-bold text-slate-700
                        cursor-not-allowed opacity-90 text-xs"
                                                />
                                                <Truck className="absolute right-4 top-4 text-slate-400" size={20} />
                                            </div>

                                            <p className="text-[10px] text-slate-400 mt-1">
                                                Machine is locked as per selected quotation
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 relative">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Select Machine</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    placeholder="Search Machine..."
                                                    value={searchMachine}
                                                    onChange={(e) => {
                                                        setSearchMachine(e.target.value);
                                                        setIsMachineDropdownOpen(true);
                                                        setRental({ ...rental, machine: "" });
                                                    }}
                                                    onFocus={() => setIsMachineDropdownOpen(true)}
                                                    onBlur={() => setTimeout(() => setIsMachineDropdownOpen(false), 200)}
                                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-orange-500 focus:bg-white outline-none transition-all font-bold text-slate-700 text-xs"
                                                />
                                                <Truck className="absolute right-4 top-4 text-slate-300" size={20} />
                                            </div>
                                            {isMachineDropdownOpen && (
                                                <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl max-h-48 overflow-y-auto p-2">
                                                    {filteredMachines.map(m => (
                                                        <button
                                                            key={m._id}
                                                            type="button"
                                                            onMouseDown={() => {
                                                                setRental({ ...rental, machine: m._id });
                                                                setSearchMachine(`${m.manufacturer} ${m.model} - ${m.vehicleNumber}`);
                                                                setIsMachineDropdownOpen(false);
                                                            }}
                                                            className="w-full text-left p-3 hover:bg-orange-50 rounded-xl transition-all border-b border-slate-50 last:border-none"
                                                        >
                                                            <div className="font-bold text-sm text-slate-800">{m.manufacturer} {m.model}</div>
                                                            <div className="text-[10px] font-black text-slate-400 font-mono tracking-widest">{m.vehicleNumber}</div>
                                                        </button>
                                                    ))}
                                                    {filteredMachines.length === 0 && (
                                                        <div className="p-4 text-center text-xs text-slate-400 italic">No machines found</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}


                                    {/* Driver Search */}
                                    <div className="space-y-2 relative">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Assign Driver</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Driver's Full Name..."
                                                value={searchDriver}
                                                onChange={(e) => {
                                                    setSearchDriver(e.target.value);
                                                    setIsDriverDropdownOpen(true);
                                                    setRental({ ...rental, driver: "" });
                                                }}
                                                onFocus={() => setIsDriverDropdownOpen(true)}
                                                onBlur={() => setTimeout(() => setIsDriverDropdownOpen(false), 200)}
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-orange-500 focus:bg-white outline-none transition-all font-bold text-slate-700"
                                            />
                                            <UserCheck className="absolute right-4 top-4 text-slate-300" size={20} />
                                        </div>
                                        {isDriverDropdownOpen && (
                                            <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl max-h-48 overflow-y-auto p-2">
                                                {filteredDrivers.map(d => (
                                                    <button
                                                        key={d._id}
                                                        type="button"
                                                        onMouseDown={() => {
                                                            setRental({ ...rental, driver: d._id });
                                                            setSearchDriver(`${d.firstName} ${d.lastName}`);
                                                            setIsDriverDropdownOpen(false);
                                                        }}
                                                        className="w-full text-left p-3 hover:bg-orange-50 rounded-xl transition-all border-b border-slate-50 last:border-none"
                                                    >
                                                        <div className="font-bold text-sm text-slate-800">{d.firstName} {d.lastName}</div>
                                                        <div className="text-[10px] font-black text-slate-400 font-mono tracking-widest">{d.phoneNumber}</div>
                                                    </button>
                                                ))}
                                                {filteredDrivers.length === 0 && (
                                                    <div className="p-4 text-center text-xs text-slate-400 italic">No drivers found</div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <Input
                                        label="Site Details"
                                        name="site"
                                        placeholder="Project Site / Location"
                                        value={rental.site}
                                        onChange={(e) => setRental({ ...rental, site: e.target.value })}
                                        required
                                        className="!py-4"
                                    />

                                    <Input
                                        label="Start Date"
                                        name="startDate"
                                        type="date"
                                        value={rental.startDate}
                                        onChange={(e) => setRental({ ...rental, startDate: e.target.value })}
                                        required
                                        className="!py-4"
                                    />

                                    <Input
                                        label="Start Time"
                                        name="startTime"
                                        type="time"
                                        value={rental.startTime}
                                        onChange={(e) => setRental({ ...rental, startTime: e.target.value })}
                                        required
                                        className="!py-4"
                                    />

                                    <div className="space-y-2 relative">
                                        <label className="text-[14px] block text-sm font-semibold text-[var(--text-secondary)] ml-1">
                                            Status
                                        </label>
                                        <div className="relative">
                                            <input
                                                value={rental.status}
                                                readOnly
                                                onClick={() => setIsStatusOpen(!isStatusOpen)}
                                                onBlur={() => setTimeout(() => setIsStatusOpen(false), 200)}
                                                placeholder="Select Status"
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-orange-500 focus:bg-white outline-none transition-all font-bold text-slate-700 text-sm cursor-pointer"
                                            />
                                            <div className={`absolute right-5 top-1/2 -translate-y-1/2 transition-transform duration-300 ${isStatusOpen ? "rotate-180" : ""}`}>
                                                <ChevronLeft size={16} className="-rotate-90 text-slate-400" />
                                            </div>
                                        </div>
                                        {isStatusOpen && (
                                            <ul className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl max-h-48 overflow-y-auto p-2 animate-in fade-in zoom-in-95 duration-200">
                                                {statusOptions.map((status, index) => (
                                                    <li
                                                        key={index}
                                                        onMouseDown={() => {
                                                            setRental({ ...rental, status: status });
                                                            setIsStatusOpen(false);
                                                        }}
                                                        className={`px-4 py-3 rounded-xl cursor-pointer transition-all font-bold text-sm mb-1 last:mb-0
                                                            ${rental.status === status
                                                                ? "bg-orange-500 text-white shadow-lg shadow-orange-100"
                                                                : "text-slate-600 hover:bg-orange-50 hover:text-orange-500"
                                                            }`}
                                                    >
                                                        {status}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    <Input
                                        label="Fuel Top Up (Liters)"
                                        name="fuel"
                                        type="number"
                                        placeholder="Fuel in Liters"
                                        value={rental.fuel}
                                        onChange={(e) => setRental({ ...rental, fuel: e.target.value })}
                                        className="!py-4"
                                    />

                                    <Input
                                        label="Hours"
                                        name="hours"
                                        type="number"
                                        placeholder="Total Hours"
                                        value={rental.hours}
                                        onChange={(e) => setRental({ ...rental, hours: e.target.value })}
                                        className="!py-4"
                                    />
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-slate-50 border-t border-gray-100 flex justify-between items-center">
                    <div>
                        {step > 1 && !editData && (
                            <button
                                onClick={handleBack}
                                className="flex items-center gap-2 px-6 py-3 font-bold text-slate-500 hover:text-slate-800 transition-all"
                            >
                                <ChevronLeft size={18} /> Back
                            </button>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 font-bold text-slate-400 hover:text-slate-600 transition-all"
                        >
                            Cancel
                        </button>
                        {step === 3 ? (
                            <Button
                                type="addbtn"
                                onClick={handleSubmit}
                                disabled={loading}
                                className="px-12 py-3 shadow-xl shadow-orange-200"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Processing...
                                    </div>
                                ) : editData ? "Update Rental" : "Complete Assignment"}
                            </Button>
                        ) : (
                            <Button
                                type="addbtn"
                                onClick={handleNext}
                                className="px-10 py-3 shadow-xl shadow-orange-200"
                            >
                                {step === 2 && quotations.length === 0 ? "Manual Entry" : "Continue"} <ChevronRight size={18} className="ml-1" />
                            </Button>
                        )}
                    </div>
                </div>
            </div >
        </div >
    );
}

