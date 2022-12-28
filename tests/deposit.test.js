const app = require('../src/app');
const supertest = require('supertest');
const request = supertest(app);
const { Profile } = require('../src/model');

describe("post /balances/deposit/:userId", ()=>{
    test("deposit without authorization", async ()=>{
        await request.post('/balances/deposit/1').expect(401);
    });

    test("deposit invalid ammount: -1", async ()=>{
        const resp = await request.post('/balances/deposit/1')
            .set('profile_id', 1)
            .send({ ammount: -1 })
            .expect(400);
        expect(resp.text).toBe('Invalid Ammount');
    });

    test("deposit invalid ammount: 0", async ()=>{
        const resp = await request.post('/balances/deposit/1')
            .set('profile_id', 1)
            .send({ ammount: 0 })
            .expect(400);
        expect(resp.text).toBe('Invalid Ammount');
    });

    test("deposit invalid ammount: NaN", async ()=>{
        const resp = await request.post('/balances/deposit/1')
            .set('profile_id', 1)
            .send({ ammount: 'xD' })
            .expect(400);
        expect(resp.text).toBe('Invalid Ammount');
    });

    test("deposit ammount bigger than 25% of total jobs to pay", async ()=>{
        const resp = await request.post('/balances/deposit/1')
            .set('profile_id', 1)
            .send({ ammount: 20000 }) // 20k
            .expect(400);
        expect(resp.text).toBe('Deposit Ammount Over 25% of Total Ammount to Pay');
    });

    test("deposit", async ()=>{
        const client = await Profile.findOne({ 
            where: { 
                id: 1 
            }
        });

        const resp = await request.post(`/balances/deposit/${client.id}`)
            .set('profile_id', 1)
            .send({ ammount: 10 })
            .expect('Content-Type', /json/)
            .expect(200);
        expect(resp.body).toBeTruthy();
        expect(resp.body.id).toBe(client.id);
        expect(resp.body.balance).toBe(client.balance + 10);
    });
});
