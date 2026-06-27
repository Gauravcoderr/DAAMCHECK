const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1";

export async function checkGST(params: {
  amount: number;
  gstPct: number;
  servicePct?: number;
  roomRate?: number;
}) {
  const res = await fetch(`${BASE_URL}/gst/check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error("GST check failed");
  return res.json();
}

export async function getIRCTCPrices() {
  const res = await fetch(`${BASE_URL}/irctc/prices`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error("IRCTC prices fetch failed");
  return res.json();
}

export async function checkIRCTCItems(
  items: { name: string; chargedPrice: number }[]
) {
  const res = await fetch(`${BASE_URL}/irctc/check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
  if (!res.ok) throw new Error("IRCTC check failed");
  return res.json();
}
