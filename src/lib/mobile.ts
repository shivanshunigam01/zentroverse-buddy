/** Keep in sync with zentroflow-api/src/helpers/mobile.js */
export function normalizeMobile(mobile: unknown): string {
  let digits = String(mobile ?? "").replace(/\D/g, "");
  if (digits.length >= 12 && digits.startsWith("91")) digits = digits.slice(-10);
  else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  else if (digits.length > 10) digits = digits.slice(-10);
  return digits;
}

export function isValidMobile(mobile: unknown): boolean {
  const n = normalizeMobile(mobile);
  return n.length === 10 && /^[6-9]/.test(n);
}
