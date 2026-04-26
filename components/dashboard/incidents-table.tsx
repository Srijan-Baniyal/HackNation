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

const formatNumber = (value: number) =>
  new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 0,
  }).format(value);

const severityVariant = (severity: HealthcareFacility["gapSeverity"]) => {
  switch (severity) {
    case "critical":
      return "default";
    case "severe":
      return "secondary";
    case "moderate":
      return "outline";
    default:
      return "muted";
  }
};

const confidenceVariant = (confidence: HealthcareFacility["confidence"]) => {
  if (confidence === "govt-verified") {
    return "secondary" as const;
  }
  if (confidence === "survey-reported") {
    return "outline" as const;
  }
  return "muted" as const;
};

export function FacilitiesTable({
  facilities,
}: {
  facilities: HealthcareFacility[];
}) {
  return (
    <>
      {/* Mobile / small screens: card list */}
      <div className="grid gap-3 md:hidden">
        {facilities.length === 0 ? (
          <p className="border border-border border-dashed bg-muted/10 p-4 text-center text-muted-foreground text-sm">
            No facilities match the current filters.
          </p>
        ) : null}
        {facilities.map((facility) => (
          <div
            className="grid gap-2 border border-border bg-muted/15 p-3"
            key={facility.id}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium text-sm leading-tight">
                  {facility.title}
                </p>
                <p className="mt-1 text-muted-foreground text-xs">
                  {facility.district}, {facility.state}
                </p>
              </div>
              <Badge
                className="capitalize"
                variant={severityVariant(facility.gapSeverity)}
              >
                {facility.gapSeverity}
              </Badge>
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">
              {facility.source}
            </p>
            <div className="mt-1 grid grid-cols-2 gap-2 border-border border-t pt-2 text-xs">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">
                  Specialty
                </p>
                <p className="capitalize">
                  {facility.category.replace("-", " ")}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">
                  Pop. affected
                </p>
                <p className="tabular-nums">
                  {formatNumber(facility.affectedPopulation)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">
                  Confidence
                </p>
                <Badge
                  className="mt-0.5 capitalize"
                  variant={confidenceVariant(facility.confidence)}
                >
                  {facility.confidence.replace("-", " ")}
                </Badge>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">
                  Updated
                </p>
                <p>{formatDate(facility.updatedAt)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tablet+: full table */}
      <div className="hidden overflow-hidden border border-border/60 md:block">
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
                  {formatNumber(facility.affectedPopulation)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
