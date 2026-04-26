import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStudioStats } from "@/lib/site-data";

export default async function MetricsPanel() {
  const stats = await getStudioStats();

  return (
    <section
      aria-labelledby="studio-metrics-heading"
      className="grid gap-4 md:grid-cols-3"
    >
      <h2 className="sr-only" id="studio-metrics-heading">
        Operations snapshot
      </h2>
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardHeader className="pb-2">
            <p className="font-medium text-muted-foreground text-xs uppercase">
              {stat.label}
            </p>
            <CardTitle className="font-display text-4xl">
              {stat.value}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {stat.detail}
            </p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
