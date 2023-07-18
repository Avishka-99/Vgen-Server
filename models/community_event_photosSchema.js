
const { DataTypes } = require('sequelize');
const sequelize = require('./db');

// Define the User model
const communityEventPhotos = sequelize.define('community_event_photos', {
    eventId:{
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        foriegnKey:true,
    },images:{
        type: DataTypes.STRING,
        allowNull: true
    },
    }
    ,

 {
    timestamps: false,
});

module.exports = communityEventPhotos;