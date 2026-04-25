import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function DashboardApiPage() {
  const base = "/api";
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>NGO REST API</CardTitle>
          <CardDescription>
            These endpoints mirror the dashboard filters so partners can request
            identical views programmatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">Seed data</Badge>
            <Badge variant="muted">No auth</Badge>
            <Badge variant="outline">No-store</Badge>
          </div>
          <Separator />
          <div className="grid gap-4">
            <section className="grid gap-2">
              <p className="font-medium">Incidents</p>
              <pre className="overflow-x-auto rounded-2xl border border-border/60 bg-muted/20 p-4 text-xs leading-relaxed">
                {`GET ${base}/crises
Query params:
  q, category, severity, trust, country, region, sinceDays

Example:
  ${base}/crises?severity=critical&category=conflict&sinceDays=7`}
              </pre>
              <Link
                className="text-primary text-sm underline-offset-4 hover:underline"
                href="/api/crises"
              >
                Open live response
              </Link>
            </section>

            <section className="grid gap-2">
              <p className="font-medium">Trust report exports</p>
              <pre className="overflow-x-auto rounded-2xl border border-border/60 bg-muted/20 p-4 text-xs leading-relaxed">
                {`GET ${base}/reports/trust?format=pdf
GET ${base}/reports/trust?format=xlsx
Same query params as /crises

Example:
  ${base}/reports/trust?format=pdf&trust=verified&sinceDays=14`}
              </pre>
              <Link
                className="text-primary text-sm underline-offset-4 hover:underline"
                href="/api/reports/trust?format=pdf"
              >
                Download sample PDF
              </Link>
            </section>

            <section className="grid gap-2">
              <p className="font-medium">NGO directory</p>
              <pre className="overflow-x-auto rounded-2xl border border-border/60 bg-muted/20 p-4 text-xs leading-relaxed">
                {`GET ${base}/ngos`}
              </pre>
              <Link
                className="text-primary text-sm underline-offset-4 hover:underline"
                href="/api/ngos"
              >
                Open live response
              </Link>
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
