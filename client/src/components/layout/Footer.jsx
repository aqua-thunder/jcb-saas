export default function Footer() {
    return (
        <footer className="bg-white border-t border-slate-200 py-4 px-6 mt-auto">
            <div className="text-center text-sm text-slate-600">
                <p>
                    © 2026 <span className="font-bold text-[var(--color-primary)]">Trevita Infotech</span>.
                    Design by <a
                        href="https://trevitainfotech.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-[var(--color-primary)] hover:underline hover:text-orange-600 transition-colors cursor-pointer"
                    >
                        Trevita Infotech
                    </a>.
                </p>
            </div>
        </footer>
    );
}
