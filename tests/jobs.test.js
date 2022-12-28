const app = require('../src/app');
const supertest = require('supertest');
const request = supertest(app);

describe("/jobs", ()=>{
    test("listing profile without unpaid jobs", async ()=>{
        const resp = await request.get('/jobs/unpaid')
            .set('profile_id', '5')
            .expect('Content-Type', /json/)
            .expect(200);
        expect(resp.body).toBeTruthy();
        expect(Array.isArray(resp.body)).toBe(true);
        expect(resp.body.length).toBe(0);
    });

    test("should not list paid jobs", async ()=>{
        const resp = await request.get('/jobs/unpaid')
            .set('profile_id', '1')
            .expect('Content-Type', /json/)
            .expect(200);
        expect(resp.body).toBeTruthy();
        expect(Array.isArray(resp.body)).toBe(true);
        expect(resp.body.length).toBeGreaterThanOrEqual(1);
        resp.body.forEach( job => {
            expect(job.paid).toBe(false);
            expect(job.Contract.ClientId===1 || job.Contract.ContractorId===1).toBe(true);
        });
    });
});