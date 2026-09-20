const TEAM_COLOURS: Record<string, string> = {
  mercedes: "#27F4D2",
  ferrari: "#E80020",
  mclaren: "#FF8000",
  red_bull: "#3671C6",
  alpine: "#FF87BC",
  rb: "#6692FF",
  aston_martin: "#229971",
  haas: "#B6BABD",
  audi: "#F50537",
  williams: "#64C4FF",
  cadillac: "#D0D0D0",
};

const TEAM_LOGO_SLUGS: Record<string, string> = {
  mercedes: "mercedes",
  ferrari: "ferrari",
  mclaren: "mclaren",
  red_bull: "redbullracing",
  rb: "racingbulls",
  alpine: "alpine",
  haas: "haasf1team",
  audi: "audi",
  williams: "williams",
  aston_martin: "astonmartin",
  cadillac: "cadillac",
};

export function getTeamColour(teamId: string | null | undefined): string {
  return TEAM_COLOURS[teamId ?? ""] ?? "#FFFFFF";
}

export function getTeamLogoUrl(
  teamId: string | null | undefined,
  season: number,
): string | null {
  // Only use the season whose official assets have been verified.
  if (season !== 2026) {
    return null;
  }

  const slug = TEAM_LOGO_SLUGS[teamId ?? ""];

  if (!slug) {
    return null;
  }

  return `https://media.formula1.com/image/upload/c_fit,w_96,h_96/q_auto/v1740000001/common/f1/2026/${slug}/2026${slug}logowhite.webp`;
}
