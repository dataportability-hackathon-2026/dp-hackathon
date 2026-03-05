import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.goto('http://localhost:3000/single-page');
await page.waitForTimeout(1000);
await page.screenshot({ path: '/tmp/voice-agent.png' });
await browser.close();
