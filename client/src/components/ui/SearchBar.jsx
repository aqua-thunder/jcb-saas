import { Search } from "lucide-react";

export default function SearchBar({
    value,
    onChange,
    placeholder = "Search...",
    className = ""
}) {
    return (
        <div className={`relative flex-1 max-w-md ${className}`}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-[var(--color-primary)] transition-all"
            />
        </div>
    );
}
