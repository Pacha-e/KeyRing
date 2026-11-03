// --- External imports ---
import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DataSource } from 'typeorm';

// --- Constants ---
const directory = mkdtempSync(join(tmpdir(), 'keyring-seed-'));
process.env.DATABASE_PATH = join(directory, 'bootstrap.sqlite');
const { dataSource } = await import('../dist/database/data-source.js');
const options = dataSource.options;
const entities = ['user', 'property', 'contract', 'transaction'];
// --- Test utility ---
class SeedTest {
  static check(name, ok) {
    if (!ok) throw Error(name);
    console.log(`PASS ${name}`);
  }

  static async prepare(name) {
    const db = new DataSource({ ...options, database: join(directory, name) });
    await db.initialize();
    return db;
  }

  static async run(db, port, expectStarted) {
    const child = spawn(process.execPath, ['dist/main.js'], {
      env: { ...process.env, DATABASE_PATH: db.options.database, PORT: String(port) },
      stdio: 'ignore',
    });
    let started = false,
      exited = false;
    child.on('exit', () => {
      exited = true;
    });
    try {
      for (let i = 0; i < 400 && !exited; i++) {
        try {
          await fetch(`http://127.0.0.1:${port}/api/properties`);
          started = true;
          break;
        } catch {
          await new Promise((r) => setTimeout(r, 100));
        }
      }
      SeedTest.check(
        expectStarted ? 'partial database starts' : 'injected seed failure stops startup',
        started === expectStarted && (expectStarted || exited),
      );
    } finally {
      if (!exited) child.kill();
    }
  }
}

// --- Test scenario ---
const partial = await SeedTest.prepare('partial.sqlite');
await partial.query(
  `INSERT INTO "user" (id,city,email,fullName,memberSince,password,phone,role) VALUES ('existing','x','existing@example.com','x','2026-01-01','x','x','user')`,
);
await partial.destroy();
await SeedTest.run(partial, 37243, true);
await partial.initialize();
const partialCounts = await Promise.all(
  entities.map((e) => partial.query(`SELECT COUNT(*) AS n FROM "${e}"`)),
);
SeedTest.check(
  'existing data prevents all seed writes',
  partialCounts.map((x) => x[0].n).join(',') === '1,0,0,0',
);
await partial.destroy();
const fail = await SeedTest.prepare('rollback.sqlite');
await fail.query(
  `CREATE TRIGGER fail_contract BEFORE INSERT ON "contract" BEGIN SELECT RAISE(ABORT, 'injected failure'); END`,
);
await fail.destroy();
await SeedTest.run(fail, 37244, false);
await fail.initialize();
const failCounts = await Promise.all(
  entities.map((e) => fail.query(`SELECT COUNT(*) AS n FROM "${e}"`)),
);
SeedTest.check(
  'seed failure rolls back all tables',
  failCounts.every((x) => x[0].n === 0),
);
await fail.destroy();
