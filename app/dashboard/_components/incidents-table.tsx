import type { CrisisIncident } from "@/app/lib/crisis/types";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const formatDate = (value: string) => {
  const time = Date.parse(value);
  if (!Number.isFinite(time)) {
    return value;
  }
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    time
  );
};

const severityVariant = (severity: CrisisIncident["severity"]) => {
  switch (severity) {
    case "critical":
      return "default";
    case "high":
      return "secondary";
    case "medium":
      return "outline";
    case "low":
      return "muted";
    default:
      return "muted";
  }
};

const trustVariant = (trust: CrisisIncident["trust"]) => {
  switch (trust) {
    case "verified":
      return "secondary";
    case "reported":
      return "outline";
    case "unverified":
      return "muted";
    case "disputed":
      return "default";
    default:
      return "muted";
  }
};

export function IncidentsTable({ incidents }: { incidents: CrisisIncident[] }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-border/60">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Incident</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Severity</TableHead>
            <TableHead>Trust</TableHead>
            <TableHead>Occurred</TableHead>
            <TableHead className="text-right">Affected</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {incidents.map((incident) => (
            <TableRow key={incident.id}>
              <TableCell className="max-w-[22rem]">
                <p className="font-medium leading-tight">{incident.title}</p>
                <p className="mt-1 text-muted-foreground text-xs leading-relaxed">
                  {incident.source}
                </p>
              </TableCell>
              <TableCell>
                <p className="font-medium">{incident.region}</p>
                <p className="text-muted-foreground text-xs">
                  {incident.country}
                </p>
              </TableCell>
              <TableCell className="capitalize">{incident.category}</TableCell>
              <TableCell>
                <Badge
                  className="capitalize"
                  variant={severityVariant(incident.severity)}
                >
                  {incident.severity}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  className="capitalize"
                  variant={trustVariant(incident.trust)}
                >
                  {incident.trust}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(incident.occurredAt)}</TableCell>
              <TableCell className="text-right tabular-nums">
                {new Intl.NumberFormat(undefined, {
                  maximumFractionDigits: 0,
                }).format(incident.affectedEstimate)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
