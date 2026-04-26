import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStudioFeatures } from "@/lib/site-data";

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
        <Card
          className="transition-colors hover:bg-muted/30"
          key={feature.title}
        >
          <CardHeader>
            <Badge className="w-fit" variant="outline">
              {feature.badge}
            </Badge>
            <CardTitle>{feature.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {feature.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
