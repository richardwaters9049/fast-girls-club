export interface F1Race {
  round: number;
  name: string;
  circuit: string;
  location: string;
  country: string;
  countryCode: string;
  startDate: string;
  endDate: string;
}

export type F1Series = "f1" | "f2" | "f3";

export const f2Calendar: F1Race[] = [];

export const f3Calendar: F1Race[] = [];

export const seriesData: Record<
  F1Series,
  {
    label: string;
    fullLabel: string;
    calendar: F1Race[];
  }
> = {
  f1: {
    label: "F1",
    fullLabel: "Formula 1",
    calendar: [],
  },
  f2: {
    label: "F2",
    fullLabel: "Formula 2",
    calendar: f2Calendar,
  },
  f3: {
    label: "F3",
    fullLabel: "Formula 3",
    calendar: f3Calendar,
  },
};
