import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const SCREENSHOTS_DIR = 'C:/work/site-factory/sites/topspin/qa-screenshots';
const BASE_URL = 'http://localhost:5173';

const viewports = [
  { name: '390', width: 390, height: 844 },
  { name: '1280', width: 1280, height: 900 },
];

const sections = [
  { name: 'full-page', selector: null },
  { name: 'hero', selector: '#hero, section:first-of-type, .hero' },
  { name: 'about', selector: '#about, [data-section="about"]' },
  { name: 'services', selector: '#services, [data-section="services"]' },
  { name: 'trainers', selector: '#trainers, [data-section="trainers"]' },
  { name: 'schedule', selector: '#schedule, [data-section="schedule"]' },
  { name: 'subscriptions', selector: '#subscriptions, [data-section="subscriptions"]' },
  { name: 'contacts', selector: '#contacts, [data-section="contacts"]' },
  { name: 'footer', selector: 'footer' },
];

async function run() {
  const browser = await chromium.launch({ headless: true });
  const consoleErrors = [];
  
  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
    });
    const page = await context.newPage();
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(`[${vp.name}px] ${msg.text()}`);
      }
    });
    page.on('pageerror', err => {
      consoleErrors.push(`[${vp.name}px] PAGE ERROR: ${err.message}`);
    });
    
    console.log(`Navigating to ${BASE_URL} at ${vp.width}px...`);
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    // Full page screenshot
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/${vp.name}px-full.png`,
      fullPage: true,
    });
    console.log(`Screenshot saved: ${vp.name}px-full.png`);
    
    // Check horizontal scroll
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    console.log(`[${vp.name}px] scrollWidth=${scrollWidth}, clientWidth=${clientWidth}, overflow=${scrollWidth - clientWidth}`);
    
    // Screenshot above the fold
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/${vp.name}px-above-fold.png`,
      fullPage: false,
    });
    
    // Check each section
    for (const section of sections) {
      if (!section.selector) continue;
      try {
        const el = await page.$(section.selector);
        if (el) {
          await el.scrollIntoViewIfNeeded();
          await page.waitForTimeout(500);
          await el.screenshot({
            path: `${SCREENSHOTS_DIR}/${vp.name}px-${section.name}.png`,
          });
          console.log(`Section screenshot: ${vp.name}px-${section.name}.png`);
        } else {
          console.log(`Section not found: ${section.name} (${section.selector})`);
        }
      } catch (e) {
        console.log(`Error screenshotting ${section.name}: ${e.message}`);
      }
    }
    
    // Check if hamburger menu exists on mobile
    if (vp.width === 390) {
      const hamburger = await page.$('button[aria-label*="меню"], button[aria-label*="menu"], .hamburger, [class*="burger"], [class*="menu-toggle"]');
      console.log(`[390px] Hamburger found: ${!!hamburger}`);
      if (hamburger) {
        await hamburger.click();
        await page.waitForTimeout(500);
        await page.screenshot({
          path: `${SCREENSHOTS_DIR}/390px-mobile-menu-open.png`,
          fullPage: false,
        });
        console.log('Mobile menu opened and screenshotted');
      }
    }
    
    // Check images loaded
    const imgResults = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs.map(img => ({
        src: img.src,
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        alt: img.alt,
      }));
    });
    console.log(`[${vp.name}px] Images:`, JSON.stringify(imgResults, null, 2));
    
    await context.close();
  }
  
  if (consoleErrors.length > 0) {
    console.log('\nCONSOLE ERRORS:');
    consoleErrors.forEach(e => console.log(e));
  } else {
    console.log('\nNo console errors detected.');
  }
  
  await browser.close();
}

run().catch(e => {
  console.error('Script failed:', e);
  process.exit(1);
});
