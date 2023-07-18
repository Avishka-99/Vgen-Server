
const { DataTypes } = require('sequelize');
const sequelize = require('./db');

// Define the User model
const complain = sequelize.define('complain', {
   complainId:{
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
},state:{
        type: DataTypes.TINYINT,
        allowNull: true
},description:{
        type: DataTypes.STRING,
        allowNull: true
}
    }
    ,

 {
    timestamps: false,
});

module.exports = complain;