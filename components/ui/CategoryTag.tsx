interface CategoryTagProps {
    children: React.ReactNode;
    accent?: "pink" | "orange" | "white";
}

export default function CategoryTag({
    children,
    accent = "pink",
}: CategoryTagProps): React.ReactElement {
    const styles = {
        pink: "border-[#ff729f]/25 bg-[#ff729f]/10 text-[#ff729f]",
        orange: "border-[#ee8434]/25 bg-[#ee8434]/10 text-[#ee8434]",
        white: "border-white/10 bg-white/[0.03] text-white/45",
    };

    return (
        <span
            className={`inline-flex items-center border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] ${styles[accent]}`}
        >
            {children}
        </span>
    );
}