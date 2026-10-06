import type { Metadata } from "next";
import { SITE_URL } from "@/lib/config";

export const metadata: Metadata = {
  title: "The Grid",
  alternates: { canonical: `${SITE_URL}/f1` },
  description: "Live timing, race weekends, calendars and championship standings from Formula 1.",
};

export default function F1Layout({ children }: { children: React.ReactNode }): React.ReactNode {
  return children;
}
