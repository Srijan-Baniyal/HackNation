import {
  ArrowSquareOutIcon,
  BracketsCurlyIcon,
  GlobeHemisphereEastIcon,
  HouseLineIcon,
  ListMagnifyingGlassIcon,
  MapPinIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: GlobeHemisphereEastIcon },
  {
    href: "/dashboard/query",
    label: "Natural language",
    icon: ListMagnifyingGlassIcon,
  },
  { href: "/dashboard/map", label: "Desert map", icon: MapPinIcon },
] as const;

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Operational dashboard for healthcare desert detection, Graph RAG query workflows, and India-wide facility mapping.",
  alternates: {
    canonical: "/dashboard",
  },
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider className="min-h-full bg-background text-foreground">
      <Sidebar className="border-border bg-sidebar text-sidebar-foreground">
        <SidebarHeader className="p-5">
          <Link className="grid gap-2" href="/dashboard">
            <span className="flex size-11 items-center justify-center bg-sidebar text-sidebar-primary">
              <GlobeHemisphereEastIcon aria-hidden="true" size={23} />
            </span>
            <span className="font-display text-2xl leading-none">
              Serving a Nation
            </span>
            <span className="text-sidebar-foreground/60 text-xs uppercase">
              Health intelligence
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Workspaces</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu aria-label="Dashboard navigation">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        className="h-10"
                        tooltip={item.label}
                      >
                        <Link href={item.href}>
                          <Icon
                            aria-hidden="true"
                            className="text-sidebar-primary"
                            size={19}
                          />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="mt-5">
            <SidebarGroupLabel>Server surfaces</SidebarGroupLabel>
            <SidebarGroupContent className="grid gap-2 px-2">
              <div className="bg-sidebar p-3">
                <div className="flex items-center gap-2 text-sm">
                  <BracketsCurlyIcon
                    aria-hidden="true"
                    className="text-sidebar-primary"
                    size={17}
                  />
                  RSC pages
                </div>
                <p className="mt-2 text-sidebar-foreground/65 text-xs leading-relaxed">
                  Data composition stays server-side; only map and query input
                  hydrate.
                </p>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="bg-sidebar p-3">
            <p className="font-medium text-sidebar-primary text-xs uppercase">
              Data mode
            </p>
            <p className="mt-2 text-sidebar-foreground/70 text-sm leading-relaxed">
              Healthcare facility pipeline with shared server filters for UI,
              partner records, and desert exports.
            </p>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="min-w-0 bg-background">
        <header className="sticky top-0 z-10 border-border border-b bg-background/92 backdrop-blur">
          <div className="flex w-full items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-10">
            <div className="flex min-w-0 items-center gap-3">
              <SidebarTrigger className="-ml-2 md:hidden" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">Operational</Badge>
                  <Badge variant="muted">RSC-first</Badge>
                </div>
                <h1 className="mt-2 truncate font-display text-2xl leading-tight sm:text-3xl">
                  Healthcare intelligence dashboard
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                asChild
                className="hidden sm:inline-flex"
                variant="outline"
              >
                <Link href="/">
                  <HouseLineIcon aria-hidden="true" /> Home
                </Link>
              </Button>
              <Button asChild>
                <Link href="/dashboard/integrations">
                  <ArrowSquareOutIcon aria-hidden="true" /> Integrations
                </Link>
              </Button>
            </div>
          </div>
        </header>
        <div className="flex w-full flex-1 flex-col gap-6 px-5 py-6 sm:px-8 lg:px-10">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
