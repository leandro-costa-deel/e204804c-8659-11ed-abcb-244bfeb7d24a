const BasicRouteHandler = require('./BasicRouteHandler');

class GetUnpaidJobsForActiveContractsHandler  extends BasicRouteHandler {
    async handleRequest(req,res){
        const Op = req.app.get('Op');
        const { Job, Contract } = req.app.get('models');
        const jobs = await Job.findAll({
            where: {
                paid: false
            },
            include: [{
                model: Contract,
                where: {
                    status: Contract.STATUS.IN_PROGRESS,
                    [Op.or]: [
                        { ClientId: req.profile.id },
                        { ContractorId: req.profile.id },
                    ]
                }
            }],
        });
        return res.json(jobs);
    }
}

const getUnpaidJobsForActiveContractsHandler = new GetUnpaidJobsForActiveContractsHandler();
module.exports = getUnpaidJobsForActiveContractsHandler;