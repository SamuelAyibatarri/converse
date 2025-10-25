import Dexie from 'dexie';

const db = new Dexie('offlineAuthDB');

// db.version(1).stores({
//   users: '++id, &email, username, passwordHash',
//   agents: '++id, &email, username, passwordHash'
// });

export default db;

