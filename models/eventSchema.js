
const { DataTypes } = require('sequelize');
const sequelize = require('./db');

// Define the User model
const event = sequelize.define('event', {
 eventId:{
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        foriegnKey:true,
        autoIncrement:true,
 },name:{
        type: DataTypes.STRING,
        allowNull: true
    },date:{
        type: DataTypes.DATE,
        allowNull: true
    },time:{
        type: DataTypes.TIME,
        allowNull: true
    },location:{
        type: DataTypes.STRING,
        allowNull: true
    },description:{
        type: DataTypes.STRING,
        allowNull: true
    },eventOrganizerId:{
        type: DataTypes.INTEGER,
        allowNull: true,
        foriegnKey:true,
    
    }
 }
    ,

 {
    timestamps: false,
});

module.exports = event;