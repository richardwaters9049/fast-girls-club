import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Grid",
  description: "Live timing, race weekends, calendars and championship standings from Formula 1.",
};

export default function F1Layout({ children }: { children: React.ReactNode }): React.ReactNode {
  return children;
}
