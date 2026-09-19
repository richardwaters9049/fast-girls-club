export interface CircuitPoint {
  x: number;
  y: number;
}

export interface CircuitMapData {
  id: string;
  name: string;
  location: string;
  country: string;
  countryCode: string;
  points: CircuitPoint[];
}

const AUSTRALIA: CircuitMapData = {
  id: "albert-park",
  name: "Albert Park Circuit",
  location: "Melbourne",
  country: "Australia",
  countryCode: "AU",
  points: [
    { x: -4.8, y: 1.2 },
    { x: -3.4, y: 3.8 },
    { x: -0.8, y: 4.8 },
    { x: 2.5, y: 4.2 },
    { x: 4.7, y: 2.4 },
    { x: 4.1, y: -0.2 },
    { x: 2.8, y: -2.6 },
    { x: 0.2, y: -3.8 },
    { x: -2.8, y: -3.2 },
    { x: -4.5, y: -1.4 },
  ],
};

const JAPAN: CircuitMapData = {
  id: "suzuka",
  name: "Suzuka Circuit",
  location: "Suzuka",
  country: "Japan",
  countryCode: "JP",
  points: [
    { x: -4.8, y: 1.4 },
    { x: -3.8, y: 3.5 },
    { x: -1.6, y: 4.6 },
    { x: 0.4, y: 3.6 },
    { x: 1.6, y: 1.4 },
    { x: 0.8, y: -0.2 },
    { x: -1.2, y: -1.0 },
    { x: -0.2, y: -2.6 },
    { x: 2.4, y: -3.6 },
    { x: 4.7, y: -2.4 },
    { x: 4.2, y: 0.2 },
    { x: 2.8, y: 2.4 },
    { x: 4.6, y: 4.2 },
  ],
};

// Simplified centreline sampled from Firkin's CC0 Sepang circuit diagram:
// https://commons.wikimedia.org/wiki/File:F1_circuits_2014-2018_-_Sepang_International_Circuit_(version_2).svg
const MALAYSIA: CircuitMapData = {
  id: "sepang",
  name: "Sepang International Circuit",
  location: "Kuala Lumpur",
  country: "Malaysia",
  countryCode: "MY",
  points: [
    { x: -0.43, y: 4.07 },
    { x: -1.35, y: 3.74 },
    { x: -2.25, y: 3.37 },
    { x: -3.17, y: 3.05 },
    { x: -4.06, y: 2.68 },
    { x: -4.63, y: 1.91 },
    { x: -4.7, y: 0.94 },
    { x: -4.24, y: 0.1 },
    { x: -5, y: -0.01 },
    { x: -4.82, y: -0.64 },
    { x: -3.85, y: -0.59 },
    { x: -2.88, y: -0.5 },
    { x: -1.9, y: -0.42 },
    { x: -0.93, y: -0.34 },
    { x: 0.04, y: -0.26 },
    { x: 1.01, y: -0.19 },
    { x: 1.98, y: -0.11 },
    { x: 2.95, y: -0.04 },
    { x: 3.55, y: -0.47 },
    { x: 2.63, y: -0.73 },
    { x: 1.67, y: -0.91 },
    { x: 0.72, y: -1.08 },
    { x: -0.24, y: -1.26 },
    { x: -1.2, y: -1.43 },
    { x: -2.16, y: -1.6 },
    { x: -3.12, y: -1.78 },
    { x: -4.07, y: -1.98 },
    { x: -3.88, y: -2.78 },
    { x: -2.98, y: -3.08 },
    { x: -2.07, y: -2.74 },
    { x: -1.19, y: -2.83 },
    { x: -0.44, y: -3.45 },
    { x: 0.31, y: -4.07 },
    { x: 1.06, y: -3.9 },
    { x: 1.35, y: -2.98 },
    { x: 0.92, y: -2.17 },
    { x: 0.67, y: -1.62 },
    { x: 1.64, y: -1.48 },
    { x: 2.61, y: -1.39 },
    { x: 3.58, y: -1.32 },
    { x: 4.55, y: -1.23 },
    { x: 5, y: -0.4 },
    { x: 4.43, y: 0.38 },
    { x: 3.79, y: 1.11 },
    { x: 3.13, y: 1.82 },
    { x: 2.2, y: 1.84 },
    { x: 1.43, y: 1.26 },
    { x: 0.51, y: 1.41 },
    { x: 0.08, y: 2.25 },
    { x: -0.12, y: 3.21 },
  ],
};

const BAHRAIN: CircuitMapData = {
  id: "bahrain",
  name: "Bahrain International Circuit",
  location: "Sakhir",
  country: "Bahrain",
  countryCode: "BH",
  points: [
    { x: -4.8, y: 1.8 },
    { x: -2.8, y: 3.8 },
    { x: 0.8, y: 4.2 },
    { x: 3.8, y: 3.2 },
    { x: 4.7, y: 1.0 },
    { x: 3.0, y: -0.2 },
    { x: 1.0, y: 0.8 },
    { x: -0.8, y: -1.0 },
    { x: 0.6, y: -2.8 },
    { x: 3.8, y: -3.6 },
    { x: 4.6, y: -1.8 },
    { x: 2.0, y: -0.8 },
    { x: -1.8, y: -3.8 },
    { x: -4.4, y: -2.2 },
  ],
};

const SAUDI_ARABIA: CircuitMapData = {
  id: "jeddah",
  name: "Jeddah Corniche Circuit",
  location: "Jeddah",
  country: "Saudi Arabia",
  countryCode: "SA",
  points: [
    { x: -5.0, y: 3.8 },
    { x: -1.4, y: 4.4 },
    { x: 3.8, y: 4.0 },
    { x: 4.8, y: 1.6 },
    { x: 2.8, y: 0.6 },
    { x: 4.6, y: -1.8 },
    { x: 3.4, y: -4.0 },
    { x: -0.4, y: -4.4 },
    { x: -4.4, y: -3.2 },
    { x: -3.2, y: -1.0 },
    { x: -4.8, y: 1.2 },
  ],
};

const USA_MIAMI: CircuitMapData = {
  id: "miami",
  name: "Miami International Autodrome",
  location: "Miami",
  country: "United States",
  countryCode: "US",
  points: [
    { x: -4.8, y: 3.4 },
    { x: -1.8, y: 4.0 },
    { x: 2.4, y: 3.8 },
    { x: 4.5, y: 2.0 },
    { x: 3.6, y: 0.2 },
    { x: 1.4, y: -0.4 },
    { x: 4.0, y: -2.4 },
    { x: 2.8, y: -4.0 },
    { x: -0.8, y: -3.8 },
    { x: -3.8, y: -2.8 },
    { x: -4.6, y: -0.8 },
    { x: -2.6, y: 0.4 },
  ],
};

const ITALY: CircuitMapData = {
  id: "monza",
  name: "Autodromo Nazionale Monza",
  location: "Monza",
  country: "Italy",
  countryCode: "IT",
  points: [
    { x: -4.8, y: 2.8 },
    { x: -2.2, y: 4.0 },
    { x: 1.4, y: 4.2 },
    { x: 4.5, y: 2.6 },
    { x: 4.8, y: 0.6 },
    { x: 2.8, y: -0.6 },
    { x: 1.0, y: -2.6 },
    { x: 3.4, y: -3.8 },
    { x: 0.4, y: -4.0 },
    { x: -2.6, y: -3.2 },
    { x: -4.4, y: -1.2 },
    { x: -2.2, y: 0.4 },
  ],
};

const CANADA: CircuitMapData = {
  id: "montreal",
  name: "Circuit Gilles-Villeneuve",
  location: "Montreal",
  country: "Canada",
  countryCode: "CA",
  points: [
    { x: -4.8, y: 2.8 },
    { x: -2.2, y: 4.0 },
    { x: 1.8, y: 3.8 },
    { x: 4.7, y: 2.0 },
    { x: 3.6, y: 0.2 },
    { x: 4.4, y: -2.4 },
    { x: 1.8, y: -3.8 },
    { x: -1.8, y: -3.6 },
    { x: -4.6, y: -2.0 },
    { x: -3.2, y: 0.0 },
  ],
};

const SPAIN: CircuitMapData = {
  id: "barcelona",
  name: "Circuit de Barcelona-Catalunya",
  location: "Barcelona",
  country: "Spain",
  countryCode: "ES",
  points: [
    { x: -4.8, y: 2.2 },
    { x: -3.2, y: 4.0 },
    { x: 0.0, y: 4.4 },
    { x: 3.2, y: 3.6 },
    { x: 4.7, y: 1.2 },
    { x: 3.8, y: -1.2 },
    { x: 1.8, y: -3.6 },
    { x: -1.2, y: -4.0 },
    { x: -4.0, y: -2.8 },
    { x: -3.8, y: -0.4 },
    { x: -2.0, y: 0.8 },
  ],
};

const AUSTRIA: CircuitMapData = {
  id: "spielberg",
  name: "Red Bull Ring",
  location: "Spielberg",
  country: "Austria",
  countryCode: "AT",
  points: [
    { x: -4.8, y: 2.0 },
    { x: -2.8, y: 3.8 },
    { x: 0.8, y: 4.4 },
    { x: 3.8, y: 3.0 },
    { x: 4.6, y: 0.8 },
    { x: 2.6, y: -0.8 },
    { x: 4.2, y: -2.8 },
    { x: 1.6, y: -4.0 },
    { x: -1.8, y: -3.2 },
    { x: -4.4, y: -1.8 },
  ],
};

const GREAT_BRITAIN: CircuitMapData = {
  id: "silverstone",
  name: "Silverstone Circuit",
  location: "Silverstone",
  country: "United Kingdom",
  countryCode: "GB",
  points: [
    { x: -4.8, y: 2.8 },
    { x: -2.2, y: 4.2 },
    { x: 1.4, y: 4.0 },
    { x: 4.5, y: 2.0 },
    { x: 3.8, y: -0.2 },
    { x: 1.8, y: -1.8 },
    { x: 4.0, y: -3.4 },
    { x: 0.8, y: -4.0 },
    { x: -2.8, y: -3.6 },
    { x: -4.7, y: -1.8 },
    { x: -2.8, y: -0.4 },
    { x: -4.4, y: 0.8 },
  ],
};

const BELGIUM: CircuitMapData = {
  id: "spa",
  name: "Circuit de Spa-Francorchamps",
  location: "Spa",
  country: "Belgium",
  countryCode: "BE",
  points: [
    { x: -4.6, y: 3.6 },
    { x: -1.8, y: 4.2 },
    { x: 0.6, y: 3.0 },
    { x: 3.8, y: 3.6 },
    { x: 4.8, y: 1.0 },
    { x: 3.0, y: -0.4 },
    { x: 4.0, y: -3.2 },
    { x: 1.0, y: -4.0 },
    { x: -1.8, y: -2.8 },
    { x: -4.4, y: -3.4 },
    { x: -3.4, y: -0.8 },
    { x: -4.8, y: 1.2 },
  ],
};

const HUNGARY: CircuitMapData = {
  id: "hungaroring",
  name: "Hungaroring",
  location: "Mogyorod",
  country: "Hungary",
  countryCode: "HU",
  points: [
    { x: -4.4, y: 2.6 },
    { x: -2.0, y: 4.0 },
    { x: 1.4, y: 4.0 },
    { x: 4.2, y: 2.4 },
    { x: 4.6, y: 0.2 },
    { x: 2.8, y: -1.6 },
    { x: 4.0, y: -3.2 },
    { x: 1.0, y: -4.0 },
    { x: -2.8, y: -3.2 },
    { x: -4.6, y: -1.0 },
    { x: -2.8, y: 0.6 },
  ],
};

const NETHERLANDS: CircuitMapData = {
  id: "zandvoort",
  name: "Circuit Zandvoort",
  location: "Zandvoort",
  country: "Netherlands",
  countryCode: "NL",
  points: [
    { x: -4.6, y: 2.0 },
    { x: -2.8, y: 4.0 },
    { x: 0.6, y: 4.2 },
    { x: 3.8, y: 2.8 },
    { x: 4.6, y: 0.4 },
    { x: 3.0, y: -1.2 },
    { x: 4.0, y: -3.2 },
    { x: 1.2, y: -4.0 },
    { x: -2.2, y: -3.4 },
    { x: -4.6, y: -1.4 },
    { x: -2.6, y: 0.2 },
  ],
};

const AZERBAIJAN: CircuitMapData = {
  id: "baku",
  name: "Baku City Circuit",
  location: "Baku",
  country: "Azerbaijan",
  countryCode: "AZ",
  points: [
    { x: -4.8, y: 3.8 },
    { x: -1.2, y: 4.0 },
    { x: 3.8, y: 3.6 },
    { x: 4.6, y: 1.4 },
    { x: 2.8, y: 0.0 },
    { x: 4.4, y: -2.8 },
    { x: 2.0, y: -4.0 },
    { x: -2.0, y: -3.6 },
    { x: -4.6, y: -1.6 },
    { x: -3.0, y: 0.4 },
  ],
};

const SINGAPORE: CircuitMapData = {
  id: "singapore",
  name: "Marina Bay Street Circuit",
  location: "Singapore",
  country: "Singapore",
  countryCode: "SG",
  points: [
    { x: -4.6, y: 3.6 },
    { x: -1.6, y: 4.2 },
    { x: 2.2, y: 3.8 },
    { x: 4.6, y: 2.0 },
    { x: 3.8, y: 0.0 },
    { x: 1.8, y: -1.2 },
    { x: 4.2, y: -2.8 },
    { x: 2.2, y: -4.0 },
    { x: -1.0, y: -3.6 },
    { x: -4.4, y: -2.6 },
    { x: -3.4, y: -0.4 },
    { x: -1.8, y: 0.8 },
  ],
};

const UNITED_STATES: CircuitMapData = {
  id: "austin",
  name: "Circuit of the Americas",
  location: "Austin",
  country: "United States",
  countryCode: "US",
  points: [
    { x: -4.6, y: 3.6 },
    { x: -1.6, y: 4.4 },
    { x: 1.8, y: 3.8 },
    { x: 4.6, y: 2.0 },
    { x: 3.8, y: 0.2 },
    { x: 1.4, y: -0.8 },
    { x: 3.8, y: -3.2 },
    { x: 1.0, y: -4.2 },
    { x: -2.4, y: -3.4 },
    { x: -4.6, y: -1.6 },
    { x: -2.8, y: 0.2 },
    { x: -4.8, y: 1.4 },
  ],
};

const MEXICO: CircuitMapData = {
  id: "mexico-city",
  name: "Autodromo Hermanos Rodriguez",
  location: "Mexico City",
  country: "Mexico",
  countryCode: "MX",
  points: [
    { x: -4.6, y: 2.4 },
    { x: -2.8, y: 4.0 },
    { x: 0.8, y: 4.2 },
    { x: 4.2, y: 2.8 },
    { x: 4.6, y: 0.6 },
    { x: 2.8, y: -0.4 },
    { x: 4.0, y: -2.8 },
    { x: 1.4, y: -4.0 },
    { x: -1.8, y: -3.2 },
    { x: -4.6, y: -2.0 },
    { x: -3.2, y: 0.0 },
  ],
};

const BRAZIL: CircuitMapData = {
  id: "interlagos",
  name: "Interlagos",
  location: "Sao Paulo",
  country: "Brazil",
  countryCode: "BR",
  points: [
    { x: -4.8, y: 2.6 },
    { x: -2.6, y: 4.0 },
    { x: 0.8, y: 4.2 },
    { x: 4.2, y: 2.4 },
    { x: 4.6, y: 0.0 },
    { x: 2.4, y: -1.0 },
    { x: 3.8, y: -3.4 },
    { x: 0.8, y: -4.0 },
    { x: -2.6, y: -3.2 },
    { x: -4.6, y: -1.4 },
    { x: -2.8, y: 0.2 },
  ],
};

const LAS_VEGAS: CircuitMapData = {
  id: "las-vegas",
  name: "Las Vegas Strip Circuit",
  location: "Las Vegas",
  country: "United States",
  countryCode: "US",
  points: [
    { x: -4.8, y: 3.8 },
    { x: -0.8, y: 4.2 },
    { x: 3.8, y: 3.6 },
    { x: 4.6, y: 1.0 },
    { x: 2.8, y: -0.4 },
    { x: 4.2, y: -2.8 },
    { x: 1.4, y: -4.0 },
    { x: -2.8, y: -3.6 },
    { x: -4.6, y: -1.6 },
    { x: -3.0, y: 0.6 },
  ],
};

const QATAR: CircuitMapData = {
  id: "lusail",
  name: "Lusail International Circuit",
  location: "Lusail",
  country: "Qatar",
  countryCode: "QA",
  points: [
    { x: -4.6, y: 2.8 },
    { x: -2.0, y: 4.2 },
    { x: 1.8, y: 4.0 },
    { x: 4.6, y: 2.2 },
    { x: 3.8, y: 0.0 },
    { x: 2.0, y: -1.4 },
    { x: 4.2, y: -3.2 },
    { x: 1.0, y: -4.0 },
    { x: -2.6, y: -3.4 },
    { x: -4.6, y: -1.6 },
    { x: -2.8, y: 0.2 },
  ],
};

const ABU_DHABI: CircuitMapData = {
  id: "yas-marina",
  name: "Yas Marina Circuit",
  location: "Abu Dhabi",
  country: "United Arab Emirates",
  countryCode: "AE",
  points: [
    { x: -4.8, y: 2.8 },
    { x: -2.2, y: 4.0 },
    { x: 1.6, y: 4.2 },
    { x: 4.6, y: 2.4 },
    { x: 3.8, y: 0.4 },
    { x: 1.8, y: -0.6 },
    { x: 4.2, y: -2.8 },
    { x: 1.2, y: -4.0 },
    { x: -2.2, y: -3.6 },
    { x: -4.6, y: -1.8 },
    { x: -3.0, y: 0.0 },
  ],
};

const MONACO: CircuitMapData = {
  id: "monaco",
  name: "Circuit de Monaco",
  location: "Monte Carlo",
  country: "Monaco",
  countryCode: "MC",
  points: [
    { x: -4.8, y: 2.6 },
    { x: -2.8, y: 4.0 },
    { x: 0.8, y: 4.2 },
    { x: 4.4, y: 2.8 },
    { x: 4.8, y: 0.8 },
    { x: 3.2, y: -0.4 },
    { x: 4.2, y: -2.6 },
    { x: 1.8, y: -4.0 },
    { x: -1.4, y: -3.4 },
    { x: -4.4, y: -2.2 },
    { x: -3.2, y: -0.2 },
    { x: -4.8, y: 0.8 },
  ],
};

const CHINA: CircuitMapData = {
  id: "shanghai",
  name: "Shanghai International Circuit",
  location: "Shanghai",
  country: "China",
  countryCode: "CN",
  points: [
    { x: -4.6, y: 2.4 },
    { x: -2.6, y: 4.0 },
    { x: 0.8, y: 4.2 },
    { x: 4.4, y: 2.8 },
    { x: 4.8, y: 0.4 },
    { x: 2.8, y: -0.8 },
    { x: 4.0, y: -3.0 },
    { x: 0.8, y: -4.0 },
    { x: -2.8, y: -3.2 },
    { x: -4.6, y: -1.2 },
    { x: -2.4, y: 0.2 },
  ],
};

const PORTUGAL: CircuitMapData = {
  id: "portimao",
  name: "Autodromo Internacional do Algarve",
  location: "Portimao",
  country: "Portugal",
  countryCode: "PT",
  points: [
    { x: -4.6, y: 2.8 },
    { x: -2.0, y: 4.0 },
    { x: 1.8, y: 4.2 },
    { x: 4.6, y: 2.0 },
    { x: 3.6, y: -0.2 },
    { x: 4.2, y: -2.8 },
    { x: 1.0, y: -4.0 },
    { x: -2.6, y: -3.4 },
    { x: -4.6, y: -1.6 },
    { x: -2.8, y: 0.2 },
  ],
};

const CIRCUITS: Record<string, CircuitMapData> = {
  "albert-park": AUSTRALIA,
  australia: AUSTRALIA,
  melbourne: AUSTRALIA,
  "melbourne-grand-prix": AUSTRALIA,

  suzuka: JAPAN,
  japan: JAPAN,

  bahrain: BAHRAIN,
  sakhir: BAHRAIN,

  jeddah: SAUDI_ARABIA,
  "jeddah-corniche": SAUDI_ARABIA,
  "saudi-arabia": SAUDI_ARABIA,

  miami: USA_MIAMI,
  "miami-international-autodrome": USA_MIAMI,

  monza: ITALY,
  italy: ITALY,
  "italian-grand-prix": ITALY,

  montreal: CANADA,
  canada: CANADA,
  "circuit-gilles-villeneuve": CANADA,

  barcelona: SPAIN,
  spain: SPAIN,
  catalunya: SPAIN,

  spielberg: AUSTRIA,
  austria: AUSTRIA,
  "red-bull-ring": AUSTRIA,

  silverstone: GREAT_BRITAIN,
  "great-britain": GREAT_BRITAIN,
  "united-kingdom": GREAT_BRITAIN,
  britain: GREAT_BRITAIN,

  spa: BELGIUM,
  belgium: BELGIUM,
  "spa-francorchamps": BELGIUM,

  hungaroring: HUNGARY,
  hungary: HUNGARY,

  zandvoort: NETHERLANDS,
  netherlands: NETHERLANDS,
  dutch: NETHERLANDS,

  baku: AZERBAIJAN,
  azerbaijan: AZERBAIJAN,

  singapore: SINGAPORE,
  "marina-bay": SINGAPORE,

  austin: UNITED_STATES,
  cota: UNITED_STATES,
  "circuit-of-the-americas": UNITED_STATES,
  "united-states": UNITED_STATES,

  "mexico-city": MEXICO,
  mexico: MEXICO,

  interlagos: BRAZIL,
  brazil: BRAZIL,
  "sao-paulo": BRAZIL,

  "las-vegas": LAS_VEGAS,
  vegas: LAS_VEGAS,

  lusail: QATAR,
  qatar: QATAR,

  "yas-marina": ABU_DHABI,
  "abu-dhabi": ABU_DHABI,

  sepang: MALAYSIA,
  malaysia: MALAYSIA,

  monaco: MONACO,
  "monte-carlo": MONACO,

  shanghai: CHINA,
  china: CHINA,

  portimao: PORTUGAL,
  portugal: PORTUGAL,
};

export function getCircuitMap(
  ...identifiers: (string | null | undefined)[]
): CircuitMapData | null {
  for (const identifier of identifiers) {
    if (!identifier) continue;

    const normalised = identifier
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const circuit =
      CIRCUITS[normalised] ??
      Object.values(CIRCUITS).find(
        (candidate) =>
          candidate.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-") === normalised,
      );

    if (circuit) return circuit;
  }

  return null;
}

export function getAvailableCircuits(): CircuitMapData[] {
  return [
    AUSTRALIA,
    MALAYSIA,
    BAHRAIN,
    SAUDI_ARABIA,
    JAPAN,
    USA_MIAMI,
    CANADA,
    MONACO,
    SPAIN,
    AUSTRIA,
    GREAT_BRITAIN,
    BELGIUM,
    HUNGARY,
    NETHERLANDS,
    ITALY,
    AZERBAIJAN,
    SINGAPORE,
    UNITED_STATES,
    MEXICO,
    BRAZIL,
    LAS_VEGAS,
    QATAR,
    ABU_DHABI,
    CHINA,
    PORTUGAL,
  ];
}
