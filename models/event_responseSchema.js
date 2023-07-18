
const { DataTypes } = require('sequelize');
const sequelize = require('./db');

// Define the User model
const eventResponse = sequelize.define('event_response', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        foriegnKey:true,
        autoIncrement:true,
    },eventId:{
        type: DataTypes.INTEGER,
        allowNull: true,
        foriegnKey:true,
    
    }
    }
    ,

 {
    timestamps: false,
});

module.exports = eventResponse;