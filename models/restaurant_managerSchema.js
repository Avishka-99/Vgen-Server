
const { DataTypes } = require('sequelize');
const sequelize = require('./db');

// Define the User model
const restaurantManager = sequelize.define('restaurant_manager', {
 restaurantManagerId:{
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
    
 },registrationNo:{
        type: DataTypes.STRING,
        allowNull: true,
 },bussinessRegDocument:{
        type: DataTypes.STRING,
        allowNull: true,
 },latitude:{
        type: DataTypes.STRING,
        allowNull: true,
 },longitude:{
        type: DataTypes.STRING,
        allowNull: true,
 },resturantType:{
        type: DataTypes.STRING,
        allowNull: true,
 },resturantName:{
        type: DataTypes.STRING,
        allowNull: true,
 },accountNo:{
        type: DataTypes.STRING,
        allowNull: true,
 },openTime:{
        //time
        type:DataTypes.TIME,
        allowNull: true,
 },closeTime:{
        //time
        type:DataTypes.TIME,
        allowNull: true,
 },
}, {
    timestamps: false,
});

module.exports = restaurantManager;