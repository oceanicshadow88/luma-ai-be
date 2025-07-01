const db = require('./db');
const app = require('./app');

module.exports = async () => {
    console.log('Global Setup: Starting database and app...');
    await db.connect();
    await db.clearDatabase();
    await app.loadApp();
    console.log('Global Setup: Database and app loaded successfully');
};
