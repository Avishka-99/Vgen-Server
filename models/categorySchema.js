const {DataTypes} = require('sequelize');
const sequelize = require('./db');

const categories = sequelize.define(
	'categories',
	{
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		image: {
			type: DataTypes.STRING,
			allowNull: true,
		},
	},

	{
		timestamps: false,
	}
);

module.exports = categories;
