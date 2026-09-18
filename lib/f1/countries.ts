const ALPHA_3_TO_2: Record<string, string> = {
  AUS: "AU",
  AUT: "AT",
  BEL: "BE",
  BRA: "BR",
  CAN: "CA",
  CHE: "CH",
  CHN: "CN",
  DEU: "DE",
  DNK: "DK",
  ESP: "ES",
  FIN: "FI",
  FRA: "FR",
  GBR: "GB",
  HUN: "HU",
  ITA: "IT",
  JPN: "JP",
  MEX: "MX",
  MCO: "MC",
  NLD: "NL",
  NZL: "NZ",
  POL: "PL",
  PRT: "PT",
  QAT: "QA",
  SGP: "SG",
  THA: "TH",
  UAE: "AE",
  USA: "US",
};

const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  Argentina: "AR",
  Australia: "AU",
  Austria: "AT",
  Azerbaijan: "AZ",
  Belgium: "BE",
  Brazil: "BR",
  Canada: "CA",
  China: "CN",
  Denmark: "DK",
  Finland: "FI",
  France: "FR",
  Germany: "DE",
  "Great Britain": "GB",
  Hungary: "HU",
  Italy: "IT",
  Japan: "JP",
  Mexico: "MX",
  Monaco: "MC",
  Netherlands: "NL",
  "New Zealand": "NZ",
  Poland: "PL",
  Portugal: "PT",
  Qatar: "QA",
  "Saudi Arabia": "SA",
  Singapore: "SG",
  Spain: "ES",
  Thailand: "TH",
  "United Arab Emirates": "AE",
  "United Kingdom": "GB",
  "United States": "US",
};

function alpha2ToEmoji(code: string): string {
  return String.fromCodePoint(
    ...code.split("").map((character) => 127397 + character.charCodeAt(0)),
  );
}

export function countryCodeToEmoji(countryCode: string): string {
  if (!countryCode) {
    return "🏁";
  }

  const suppliedCode = countryCode.trim().toUpperCase();
  const code =
    suppliedCode.length === 3
      ? ALPHA_3_TO_2[suppliedCode]
      : suppliedCode;

  return code && /^[A-Z]{2}$/.test(code) ? alpha2ToEmoji(code) : "🏁";
}

export function getCountryFlag(countryCode: string): string {
  return countryCodeToEmoji(countryCode);
}

export function countryNameToCode(country: string): string {
  return COUNTRY_NAME_TO_CODE[country.trim()] ?? "";
}
