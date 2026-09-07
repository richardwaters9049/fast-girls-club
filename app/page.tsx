import Link from "next/link";

import HeroScene from "@/components/3d/HeroScene";

// import { Container } from "@/components/ui/Container";
// import { SectionHeading } from "@/components/ui/SectionHeading";

interface Story {
  title: string;
  category: string;
  image: string;
  href: string;
}

interface NewsItem {
  title: string;
  category: string;
  date: string;
  href: string;
}

const stories: Story[] = [
  {
    title: "Everything you need to know ahead of the next race weekend",
    category: "Formula 1",
    image: "/images/story-1.jpg",
    href: "/formula-1",
  },
  {
    title: "The women making their mark on the racing world",
    category: "Women in Motorsport",
    image: "/images/story-2.jpg",
    href: "/stories",
  },
  {
    title: "Your guide to the drivers, teams and championships",
    category: "Grid Guide",
    image: "/images/story-3.jpg",
    href: "/grid-guide",
  },
];

const latestNews: NewsItem[] = [
  {
    title: "The latest news from the world of Formula 1",
    category: "Formula 1",
    date: "7 September 2026",
    href: "/category/formula-1",
  },
  {
    title: "What happened on the grid this week?",
    category: "Motorsport",
    date: "6 September 2026",
    href: "/stories",
  },
  {
    title: "Meet the women behind the wheel",
    category: "Women in Motorsport",
    date: "5 September 2026",
    href: "/stories",
  },
];

export default function HomePage(): React.ReactElement {
  return (
    <main className="overflow-hidden bg-white text-black">
      {/* Hero */}
      <section className="border-b border-black/10">
        {/* <Container> */}

        <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex items-center px-6 py-16 sm:px-10 md:py-24 lg:px-16 lg:py-32">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff729f]" />

                <p className="text-xs font-bold uppercase tracking-[0.3em]">
                  Fast Girls Club
                </p>
              </div>

              <h1 className="mt-7 text-[clamp(3.5rem,8vw,8rem)] font-black uppercase leading-[0.82] tracking-[-0.065em]">
                Women.
                <br />
                <span className="text-[#ff729f]">Motorsport.</span>
                <br />
                Racing.
              </h1>

              <p className="mt-8 max-w-xl text-base leading-7 text-black/70 sm:text-lg">
                Women in motorsport, racing news and the grid guide.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  href="/latest-news"
                  className="rounded-full bg-[#ff729f] px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-black transition-all duration-200 hover:-translate-y-1 hover:bg-black hover:text-white"
                >
                  Latest news
                </Link>

                <Link
                  href="/grid-guide"
                  className="rounded-full border border-black px-7 py-3.5 text-sm font-bold uppercase tracking-wide transition-all duration-200 hover:-translate-y-1 hover:border-[#ff729f] hover:bg-[#ff729f]"
                >
                  Grid guide
                </Link>
              </div>

              <div className="mt-12 flex flex-wrap gap-5 border-t border-black/10 pt-5">
                <Link
                  href="/category/formula-1"
                  className="text-xs font-bold uppercase tracking-[0.18em] transition-colors hover:text-[#ff729f]"
                >
                  F1
                </Link>

                <Link
                  href="/category/formula-2"
                  className="text-xs font-bold uppercase tracking-[0.18em] transition-colors hover:text-[#ff729f]"
                >
                  F2
                </Link>

                <Link
                  href="/category/formula-3"
                  className="text-xs font-bold uppercase tracking-[0.18em] transition-colors hover:text-[#ff729f]"
                >
                  F3
                </Link>

                <Link
                  href="/category/f1-academy"
                  className="text-xs font-bold uppercase tracking-[0.18em] transition-colors hover:text-[#ff729f]"
                >
                  F1 Academy
                </Link>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden bg-[#16070d]">
            <div className="absolute inset-0">
              <div className="absolute -right-20 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-[#ff729f]/20 blur-3xl" />
            </div>

            <div className="relative aspect-square lg:aspect-auto lg:h-full lg:min-h-[720px]">
              <HeroScene />
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <div className="flex items-end justify-between gap-6 text-white">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#ff729f]">
                    Live from the grid
                  </p>

                  <p className="mt-2 max-w-xs text-lg font-bold leading-tight">
                    Racing, stories and the women driving the sport forward.
                  </p>
                </div>

                <span className="hidden text-xs font-bold uppercase tracking-[0.2em] text-white/40 sm:block">
                  01 / 04
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* </Container> */}
      </section>

      {/* Featured Stories */}
      <section className="py-20 md:py-28">
        {/* <Container> */}

        <div className="px-6 sm:px-10 lg:px-16">
          <div className="flex items-end justify-between border-b-2 border-black pb-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#ff729f]">
                Stories
              </p>

              <h2 className="mt-2 text-4xl font-black uppercase tracking-[-0.04em] sm:text-5xl">
                Featured
              </h2>
            </div>

            <Link
              href="/stories"
              className="text-xs font-bold uppercase tracking-[0.18em] transition-colors hover:text-[#ff729f]"
            >
              View all →
            </Link>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            <Link
              href="/stories"
              className="group relative overflow-hidden bg-black"
            >
              <div className="aspect-[16/10] bg-[#1b0a10]">
                {/* TODO: Replace with real WordPress featured image */}
              </div>

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-6 pt-32 text-white sm:p-8 sm:pt-40">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ff729f]">
                  Women in Motorsport
                </p>

                <h3 className="mt-3 max-w-2xl text-3xl font-black uppercase leading-[0.95] tracking-[-0.03em] sm:text-4xl md:text-5xl">
                  Women are changing the face of motorsport
                </h3>

                <span className="mt-6 inline-block text-xs font-bold uppercase tracking-[0.18em] transition-colors group-hover:text-[#ff729f]">
                  Read story →
                </span>
              </div>
            </Link>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
              {stories.slice(1).map((story: Story) => (
                <Link
                  key={story.href}
                  href={story.href}
                  className="group grid grid-cols-[120px_1fr] gap-5 border-b border-black/10 pb-6 sm:grid-cols-[150px_1fr] lg:grid-cols-[150px_1fr]"
                >
                  <div className="aspect-square bg-[#fff0f5]">
                    {/* TODO: Replace with real WordPress image */}
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#ff729f]">
                      {story.category}
                    </p>

                    <h3 className="mt-2 text-lg font-bold leading-tight transition-colors group-hover:text-[#ff729f]">
                      {story.title}
                    </h3>

                    <span className="mt-4 inline-block text-[10px] font-bold uppercase tracking-[0.18em]">
                      Read more →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* </Container> */}
      </section>

      {/* Motorsport */}
      <section className="bg-[#fff1f5] py-20 md:py-28">
        {/* <Container> */}

        <div className="px-6 sm:px-10 lg:px-16">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#ff729f]">
              The grid
            </p>

            <h2 className="mt-3 text-4xl font-black uppercase leading-[0.9] tracking-[-0.04em] sm:text-5xl md:text-6xl">
              Everything
              <br />
              motorsport.
            </h2>

            <p className="mt-6 max-w-xl text-base leading-7 text-black/65">
              From Formula 1 to F1 Academy, keep up with the racing series,
              drivers, results and stories that matter.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2">
            <Link
              href="/category/formula-1"
              className="group flex items-end justify-between border-t-2 border-black bg-white p-6 transition-transform duration-300 hover:-translate-y-1 sm:p-8"
            >
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#ff729f]">
                  01
                </span>

                <h3 className="mt-12 text-3xl font-black uppercase tracking-[-0.03em]">
                  Formula 1
                </h3>
              </div>

              <span className="text-xl transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>

            <Link
              href="/category/formula-2"
              className="group flex items-end justify-between border-t-2 border-black bg-white p-6 transition-transform duration-300 hover:-translate-y-1 sm:p-8"
            >
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#ff729f]">
                  02
                </span>

                <h3 className="mt-12 text-3xl font-black uppercase tracking-[-0.03em]">
                  Formula 2
                </h3>
              </div>

              <span className="text-xl transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>

            <Link
              href="/category/formula-3"
              className="group flex items-end justify-between border-t-2 border-black bg-white p-6 transition-transform duration-300 hover:-translate-y-1 sm:p-8"
            >
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#ff729f]">
                  03
                </span>

                <h3 className="mt-12 text-3xl font-black uppercase tracking-[-0.03em]">
                  Formula 3
                </h3>
              </div>

              <span className="text-xl transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>

            <Link
              href="/category/f1-academy"
              className="group flex items-end justify-between border-t-2 border-black bg-white p-6 transition-transform duration-300 hover:-translate-y-1 sm:p-8"
            >
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#ff729f]">
                  04
                </span>

                <h3 className="mt-12 text-3xl font-black uppercase tracking-[-0.03em]">
                  F1 Academy
                </h3>
              </div>

              <span className="text-xl transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </div>

        {/* </Container> */}
      </section>

      {/* Latest News */}
      <section className="py-20 md:py-28">
        {/* <Container> */}

        <div className="px-6 sm:px-10 lg:px-16">
          <div className="flex items-end justify-between border-b-2 border-black pb-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#ff729f]">
                News
              </p>

              <h2 className="mt-2 text-4xl font-black uppercase tracking-[-0.04em] sm:text-5xl">
                Latest news
              </h2>
            </div>

            <Link
              href="/latest-news"
              className="text-xs font-bold uppercase tracking-[0.18em] transition-colors hover:text-[#ff729f]"
            >
              All news →
            </Link>
          </div>

          <div className="divide-y divide-black/10">
            {latestNews.map((item: NewsItem) => (
              <Link
                key={`${item.category}-${item.date}`}
                href={item.href}
                className="grid gap-3 py-7 transition-all duration-200 hover:pl-2 md:grid-cols-[180px_1fr_120px]"
              >
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#ff729f]">
                  {item.category}
                </span>

                <span className="max-w-3xl text-xl font-bold leading-tight">
                  {item.title}
                </span>

                <span className="text-xs uppercase tracking-[0.12em] text-black/40 md:text-right">
                  {item.date}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* </Container> */}
      </section>

      {/* Live Timing */}
      <section className="bg-black py-16 text-white md:py-20">
        {/* <Container> */}

        <div className="px-6 sm:px-10 lg:px-16">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff729f] shadow-[0_0_15px_#ff729f]" />

                <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#ff729f]">
                  Live timing
                </p>
              </div>

              <h2 className="mt-4 text-4xl font-black uppercase tracking-[-0.04em] sm:text-5xl">
                On the grid
              </h2>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-3xl font-black">F1</p>

              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/40">
                Connecting
              </p>
            </div>
          </div>
        </div>

        {/* </Container> */}
      </section>

      {/* CTA */}
      <section className="bg-[#ff729f] py-20 md:py-28">
        {/* <Container> */}

        <div className="px-6 sm:px-10 lg:px-16">
          <div className="max-w-5xl">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-black/60">
              Fast Girls Club
            </p>

            <h2 className="mt-5 text-5xl font-black uppercase leading-[0.85] tracking-[-0.055em] sm:text-6xl md:text-8xl">
              Built for
              <br />
              the grid.
            </h2>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/latest-news"
                className="rounded-full bg-black px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition-all hover:-translate-y-1 hover:bg-white hover:text-black"
              >
                Read the latest
              </Link>

              <Link
                href="/grid-guide"
                className="rounded-full border border-black px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-black transition-all hover:-translate-y-1 hover:bg-white"
              >
                Meet the grid
              </Link>
            </div>
          </div>
        </div>

        {/* </Container> */}
      </section>
    </main>
  );
}