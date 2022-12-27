const { Op } = require("sequelize");

module.exports = async function GetNonTerminatedContractsHandler(req,res){
    try {
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
        res.json(contracts);
    } catch(error) {
        console.log("ERROR:", error);
        res.status(500).send(''+error);
    }
}