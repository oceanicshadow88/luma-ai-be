const request = require('supertest');
const UserBuilder = require('./builders/userBuilder');
const app = require('../setup/app');

describe('Sign Up Admin', () => {

    it('should create an admin user successfully', async () => {
        const adminUser = new UserBuilder()
            .withEmail('abc@lumaai.com')
            .withPassword('!passwordD123')
            .withFirstName('Admin')
            .withLastName('User')
            .build();
        console.log({ adminUser, ...{ termsAccepted: true, verifyValue: '8888888' } });
        const response = await request(app.application)
            .post('/api/v1/auth/signup/admin')
            .send({ ...adminUser, ...{ termsAccepted: true, verifyValue: '8888888' } });

        expect(response.status).toBe(201);
        expect(response.body.user.email).toBe(adminUser.email);
        expect(response.body.user.username).toBe(adminUser.username);
        expect(response.body.user.firstName).toBe(adminUser.firstName);
        expect(response.body.user.lastName).toBe(adminUser.lastName);
    })
})