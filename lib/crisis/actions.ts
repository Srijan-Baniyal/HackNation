"use server";

import { redirect } from "next/navigation";
import {
  filtersToSearchParams,
  parseNaturalLanguageQuery,
} from "@/lib/crisis/query";

const dashboardPathRegex = /^\/dashboard(?:\/[a-z-]+)?$/;

const getSafeDashboardPath = (value: FormDataEntryValue | null) => {
  if (typeof value !== "string") {
    return "/dashboard/query";
  }

  return dashboardPathRegex.test(value) ? value : "/dashboard/query";
};

export async function runNaturalLanguageQuery(formData: FormData) {
  await Promise.resolve();

  const rawQuery = formData.get("q");
  const query = typeof rawQuery === "string" ? rawQuery : "";
  const filters = parseNaturalLanguageQuery(query);
  const params = filtersToSearchParams(filters);
  const path = getSafeDashboardPath(formData.get("actionPath"));
  const queryString = params.toString();

  redirect(queryString ? `${path}?${queryString}` : path);
}
