import React from "react";
import { AlertCircle, X } from "lucide-react";
import Button from "./Button";

/**
 * A reusable confirmation modal for dangerous or important actions.
 * 
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {function} onClose - Function to call when closing without confirming
 * @param {function} onConfirm - Function to call when user confirms the action
 * @param {string} title - Modal title
 * @param {string} message - Modal message/description
 * @param {string} confirmText - Text for the confirmation button
 * @param {string} cancelText - Text for the cancel button
 * @param {string} type - Type of modal: 'danger', 'warning', 'info'
 */
const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Action",
    message = "Are you sure you want to proceed?",
    confirmText = "Delete",
    cancelText = "Cancel",
    type = "danger"
}) => {
    if (!isOpen) return null;

    const typeConfig = {
        danger: {
            icon: <AlertCircle className="w-8 h-8 text-red-500" />,
            iconBg: "bg-red-500/10",
            confirmClass: "bg-red-500 hover:bg-red-600 border-none",
        },
        warning: {
            icon: <AlertCircle className="w-8 h-8 text-yellow-500" />,
            iconBg: "bg-yellow-500/10",
            confirmClass: "bg-yellow-500 hover:bg-yellow-600 border-none",
        },
        info: {
            icon: <AlertCircle className="w-8 h-8 text-blue-500" />,
            iconBg: "bg-blue-500/10",
            confirmClass: "bg-blue-500 hover:bg-blue-600 border-none",
        }
    };

    const config = typeConfig[type] || typeConfig.danger;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div
                className="bg-[var(--bg-card)] w-full max-w-sm rounded-[24px] border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative p-8 flex flex-col items-center text-center">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-white transition-all transform hover:rotate-90 p-2"
                    >
                        <X size={20} />
                    </button>

                    <div className={`${config.iconBg} p-5 rounded-full mb-6 mt-2`}>
                        {config.icon}
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">{title}</h3>
                    <p className="text-[var(--text-muted)] text-sm mb-10 leading-relaxed px-2">
                        {message}
                    </p>

                    <div className="flex gap-4 w-full">
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-3.5 rounded-xl font-semibold text-sm bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all duration-300 active:scale-95"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`flex-1 px-6 py-3.5 rounded-xl font-semibold text-sm ${config.confirmClass} text-white transition-all duration-300 shadow-lg active:scale-95`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
