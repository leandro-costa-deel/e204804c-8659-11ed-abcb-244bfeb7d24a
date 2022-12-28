const BasicRouteHandler = require('./BasicRouteHandler');

class GetNonTerminatedContractsHandler  extends BasicRouteHandler {
    async handleRequest(req,res){
        const Op = req.app.get('Op');
        const { Contract } = req.app.get('models');
        const contracts = await Contract.findAll({
            where: {
                status: {
                    [Op.ne]: Contract.STATUS.TERMINATED
                },
                [Op.or]: [
                    { ClientId: req.profile.id },
                    { ContractorId: req.profile.id },
                ]
            }
        });
        return res.json(contracts);
    }
}

// singleton
const getNonTerminatedContractsHandler = new GetNonTerminatedContractsHandler();
module.exports = getNonTerminatedContractsHandler;