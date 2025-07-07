const db = require('./db');
const app = require('./app');

module.exports = async () => {
    await db.connect();
    await db.clearDatabase();
    await app.loadApp();
};
