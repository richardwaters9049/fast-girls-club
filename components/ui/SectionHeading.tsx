import type { ReactNode } from "react";

interface SectionHeadingProps {
    eyebrow: string;
    title: string;
    description?: string;
    action?: ReactNode;
    accent?: "pink" | "orange";
}

export default function SectionHeading({
    eyebrow,
    title,
    description,
    action,
    accent = "pink",
}: SectionHeadingProps): React.ReactElement {
    return (
        <div className="mb-6 flex flex-col gap-5 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
                <p
                    className={`text-[10px] font-bold uppercase tracking-[0.24em] ${accent === "orange"
                        ? "text-[#ee8434]"
                        : "text-[#ff729f]"
                        }`}
                >
                    {eyebrow}
                </p>

                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
                    {title}
                </h2>

                {description && (
                    <p className="mt-2 text-sm leading-6 text-white/40">
                        {description}
                    </p>
                )}
            </div>

            {action && <div className="shrink-0">{action}</div>}
        </div>
    );
}