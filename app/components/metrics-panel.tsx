import { getStudioStats } from "@/app/lib/site-data";

export default async function MetricsPanel() {
  const stats = await getStudioStats();

  return (
    <section
      aria-labelledby="studio-metrics-heading"
      className="rounded-3xl border border-white/20 bg-white/5 p-6 backdrop-blur-sm"
    >
      <h2
        className="font-medium text-sm text-white/70 uppercase tracking-[0.28em]"
        id="studio-metrics-heading"
      >
        Performance Snapshot
      </h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <article
            className="rounded-2xl border border-white/10 bg-black/30 p-4"
            key={stat.label}
          >
            <p className="text-white/60 text-xs uppercase tracking-[0.2em]">
              {stat.label}
            </p>
            <p className="mt-3 font-display text-3xl text-white">
              {stat.value}
            </p>
            <p className="mt-3 text-sm text-white/80 leading-relaxed">
              {stat.detail}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
