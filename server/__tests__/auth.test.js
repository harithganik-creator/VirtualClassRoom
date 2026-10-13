const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { once } = require('node:events');
const { test } = require('node:test');

process.env.JWT_SECRET ||= 'test-only-secret';

const app = require('../app');

test('users can register, sign in, and receive an error for invalid credentials', async (context) => {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  context.after(() => new Promise((resolve) => server.close(resolve)));

  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}/api/auth`;
  const credentials = {
    name: 'Auth Test User',
    email: `auth-${randomUUID()}@example.com`,
    password: 'test-password-123',
    role: 'student',
  };

  const registerResponse = await fetch(`${baseUrl}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  const registered = await registerResponse.json();

  assert.equal(registerResponse.status, 201);
  assert.equal(registered.user.email, credentials.email);
  assert.ok(registered.token);

  const loginResponse = await fetch(`${baseUrl}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: credentials.email, password: credentials.password }),
  });
  const loggedIn = await loginResponse.json();

  assert.equal(loginResponse.status, 200);
  assert.equal(loggedIn.user.email, credentials.email);
  assert.ok(loggedIn.token);

  const invalidResponse = await fetch(`${baseUrl}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: credentials.email, password: 'wrong-password' }),
  });

  assert.equal(invalidResponse.status, 401);
});