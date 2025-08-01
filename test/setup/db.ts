import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongod: MongoMemoryServer | null = null;
let connection: typeof mongoose | null = null;

export const connect = async (): Promise<typeof mongoose> => {
  if (connection) {
    return connection;
  }

  // Close any existing connections
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }

  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  connection = await mongoose.connect(uri, {
    bufferCommands: false,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });

  return connection;
};

export const closeDatabase = async (): Promise<void> => {
  if (!connection) {
    return;
  }

  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }

  connection = null;

  if (mongod) {
    await mongod.stop();
    mongod = null;
  }
};

export const clearDatabase = async (): Promise<void> => {
  if (!mongoose.connection.readyState || mongoose.connection.readyState !== 1) {
    // eslint-disable-next-line no-console
    console.warn('Database not connected, skipping clear');
    return;
  }

  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    if (collection) {
      await collection.deleteMany({});
    }
  }
};

export const connectToDatabase = connect;
export const disconnectFromDatabase = closeDatabase;
