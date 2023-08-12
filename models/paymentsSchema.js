const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const payments=sequelize.define('payments',{
    paymentId:{
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement:true,
    },
    orderId:{
        type: DataTypes.INTEGER,
        allowNull: false,
        foriegnKey:true,
    },
    status:{
        type: DataTypes.INTEGER,
        allowNull: true,
        
    },
    
    userId:{
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        foriegnKey:true,
        foriegnKey:true,
    },
    
    
},
{
   timestamps: false,
});
module.exports=payments;
