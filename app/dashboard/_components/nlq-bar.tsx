"use client";

import { MagnifyingGlass } from "@phosphor-icons/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  filtersToSearchParams,
  parseNaturalLanguageQuery,
} from "@/app/lib/crisis/query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NlqBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initial = useMemo(() => searchParams.get("q") ?? "", [searchParams]);
  const [value, setValue] = useState(initial);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="flex flex-col gap-3 sm:flex-row sm:items-center"
      onSubmit={(event) => {
        event.preventDefault();
        const inferred = parseNaturalLanguageQuery(value);
        const params = filtersToSearchParams(inferred);
        startTransition(() => {
          router.replace(`${pathname}?${params.toString()}`);
        });
      }}
    >
      <div className="relative flex-1">
        <MagnifyingGlass
          aria-hidden="true"
          className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
          size={18}
        />
        <Input
          className="h-11 pl-10"
          name="q"
          onChange={(event) => setValue(event.target.value)}
          placeholder="Try: “verified floods in last 7 days” or “critical conflict”"
          value={value}
        />
      </div>
      <Button className="h-11 rounded-full" disabled={isPending} type="submit">
        Run query
      </Button>
    </form>
  );
}
