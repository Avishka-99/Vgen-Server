
const { DataTypes } = require('sequelize');
const sequelize = require('./db');

// Define the User model
const donation = sequelize.define('donation', {
  donationId:{
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
    
  },userId:{
        type: DataTypes.INTEGER,
        allowNull: true,
        primaryKey: true,
        foriegnKey:true,
    },eventOrganizerId:{
        type: DataTypes.INTEGER,
        allowNull: true,
        primaryKey: true,
        foriegnKey:true,
    },date:{
        type: DataTypes.DATE,
        allowNull: true
    },time:{
        type: DataTypes.TIME,
        allowNull: true
    },name:{
        type: DataTypes.STRING,
        allowNull: true
    },description:{
        type: DataTypes.STRING,
        allowNull: true
    }

  },

 {
    timestamps: false,
});

module.exports = donation;