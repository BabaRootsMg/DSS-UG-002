// npm install --save-dev axios tough-cookie axios-cookiejar-support qs
// run with: 
// node csrfTest.js



import axios from 'axios';
import { CookieJar } from 'tough-cookie';
import { wrapper } from 'axios-cookiejar-support';
import qs from 'qs';

const TARGET = 'http://localhost:3000';
const jar = new CookieJar();
const client = wrapper(axios.create({ jar, withCredentials: true }));

(async () => {
  try {
    console.log('\n[1] Logging in to grab session cookie…');
    // 1. Log in to get a valid connect.sid
    const loginRes = await client.post(
      `${TARGET}/login`,
      qs.stringify({ email: 'Christiancab137@gmail.com', password: 'password987' }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        maxRedirects: 0,
        validateStatus: () => true }
    );
    if (!loginRes.headers['set-cookie']?.some(c => c.startsWith('connect.sid='))) {
      console.error('❌ Login failed or no session cookie set');
      process.exit(1);
    }
    console.log('✅ Logged in, session cookie acquired');

    console.log('\n[2] Attempting to POST /posts WITHOUT a CSRF token…');
    // 2. Try to create a post without _csrf (csurf default)  
    const postRes = await client.post(
      `${TARGET}/posts`,
      qs.stringify({ title: 'CSRF Test', content: 'This should be blocked' }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        maxRedirects: 0,
        validateStatus: () => true }
    );

    // 3. Check response
    if (postRes.status === 403) {
      console.log('✅ CSRF protection working (received 403 Forbidden)');
      process.exit(0);
    } else {
      console.error(`❌ CSRF bypassed! Server responded with ${postRes.status}`);
      process.exit(1);
    }

  } catch (err) {
    console.error('❌ Error during test:', err.message);
    process.exit(1);
  }
})();
