import Button from "../ui/Button";
import Input from "../ui/Input";
import { useState } from "react";
import { useAuth } from "../../store/auth";
import { useToast } from "../../store/ToastContext";

import machineData from "../../assets/data/machine.json";

export default function AddMachineModal({ onClose }) {
    const { toast } = useToast();
    const uniqueCompanies = [...new Set(machineData.map(item => item.company))];

    const { getMachines, token } = useAuth();
    const [isManufacturerOpen, setIsManufacturerOpen] = useState(false);
    const [isStatusOpen, setIsStatusOpen] = useState(false);

    const statusOptions = ["Active", "Pending"];

    const [addMachine, setAddMachine] = useState({
        model: "",
        manufacturer: "",
        mileage: "",
        vehicleNumber: "",
        vehicleMakeYear: "",
        status: "",
        usageHours: "",
        rentalRate: "",
        lastServiceDate: "",
        serviceLimitHours: "",
    })
    const handleChange = (e) => {
        const { name, value, type } = e.target;

        // Prevent negative values for number inputs
        if (type === "number" && value !== "" && parseFloat(value) < 0) {
            return;
        }

        setAddMachine({
            ...addMachine,
            [name]: value,
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation: Usage hours cannot exceed service limit hours
        if (addMachine.usageHours !== "" && addMachine.serviceLimitHours !== "") {
            if (parseFloat(addMachine.usageHours) > parseFloat(addMachine.serviceLimitHours)) {
                toast.error(`Usage hours (${addMachine.usageHours}) cannot exceed service limit (${addMachine.serviceLimitHours})`);
                return;
            }
        }

        try {
            const response = await fetch("http://localhost:7000/api/machine", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(addMachine)
            })
            if (response.ok) {
                toast.success("Machine added successfully");
                getMachines();
                onClose();
            } else {
                const data = await response.json();
                toast.error(data.message || "Failed to add machine");
            }
        } catch (error) {
            toast.error("Error connecting to server");
        }
    }

    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-2 sm:px-4">

            {/* Modal Box */}
            <div
                className=" bg-white rounded-xl w-full max-w-lg sm:max-w-xl md:max-w-3xl max-h-[80vh]  flex flex-col">

                {/* Header (Sticky) */}
                <div className="flex justify-between items-center px-4 sm:px-6 py-4 border-b border-gray-300">
                    <h2 className="text-lg sm:text-xl font-semibold">Add Machine</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-black text-xl"
                    >
                        ✕
                    </button>
                </div>

                {/* Scrollable Form Area */}
                <div className="overflow-y-auto px-4 sm:px-6 py-4">
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <Input
                            label="Model"
                            labelClassName="uppercase"
                            name="model"
                            placeholder="3D MAX"
                            value={addMachine.model}
                            onChange={handleChange}
                            required
                        />
                        <div className="space-y-2 relative">
                            <label className="block text-sm font-semibold uppercase text-[var(--text-secondary)]">Manufacturer</label>
                            <input
                                name="manufacturer"
                                value={addMachine.manufacturer}
                                onChange={(e) => {
                                    handleChange(e);
                                    setIsManufacturerOpen(true);
                                }}
                                onFocus={() => setIsManufacturerOpen(true)}
                                onBlur={() => setTimeout(() => setIsManufacturerOpen(false), 200)}
                                placeholder="Search & Select Manufacturer"
                                autoComplete="off"
                                required
                                className="w-full px-4 py-3 rounded-xl outline-none transition text-[var(--color-black)] bg-[var(--bg-light)] border border-[var(--color-primary)] focus:border-[var(--color-primary)]"
                            />
                            {isManufacturerOpen && (
                                <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-40 overflow-y-auto">
                                    {uniqueCompanies
                                        .filter((c) => c.toLowerCase().includes(addMachine.manufacturer.toLowerCase()))
                                        .map((company, index) => (
                                            <li
                                                key={index}
                                                onMouseDown={() => {
                                                    setAddMachine({ ...addMachine, manufacturer: company });
                                                    setIsManufacturerOpen(false);
                                                }}
                                                className="px-4 py-2 text-[var(--color-black)] hover:bg-[var(--color-primary)] hover:text-white cursor-pointer transition border-b border-gray-100 last:border-none"
                                            >
                                                {company}
                                            </li>
                                        ))}
                                    {uniqueCompanies.filter((c) => c.toLowerCase().includes(addMachine.manufacturer.toLowerCase())).length === 0 && (
                                        <li className="px-4 py-2 text-gray-400 italic">No company found</li>
                                    )}
                                </ul>
                            )}
                        </div>
                        <Input
                            label="Vehicle Number"
                            labelClassName="uppercase"
                            name="vehicleNumber"
                            placeholder="GJ06AD1010"
                            value={addMachine.vehicleNumber}
                            onChange={handleChange}
                            required
                        />
                        {/* Usage and Service Hours */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                            <Input
                                label="Vehicle Make Year"
                                labelClassName="uppercase"
                                name="vehicleMakeYear"
                                placeholder="2015"
                                value={addMachine.vehicleMakeYear}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                label="Service Hour Limit"
                                labelClassName="uppercase"
                                name="serviceLimitHours"
                                placeholder="500"
                                value={addMachine.serviceLimitHours}
                                onChange={handleChange}
                                required
                                type="number"
                                min="0"
                            />
                        </div>

                        {/* Rental and Make Year */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label="Last Service Date"
                                labelClassName="uppercase"
                                name="lastServiceDate"
                                placeholder="05/09/2020"
                                value={addMachine.lastServiceDate}
                                onChange={handleChange}
                                required
                                type="date"
                            />
                            <Input
                                label="Usage Hours"
                                labelClassName="uppercase"
                                name="usageHours"
                                placeholder="140"
                                value={addMachine.usageHours}
                                onChange={handleChange}
                                required
                                type="number"
                                min="0"
                            />

                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label="Rental Rate"
                                labelClassName="uppercase"
                                name="rentalRate"
                                placeholder="1200"
                                value={addMachine.rentalRate}
                                onChange={handleChange}
                                required
                                type="number"
                                min="0"
                            />

                            <Input
                                label="Mileage"
                                labelClassName="uppercase"
                                name="mileage"
                                placeholder="6"
                                value={addMachine.mileage}
                                onChange={handleChange}
                                required
                            />
                        </div>


                        {/* Status */}
                        <div className="space-y-2 relative">
                            <label className="block text-sm font-semibold uppercase text-[var(--text-secondary)]">Status</label>
                            <input
                                name="status"
                                value={addMachine.status}
                                readOnly
                                onClick={() => setIsStatusOpen(!isStatusOpen)}
                                onBlur={() => setTimeout(() => setIsStatusOpen(false), 200)}
                                placeholder="Select Status"
                                autoComplete="off"
                                required
                                className="w-full px-4 py-3 rounded-xl outline-none transition text-[var(--color-black)] bg-[var(--bg-light)] border border-[var(--color-primary)] focus:border-[var(--color-primary)] cursor-pointer"
                            />
                            {isStatusOpen && (
                                <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-40 overflow-y-auto">
                                    {statusOptions.map((status, index) => (
                                        <li
                                            key={index}
                                            onMouseDown={() => {
                                                setAddMachine({ ...addMachine, status: status });
                                                setIsStatusOpen(false);
                                            }}
                                            className="px-4 py-2 text-[var(--color-black)] hover:bg-[var(--color-primary)] hover:text-white cursor-pointer transition border-b border-gray-100 last:border-none"
                                        >
                                            {status}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="px-4 sm:px-6 py-4 border-t border-gray-300 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border rounded-lg"
                            >
                                Cancel
                            </button>

                            <Button
                                type="primary"
                                htmlType="submit"
                            >
                                Save
                            </Button>

                        </div>
                    </form>
                </div>

                {/* Footer (Sticky buttons) */}

            </div>
        </div>
    );
}