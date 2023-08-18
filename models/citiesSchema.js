const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const cities = sequelize.define('cities', {
    id:{
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,

    },name:{
        type: DataTypes.STRING,
        allowNull: true
    }
},

 {
    timestamps: false,
});

module.exports = cities;