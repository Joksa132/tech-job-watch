export function fmtDate(d: Date) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}.${d.getFullYear()}`;
}

export function fmtSalary(min: number, max: number, ccy: string | null) {
  const k = (n: number) => `${Math.round(n / 1000)}k`;
  return `${k(min)}–${k(max)} ${ccy ?? ""}`.trim();
}
