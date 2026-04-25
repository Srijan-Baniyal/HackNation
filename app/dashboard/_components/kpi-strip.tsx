import type { CrisisMetrics } from "@/app/lib/crisis/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const percent = (value: number) =>
  new Intl.NumberFormat(undefined, {
    style: "percent",
    maximumFractionDigits: 0,
  }).format(value);

const number = (value: number) =>
  new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(value);

export function KpiStrip({ metrics }: { metrics: CrisisMetrics }) {
  return (
    <section className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="font-medium text-base">Incidents</CardTitle>
        </CardHeader>
        <CardContent className="flex items-baseline justify-between gap-3">
          <p className="font-display text-3xl">
            {number(metrics.incidentCount)}
          </p>
          <Badge variant="muted">Filtered</Badge>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="font-medium text-base">
            Affected (est.)
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-baseline justify-between gap-3">
          <p className="font-display text-3xl">
            {number(metrics.affectedTotal)}
          </p>
          <Badge variant="secondary">People</Badge>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="font-medium text-base">Critical</CardTitle>
        </CardHeader>
        <CardContent className="flex items-baseline justify-between gap-3">
          <p className="font-display text-3xl">
            {number(metrics.criticalCount)}
          </p>
          <Badge variant="outline">Priority</Badge>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="font-medium text-base">
            Verified share
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-baseline justify-between gap-3">
          <p className="font-display text-3xl">
            {percent(metrics.verifiedShare)}
          </p>
          <Badge variant="muted">Trust</Badge>
        </CardContent>
      </Card>
    </section>
  );
}
