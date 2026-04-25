import { CrisisMap } from "@/app/dashboard/_components/crisis-map";
import { filterIncidents } from "@/app/lib/crisis/data";
import { incidentsToGeoJSON } from "@/app/lib/crisis/geojson";
import { parseFiltersFromSearchParams } from "@/app/lib/crisis/query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function DashboardMapPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const filters = parseFiltersFromSearchParams(searchParams);
  const incidents = await filterIncidents(filters);
  const geojson = incidentsToGeoJSON(incidents);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crisis map</CardTitle>
        <CardDescription>
          Heatmap view powered by MapLibre. Use Natural Language Query to shape
          the dataset and share the same view with the NGO API.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <CrisisMap data={geojson} />
      </CardContent>
    </Card>
  );
}
