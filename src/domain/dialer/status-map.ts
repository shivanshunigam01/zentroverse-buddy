const TABLE: Record<string, string> = {
  new: "READY",
  interested: "INTERESTED",
  "not interested": "NOT_INTERESTED",
  converted: "CONVERTED",
  successful: "CONVERTED",
  "schedule call": "CALLBACK",
  callback: "CALLBACK",
  answered: "CONTACTED",
  busy: "BUSY",
  "no answer": "NO_ANSWER",
  missed: "NO_ANSWER",
  "ring timeout": "NO_ANSWER",
  "not reachable": "NOT_REACHABLE",
  "call drop": "CALL_DROPPED",
  failed: "FAILED",
  "do not call": "DNC",
  dnc: "DNC",
  dnd: "DNC",
};

const normalizeKey = (value: string): string =>
  value.trim().toLowerCase().replace(/[_-]+/g, " ");

export function mapSmartfloStatusLabel(smartfloValue: string): {
  mapped: string | null;
  external: string | null;
  known: boolean;
} {
  const raw = smartfloValue.trim();
  if (!raw) return { mapped: null, external: null, known: true };
  const mapped = TABLE[normalizeKey(raw)] ?? null;
  if (mapped) return { mapped, external: null, known: true };
  return { mapped: null, external: raw, known: false };
}

export function maskIdentifier(value: string | null | undefined): string {
  const s = String(value ?? "").trim();
  if (!s) return "—";
  if (s.length <= 4) return "********";
  return `********${s.slice(-4)}`;
}
