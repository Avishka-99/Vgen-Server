const path = require('path');
const express = require('express');
const router = express.Router();
const app = express();

const jwt = require('jsonwebtoken');
const User = require('../../models/userSchema');
const product = require('../../models/productSchema');
const restaurant = require('../../models/restaurant_managerSchema');
const sellProducts =require('../../models/sell_productsSchema');
router.post('/fetchrestaurants', (req, res) => {
	User.hasOne(restaurant, {
		foreignKey: 'resturantManagerId',
	});
	restaurant.belongsTo(User, {
		foreignKey: 'resturantManagerId',
	});
	User.findAll({
		attributes: ['userId','contactNo','city'],
		include: {
			model: restaurant,
			attributes: ['resturantManagerId', 'latitude', 'longitude', 'resturantType', 'resturantName', 'openTime', 'closeTime','image'],
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
router.post('/fetchrestaurantproducts',(req,res)=>{
    const restaurantID = req.body.restaurantId;
    product.hasMany(sellProducts,{
        foreignKey:'productId',
    });
    sellProducts.belongsTo(product,{
        foreignKey:'productId',
    });
    product
			.findAll({
				attributes: ['productId', 'description', 'productName', 'productImage', 'product_category'],
				include: {
					model: sellProducts,
					attributes: ['manufactureId', 'price', 'quantity'],
					where: {manufactureId: restaurantID},
					required: true,
				},
			})
			.then((result) => {
				console.log(result);
				res.send(result);
			});
    // console.log(restaurantID)
    // res.send('restaurantID');
});
module.exports = router;
