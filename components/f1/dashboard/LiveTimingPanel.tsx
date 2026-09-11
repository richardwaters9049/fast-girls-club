import AnimatedSection from "@/components/ui/AnimatedSection";
import CategoryTag from "@/components/ui/CategoryTag";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";

import LiveTiming from "../LiveTiming";

import type { F1LiveResponse } from "@/lib/f1/types";

interface LiveTimingPanelProps {
    data: F1LiveResponse | null;
    loading: boolean;
    error: string | null;
}

export default function LiveTimingPanel({
    data,
    loading,
    error,
}: LiveTimingPanelProps): React.ReactElement {
    const isLive =
        data?.isLive ?? false;

    return (
        <Container
            size="wide"
            className="h-full py-5 md:py-6"
        >
            <AnimatedSection className="flex h-full flex-col overflow-hidden">
                <SectionHeading
                    eyebrow="Live data"
                    title="Live timing"
                    description="Five drivers per page. Switch pages without leaving the dashboard."
                    action={
                        <CategoryTag
                            accent={
                                isLive
                                    ? "pink"
                                    : "white"
                            }
                        >
                            {isLive
                                ? "Live"
                                : "Ready"}
                        </CategoryTag>
                    }
                />

                <div className="min-h-0 flex-1 overflow-hidden">
                    <LiveTiming
                        data={data}
                        loading={loading}
                        error={error}
                    />
                </div>
            </AnimatedSection>
        </Container>
    );
}