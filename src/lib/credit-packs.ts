export const CREDIT_PACKS = {
  pro_monthly: {
    slug: "pro_monthly",
    credits: 100_000,
    priceCents: 500,
    label: "Pro — Monthly",
    priceLabel: "$5/mo",
  },
} as const;

export type CreditPackSlug = keyof typeof CREDIT_PACKS;
