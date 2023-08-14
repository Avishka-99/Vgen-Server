const path = require('path');
const express = require('express');
const router = express.Router();
const app = express();

const jwt = require('jsonwebtoken');
const User = require('../../models/userSchema');
const product = require('../../models/productSchema');
const restaurant = require('../../models/restaurant_managerSchema');
const sellProducts = require('../../models/sell_productsSchema');
const orders = require('../../models/ordersSchema');
const place_order = require('../../models/place_orderSchema');
router.post('/fetchrestaurants', (req, res) => {
	User.hasOne(restaurant, {
		foreignKey: 'resturantManagerId',
	});
	restaurant.belongsTo(User, {
		foreignKey: 'resturantManagerId',
	});
	User.findAll({
		attributes: ['userId', 'contactNo', 'city'],
		include: {
			model: restaurant,
			attributes: ['resturantManagerId', 'latitude', 'longitude', 'resturantType', 'resturantName', 'openTime', 'closeTime', 'image'],
			required: true,
		},
		where: {
			status: 'verified',
			userRole: 'resturantManager',
			// userId: restaurant.resturantManagerId,
		},
	}).then((result) => {
		res.send(result);
	});
	// console.log(restaurants)
	// res.send(restaurants)
});
router.post('/fetchrestaurantproducts', (req, res) => {
	const restaurantID = req.body.restaurantId;
	product.hasMany(sellProducts, {
		foreignKey: 'productId',
	});
	sellProducts.belongsTo(product, {
		foreignKey: 'productId',
	});
	product
		.findAll({
			attributes: ['productId', 'description', 'productName', 'productImage', 'product_category', 'cooking_time'],
			include: {
				model: sellProducts,
				attributes: ['manufactureId', 'price', 'quantity'],
				where: {manufactureId: restaurantID},
				required: true,
			},
		})
		.then((result) => {
			res.send(result);
		});
	// console.log(restaurantID)
	// res.send('restaurantID');
});
router.post('/updatedb', async (req, res) => {
	const amount = req.body.amount;
	const quantity = req.body.quantity;
	const productId = req.body.id;
	const id = req.body.restaurantId;
	const lang = req.body.lang;
	const long = req.body.long;
	const userId = req.body.userId;
	const date = req.body.date;
	const time = req.body.time;
	const status = req.body.status;
	console.log('req body', req.body);
	sellProducts
		.decrement('quantity', {
			by: quantity,
			where: {
				productId: productId,
				manufactureId: id,
			},
		})
		.then((result) => {
			orders
				.create({
					totalQuantity: quantity,
					amount: amount, // Use 'amount' instead of 'price' if that's the correct field name in your 'place_order' model
					date: date,
					time: time,
					orderState: status,

					// other fields...
				})
				.then((result_2) => {
					place_order.create({
						userId: userId,
						productId: productId, // Use the 'productId' from the 'product' table
						quantity: quantity,
						orderId: result_2.orderId,
						price: amount,
						resturantManagerId: id, // Use the 'orderId' from the 'order' table
					});
					res.send('success');
				});

			// console.log(result.id);
			// res.send('success');
		});
});
router.post('/fetchproduct', async (req, res) => {
	const productId = req.body.id;
	const id = req.body.restaurantId;
	console.log(id);
	product.hasMany(sellProducts, {
		foreignKey: 'productId',
	});
	sellProducts.belongsTo(product, {
		foreignKey: 'productId',
	});
	product
		.findAll({
			attributes: ['productId', 'description', 'productName', 'productImage', 'product_category', 'cooking_time'],
			include: {
				model: sellProducts,
				attributes: ['manufactureId', 'price', 'quantity'],
				where: {
					productId: productId,
					manufactureId: id,
				},
				required: true,
			},
		})
		.then((result) => {
			console.log(result);
			res.send(result);
		});
});
module.exports = router;
