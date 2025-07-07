const request = require('supertest');
const UserBuilder = require('./builders/userBuilder');
const app = require('../setup/app');
const jestSetup = require('../setup/jest-setup');

describe('Sign Up Admin', () => {
    it('should create an admin user successfully', async () => {
        const adminUser = new UserBuilder()
            .withEmail('abc@lumaai.com')
            .withPassword('!passwordD123')
            .withFirstName('Admin')
            .withLastName('User')
            .build();
                    
        const response = await request(app.application)
            .post('/api/v1/auth/signup/admin')
            .send({ 
                ...adminUser, 
                termsAccepted: true, 
                verifyValue: '8888888', 
                companyId: jestSetup.defaultCompany._id 
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('refreshToken');
        expect(response.body).toHaveProperty('accessToken');
    })

    it('should reject admin signup with invalid email domain', async () => {
        const adminUser = new UserBuilder()
            .withEmail('abc@lumaaia.com')
            .withPassword('!passwordD123')
            .withFirstName('Admin')
            .withLastName('User')
            .build();
                    
        const response = await request(app.application)
            .post('/api/v1/auth/signup/admin')
            .send({ 
                ...adminUser, 
                termsAccepted: true, 
                verifyValue: '8888888', 
                companyId: jestSetup.defaultCompany._id 
            });

        expect(response.status).toBe(302);
    })
})