import React, { useEffect, useState } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

const Toast = ({ message, type = "success", duration = 3000, onClose }) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(onClose, 300); // Match animation duration
    };

    const icons = {
        success: <CheckCircle className="w-5 h-5 text-white" />,
        error: <AlertCircle className="w-5 h-5 text-white" />,
        warning: <AlertTriangle className="w-5 h-5 text-white" />,
        info: <Info className="w-5 h-5 text-white" />,
    };

    const colors = {
        success: "border-green-500/20 bg-green-500",
        error: "border-red-500/20 bg-red-500",
        warning: "border-orange-500/20 bg-orange-500",
        info: "border-blue-500/20 bg-blue-500",
    };

    return (
        <div
            className={`
        flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl
        min-w-[300px] max-w-md transition-all duration-300 transform
        ${colors[type]}
        ${isExiting ? "translate-x-full opacity-0" : "translate-x-0 opacity-100"}
        animate-in fade-in slide-in-from-right-8
      `}
        >
            <div className="flex-shrink-0">{icons[type]}</div>
            <div className="flex-1 text-sm font-medium text-white">{message}</div>
            <button
                onClick={handleClose}
                className="flex-shrink-0 p-1 rounded-lg hover:bg-white/10 text-white hover:text-white transition-colors"
            >
                <X size={16} />
            </button>
        </div>
    );
};

export default Toast;
