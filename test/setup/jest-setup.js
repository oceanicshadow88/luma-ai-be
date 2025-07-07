const db = require('./db');
const app = require('./app');
const UserBuilder = require('../__test__/builders/userBuilder');
const CompanyBuilder = require('../__test__/builders/companyBuilder');

let _defaultUser = null;
let _defaultCompany = null;

const createDefaultData = async () => {
    // Create a default company with owner for tests
    _defaultUser = await new UserBuilder()
        .withEmail('owner@lumaai.com')
        .withUsername('defaultowner')
        .withFirstName('Default')
        .withLastName('Owner')
        .save();
    
    _defaultCompany = await new CompanyBuilder()
        .withOwner(_defaultUser._id)
        .save();
}

beforeAll(async () => {
    await db.connect();
    await db.clearDatabase();
    await app.loadApp();
});

beforeEach(async () => {
    // Reset the database before each test
    await db.clearDatabase();
    await createDefaultData();
});

afterAll(async () => {
    // Close the database connection after all tests are done
    await db.closeDatabase();
    await app.closeApp();
});

// Export read-only getters
module.exports = {
    get defaultUser() {
        
        return _defaultUser;
    },
    get defaultCompany() {
        return _defaultCompany;
    }
};