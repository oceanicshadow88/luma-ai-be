import * as app from './app';
import * as db from './db';

export default async (): Promise<void> => {
  await db.connect();
  await db.clearDatabase();
  await app.loadApp();
};
