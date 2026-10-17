const API_URL = 'http://localhost:4000';

async function runRegressionTest() {
  const testEmail = `regression_${Date.now()}@university.edu`;
  const testPassword = 'SecurePassword123!';
  const testName = 'Dr. Sarah Connor';

  console.log(`\n=== 1. SIGN UP (POST /api/auth/register) with ${testEmail} ===`);
  const regRes = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: testPassword, name: testName }),
  });
  const regCookie = regRes.headers.get('set-cookie');
  const regData = await regRes.json();
  console.log('Register HTTP status:', regRes.status);
  console.log('Register Cookie set:', !!regCookie);
  console.log('Register User returned:', regData.user?.email, regData.user?.name);
  if (regRes.status !== 201 || !regData.user?.id) {
    throw new Error(`Register failed: ${JSON.stringify(regData)}`);
  }

  console.log(`\n=== 2. VERIFY GET /api/auth/me WITH SESSION COOKIE ===`);
  const meRes = await fetch(`${API_URL}/api/auth/me`, {
    headers: { Cookie: regCookie },
  });
  const meData = await meRes.json();
  console.log('GET /me HTTP status:', meRes.status);
  console.log('Authenticated as:', meData.user?.email, meData.user?.name);
  if (meRes.status !== 200 || meData.user?.email !== testEmail) {
    throw new Error('GET /me failed');
  }

  console.log(`\n=== 3. SIGN OUT (POST /api/auth/logout) ===`);
  const logoutRes = await fetch(`${API_URL}/api/auth/logout`, {
    method: 'POST',
    headers: { Cookie: regCookie },
  });
  const logoutCookie = logoutRes.headers.get('set-cookie');
  console.log('Logout HTTP status:', logoutRes.status);
  console.log('Logout Clears Cookie:', logoutCookie?.includes('Max-Age=0') || logoutCookie?.includes('expires='));

  console.log(`\n=== 4. ATTEMPT SIGN IN WITH WRONG PASSWORD (Must be rejected) ===`);
  const wrongPassRes = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: 'WrongPassword456!' }),
  });
  const wrongPassData = await wrongPassRes.json();
  console.log('Wrong Password HTTP status:', wrongPassRes.status);
  console.log('Wrong Password Error Message:', wrongPassData.message);
  if (wrongPassRes.status !== 401 || wrongPassData.message !== 'Email or password is incorrect.') {
    throw new Error('Wrong password test failed');
  }

  console.log(`\n=== 5. SIGN IN WITH CORRECT PASSWORD (Must succeed & restore profile) ===`);
  const loginRes = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: testPassword }),
  });
  const loginCookie = loginRes.headers.get('set-cookie');
  const loginData = await loginRes.json();
  console.log('Sign in HTTP status:', loginRes.status);
  console.log('Sign in Cookie set:', !!loginCookie);
  console.log('Sign in User returned:', loginData.user?.email, loginData.user?.name);
  if (loginRes.status !== 200 || loginData.user?.email !== testEmail || loginData.user?.name !== testName) {
    throw new Error('Sign in failed to restore user');
  }

  console.log('\n✅ ALL AUTH REGRESSION CHECKS PASSED: Account persisted cleanly in Neon across logout and sign-in!');
}

runRegressionTest().catch((err) => {
  console.error('❌ REGRESSION TEST FAILED:', err);
  process.exit(1);
});
