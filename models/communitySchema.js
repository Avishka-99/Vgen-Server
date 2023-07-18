
const { DataTypes } = require('sequelize');
const sequelize = require('./db');

// Define the User model
const community = sequelize.define('community', {
    communityId:{
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement:true,},
name:{
        type: DataTypes.STRING,
        allowNull: true,},
        date:{
        type: DataTypes.DATE,
        allowNull: true,},
        time:{
        type: DataTypes.TIME,
        allowNull: true,},
        noOfMembers:{
        type: DataTypes.INTEGER,
        allowNull: true,},
        description:{
        type: DataTypes.STRING,
        allowNull: true,},
        eventOrganizerId:{
        type: DataTypes.INTEGER,
        allowNull: true,
        foriegnKey:true,
        
        }
},
  
    
    

 {
    timestamps: false,
});

module.exports = community;