//npm install --save-dev puppeteer


const puppeteer = require('puppeteer');

describe('Session Hijack Simulation', () => {
  let browser, victimPage, attackerPage;

  beforeAll(async () => {
    browser = await puppeteer.launch({ headless: true });
    // Create two separate, isolated browser contexts
    const contexts = await Promise.all([
      browser.createIncognitoBrowserContext(),
      browser.createIncognitoBrowserContext()
    ]);
    [victimPage, attackerPage] = await Promise.all(
      contexts.map(ctx => ctx.newPage()) 
  });

  afterAll(async () => {
    await browser.close();
  });

  it('should prevent cookie replay across contexts', async () => {
    // 1. Victim logs in
    await victimPage.goto('http://localhost:3000/login');
    await victimPage.type('input[name="email"]', 'alice@x.com');
    await victimPage.type('input[name="password"]', 'correcthorsebatterystaple');
    await Promise.all([
      victimPage.click('button[type="submit"]'),
      victimPage.waitForNavigation()
    ]);

    // 2. Extract the session cookie
    const cookies = await victimPage.cookies();
    const sessionCookie = cookies.find(c => c.name === 'connect.sid');
    expect(sessionCookie).toBeDefined();

    // 3. Attacker imports that cookie into their own context
    await attackerPage.setCookie(sessionCookie);
    // Now attacker tries to hit a protected endpoint
    await attackerPage.goto('http://localhost:3000/posts/new');
    
    // 4. Check — if hijacking is possible, attackerPage is now "logged in"
    const url = attackerPage.url();
    // e.g., your app redirects to login if unauthenticated
    expect(url).toMatch(/\/login/);   
    // or assert that attackerPage does NOT see the post-creation form:
    const formExists = await attackerPage.$('form#new-post') !== null;
    expect(formExists).toBe(false);
  });
});