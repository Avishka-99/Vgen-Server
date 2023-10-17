const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const recipes = sequelize.define('recipes', {
    userId:{
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        foriegnKey: true
    },recipeId:{
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },recipeName:{
        type: DataTypes.STRING,
        allowNull: true
    },cuisineType:{
        type: DataTypes.STRING,
        allowNull: true
    },categoryType:{
        type: DataTypes.STRING,
        allowNull: true

    },
    veganCategory:{
        type: DataTypes.STRING,
        allowNull: true
    },checkVegan:{
        type: DataTypes.TINYINT,
        allowNull: true
    },ingredients:{
        type: DataTypes.STRING,
        allowNull: true
    },instructions:{
        type: DataTypes.STRING,
        allowNull: true
    },servingSize:{
        type: DataTypes.STRING,
        allowNull: true
    },preparationTime:{
        type: DataTypes.STRING,
        allowNull: true
    },recipeImage:{
        type: DataTypes.STRING,
        allowNull: true
    },recipeRate:{
        type: DataTypes.INTEGER,
        allowNull: true
    },recipeReview:{
        type: DataTypes.STRING,
        allowNull: true
},
},

 {
    timestamps: false,
});

module.exports = recipes;