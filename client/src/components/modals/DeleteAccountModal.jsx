import React, { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";
import Button from "../ui/Button";

export default function DeleteAccountModal({ isOpen, onClose, onConfirm, user, loading }) {
    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-1 bg-red-600"></div>

                <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600">
                            <AlertTriangle size={24} />
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X size={20} className="text-gray-400" />
                        </button>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Delete Account?</h3>
                    <p className="text-gray-500 mb-6 leading-relaxed">
                        Hi <span className="font-bold text-gray-900">{user.fullName || "User"}</span>, are you sure you want to delete account associated with <span className="font-medium text-red-600 underline">{user.email}</span>? This action is permanent and cannot be undone.
                    </p>

                    <div className="bg-red-50 p-4 rounded-2xl border border-red-100 mb-8">
                        <div className="flex gap-3">
                            <div className="text-red-600 mt-0.5">•</div>
                            <p className="text-sm text-red-800">All your data will be permanently removed.</p>
                        </div>
                        <div className="flex gap-3 mt-2">
                            <div className="text-red-600 mt-0.5">•</div>
                            <p className="text-sm text-red-800">You will lose access to all your dashboard features.</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            type="primary"
                            className="flex-1 bg-red-600 hover:bg-red-700 border-none order-2 sm:order-1"
                            onClick={onConfirm}
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Deleting...
                                </div>
                            ) : "Yes, Delete Everything"}
                        </Button>
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-3 text-gray-600 font-semibold hover:bg-gray-50 rounded-xl transition-colors order-1 sm:order-2"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
