export function formatMoney(value: number | string | null | undefined, currency: string | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (!currency) {
    return "—";
  }

  const numericValue = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numericValue)) {
    return "—";
  }

  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: 2
  }).format(numericValue);
}
