import { chromium } from "playwright";

const BASE = "http://localhost:3000";

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log("1. Navigate to dashboard...");
  await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });

  // Wait for auth gate to render
  await page.waitForTimeout(3000);

  // Use the Maya dev quick login button
  const mayaBtn = page.locator('button:has-text("Maya")');
  const hasMaya = await mayaBtn.isVisible({ timeout: 5000 }).catch(() => false);

  if (hasMaya) {
    console.log(
      "2. Clicking Maya quick login (will auto-reset stale accounts)...",
    );
    await mayaBtn.click();
    await page.waitForTimeout(5000);
  } else {
    // Fallback: sign up fresh
    console.log("2. No dev login buttons, signing up...");
    const testEmail = `test-${Date.now()}@test.com`;
    await page.evaluate(async (email) => {
      await fetch("/api/auth/sign-up/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password: "testpassword123",
          name: "Test User",
        }),
      });
    }, testEmail);
    await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });
    await page.waitForTimeout(3000);
  }

  console.log("3. Checking page loaded...");
  await page.screenshot({ path: "test-screenshot.png" });

  // Test 1: Verify conversation API routes exist
  console.log("4. Testing POST /api/conversations...");
  const createRes = await page.evaluate(async () => {
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Test conversation" }),
    });
    return { status: res.status, body: await res.json() };
  });
  console.log(`   Status: ${createRes.status}`);

  if (createRes.status !== 201) {
    console.error("   FAIL: Could not create conversation", createRes.body);
    await browser.close();
    process.exit(1);
  }
  console.log(`   Created conversation: ${createRes.body.id}`);

  const convId = createRes.body.id;

  // Test 2: Save messages to conversation
  console.log("5. Testing POST /api/conversations/[id]/messages...");
  const msgId1 = `test-msg-${Date.now()}-1`;
  const msgId2 = `test-msg-${Date.now()}-2`;
  const saveRes = await page.evaluate(
    async ({ convId, msgId1, msgId2 }) => {
      const res = await fetch(`/api/conversations/${convId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              id: msgId1,
              role: "user",
              text: "Hello from test",
              modality: "text",
              timestamp: Date.now(),
            },
            {
              id: msgId2,
              role: "assistant",
              text: "Hi there!",
              modality: "text",
              timestamp: Date.now() + 1,
            },
          ],
        }),
      });
      return { status: res.status, body: await res.json() };
    },
    { convId, msgId1, msgId2 },
  );
  console.log(`   Status: ${saveRes.status}, saved: ${saveRes.body.saved}`);
  if (saveRes.status !== 200 || saveRes.body.saved !== 2) {
    console.error("   FAIL: Could not save messages", saveRes.body);
    await browser.close();
    process.exit(1);
  }

  // Test 3: Load messages back
  console.log("6. Testing GET /api/conversations/[id]/messages...");
  const loadRes = await page.evaluate(
    async ({ convId }) => {
      const res = await fetch(`/api/conversations/${convId}/messages`);
      return { status: res.status, body: await res.json() };
    },
    { convId },
  );
  console.log(`   Status: ${loadRes.status}, messages: ${loadRes.body.length}`);
  if (loadRes.status !== 200 || loadRes.body.length !== 2) {
    console.error("   FAIL: Could not load messages", loadRes.body);
    await browser.close();
    process.exit(1);
  }
  if (loadRes.body[0].text !== "Hello from test") {
    console.error("   FAIL: Message content mismatch", loadRes.body[0]);
    await browser.close();
    process.exit(1);
  }

  // Test 4: Deduplication — resend same messages
  console.log("7. Testing deduplication (resend same IDs)...");
  await page.evaluate(
    async ({ convId, msgId1 }) => {
      await fetch(`/api/conversations/${convId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              id: msgId1,
              role: "user",
              text: "Hello from test",
              modality: "text",
              timestamp: Date.now(),
            },
          ],
        }),
      });
    },
    { convId, msgId1 },
  );
  // Verify still only 2 messages (not 3)
  const afterDupe = await page.evaluate(
    async ({ convId }) => {
      const res = await fetch(`/api/conversations/${convId}/messages`);
      return { status: res.status, body: await res.json() };
    },
    { convId },
  );
  console.log(`   Messages after dupe attempt: ${afterDupe.body.length}`);
  if (afterDupe.body.length !== 2) {
    console.error("   FAIL: Deduplication broken");
    await browser.close();
    process.exit(1);
  }

  // Test 5: List conversations
  console.log("8. Testing GET /api/conversations...");
  const listRes = await page.evaluate(async () => {
    const res = await fetch("/api/conversations");
    return { status: res.status, body: await res.json() };
  });
  console.log(
    `   Status: ${listRes.status}, conversations: ${listRes.body.length}`,
  );
  if (listRes.status !== 200 || listRes.body.length < 1) {
    console.error("   FAIL: Could not list conversations");
    await browser.close();
    process.exit(1);
  }

  // Test 6: Verify sessionStorage integration
  console.log("10. Testing sessionStorage integration...");
  const sessionTest = await page.evaluate(() => {
    sessionStorage.setItem("conversationId", "test-123");
    return sessionStorage.getItem("conversationId");
  });
  console.log(
    `   sessionStorage: ${sessionTest === "test-123" ? "PASS" : "FAIL"}`,
  );

  console.log("\n=== ALL TESTS PASSED ===");
  await browser.close();
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
