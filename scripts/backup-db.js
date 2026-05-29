/* eslint-disable */
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment');
  process.exit(1);
}

const ts = new Date()
  .toISOString()
  .replace(/[:.]/g, '-')
  .replace('T', '_')
  .slice(0, 19);

const projectRoot = path.resolve(__dirname, '..');
const backupsDir = path.join(projectRoot, 'backups');
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), `zereklab-backup-${ts}-`));
const dumpDir = path.join(tmpDir, `zereklab-backup-${ts}`);
fs.mkdirSync(dumpDir, { recursive: true });

if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir, { recursive: true });
}

async function run() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  console.log('Connected to MongoDB');

  const url = new URL(MONGODB_URI);
  let dbNameFromUri = url.pathname.replace(/^\//, '');

  if (!dbNameFromUri) {
    const admin = client.db().admin();
    const { databases } = await admin.listDatabases();
    const userDbs = databases.filter(
      (d) => !['admin', 'local', 'config'].includes(d.name)
    );
    console.log(
      'Available databases:',
      userDbs.map((d) => `${d.name} (${(d.sizeOnDisk / 1024).toFixed(1)}KB)`).join(', ')
    );

    let pick = userDbs.find((d) => d.name.toLowerCase() === 'zereklab');
    if (!pick) {
      pick = userDbs.sort((a, b) => b.sizeOnDisk - a.sizeOnDisk)[0];
    }
    dbNameFromUri = pick ? pick.name : 'zereklab';
    console.log(`Using database: "${dbNameFromUri}"`);
  }

  const db = client.db(dbNameFromUri);

  const collections = await db.listCollections().toArray();
  console.log(`Found ${collections.length} collections in "${dbNameFromUri}"`);

  const summary = {
    database: dbNameFromUri,
    timestamp: new Date().toISOString(),
    collections: [],
  };

  for (const { name } of collections) {
    const coll = db.collection(name);
    const docs = await coll.find({}).toArray();
    const file = path.join(dumpDir, `${name}.json`);
    fs.writeFileSync(file, JSON.stringify(docs, null, 2), 'utf8');
    console.log(`  - ${name}: ${docs.length} docs -> ${path.basename(file)}`);
    summary.collections.push({ name, count: docs.length });
  }

  fs.writeFileSync(
    path.join(dumpDir, '_meta.json'),
    JSON.stringify(summary, null, 2),
    'utf8'
  );

  await client.close();

  const zipName = `zereklab-backup-${ts}.zip`;
  const zipPath = path.join(backupsDir, zipName);

  execSync(`zip -r ${JSON.stringify(zipPath)} ${JSON.stringify(path.basename(dumpDir))}`, {
    cwd: tmpDir,
    stdio: 'inherit',
  });

  fs.rmSync(tmpDir, { recursive: true, force: true });

  const stat = fs.statSync(zipPath);
  console.log(`\nBackup created: ${zipPath}`);
  console.log(`Size: ${(stat.size / 1024).toFixed(2)} KB`);
}

run().catch((err) => {
  console.error('Backup failed:', err);
  process.exit(1);
});
