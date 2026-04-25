import { getStudioFeatures } from "@/app/lib/site-data";

export default async function FeatureGrid() {
  const features = await getStudioFeatures();

  return (
    <section
      aria-labelledby="feature-heading"
      className="grid gap-4 sm:grid-cols-2"
    >
      <h2 className="sr-only" id="feature-heading">
        Core capabilities
      </h2>
      {features.map((feature) => (
        <article
          className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_22px_44px_-34px_rgba(0,0,0,0.55)]"
          key={feature.title}
        >
          <p className="inline-flex rounded-full bg-black px-3 py-1 text-white text-xs uppercase tracking-[0.18em]">
            {feature.badge}
          </p>
          <h3 className="mt-5 font-display text-2xl text-black">
            {feature.title}
          </h3>
          <p className="mt-3 text-black/75 text-sm leading-relaxed">
            {feature.description}
          </p>
        </article>
      ))}
    </section>
  );
}
