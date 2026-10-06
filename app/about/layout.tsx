import type { Metadata } from "next";
import { SITE_URL } from "@/lib/config";

export const metadata: Metadata = {
  title: "About",
  description: "Meet Fast Girls Club: motorsport stories, racing culture and a community putting women in motorsport front and centre.",
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: { title: "About Fast Girls Club", url: `${SITE_URL}/about` },
};

export default function AboutLayout({ children }: { children: React.ReactNode }): React.ReactNode {
  return children;
}
