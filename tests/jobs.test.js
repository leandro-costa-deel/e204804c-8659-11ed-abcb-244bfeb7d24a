const app = require('../src/app');
const supertest = require('supertest');
const { Job, Contract, Profile } = require('../src/model');
const request = supertest(app);

describe("get /jobs", ()=>{
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

describe("post /jobs/:job_id/pay", ()=>{
    test("pay without profile_id", async ()=>{
        await request.post('/jobs/0/pay')
            .expect(401);
    });

    test("attempt to pay non existing job", async ()=>{
        await request.post(`/jobs/0/pay`)
            .set('profile_id', '1')
            .expect(404);
    });

    test("attempt to pay anothers client job paid job", async ()=>{
        const job = await Job.findOne({
            where: {
                paid: true
            },
            include:{
                model: Contract
            }
        });

        expect(job).toBeTruthy();
        await request.post(`/jobs/${job.id}/pay`)
            .set('profile_id', job.Contract.ClientId+1)
            .expect(404);
    });

    test("attempt to pay a already paid job", async ()=>{
        const job = await Job.findOne({
            where: {
                paid: true
            },
            include:{
                model: Contract
            }
        });
        expect(job).toBeTruthy();
        const resp = await request.post(`/jobs/${job.id}/pay`)
            .set('profile_id', job.Contract.ClientId)
            .expect(400);
        expect(resp.text).toBe('Job Already Paid');
    });

    test("pay without sufficient balance", async ()=>{
        const client = await Profile.create({
            firstName: 'Deel',
            lastName: 'Inc',
            profession: 'Company',
            balance: 0,
            type: Profile.TYPE.CLIENT,
        });

        const contractor = await Profile.create({
            firstName: 'Leandro',
            lastName: 'Costa',
            profession: 'Programer',
            balance: 0,
            type: Profile.TYPE.CONTRACTOR,
        });

        const contract = await Contract.create({
            terms: 'who knows',
            status: Contract.STATUS.IN_PROGRESS,
            ClientId: client.id,
            ContractorId: contractor.id,
        });

        const job = await Job.create({
            description: 'work',
            price: 200,
            ContractId: contract.id,
        });

        expect(job).toBeTruthy();
        const resp = await request.post(`/jobs/${job.id}/pay`)
            .set('profile_id', client.id)
            .expect(400);
        expect(resp.text).toBe('Insufficient Funds');

        await job.destroy();
        await contract.destroy();
        await contractor.destroy();
        await client.destroy();
    });

    test("pay for a job", async ()=>{
        const CLIENT_INITIAL_BALANCE = 100000; // 100k
        const PRICE = 8000; // 8k
        const client = await Profile.create({
            firstName: 'Deel',
            lastName: 'Inc',
            profession: 'Company',
            balance: CLIENT_INITIAL_BALANCE,
            type: Profile.TYPE.CLIENT,
        });

        const contractor = await Profile.create({
            firstName: 'Leandro',
            lastName: 'Costa',
            profession: 'Programer',
            balance: 0,
            type: Profile.TYPE.CONTRACTOR,
        });

        const contract = await Contract.create({
            terms: 'who knows',
            status: Contract.STATUS.IN_PROGRESS,
            ClientId: client.id,
            ContractorId: contractor.id,
        });

        const job = await Job.create({
            description: 'work',
            price: PRICE,
            ContractId: contract.id,
        });

        expect(job).toBeTruthy();
        const resp = await request.post(`/jobs/${job.id}/pay`)
            .set('profile_id', client.id)
            .expect('Content-Type', /json/)
            .expect(200);
        expect(resp.body).toBeTruthy();
        expect(resp.body.id).toBe(job.id);
        expect(resp.body.paid).toBe(true);
        expect(resp.body.ContractId).toBe(contract.id);
        expect(resp.body.Contract.ClientId).toBe(client.id);
        expect(resp.body.Contract.ContractorId).toBe(contractor.id);
        expect(resp.body.Contract.Client.id).toBe(client.id);
        expect(resp.body.Contract.Client.balance).toBe(CLIENT_INITIAL_BALANCE - PRICE);
        expect(resp.body.Contract.Contractor.id).toBe(contractor.id);
        expect(resp.body.Contract.Contractor.balance).toBe(PRICE);

        const refresedClient = await Profile.findOne({ 
            where: { 
                id: client.id 
            }
        });
        expect(refresedClient).toBeTruthy();
        expect(refresedClient.balance).toBe(CLIENT_INITIAL_BALANCE - PRICE);

        const refresedContractor = await Profile.findOne({ 
            where: { 
                id: contractor.id 
            }
        });
        expect(refresedContractor).toBeTruthy();
        expect(refresedContractor.balance).toBe(PRICE);

        await job.destroy();
        await contract.destroy();
        await contractor.destroy();
        await client.destroy();
    });
});