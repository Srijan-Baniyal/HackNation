import {
  Globe,
  ListMagnifyingGlass,
  MapPin,
  Receipt,
  ShieldCheck,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: Globe },
  {
    href: "/dashboard/query",
    label: "Natural language",
    icon: ListMagnifyingGlass,
  },
  { href: "/dashboard/map", label: "Crisis map", icon: MapPin },
  { href: "/dashboard/reports", label: "Trust reports", icon: Receipt },
  { href: "/dashboard/api", label: "NGO API", icon: ShieldCheck },
] as const;

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 bg-background text-foreground">
      <aside className="hidden w-72 shrink-0 border-border/60 border-r bg-card/60 p-5 backdrop-blur-sm lg:block">
        <div className="flex items-center justify-between">
          <Link className="font-display text-xl leading-none" href="/dashboard">
            Serving a Nation
          </Link>
          <span className="rounded-full border border-border/60 bg-muted px-2.5 py-1 text-muted-foreground text-xs">
            Beta
          </span>
        </div>
        <nav className="mt-6 flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                className={cn(
                  "group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-sm transition-colors hover:bg-muted/50",
                  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/50"
                )}
                href={item.href}
                key={item.href}
              >
                <span className="grid size-8 place-items-center rounded-lg bg-muted/60 text-muted-foreground transition-colors group-hover:bg-muted">
                  <Icon aria-hidden="true" size={18} />
                </span>
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-8 rounded-2xl border border-border/60 bg-background p-4">
          <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
            Data mode
          </p>
          <p className="mt-2 text-sm leading-relaxed">
            Seeded incidents. Switch to API later without changing the UI.
          </p>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 border-border/60 border-b bg-background/85 backdrop-blur-sm">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 sm:px-10 lg:px-12">
            <div className="flex flex-col">
              <p className="text-muted-foreground text-xs uppercase tracking-[0.22em]">
                Crisis intelligence
              </p>
              <p className="font-display text-2xl leading-tight">
                Operational dashboard
              </p>
            </div>
            <Link
              className="rounded-full border border-border/60 bg-card px-4 py-2 font-medium text-sm hover:bg-muted/40"
              href="/"
            >
              Home
            </Link>
          </div>
        </header>
        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-8 sm:px-10 lg:px-12">
          {children}
        </main>
      </div>
    </div>
  );
}
