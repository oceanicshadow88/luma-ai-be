const db = require('./db');
const app = require('./app');

beforeAll(async () => {
    console.log('Jest Setup: Starting database and app...');
    await db.connect();
    await db.clearDatabase();
    await app.loadApp();
    console.log('Jest Setup: Database and app loaded successfully');
});

beforeEach(async () => {
    // Reset the database before each test
    await db.clearDatabase();
});

afterAll(async () => {
    // Close the database connection after all tests are done
    await db.closeDatabase();
    await app.closeApp();
});