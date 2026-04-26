import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { runNaturalLanguageQuery } from "@/lib/crisis/actions";

export function NlqBar({
  actionPath = "/dashboard/query",
  defaultValue = "",
}: {
  actionPath?: string;
  defaultValue?: string | null;
}) {
  return (
    <form
      action={runNaturalLanguageQuery}
      className="flex flex-col gap-3 sm:flex-row sm:items-center"
    >
      <input name="actionPath" type="hidden" value={actionPath} />
      <div className="relative flex-1">
        <MagnifyingGlass
          aria-hidden="true"
          className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
          size={18}
        />
        <Input
          className="h-11 pl-10"
          defaultValue={defaultValue ?? ""}
          name="q"
          placeholder='Try: "oncology deserts in Rajasthan" or "critical dialysis gaps"'
        />
      </div>
      <Button className="h-11" type="submit">
        Run query
      </Button>
    </form>
  );
}
