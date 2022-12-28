const { Op } = require("sequelize");

module.exports = async function GetUnpaidJobsForActiveContractsHandler(req,res){
    try {
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
        res.json(jobs);
    } catch(error) {
        console.error("ERROR:", error);
        res.status(500).send(''+error);
    }
}