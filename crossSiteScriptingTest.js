// npm install --save-dev puppeteer
// run with:
// node xssTest.js



import puppeteer from 'puppeteer';

(async () => {
  const TARGET = 'http://localhost:3000';
  const PAYLOAD = `<script>alert("XSS")</script>`;
  let browser, page, vuln = false;

  try {
    browser = await puppeteer.launch({ headless: true });
    page = await browser.newPage();

    // Helper: watch for any alert() and flag vuln
    page.on('dialog', async dialog => {
      if (dialog.type() === 'alert' && dialog.message().includes('XSS')) {
        vuln = true;
        await dialog.dismiss();
      }
    });

    console.log('\n[Reflected XSS] testing search?keyword=PAYLOAD');
    await page.goto(`${TARGET}/posts/search?keyword=${encodeURIComponent(PAYLOAD)}`, { waitUntil: 'networkidle2' });
    // give script a moment to fire
    await page.waitForTimeout(1000);
    console.log(vuln
      ? '❌ Reflected XSS detected'
      : '✅ Reflected XSS not detected');

    // Reset flag before stored test
    vuln = false;

    console.log('\n[Stored XSS] logging in...');
    // 1. log in 
    await page.goto(`${TARGET}/login`, { waitUntil: 'networkidle2' });
    await page.type('input[name="email"]', 'Christiancab137@gmail.com');
    await page.type('input[name="password"]', 'password987');
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2' })
    ]);

    console.log('Creating post with XSS payload in title...');
    // 2. create a post with the payload in the title
    await page.goto(`${TARGET}/posts/new`, { waitUntil: 'networkidle2' });
    await page.type('input[name="title"]', PAYLOAD);
    await page.type('textarea[name="content"]', 'Test content');
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2' })
    ]);

    // 3. capture the new URL (e.g. /posts/123)
    const newPostUrl = page.url();
    console.log(`Visiting ${newPostUrl}`);
    await page.goto(newPostUrl, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(1000);

    console.log(vuln
      ? '❌ Stored XSS detected'
      : '✅ Stored XSS not detected');

    if (vuln) process.exit(1);
    process.exit(0);

  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
})();
