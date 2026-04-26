import { GlobeHemisphereEastIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

const workspaceLinks = [
  {
    href: "/dashboard/query",
    label: "Natural language",
    description: "Convert operator intent into structured crisis filters.",
  },
  {
    href: "/dashboard/map",
    label: "Crisis map",
    description: "Read incident density and regional hotspots.",
  },
  {
    href: "/dashboard/reports",
    label: "Trust reports",
    description: "Export auditable PDF and Excel response snapshots.",
  },
] as const;

export function SiteNavigation() {
  return (
    <header className="flex items-center justify-between gap-4 border border-border bg-card px-4 py-3">
      <Link className="flex items-center gap-3" href="/">
        <span className="grid size-10 place-items-center border border-border bg-muted text-primary">
          <GlobeHemisphereEastIcon aria-hidden="true" size={22} />
        </span>
        <span className="grid">
          <span className="font-display text-xl leading-none">
            Serving a Nation
          </span>
          <span className="text-muted-foreground text-xs uppercase">
            Crisis intelligence
          </span>
        </span>
      </Link>

      <div className="hidden items-center gap-2 md:flex">
        <Link
          className="px-3 py-2 font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
          href="/about"
        >
          About
        </Link>

        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Workspaces</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid w-[26rem] gap-1">
                  {workspaceLinks.map((item) => (
                    <NavigationMenuLink asChild key={item.href}>
                      <Link
                        className="grid h-auto justify-start gap-1 p-3 text-left"
                        href={item.href}
                      >
                        <span className="font-medium">{item.label}</span>
                        <span className="text-muted-foreground text-xs leading-relaxed">
                          {item.description}
                        </span>
                      </Link>
                    </NavigationMenuLink>
                  ))}
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <ThemeToggle />

        <Button asChild>
          <Link href="/dashboard">Open dashboard</Link>
        </Button>
      </div>

      <div className="flex items-center gap-2 md:hidden">
        <ThemeToggle />
        <Button asChild size="sm">
          <Link href="/dashboard">Dashboard</Link>
        </Button>
      </div>
    </header>
  );
}
