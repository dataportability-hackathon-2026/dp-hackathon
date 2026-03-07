import { db } from "../src/db";
import { user } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function seedAdmin() {
  // Set admin role for admin user
  const result = await db
    .update(user)
    .set({ role: "admin" })
    .where(eq(user.email, "admin@coremodel.ai"))
    .returning({ id: user.id, email: user.email, role: user.role });

  if (result.length > 0) {
    console.log("Updated admin user:", result[0]);
  } else {
    console.log("Admin user not found - they will get admin role on next sign up via auth-gate");
  }

  // Ensure all other users have 'user' role set
  await db
    .update(user)
    .set({ role: "user" })
    .where(eq(user.role, "user"));

  console.log("Done");
  process.exit(0);
}

seedAdmin();
