import { openDB } from 'idb';

const DB_NAME = 'OfflinePostsDB';
const STORE_NAME = 'posts';
const DB_VERSION = 1;

async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    },
  });
}

export async function savePostForLater(post) {
  const db = await getDB();
  await db.add(STORE_NAME, post);
}

export async function getOfflinePosts() {
  const db = await getDB();
  return db.getAll(STORE_NAME);
}

export async function clearOfflinePosts() {
  const db = await getDB();
  await db.clear(STORE_NAME);
} 