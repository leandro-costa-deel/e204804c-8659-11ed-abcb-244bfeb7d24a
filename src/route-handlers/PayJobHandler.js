const BasicRouteHandler = require('./BasicRouteHandler');

class PayJobHandler  extends BasicRouteHandler {
    async handleRequest(req,res){
        const Op = req.app.get('Op');
        const sequelize = req.app.get('sequelize');
        const { Job, Contract, Profile } = req.app.get('models');
        const { job_id } = req.params;
        const transaction = await sequelize.transaction();

        const job = await Job.findOne({
            where: {
                id: job_id
            },
            include: [{
                model: Contract,
                where: {
                    ClientId: req.profile.id
                },
                include: [{
                    model: Profile,
                    as: 'Client',
                    required: true
                }, {
                    model: Profile,
                    as: 'Contractor',
                    required: true
                }]
            }]
        });

        // Guard Clauses to keep the business logic clean.
        if(!job) return res.status(404).send(`Job Not Found ${job_id}`);
        if(job.paid) return res.status(400).send(`Job Already Paid`);
        if(job.Contract.Client.balance < job.price) return res.status(400).send(`Insufficient Funds`);

        try {
            job.Contract.Client.balance -= job.price;
            job.Contract.Contractor.balance += job.price;
            job.paid = true;
            await job.save({ transaction });
            await job.Contract.Client.save({ transaction });
            await job.Contract.Contractor.save({ transaction });
            await transaction.commit();
            return res.json(job);
        } catch(error) {
            transaction.rollback();

            // rethrowing the error to trigger the default error handling on BasicRouteHandler
            throw error; 
        }
    }
}

const payJobHandler = new PayJobHandler();
module.exports = payJobHandler;