

export default function AppSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      {children}
    </section>
  );
}
