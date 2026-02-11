import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function Input({
    label,
    type = "text",
    name,
    value,
    onChange,
    placeholder,
    required = false,
    variant = "default",
    className = "",
    labelClassName = "",
    ...props
}) {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";

    const base =
        "w-full px-4 py-3 rounded-xl outline-none transition text-[var(--color-black)]";

    const variants = {
        default: `
      bg-[var(--bg-light)]
      border border-[var(--color-primary)]
      focus:border-[var(--color-primary)]
    `,
        outline: `
      bg-transparent
      border-2 border-[var(--color-primary)]
      focus:border-[var(--color-primary)]
    `,
        underline: `
      bg-transparent
      border-b-2 border-[var(--color-primary)]
      rounded-none px-0
      focus:border-[var(--color-primary)]
    `,
        invioceInput: `
        bg-[var(--bg-main)] border border-white/10 rounded-md px-4 text-[var(--text-primary)] outline-none
 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition
        `
    };

    return (
        <div className="space-y-2">
            {label && (
                <label className={`block text-sm font-semibold ${labelClassName || "text-[var(--text-secondary)]"}`}>
                    {label}
                </label>
            )}

            <div className="relative">
                <input
                    type={isPassword && showPassword ? "text" : type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    className={`
            ${base}
            ${variants[variant]}
            ${isPassword ? "pr-12" : ""}
            ${className}
          `}
                    {...props}
                />

                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="
                                absolute right-3 top-1/2 -translate-y-1/2
                                text-gray-500 hover:text-[var(--color-primary)]
                                transition
                                "
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                )}
            </div>
        </div>
    );
}
