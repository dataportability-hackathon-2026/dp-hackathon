import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { creditLedger } from "@/db/schema";
import { addCredits } from "@/lib/credits";

const WELCOME_CREDIT_AMOUNT = 10_000; // 10 display credits (stored as 1000x)

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await addCredits(
            user.id,
            WELCOME_CREDIT_AMOUNT,
            "adjustment",
            "Welcome bonus — 10 free credits",
          );
          // Insert free_claim marker so claim-credits endpoint knows it's done
          await db.insert(creditLedger).values({
            userId: user.id,
            amount: 0,
            type: "free_claim",
            description: "Auto-granted welcome bonus marker",
            balanceAfter: WELCOME_CREDIT_AMOUNT,
          });
        },
      },
    },
  },
});
