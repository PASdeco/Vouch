import type { Deal } from "./deals";

export const MOCK_DEALS: Deal[] = [
  {
    id: "VOUCH-1042",
    brand: "0xBrand000000000000000000000000000000000001",
    creator: "0xCreator0000000000000000000000000000000002",
    brief: "30s mention in first 2 minutes, show bottle on camera, disclose #ad, keep live 30 days.",
    platform: "YouTube",
    postUrl: "https://example.com/watch?v=demo1042",
    amount: "250 GEN",
    deadline: new Date(Date.now() + 6 * 864e5).toISOString(),
    minLiveDays: 30,
    status: "VERIFYING",
    requirements: [
      { id: "mention", label: "Mention product", met: "pass" },
      { id: "oncamera", label: "Show on camera", met: "pass" },
      { id: "disclose", label: "Disclose #ad", met: "pending" },
      { id: "live", label: "Stay live 30 days", met: "pending" },
    ],
    consensus: { agree: 2, total: 3 },
    verdictReason: "Validators confirm mention + on-camera. #ad disclosure unclear from excerpt — 3rd vote pending.",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "VOUCH-1041",
    brand: "0xBrand000000000000000000000000000000000001",
    creator: "0xCreator0000000000000000000000000000000003",
    brief: "TikTok stitch with product demo, link in bio 7 days.",
    platform: "TikTok",
    postUrl: "",
    amount: "80 GEN",
    deadline: new Date(Date.now() + 2 * 864e5).toISOString(),
    minLiveDays: 7,
    status: "FUNDED",
    requirements: [
      { id: "demo", label: "Product demo", met: "pending" },
      { id: "link", label: "Link in bio 7 days", met: "pending" },
    ],
    consensus: { agree: 0, total: 3 },
    verdictReason: "",
    updatedAt: new Date().toISOString(),
  },
];

export async function getMockDeals(): Promise<Deal[]> {
  return MOCK_DEALS;
}
