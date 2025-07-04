module.exports = async () => {
    const db = require('./setup/db');
    const app = require('./setup/app');
    
    await db.closeDatabase();
    await app.closeApp();
    process.exit(0);
};