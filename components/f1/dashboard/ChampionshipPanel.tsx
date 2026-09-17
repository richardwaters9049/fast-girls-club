import AnimatedSection from "@/components/ui/AnimatedSection";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";

import ConstructorStandings from "../ConstructorStandings";
import DriverStandings from "../DriverStandings";

type ChampionshipPanelProps = {
    initialView?: "drivers" | "teams";
};

export default function ChampionshipPanel({
    initialView = "drivers",
}: ChampionshipPanelProps): React.ReactElement {
    const isTeams = initialView === "teams";

    return (
        <Container
            size="wide"
            className="py-8 md:py-12"
        >
            <AnimatedSection>
                <SectionHeading
                    eyebrow="Championship"
                    title={isTeams ? "Teams" : "Drivers"}
                    description="Explore the current championship order. Each classification has its own paginated table."
                />

                <div className="mt-8 grid items-start gap-6 lg:grid-cols-2">
                    <section className="border border-white/10 bg-white/[0.025] p-5 md:p-7">
                        <SectionHeading
                            eyebrow="Drivers"
                            title="Driver championship"
                            description="Driver points and championship positions."
                            accent="orange"
                        />

                        <div className="mt-7">
                            <DriverStandings />
                        </div>
                    </section>

                    <section className="border border-white/10 bg-white/[0.025] p-5 md:p-7">
                        <SectionHeading
                            eyebrow="Constructors"
                            title="Team championship"
                            description="Constructor points and championship positions."
                        />

                        <div className="mt-7">
                            <ConstructorStandings />
                        </div>
                    </section>
                </div>
            </AnimatedSection>
        </Container>
    );
}