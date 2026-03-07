import { eq } from "drizzle-orm";
import { db } from "../src/db";
import { topic, user } from "../src/db/schema";
import { buildCommunityTopicRows } from "../src/lib/seed-community-topics";

async function seedCommunityTopics() {
  // Find first admin user to use as owner
  const adminUser = await db
    .select({ id: user.id, email: user.email })
    .from(user)
    .where(eq(user.role, "admin"))
    .limit(1);

  if (adminUser.length === 0) {
    console.error("No admin user found. Run seed-admin.ts first.");
    process.exit(1);
  }

  const ownerId = adminUser[0].id;
  console.log(`Using admin user: ${adminUser[0].email} (${ownerId})`);

  const rows = buildCommunityTopicRows(ownerId);

  const inserted = await db
    .insert(topic)
    .values(rows)
    .onConflictDoNothing({ target: topic.slug })
    .returning({ id: topic.id, name: topic.name, slug: topic.slug });

  console.log(`Inserted ${inserted.length} community topics:`);
  for (const row of inserted) {
    console.log(`  - ${row.name} (${row.slug})`);
  }

  if (inserted.length < rows.length) {
    console.log(
      `Skipped ${rows.length - inserted.length} topics (already exist).`,
    );
  }

  process.exit(0);
}

seedCommunityTopics();
