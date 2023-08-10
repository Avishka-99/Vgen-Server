const path = require('path');
const express = require('express');
const router = express.Router();
const app = express();

const jwt = require('jsonwebtoken');
const User = require('../../models/userSchema');
const product = require('../../models/productSchema');
const restaurant = require('../../models/restaurant_managerSchema');
router.post('/fetchrestaurants', (req, res) => {
	User.hasOne(restaurant, {
		foreignKey: 'resturantManagerId',
	});
	restaurant.belongsTo(User, {
		foreignKey: 'resturantManagerId',
	});
	User.findAll({
		include: {
			model: restaurant,
			attributes: ['resturantManagerId', 'latitude', 'longitude', 'resturantType', 'resturantName', 'openTime', 'closeTime'],
			required: true,
		},
		where: {
			status: 'verified',
			userRole: 'resturantManager',
			// userId: restaurant.resturantManagerId,
		},
	}).then((result) => {
		console.log(result);
		res.send(result);
	});
	// console.log(restaurants)
	// res.send(restaurants)
});
module.exports = router;
