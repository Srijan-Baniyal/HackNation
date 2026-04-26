import { Suspense } from "react";
import { CrisisMap } from "@/components/dashboard/crisis-map";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { filterFacilities } from "@/lib/crisis/data";
import { facilitiesToGeoJSON } from "@/lib/crisis/geojson";
import { parseFiltersFromSearchParams } from "@/lib/crisis/query";

async function MapContent({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const filters = parseFiltersFromSearchParams(resolvedSearchParams);
  const facilities = await filterFacilities(filters);
  const geojson = facilitiesToGeoJSON(facilities);

  return <CrisisMap data={geojson} />;
}

export default function DashboardMapPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Healthcare desert map</CardTitle>
        <CardDescription>
          India-focused heatmap showing healthcare facility gaps and specialty
          deserts. Zoom in to see individual facilities color-coded by gap
          severity. Click points for details.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
          <MapContent searchParams={searchParams} />
        </Suspense>
      </CardContent>
    </Card>
  );
}
