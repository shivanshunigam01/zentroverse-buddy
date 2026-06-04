import { api, apiBlob } from "@/lib/api";

export type PipelineReport = {
  funnel: Array<{ _id: string | null; count: number }>;
  sources: Array<{ _id: string | null; count: number }>;
  executives: Array<{ _id: string | null; count: number }>;
};

export async function fetchPipelineReport(): Promise<PipelineReport> {
  return api<PipelineReport>("/reports/pipeline");
}

export async function downloadReportExport(): Promise<Blob> {
  return apiBlob("/reports/export");
}
