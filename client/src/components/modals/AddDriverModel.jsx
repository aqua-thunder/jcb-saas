import Button from "../ui/Button";
import Input from "../ui/Input";
import { useState } from "react";
import { useToast } from "../../store/ToastContext";

import { useAuth } from "../../store/auth";

export default function AddDriverModel({ onClose }) {
    const { toast } = useToast();
    const { token, getDriver } = useAuth();

    const [addDriver, setAddDriver] = useState({
        firstName: "",
        lastName: "",
        phoneNumber: "",
        addharNumber: "",
        dob: "",
        address: "",
        licensePhoto: null
    })
    const handleChange = (e) => {
        setAddDriver({
            ...addDriver,
            [e.target.name]: e.target.value
        })
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => {
                setAddDriver({
                    ...addDriver,
                    [e.target.name]: reader.result // Base64 string
                });
            };
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:7000/api/driver", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(addDriver),
            });
            if (!response.ok) {
                throw new Error("Request failed");
            }
            await response.text();

            toast.success("Driver added successfully");
            getDriver();
            onClose();
        } catch (error) {
            console.error("ERROR:", error);
        }
    };
    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-2 sm:px-4">

            {/* Modal Box */}
            <div
                className=" bg-white rounded-xl w-full  max-w-lg sm:max-w-xl md:max-w-2xl max-h-[90vh]  flex flex-col">

                {/* Header (Sticky) */}
                <div className="flex justify-between items-center px-4 sm:px-6 py-4 border-b border-gray-300">
                    <h2 className="text-lg sm:text-xl font-semibold">Add Driver</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-black text-xl"
                    >
                        ✕
                    </button>
                </div>

                {/* Scrollable Form Area */}
                <div className="overflow-y-auto px-4 sm:px-6 py-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="First Name"
                            labelClassName="uppercase"
                            name="firstName"
                            placeholder="Rajubhai"
                            value={addDriver.firstName}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="Last Name"
                            labelClassName="uppercase"
                            name="lastName"
                            placeholder="Purohit"
                            value={addDriver.lastName}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="phone Number"
                            labelClassName="uppercase"
                            name="phoneNumber"
                            placeholder="10101010101"
                            value={addDriver.phoneNumber}
                            maxLength={10}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, ""); // only digits
                                if (value.length <= 10) {
                                    handleChange({
                                        target: {
                                            name: "phoneNumber",
                                            value,
                                        },
                                    });
                                }
                            }}
                            required
                        />
                        {/* Two-column on desktop */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label="Addhar Number"
                                labelClassName="uppercase"
                                name="addharNumber"
                                placeholder="123456789123"
                                value={addDriver.addharNumber}
                                maxLength={12}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, ""); // only digits
                                    if (value.length <= 12) {
                                        handleChange({
                                            target: {
                                                name: "addharNumber",
                                                value,
                                            },
                                        });
                                    }
                                }}
                                required
                            />
                            <Input
                                label="DOB"
                                labelClassName="uppercase"
                                name="dob"
                                placeholder="30/09/1997"
                                value={addDriver.dob}
                                onChange={handleChange}
                                required
                                type="date"
                            />
                        </div>
                        <Input
                            label="Address"
                            labelClassName="uppercase"
                            name="address"
                            placeholder="Vadodara"
                            value={addDriver.address}
                            onChange={handleChange}
                            required
                        />

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold uppercase text-[var(--text-secondary)]">
                                Driving License Photo
                            </label>
                            <input
                                type="file"
                                name="licensePhoto"
                                onChange={handleFileChange}
                                accept="image/*"
                                className="w-full px-4 py-3 rounded-xl outline-none transition text-[var(--color-black)] bg-[var(--bg-light)] border border-[var(--color-primary)] focus:border-[var(--color-primary)] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>

                        {/* Footer (Sticky buttons) */}
                        <div className="px-4 sm:px-6 py-4 border-t border-gray-300 flex justify-end gap-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 border rounded-lg"
                            >
                                Cancel
                            </button>
                            <Button
                                type="primary" htmlType="submit"
                            >
                                Save
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}