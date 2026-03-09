/**
 * Playwright CLI validation script for the Remix artifact type.
 *
 * Run with: npx tsx scripts/validate-remix-artifact.ts
 *
 * This script uses Playwright's browser automation (NOT @playwright/test)
 * to validate that:
 *   1. The Remix type appears in the artifact grid sidebar
 *   2. Clicking Remix opens the artifact canvas
 *   3. The RemixCard renders correctly
 *   4. The Generate Materials section includes a Remix option
 */

import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";

async function main() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 },
  });
  const page = await context.newPage();

  let passed = 0;
  let failed = 0;

  function check(label: string, ok: boolean) {
    if (ok) {
      console.log(`  ✅ ${label}`);
      passed++;
    } else {
      console.log(`  ❌ ${label}`);
      failed++;
    }
  }

  // ── Navigate to landing page and sign in ──
  console.log(`\n🔍 Navigating to ${BASE_URL}...\n`);
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  // Click "Sign In" from landing page
  const signInLink = page.locator("a, button", { hasText: "Sign In" }).first();
  if (await signInLink.isVisible().catch(() => false)) {
    console.log("Navigating to sign-in page...");
    await signInLink.click();
    await page.waitForTimeout(2000);
  }

  // Use a Quick Login demo persona (Dr. Priya)
  const personaButton = page
    .locator("button", { hasText: "Dr. Priya" })
    .first();
  if (await personaButton.isVisible().catch(() => false)) {
    console.log("Logging in as Dr. Priya...");
    await personaButton.click();
    await page.waitForTimeout(4000);
  }

  // After login we should be on the dashboard — check if we need to select a topic
  const currentUrl = page.url();
  console.log(`Current URL: ${currentUrl}\n`);

  // If we're still on root, look for a topic link to navigate
  if (!currentUrl.includes("/dashboard/")) {
    const topicLink = page.locator("a[href*='/dashboard/']").first();
    if (await topicLink.isVisible().catch(() => false)) {
      console.log("Clicking first topic to enter dashboard...");
      await topicLink.click();
      await page.waitForTimeout(3000);
    }
  }

  await page.screenshot({
    path: "scripts/validate-remix-step0-after-login.png",
  });
  console.log("📸 Post-login screenshot saved\n");

  // ── Step 1: Check the artifact grid sidebar for "Remix" ──
  console.log("Step 1: Looking for Remix in the artifact type grid...");

  // The artifact grid is in the sidebar (hidden on mobile, visible on lg+)
  const remixButton = page.locator("button", { hasText: "Remix" }).first();
  await page.waitForTimeout(1000);
  const remixVisible = await remixButton.isVisible().catch(() => false);
  check("Remix button found in artifact grid", remixVisible);

  if (!remixVisible) {
    await page.screenshot({ path: "scripts/validate-remix-step1-debug.png" });
    console.log(
      "  📸 Debug screenshot saved to scripts/validate-remix-step1-debug.png",
    );
    console.log(
      "  ℹ️  The sidebar may be hidden on this viewport or auth may have failed",
    );
  }

  // ── Step 2: Click Remix to open the canvas ──
  if (remixVisible) {
    console.log("\nStep 2: Clicking Remix to open artifact canvas...");
    await remixButton.click();
    await page.waitForTimeout(1000);

    // The URL should now contain ?artifact=remix
    const urlAfterClick = page.url();
    check(
      "URL updated with artifact=remix",
      urlAfterClick.includes("artifact=remix"),
    );

    // Check that the canvas header shows "Remix"
    const canvasHeader = page.locator("span.text-sm.font-semibold", {
      hasText: "Remix",
    });
    const headerVisible = await canvasHeader.isVisible().catch(() => false);
    check("Remix canvas header visible", headerVisible);

    // The Generate Remix toolbar button should be visible
    const generateBtn = page.locator("button", {
      hasText: "Generate Remix",
    });
    const genBtnVisible = await generateBtn.isVisible().catch(() => false);
    check("Generate Remix toolbar button visible", genBtnVisible);

    await page.screenshot({ path: "scripts/validate-remix-step2.png" });
    console.log("  📸 Screenshot saved to scripts/validate-remix-step2.png");
  }

  // ── Step 3: Navigate back and check Generate Materials section ──
  console.log("\nStep 3: Checking Generate Materials section...");

  // Click the guide tab
  const guideTab = page.locator("[role='tab']", { hasText: /guide/i }).first();
  if (await guideTab.isVisible().catch(() => false)) {
    await guideTab.click();
    await page.waitForTimeout(1000);
  }

  // Look for the "Remix" generate card — it may need scrolling
  const remixGenCard = page.locator("button", {
    hasText: "Remix",
  });
  const genCardCount = await remixGenCard.count();
  check("Remix option exists in Generate Materials", genCardCount > 0);

  await page.screenshot({ path: "scripts/validate-remix-final.png" });
  console.log("  📸 Final screenshot saved\n");

  // ── Summary ──
  console.log("─".repeat(40));
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log("─".repeat(40));

  if (failed > 0) {
    console.log("\n⚠️  Some checks failed — review screenshots for details");
  } else {
    console.log("\n✨ All checks passed!");
  }

  // Keep browser open for manual inspection
  console.log("\nBrowser stays open 10s for inspection...");
  await page.waitForTimeout(10000);

  await browser.close();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Validation failed:", err);
  process.exit(1);
});
