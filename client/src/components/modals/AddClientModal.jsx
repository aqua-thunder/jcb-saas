import Button from "../ui/Button";
import Input from "../ui/Input";
import { useState, useEffect } from "react";
import { useAuth } from "../../store/auth";
import { useToast } from "../../store/ToastContext";


export default function AddClientModal({ onClose, editData = null, onUpdate = null }) {
    const { toast } = useToast();
    const { token } = useAuth();

    const [loading, setLoading] = useState(false);

    const [client, setClient] = useState({
        clientName: "",
        phoneNumber: "",
        email: "",
        contactPerson: "",
        billingAddress: "",
        shippingAddress: "",
        pincode: "",
        city: "",
        state: "",
        gstNumber: "",
    });

    useEffect(() => {
        if (editData) {
            setClient(editData);
        }
    }, [editData]);

    const handleChange = (e) => {
        if (e.target.name === "gstNumber" && e.target.value.length > 15) return;
        setClient({
            ...client,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        console.log(client)
        e.preventDefault();
        setLoading(true);

        try {
            const url = editData
                ? `http://localhost:7000/api/client/${editData._id}`
                : `http://localhost:7000/api/client`;

            const method = editData ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(client)
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(editData ? "Client updated successfully" : "Client added successfully");
                if (onUpdate) await onUpdate();
                onClose();
            } else {
                toast.error(data.message || "Failed to save client");
            }
        } catch (error) {
            console.error("Client save error:", error);
            toast.error("Error connecting to server");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-2 sm:px-4">
            <div className="bg-white rounded-2xl w-full max-w-lg sm:max-w-xl md:max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-slate-800">
                        {editData ? "Edit Client" : "Add New Client"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Form Body */}
                <div className="overflow-y-auto px-6 py-6 custom-scrollbar">
                    <form id="client-form" onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Client Name"
                                name="clientName"
                                placeholder="Enter client/company name"
                                value={client.clientName}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                label="Phone Number"
                                name="phoneNumber"
                                placeholder="Enter phone number"
                                value={client.phoneNumber}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Email Address"
                                name="email"
                                type="email"
                                placeholder="client@example.com"
                                value={client.email}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                label="Contact Person (Optional)"
                                name="contactPerson"
                                placeholder="Enter contact person name"
                                value={client.contactPerson}
                                onChange={handleChange}
                            />
                        </div>

                        <Input
                            label="GST Number"
                            name="gstNumber"
                            placeholder="e.g. 22AAAAA0000A1Z5"
                            value={client.gstNumber}
                            onChange={handleChange}
                            className="uppercase"
                            maxLength={15}
                            required
                        />

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold uppercase text-slate-500 tracking-wider">
                                Billing Address
                            </label>
                            <textarea
                                name="billingAddress"
                                value={client.billingAddress}
                                onChange={handleChange}
                                placeholder="Street, building, area..."
                                className="w-full px-4 py-3 rounded-xl outline-none transition text-[var(--color-black)] bg-[var(--bg-light)] border border-[var(--color-primary)] focus:border-[var(--color-primary)] min-h-[100px] resize-none"
                            />
                        </div>



                        <div className="space-y-2">
                            <label className="block text-sm font-semibold uppercase text-slate-500 tracking-wider">
                                Shipping Address <span className="text-xs font-normal lowercase">(Optional)</span>
                            </label>
                            <textarea
                                name="shippingAddress"
                                value={client.shippingAddress}
                                onChange={handleChange}
                                placeholder="Same as billing or different..."
                                className="w-full px-4 py-3 rounded-xl outline-none transition text-[var(--color-black)] bg-[var(--bg-light)] border border-[var(--color-primary)] focus:border-[var(--color-primary)] min-h-[100px] resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Input
                                label="Pincode"
                                name="pincode"
                                placeholder="000000"
                                value={client.pincode}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                label="City"
                                name="city"
                                placeholder="Enter city"
                                value={client.city}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                label="State"
                                name="state"
                                placeholder="Enter state"
                                value={client.state}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        {/* Footer */}
                        <div className="px-6 py-4 bg-slate-50 border-t border-gray-100 flex justify-end gap-3 rounded-b-2xl">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2.5 font-bold text-slate-500 hover:text-slate-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <Button
                                type="addbtn"
                                htmlType="submit"
                                form="client-form"
                                disabled={loading}
                                className="px-8"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Saving...
                                    </div>
                                ) : editData ? "Update Client" : "Add Client"}
                            </Button>
                        </div>
                    </form>
                </div>


            </div>
        </div>
    );
}
