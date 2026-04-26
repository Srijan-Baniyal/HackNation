import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DesertMetrics } from "@/lib/crisis/types";

const percent = (value: number) =>
  new Intl.NumberFormat(undefined, {
    style: "percent",
    maximumFractionDigits: 0,
  }).format(value);

const number = (value: number) =>
  new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(value);

export function KpiStrip({ metrics }: { metrics: DesertMetrics }) {
  return (
    <section className="grid gap-4 md:grid-cols-4">
      <Card className="kpi-accent">
        <CardHeader className="pb-2">
          <CardTitle className="font-medium text-base">Facilities</CardTitle>
        </CardHeader>
        <CardContent className="flex items-baseline justify-between gap-3">
          <p className="font-display text-3xl">
            {number(metrics.facilityCount)}
          </p>
          <Badge variant="muted">Filtered</Badge>
        </CardContent>
      </Card>
      <Card className="kpi-accent">
        <CardHeader className="pb-2">
          <CardTitle className="font-medium text-base">Pop. affected</CardTitle>
        </CardHeader>
        <CardContent className="flex items-baseline justify-between gap-3">
          <p className="font-display text-3xl">
            {number(metrics.affectedTotal)}
          </p>
          <Badge variant="secondary">People</Badge>
        </CardContent>
      </Card>
      <Card className="kpi-accent">
        <CardHeader className="pb-2">
          <CardTitle className="font-medium text-base">
            Critical deserts
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-baseline justify-between gap-3">
          <p className="font-display text-3xl">
            {number(metrics.criticalDeserts)}
          </p>
          <Badge variant="outline">Urgent</Badge>
        </CardContent>
      </Card>
      <Card className="kpi-accent">
        <CardHeader className="pb-2">
          <CardTitle className="font-medium text-base">Govt verified</CardTitle>
        </CardHeader>
        <CardContent className="flex items-baseline justify-between gap-3">
          <p className="font-display text-3xl">
            {percent(metrics.verifiedShare)}
          </p>
          <Badge variant="muted">Data quality</Badge>
        </CardContent>
      </Card>
    </section>
  );
}
