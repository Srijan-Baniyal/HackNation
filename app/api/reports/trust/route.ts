import {
  Document,
  Page,
  pdf,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import React from "react";
import { utils, write } from "xlsx";
import { filterIncidents } from "@/app/lib/crisis/data";
import { computeMetrics } from "@/app/lib/crisis/metrics";
import { parseFiltersFromSearchParams } from "@/app/lib/crisis/query";

export const runtime = "nodejs";

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 36,
    fontSize: 11,
    color: "#111320",
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 11,
    color: "#4b5563",
    marginBottom: 18,
  },
  grid: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  kpi: {
    flexGrow: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 10,
  },
  kpiLabel: {
    fontSize: 9,
    color: "#6b7280",
    marginBottom: 6,
  },
  kpiValue: {
    fontSize: 14,
    fontWeight: 700,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    marginTop: 12,
    marginBottom: 8,
  },
  row: {
    borderWidth: 1,
    borderColor: "#eef2f7",
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  rowTitle: {
    fontSize: 11,
    fontWeight: 700,
  },
  rowMeta: {
    marginTop: 4,
    color: "#6b7280",
    fontSize: 9,
  },
});

const formatPercent = (value: number) =>
  new Intl.NumberFormat(undefined, {
    style: "percent",
    maximumFractionDigits: 0,
  }).format(value);

const formatNumber = (value: number) =>
  new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(value);

interface TrustReportPayload {
  affectedTotal: number;
  criticalCount: number;
  generatedAt: string;
  incidentCount: number;
  incidents: Array<{
    title: string;
    region: string;
    country: string;
    category: string;
    severity: string;
    trust: string;
    occurredAt: string;
    affectedEstimate: number;
    source: string;
  }>;
  verifiedShare: number;
}

const createReportDocument = (payload: TrustReportPayload) => {
  const e = React.createElement;
  const kpis = [
    { label: "Incidents", value: formatNumber(payload.incidentCount) },
    { label: "Affected (est.)", value: formatNumber(payload.affectedTotal) },
    { label: "Critical", value: formatNumber(payload.criticalCount) },
    { label: "Verified share", value: formatPercent(payload.verifiedShare) },
  ];

  return e(
    Document,
    null,
    e(
      Page,
      { size: "A4", style: styles.page },
      e(Text, { style: styles.title }, "Trust Report"),
      e(
        Text,
        { style: styles.subtitle },
        `Serving a Nation • Generated ${payload.generatedAt}`
      ),
      e(
        View,
        { style: styles.grid },
        ...kpis.map((kpi) =>
          e(
            View,
            { style: styles.kpi, key: kpi.label },
            e(Text, { style: styles.kpiLabel }, kpi.label),
            e(Text, { style: styles.kpiValue }, kpi.value)
          )
        )
      ),
      e(Text, { style: styles.sectionTitle }, "Incident subset"),
      ...payload.incidents.slice(0, 12).map((incident) =>
        e(
          View,
          {
            style: styles.row,
            key: `${incident.title}-${incident.occurredAt}`,
          },
          e(Text, { style: styles.rowTitle }, incident.title),
          e(
            Text,
            { style: styles.rowMeta },
            `${incident.region}, ${incident.country} • ${incident.category} • ${incident.severity} • ${incident.trust}`
          ),
          e(
            Text,
            { style: styles.rowMeta },
            `Occurred ${incident.occurredAt} • Affected ${formatNumber(incident.affectedEstimate)} • Source ${incident.source}`
          )
        )
      )
    )
  );
};

const buildPdfBuffer = async (payload: TrustReportPayload) => {
  const instance = pdf(createReportDocument(payload));
  const buffer = await instance.toBuffer();
  return buffer;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const format = url.searchParams.get("format") ?? "pdf";
  const filters = parseFiltersFromSearchParams(
    Object.fromEntries(url.searchParams.entries())
  );

  const incidents = await filterIncidents(filters);
  const metrics = computeMetrics(incidents);
  const generatedAt = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());

  if (format === "xlsx") {
    const rows = incidents.map((incident) => ({
      id: incident.id,
      title: incident.title,
      summary: incident.summary,
      category: incident.category,
      severity: incident.severity,
      trust: incident.trust,
      source: incident.source,
      country: incident.country,
      region: incident.region,
      occurredAt: incident.occurredAt,
      updatedAt: incident.updatedAt,
      affectedEstimate: incident.affectedEstimate,
      lat: incident.lat,
      lon: incident.lon,
    }));

    const workbook = utils.book_new();
    const sheet = utils.json_to_sheet(rows);
    utils.book_append_sheet(workbook, sheet, "Incidents");

    const summarySheet = utils.json_to_sheet([
      {
        generatedAt,
        incidentCount: metrics.incidentCount,
        affectedTotal: metrics.affectedTotal,
        criticalCount: metrics.criticalCount,
        verifiedShare: metrics.verifiedShare,
      },
    ]);
    utils.book_append_sheet(workbook, summarySheet, "Summary");

    const buffer = write(workbook, {
      bookType: "xlsx",
      type: "buffer",
    }) as Buffer;
    return new NextResponse(buffer, {
      headers: {
        "content-type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "content-disposition": 'attachment; filename="trust-report.xlsx"',
        "cache-control": "no-store",
      },
    });
  }

  const pdfBuffer = await buildPdfBuffer({
    generatedAt,
    incidentCount: metrics.incidentCount,
    affectedTotal: metrics.affectedTotal,
    criticalCount: metrics.criticalCount,
    verifiedShare: metrics.verifiedShare,
    incidents: incidents.map((incident) => ({
      title: incident.title,
      region: incident.region,
      country: incident.country,
      category: incident.category,
      severity: incident.severity,
      trust: incident.trust,
      occurredAt: incident.occurredAt,
      affectedEstimate: incident.affectedEstimate,
      source: incident.source,
    })),
  });

  return new NextResponse(pdfBuffer, {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": 'attachment; filename="trust-report.pdf"',
      "cache-control": "no-store",
    },
  });
}
