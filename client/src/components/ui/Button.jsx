import React from "react";

export default function Button({
    children,
    type = "secondary",
    htmlType = "button",
    onClick,
    disabled = false,
    className = "",
}) {
    const baseClasses = `
    inline-flex items-center justify-center gap-2
    px-7 py-3 rounded-xl
    font-medium tracking-wide
    transition-all duration-300
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

    const styles = {
        primary: `
    bg-[var(--color-primary)] text-[var(--color-white)]
    hover:bg-[var(--color-primary)]

    transform transition-all duration-300 ease-out
    hover:-translate-y-0.5 hover:shadow-lg
    active:translate-y-0 active:shadow-md

    focus:ring-2 focus:ring-[var(--color-primary)]
  `,

        secondary: `
    bg-transparent text-[var(--color-primary)]
    border border-[var(--color-primary)]

    transform transition-all duration-300 ease-out
    hover:border-[var(--color-primary)]
    hover:text-[var(--color-primary)]
    hover:-translate-y-0.5 hover:shadow-md

    active:translate-y-0
    focus:ring-2 focus:ring-[var(--color-primary)]
  `,
        addbtn: `
  text-xs font-semibold uppercase tracking-wider
  bg-transparent text-[var(--color-primary)]
  border border-[var(--color-primary)] rounded-md
  px-3 py-1.5

  transform transition-all duration-300 ease-out
  hover:bg-[var(--color-primary)] hover:text-[var(--color-white)]
  hover:-translate-y-1 hover:shadow-lg

  active:translate-y-0 active:shadow-md
  focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]
`,
        savebtn: `
  text-xs font-semibold uppercase tracking-wider
  bg-transparent text-green-600
  border border-green-600 rounded-md
  px-3 py-1.5

  transform transition-all duration-300 ease-out
  hover:bg-green-600 hover:text-white
  hover:-translate-y-1 hover:shadow-lg

  active:translate-y-0 active:shadow-md
  focus:outline-none focus:ring-2 focus:ring-green-500
`,
        danger: `
        bg-red-500/10 text-red-500
        border border-red-500/20
        
        hover:bg-red-500 hover:text-white
        hover:-translate-y-0.5 hover:shadow-lg
        active:translate-y-0
        focus:ring-2 focus:ring-red-500
        `,
        downloadbtn: `
  text-xs font-semibold uppercase tracking-wider
  bg-transparent text-blue-500
  border border-blue-500 rounded-md
  px-3 py-1.5

  transform transition-all duration-300 ease-out
  hover:bg-blue-500 hover:text-white
  hover:-translate-y-1 hover:shadow-lg

  active:translate-y-0 active:shadow-md
  focus:outline-none focus:ring-2 focus:ring-blue-500
`
    };


    return (
        <button
            type={htmlType}
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${styles[type]} ${className}`}
        >
            {children}
        </button>
    );
}
