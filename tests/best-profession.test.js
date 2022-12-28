const app = require('../src/app');
const supertest = require('supertest');
const request = supertest(app);

describe("get /admin/best-profession", ()=>{
    test("get best professions without authetication", async ()=>{
        await request.get('/admin/best-profession').expect(401);
    });

    test("get best professions without start param", async ()=>{
        const resp = await request.get('/admin/best-profession')
            .set('profile_id', '1')
            .expect(400);
        expect(resp.text).toBe("Invalid Start Date");
    });

    test("get best professions with invalid start param", async ()=>{
        const resp = await request.get('/admin/best-profession?start=abc')
            .set('profile_id', '1')
            .expect(400);
        expect(resp.text).toBe("Invalid Start Date");
    });

    test("get best professions without end param", async ()=>{
        const resp = await request.get('/admin/best-profession?start=2022-12-27')
            .set('profile_id', '1')
            .expect(400);
        expect(resp.text).toBe("Invalid End Date");
    });

    test("get best professions with start bigger than end", async ()=>{
        const resp = await request.get('/admin/best-profession?start=2022-12-27&end=2020-01-01')
            .set('profile_id', '1')
            .expect(400);
        expect(resp.text).toBe("Invalid Date Range");
    });

    test("get best professions - ok", async ()=>{
        const resp = await request.get('/admin/best-profession?start=2000-01-01&end=2022-01-01')
            .set('profile_id', '1')
            .expect(200);
        expect(resp.body).toBeTruthy();
        expect(resp.body.profession).toBeTruthy();
        expect(resp.body.profession).toBe("Programmer");
    });
});