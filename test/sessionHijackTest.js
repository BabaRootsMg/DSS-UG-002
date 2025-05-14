//npm install --save-dev puppeteer
//run with node sessionHijackTest.js


// sessionHijackTest.js
import puppeteer from 'puppeteer';
import assert from 'assert';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  // Two isolated pages = two “browsers”
  const victimPage   = await browser.newPage();
  const attackerPage = await browser.newPage();

  // 1. Victim logs in
  await victimPage.goto('http://localhost:3000/login');
  await victimPage.type('input[name="email"]', 'alice@x.com');
  await victimPage.type('input[name="password"]', 'correcthorsebatterystaple');
  await Promise.all([
    victimPage.click('button[type="submit"]'),
    victimPage.waitForNavigation()
  ]);

  // 2. Grab the session cookie
  const cookies = await victimPage.cookies();
  const sessionCookie = cookies.find(c => c.name === 'connect.sid');
  assert(sessionCookie, 'No session cookie set for victim');

  // 3. Attacker imports that cookie
  await attackerPage.setCookie(sessionCookie);
  await attackerPage.goto('http://localhost:3000/posts/new');

  // 4. Check whether attacker is blocked
  const currentUrl = attackerPage.url();
  const blocked = /\/login$/.test(currentUrl) 
    || currentUrl.includes('Invalid');  // adjust to your app’s behavior

  if (blocked) {
    console.log('✅ Hijack prevented');
    process.exit(0);
  } else {
    console.error('❌ Hijack succeeded!');
    process.exit(1);
  }
})().catch(err => {
  console.error(err);
  process.exit(1);
});
