export default function HomePage() {
  return (
    <section className="mx-auto max-w-2xl py-20 text-center">
      <h1 className="text-4xl font-bold tracking-tight">Directr</h1>
      <p className="mt-4 text-lg text-gray-400">
        Upload raw video → get a captioned, social-ready clip back.
      </p>
      <a
        href="/app"
        className="mt-6 inline-block rounded-md bg-white px-6 py-3 text-black font-medium hover:bg-gray-200"
      >
        Go to App
      </a>
    </section>
  );
}
