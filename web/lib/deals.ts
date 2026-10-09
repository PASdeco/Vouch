import { z } from "zod";

export const DealStatusSchema = z.enum([
  "FUNDED",
  "SUBMITTED",
  "VERIFYING",
  "APPROVED",
  "REJECTED",
  "APPEALED",
  "PAID",
  "REFUNDED",
  "EXPIRED",
]);
export type DealStatus = z.infer<typeof DealStatusSchema>;

export const RequirementSchema = z.object({
  id: z.string(),
  label: z.string(),
  met: z.enum(["pass", "pending", "fail", "unclear"]),
});
export type Requirement = z.infer<typeof RequirementSchema>;

export const DealSchema = z.object({
  id: z.string(),
  brand: z.string(),
  creator: z.string(),
  brief: z.string(),
  platform: z.string(),
  postUrl: z.string().optional().default(""),
  amount: z.string(),
  deadline: z.string(),
  minLiveDays: z.number(),
  status: DealStatusSchema,
  requirements: z.array(RequirementSchema).default([]),
  consensus: z
    .object({ agree: z.number(), total: z.number() })
    .default({ agree: 0, total: 3 }),
  verdictReason: z.string().default(""),
  updatedAt: z.string(),
});
export type Deal = z.infer<typeof DealSchema>;

export function mockMode(): boolean {
  if (typeof process === "undefined") return true;
  const v = process.env.MOCK_MODE ?? process.env.NEXT_PUBLIC_MOCK_MODE;
  if (v !== undefined) return v === "true";
  return !process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
}
