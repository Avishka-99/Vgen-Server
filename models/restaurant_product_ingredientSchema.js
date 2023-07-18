const { DataTypes } = require('sequelize');
const sequelize = require('./db');

// Define the User model
const restaurantProductIngredient = sequelize.define('restaurant_product_ingredient', {
   productId:{
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        foriegnKey:true,
        autoIncrement:true,
   },ingredient:{
        type: DataTypes.STRING,
        allowNull: true
        
   },
}, {
    timestamps: false,
});

module.exports = restaurantProductIngredient;