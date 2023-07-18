
const { DataTypes } = require('sequelize');
const sequelize = require('./db');

// Define the User model
const communityResponse = sequelize.define('community_response', {
userId:{
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    foriegnKey:true,
},communityId:{
    type: DataTypes.INTEGER,
    allowNull: true,
    foriegnKey:true,
}
    }
    ,

 {
    timestamps: false,
});

module.exports = communityResponse;