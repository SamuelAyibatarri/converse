// import Dexie from 'dexie';
import fs from 'fs';
import path from 'path'

const dbDir = path.join(__dirname, 'db');
const dbPath = path.join(dbDir, 'database.json');
// const db = new Dexie('offlineAuthDB');

// db.version(1).stores({
//   users: '++id, &email, username, passwordHash',
//   agents: '++id, &email, username, passwordHash'
// });

// export default db;

