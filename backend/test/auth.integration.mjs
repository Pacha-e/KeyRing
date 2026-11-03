// --- External imports ---
import Database from 'better-sqlite3';
import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// --- Constants ---
const directory = mkdtempSync(join(tmpdir(), 'keyring-auth-'));
const port = 37241;
const child = spawn(process.execPath, ['dist/main.js'], {
  env: { ...process.env, DATABASE_PATH: join(directory, 'test.sqlite'), PORT: String(port) },
  stdio: 'ignore',
});
let n = 0;
// --- Test utility ---
class ApiTest {
  static admins(database) {
    return database.prepare('SELECT id FROM "user" WHERE role = ?').all('admin');
  }

  static check(name, ok) {
    if (!ok) throw Error(name);
    console.log(`PASS ${name}`);
  }

  static async request(path, method = 'GET', data, token) {
    const r = await fetch(`http://127.0.0.1:${port}/api${path}`, {
      method,
      headers: {
        ...(data ? { 'content-type': 'application/json' } : {}),
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      ...(data ? { body: JSON.stringify(data) } : {}),
    });
    const text = await r.text();
    return { status: r.status, body: text ? JSON.parse(text) : null };
  }
}

// --- Test scenario ---
try {
  for (; n < 400; n++) {
    try {
      await ApiTest.request('/users');
      break;
    } catch {
      await new Promise((r) => setTimeout(r, 100));
    }
  }
  ApiTest.check('startup', n < 400);
  ApiTest.check('protected anonymous', (await ApiTest.request('/properties')).status === 401);
  const admin = await ApiTest.request('/users/login', 'POST', {
    email: 'admin@keyring.co',
    password: 'admin123',
  });
  const user = await ApiTest.request('/users/login', 'POST', {
    email: 'user@keyring.co',
    password: 'user123',
  });
  ApiTest.check(
    'login sessions',
    admin.status === 200 && user.status === 200 && !!admin.body.token && !!user.body.token,
  );
  const a = admin.body.token,
    u = user.body.token;
  ApiTest.check(
    'users restricted',
    (await ApiTest.request('/users', 'GET', undefined, u)).status === 403,
  );
  ApiTest.check(
    'anonymous admin denied',
    (
      await ApiTest.request('/users', 'POST', {
        city: 'x',
        email: 'x@example.com',
        fullName: 'x',
        password: 'x',
        phone: 'x',
        role: 'admin',
      })
    ).status === 403,
  );
  const props = await ApiTest.request('/properties', 'GET', undefined, a);
  const mine = await ApiTest.request('/properties?role=admin&userId=x', 'GET', undefined, u);
  ApiTest.check(
    'untrusted role ignored',
    mine.status === 200 &&
      mine.body.every((p) => p.userId === user.body.user.id) &&
      mine.body.length < props.body.length,
  );
  const foreign = props.body.find((p) => p.userId !== user.body.user.id);
  ApiTest.check(
    'foreign property denied',
    (await ApiTest.request(`/properties/${foreign.id}`, 'GET', undefined, u)).status === 403,
  );
  ApiTest.check(
    'last admin deletion denied',
    (await ApiTest.request(`/users/${admin.body.user.id}`, 'DELETE', undefined, a)).status === 403,
  );
  ApiTest.check(
    'last admin demotion denied',
    (await ApiTest.request(`/users/${admin.body.user.id}`, 'PATCH', { role: 'user' }, a)).status ===
      403,
  );
  ApiTest.check(
    'empty password denied',
    (await ApiTest.request(`/users/${user.body.user.id}`, 'PATCH', { password: '' }, u)).status ===
      400,
  );
  ApiTest.check(
    'null password denied',
    (await ApiTest.request(`/users/${user.body.user.id}`, 'PATCH', { password: null }, u))
      .status === 400,
  );
  ApiTest.check(
    'invalid date denied',
    (
      await ApiTest.request(
        '/transactions',
        'POST',
        {
          amount: 1,
          date: '2026-02-30',
          description: 'x',
          propertyId: mine.body[0].id,
          source: 'OTHER',
          type: 'INCOME',
        },
        u,
      )
    ).status === 400,
  );
  const contracts = await ApiTest.request('/contracts', 'GET', undefined, a);
  const foreignContract = contracts.body.find((c) => !mine.body.some((p) => p.id === c.propertyId));
  ApiTest.check('foreign contract fixture exists', !!foreignContract);
  {
    ApiTest.check(
      'foreign contract denied',
      (await ApiTest.request(`/contracts/${foreignContract.id}`, 'GET', undefined, u)).status ===
        403,
    );
    ApiTest.check(
      'foreign contract update denied',
      (
        await ApiTest.request(
          `/contracts/${foreignContract.id}`,
          'PATCH',
          { tenantName: 'changed' },
          u,
        )
      ).status === 403,
    );
  }
  const transactions = await ApiTest.request('/transactions', 'GET', undefined, u);
  ApiTest.check('transaction fixture exists', transactions.body.length > 0);
  ApiTest.check(
    'moving transaction to foreign property denied',
    (
      await ApiTest.request(
        `/transactions/${transactions.body[0].id}`,
        'PATCH',
        { propertyId: foreign.id },
        u,
      )
    ).status === 403,
  );
  ApiTest.check(
    'foreign property filter gives empty list',
    (await ApiTest.request(`/contracts?propertyIds=${foreign.id}`, 'GET', undefined, u)).body
      .length === 0,
  );
  const second = await ApiTest.request(
    '/users',
    'POST',
    {
      city: 'x',
      email: 'second@example.com',
      fullName: 'Second',
      password: 'password',
      phone: 'x',
      role: 'admin',
    },
    a,
  );
  ApiTest.check('second admin created', second.status === 201);
  const secondLogin = await ApiTest.request('/users/login', 'POST', {
    email: 'second@example.com',
    password: 'password',
  });
  const b = secondLogin.body.token;
  await Promise.all([
    ApiTest.request(`/users/${second.body.id}`, 'PATCH', { role: 'user' }, a),
    ApiTest.request(`/users/${admin.body.user.id}`, 'PATCH', { role: 'user' }, b),
  ]);
  const db = new Database(join(directory, 'test.sqlite'), { readonly: true });
  ApiTest.check('concurrent demotions retain admin', ApiTest.admins(db).length >= 1);
  const remaining = ApiTest.admins(db)[0].id === admin.body.user.id ? a : b;
  const demoted =
    ApiTest.admins(db)[0].id === admin.body.user.id ? second.body.id : admin.body.user.id;
  ApiTest.check(
    'restore second admin',
    (await ApiTest.request(`/users/${demoted}`, 'PATCH', { role: 'admin' }, remaining)).status ===
      200,
  );
  await Promise.all([
    ApiTest.request(`/users/${second.body.id}`, 'DELETE', undefined, a),
    ApiTest.request(`/users/${admin.body.user.id}`, 'DELETE', undefined, b),
  ]);
  ApiTest.check('concurrent deletions retain admin', ApiTest.admins(db).length >= 1);
  db.close();
  ApiTest.check(
    'logout',
    (await ApiTest.request('/users/logout', 'POST', undefined, u)).status === 204 &&
      (await ApiTest.request('/properties', 'GET', undefined, u)).status === 401,
  );
} finally {
  child.kill();
}
