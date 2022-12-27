module.exports = async function ContractByIdHandler(req,res){
    const {Contract} = req.app.get('models');
    const {id} = req.params;
    const contract = await Contract.findOne({
        where: {id}});
    if(!contract) return res.status(404).end();
    if(contract.ContractorId !== req.profile.id) return res.status(403).end();
    res.json(contract);
}