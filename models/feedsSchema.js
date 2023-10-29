const { DataTypes } = require('sequelize');
const sequelize = require('./db');


// Define the User model
const feed = sequelize.define('post', {
    postId: {
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
 },communityId:{
              type: DataTypes.INTEGER,
              allowNull: true,
              foriegnKey:true,
              references: {
              model: 'community',
              key: 'communityId'
       } 
       
 },title:{
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


module.exports = feed;