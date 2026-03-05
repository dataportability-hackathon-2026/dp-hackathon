export const CREDIT_PACKS = {
  starter_25: {
    slug: "starter_25",
    credits: 25_000,
    priceCents: 1000,
    label: "25 credits",
    priceLabel: "$10",
  },
  pro_75: {
    slug: "pro_75",
    credits: 75_000,
    priceCents: 2500,
    label: "75 credits",
    priceLabel: "$25",
  },
  mega_200: {
    slug: "mega_200",
    credits: 200_000,
    priceCents: 5900,
    label: "200 credits",
    priceLabel: "$59",
  },
} as const;

export type CreditPackSlug = keyof typeof CREDIT_PACKS;
