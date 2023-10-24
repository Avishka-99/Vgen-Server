
const { DataTypes } = require('sequelize');
const sequelize = require('./db');

// Define the User model
const communityEventOrganizer = sequelize.define('community_event_organizer', {
    eventOrganizerId:{
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        foriegnKey:true,
    },organizeName:{
        type:DataTypes.STRING,
        allowNull:true
    }
    ,regNo:{
        type: DataTypes.STRING,
        allowNull: true
    },description:{
        type: DataTypes.STRING,
        allowNull: true
    },nic:{
        type:DataTypes.STRING,
        allowNull:true
    },verifyState:{
        type:DataTypes.TINYINT,
        allowNull:true
    },profilePicture:{
        type:DataTypes.STRING,
        allowNull:true
    }
},

 {
    timestamps: false,
});

module.exports = communityEventOrganizer;