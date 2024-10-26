const {DataTypes} = require('sequelize');
const sequelize = require('./db');
const multer = require('multer');
const path = require('path');
const restaurant = require('./restaurant_managerSchema');
const Product = require('./productSchema');

// Define the User model

const sellProduct = sequelize.define(
	'sell_product',
	{
		productId: {
			type: DataTypes.INTEGER,

			allowNull: false,
			primaryKey: true,
		},
		manufactureId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
			foriegnKey: true,
		},
		price: {
			type: DataTypes.INTEGER,
			allowNull: true,
		},
		quantity: {
			type: DataTypes.FLOAT,
			allowNull: true,
		},
		options: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		

		priceBase: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		potionType: {
			type: DataTypes.TINYINT,
			allowNull: true,
		},
		largeIncreament: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		smallDecreament: {
			type: DataTypes.FLOAT,
			allowNull: true,
		}
	},
	{
		timestamps: false,
	}
);



module.exports = sellProduct;
