import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { HealthcareFacility } from "@/lib/crisis/types";

const formatDate = (value: string) => {
  const time = Date.parse(value);
  if (!Number.isFinite(time)) {
    return value;
  }
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    time
  );
};

const severityVariant = (severity: HealthcareFacility["gapSeverity"]) => {
  switch (severity) {
    case "critical":
      return "default";
    case "severe":
      return "secondary";
    case "moderate":
      return "outline";
    case "none":
      return "muted";
    default:
      return "muted";
  }
};

const confidenceVariant = (confidence: HealthcareFacility["confidence"]) => {
  switch (confidence) {
    case "govt-verified":
      return "secondary";
    case "survey-reported":
      return "outline";
    case "crowd-sourced":
      return "muted";
    case "estimated":
      return "muted";
    default:
      return "muted";
  }
};

export function FacilitiesTable({
  facilities,
}: {
  facilities: HealthcareFacility[];
}) {
  return (
    <div className="overflow-hidden border border-border/60">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Facility</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Specialty</TableHead>
            <TableHead>Gap</TableHead>
            <TableHead>Confidence</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="text-right">Pop. affected</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {facilities.map((facility) => (
            <TableRow key={facility.id}>
              <TableCell className="max-w-[22rem]">
                <p className="font-medium leading-tight">{facility.title}</p>
                <p className="mt-1 text-muted-foreground text-xs leading-relaxed">
                  {facility.source}
                </p>
              </TableCell>
              <TableCell>
                <p className="font-medium">{facility.district}</p>
                <p className="text-muted-foreground text-xs">
                  {facility.state}
                </p>
              </TableCell>
              <TableCell className="capitalize">
                {facility.category.replace("-", " ")}
              </TableCell>
              <TableCell>
                <Badge
                  className="capitalize"
                  variant={severityVariant(facility.gapSeverity)}
                >
                  {facility.gapSeverity}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  className="capitalize"
                  variant={confidenceVariant(facility.confidence)}
                >
                  {facility.confidence.replace("-", " ")}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(facility.updatedAt)}</TableCell>
              <TableCell className="text-right tabular-nums">
                {new Intl.NumberFormat(undefined, {
                  maximumFractionDigits: 0,
                }).format(facility.affectedPopulation)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
