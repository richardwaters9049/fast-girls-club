const COUNTRY_FLAGS: Record<string, string> = {
  AUS: "🇦🇺",
  AUT: "🇦🇹",
  BEL: "🇧🇪",
  BRA: "🇧🇷",
  CAN: "🇨🇦",
  CHE: "🇨🇭",
  CHN: "🇨🇳",
  DEU: "🇩🇪",
  ESP: "🇪🇸",
  FRA: "🇫🇷",
  GBR: "🇬🇧",
  HUN: "🇭🇺",
  ITA: "🇮🇹",
  JPN: "🇯🇵",
  MEX: "🇲🇽",
  MCO: "🇲🇨",
  NLD: "🇳🇱",
  NZL: "🇳🇿",
  PRT: "🇵🇹",
  SGP: "🇸🇬",
  THA: "🇹🇭",
  USA: "🇺🇸",
};

export function countryCodeToEmoji(countryCode: string): string {
  if (!countryCode) {
    return "🏁";
  }

  const code = countryCode.trim().toUpperCase();

  return COUNTRY_FLAGS[code] ?? "🏁";
}

export function getCountryFlag(countryCode: string): string {
  return countryCodeToEmoji(countryCode);
}
