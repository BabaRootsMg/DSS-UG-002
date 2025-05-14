//npm install --save-dev axios
// run it with:
//node sqlInjectionTest.js



import axios from 'axios'
import { performance } from 'perf_hooks'

const TARGET = 'http://localhost:3000'
const TIME_THRESHOLD = 4000  // ms

async function errorBasedTest() {
  console.log('\n[Error-Based] Testing search?keyword=\'');
  try {
    const res = await axios.get(`${TARGET}/posts/search`, {
      params: { keyword: `'` },
      validateStatus: () => true
    });
    if (/syntax error|SQL/.test(res.data)) {
      console.error('❌ Vulnerable: SQL error leaked in response');
    } else {
      console.log('✅ No SQL error in response');
    }
  } catch (e) {
    console.error('✅ No leak (request threw, but no SQL error in body)');
  }
}

async function booleanBypassTest() {
  console.log('\n[Boolean-Bypass] Testing login with OR1=1:');
  const res = await axios.post(`${TARGET}/login`, 
    'email=%27%20OR%20%271%27%3D%271&password=x',
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      maxRedirects: 0,
      validateStatus: () => true
    }
  );
  // If your app redirects to dashboard or to 2FA page, that's a fail
  const location = res.headers['location'] || '';
  if (/dashboard|verify/.test(location)) {
    console.error('❌ Vulnerable: login bypass succeeded');
  } else {
    console.log('✅ Login bypass blocked');
  }
}

async function timeDelayTest() {
  console.log('\n[Time-Delay] Testing pg_sleep on POST /posts');
  const payload = `foo'; SELECT pg_sleep(5);--`;
  const body = new URLSearchParams({ title: payload, content: 'x' }).toString();

  const start = performance.now();
  await axios.post(`${TARGET}/posts`, body, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    validateStatus: () => true
  });
  const duration = performance.now() - start;

  if (duration > TIME_THRESHOLD) {
    console.error(`❌ Vulnerable: response took ${Math.round(duration)}ms`);
  } else {
    console.log(`✅ No blind SQLi (took ${Math.round(duration)}ms)`);
  }
}

(async () => {
  console.log('Starting SQL Injection Tests against', TARGET);
  await errorBasedTest();
  await booleanBypassTest();
  await timeDelayTest();
})();
