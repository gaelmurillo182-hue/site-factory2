import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  
  // Find overflowing elements
  const overflowers = await page.evaluate(() => {
    const results = [];
    const docWidth = document.documentElement.scrollWidth;
    
    document.querySelectorAll('*').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.right > 390 + 2) {
        const styles = window.getComputedStyle(el);
        results.push({
          tag: el.tagName,
          class: el.className?.toString?.().slice(0, 80) || '',
          id: el.id,
          right: Math.round(rect.right),
          left: Math.round(rect.left),
          width: Math.round(rect.width),
          text: el.textContent?.slice(0, 80) || '',
          overflow: styles.overflow,
          overflowX: styles.overflowX,
        });
      }
    });
    
    return results;
  });
  
  console.log('Elements overflowing 390px viewport:');
  overflowers.forEach(el => {
    console.log(`  ${el.tag}#${el.id}.${el.class.slice(0,40)} right=${el.right} left=${el.left} w=${el.width}`);
    console.log(`    text: "${el.text.slice(0, 60)}"`);
    console.log(`    overflow: ${el.overflow} / overflowX: ${el.overflowX}`);
  });
  
  await browser.close();
}

run().catch(e => { console.error(e); process.exit(1); });
