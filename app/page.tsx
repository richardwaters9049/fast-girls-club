"use client";

import dynamic from "next/dynamic";

const Scene = dynamic(
  () => import("@/components/3d/Scene"),
  {
    ssr: false,
  },
);

export default function Home(): React.ReactElement {
  return (
    <main className="relative h-screen w-full bg-black">
      <Scene />
    </main>
  );
}