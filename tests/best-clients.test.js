const app = require('../src/app');
const supertest = require('supertest');
const request = supertest(app);

describe("get /admin/best-clients", ()=>{
    test("get best clients without authetication", async ()=>{
        await request.get('/admin/best-clients').expect(401);
    });

    test("get best clients without start param", async ()=>{
        const resp = await request.get('/admin/best-clients')
            .set('profile_id', '1')
            .expect(400);
        expect(resp.text).toBe("Invalid Start Date");
    });

    test("get best clients with invalid start param", async ()=>{
        const resp = await request.get('/admin/best-clients?start=abc')
            .set('profile_id', '1')
            .expect(400);
        expect(resp.text).toBe("Invalid Start Date");
    });

    test("get best clients without end param", async ()=>{
        const resp = await request.get('/admin/best-clients?start=2022-12-27')
            .set('profile_id', '1')
            .expect(400);
        expect(resp.text).toBe("Invalid End Date");
    });

    test("get best clients with start bigger than end", async ()=>{
        const resp = await request.get('/admin/best-clients?start=2022-12-27&end=2020-01-01')
            .set('profile_id', '1')
            .expect(400);
        expect(resp.text).toBe("Invalid Date Range");
    });

    test("get best clients with invalid limit param (-1)", async ()=>{
        const resp = await request.get('/admin/best-clients?start=2022-01-01&end=2022-12-27&limit=-1')
            .set('profile_id', '1')
            .expect(400);
        expect(resp.text).toBe("Invalid Limit");
    });

    test("get best clients with invalid limit param (NaN)", async ()=>{
        const resp = await request.get('/admin/best-clients?start=2022-01-01&end=2022-12-27&limit=xD')
            .set('profile_id', '1')
            .expect(400);
        expect(resp.text).toBe("Invalid Limit");
    });

    test("get best clients - implicit limit param (2)", async ()=>{
        const resp = await request.get('/admin/best-clients?start=2000-01-01&end=2022-01-01')
            .set('profile_id', '1')
            .expect(200);
        expect(resp.body).toBeTruthy();
        expect(Array.isArray(resp.body)).toBe(true);
        expect(resp.body.length).toBe(2); // Default Limit specified on the task

        let lastPaid = 0;
        resp.body.forEach( client => {
            expect(client).toBeDefined();
            expect(client.id).toBeGreaterThan(0);

            // Asserts the order
            expect(lastPaid===0 || client.paid <= lastPaid).toBe(true);
            lastPaid = client.paid;
        })
    });

    test("get best clients with limit", async ()=>{
        const resp = await request.get('/admin/best-clients?start=2000-01-01&end=2022-01-01&limit=3')
            .set('profile_id', '1')
            .expect(200);
        expect(resp.body).toBeTruthy();
        expect(Array.isArray(resp.body)).toBe(true);
        expect(resp.body.length).toBe(3);

        let lastPaid = 0;
        resp.body.forEach( client => {
            expect(client).toBeDefined();
            expect(client.id).toBeGreaterThan(0);

            // Asserts the order
            expect(lastPaid===0 || client.paid <= lastPaid).toBe(true);
            lastPaid = client.paid;
        })
    });
});