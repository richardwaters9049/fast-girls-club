export default function BlogLoading(): React.ReactElement {
  return (
    <main className="min-h-screen bg-[#e6e6e6] px-6 py-16 lg:px-10">
      <div className="mx-auto max-w-[77.5rem] animate-pulse">
        <div className="h-32 bg-[#1c1c1c]/10" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((item) => <div key={item} className="aspect-[3/4] bg-[#1c1c1c]/10" />)}
        </div>
      </div>
    </main>
  );
}
