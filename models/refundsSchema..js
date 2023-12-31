
const { DataTypes } = require('sequelize');
const sequelize = require('./db');

// Define the User model
const refunds = sequelize.define('refunds', {
id:{
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement:true,
},date:{
        type: DataTypes.DATE,
        allowNull: true
},time:{
        type: DataTypes.TIME,
        allowNull: true
},orderId:{
    type: DataTypes.INTEGER,
    allowNull: false,
},status:{
        type: DataTypes.TINYINT,
        allowNull: true
}
    }
    ,

 {
    timestamps: false,
});

module.exports = refunds;