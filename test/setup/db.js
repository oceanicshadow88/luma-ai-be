const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod;
let connection;

async function connect() {
    if (connection) {
        return connection;
    }
    
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    
    connection = await mongoose.connect(uri);

    return connection;
}

const closeDatabase = async () => {
    if (!connection) {
        return;
    }
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    connection = null;
    if (mongod) {
        await mongod.stop();
        mongod = null;
    }
};

const clearDatabase = async () => {
    if (!mongoose.connection.readyState) {
        console.warn('Database not connected, skipping clear');
        return;
    }
    
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
    }
};

module.exports = { connect, closeDatabase, clearDatabase };