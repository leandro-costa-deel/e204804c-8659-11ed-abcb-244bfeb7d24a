const app = require('../src/app');
const supertest = require('supertest');
const request = supertest(app);

test("get /ping", async ()=>{
    const resp = await request.get('/ping')
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(200);
    expect(resp.text).toBe('pong');
});