const { DataTypes } = require('sequelize');
const sequelize = require('./db');


// Define the User model
const feed = sequelize.define('feed', {
    feedId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        foriegnKey: true,
    },
 userId:{
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
              foriegnKey:true,   
              references: {
                     model: 'user',
                     key: 'userId'
              } 
 },feedName:{
        type: DataTypes.STRING,
        allowNull: true
 },description:{
        type: DataTypes.STRING,
        allowNull: true
 },feedImage:{
        type: DataTypes.STRING,
        allowNull: true
 }
},
 {
    timestamps: false,
});


module.exports = feed;