const app = require('../src/app');
const supertest = require('supertest');
const request = supertest(app);

test("owener get contract by id", async ()=>{
    const resp = await request.get('/contracts/1')
        .set('profile_id', '5')
        .expect('Content-Type', /json/)
        .expect(200);
    expect(resp.body).toBeTruthy();
    expect(resp.body.id).toBe(1);
    expect(resp.body.terms).toBe('bla bla bla');
    expect(resp.body.status).toBe('terminated');
    expect(resp.body.ClientId).toBe(1);
    expect(resp.body.ContractorId).toBe(5);
});

test("not owner tries to get contract by", async ()=>{
    await request.get('/contracts/3')
        .set('profile_id', '1')
        .expect(403);
});