const Sequelize = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite3',
});

class Profile extends Sequelize.Model {}
Profile.init(
  {
    firstName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    profession: {
      type: Sequelize.STRING,
      allowNull: false
    },
    balance:{
      type:Sequelize.DECIMAL(12,2)
    },
    type: {
      type: Sequelize.ENUM('client', 'contractor'),
      allowNull: false,
    }
  },
  {
    sequelize,
    modelName: 'Profile'
  }
);

Profile.TYPE = {
  CLIENT: 'client',
  CONTRACTOR: 'contractor',
}

Profile.prototype.getTotalAmmountToPay = async function(){
  const resp = await Job.findOne({
    attributes: [
      [sequelize.fn('sum', sequelize.col('price')), 'total_amount'],
    ],
    where: {
      paid: false
    },
    include: [{
      attributes:[],
      model: Contract,
      where: {
        ClientId: this.id,
      },
      required: true,
    }]
  });

  return resp.dataValues.total_amount;
}

class Contract extends Sequelize.Model {}
Contract.init(
  {
    terms: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    status:{
      type: Sequelize.ENUM('new','in_progress','terminated')
    }
  },
  {
    sequelize,
    modelName: 'Contract',
    indexes: [{
      fields: ['status'] 
    }]
  }
);

Contract.STATUS = {
  NEW: 'new',
  IN_PROGRESS: 'in_progress',
  TERMINATED: 'terminated',
};

class Job extends Sequelize.Model {}
Job.init(
  {
    description: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    price:{
      type: Sequelize.DECIMAL(12,2),
      allowNull: false
    },
    paid: {
      type: Sequelize.BOOLEAN,
      defaultValue:false
    },
    paymentDate:{
      type: Sequelize.DATE
    }
  },
  {
    sequelize,
    modelName: 'Job',
    indexes: [{
      fields: ['paid'] 
    }]
  }
);

Profile.hasMany(Contract, {as :'Contractor',foreignKey:'ContractorId'})
Contract.belongsTo(Profile, {as: 'Contractor'})
Profile.hasMany(Contract, {as : 'Client', foreignKey:'ClientId'})
Contract.belongsTo(Profile, {as: 'Client'})
Contract.hasMany(Job)
Job.belongsTo(Contract)

module.exports = {
  sequelize,
  Op: Sequelize.Op,
  Profile,
  Contract,
  Job
};
