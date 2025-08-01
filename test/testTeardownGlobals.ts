import 'tsconfig-paths/register';

import * as app from './setup/app';
import * as db from './setup/db';

export default async (): Promise<void> => {
  await db.closeDatabase();
  await app.closeApp();
  process.exit(0);
};
