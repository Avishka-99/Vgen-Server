const path = require('path');
const express = require('express');
const router = express.Router();
const app = express();
const multer = require('multer');
const jwt = require('jsonwebtoken');
const Recipe = require('../../models/recipeSchema');
const feed = require('../../models/feedsSchema');
const order = require('../../models/ordersSchema');

const sell_product = require('../../models/sell_productsSchema');
const payments=require('../../models/paymentsSchema');
const User = require('../../models/userSchema');
const product = require('../../models/productSchema');
const restaurant = require('../../models/restaurant_managerSchema');
const sellProducts = require('../../models/sell_productsSchema');
const orders = require('../../models/ordersSchema');
const communityEventOrganizer = require('../../models/community_event_organizerSchema');
const place_order = require('../../models/place_orderSchema');
const Sequelize = require('sequelize');
const veganUser=require('../../models/vegan_userSchema');
const {or} = require('sequelize');

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
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, './uploads/recipes');
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + path.extname(file.originalname));
	},
});
const upload = multer({storage: storage});
//recipe upload
router.post('/recipeupload',upload.single('image'), async (req, res) => {
	try {
		const {userId,recipeName,cuisine,category,veganCategory,isVegan,ingredients,
			instructions,servingSize,preparationTime} = req.body;
		const {filename} = req.file;
		let isVegan2;
	     if(isVegan===true){
			 isVegan2='yes';
		 }else{
			 isVegan2='no';
		 }
		const productData = await Recipe.create({
            userId,
			recipeName,
			cuisineType:cuisine,
			categoryType:category,
			veganCategory,
			checkVegan:isVegan2,
			ingredients,
			instructions,
			servingSize,
			preparationTime,
			recipeImage:filename

		});
		res.send(productData);
	
	} catch (err) {
		console.log(err);
	}
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
			attributes: ['productId', 'description', 'productName', 'productImage', 'product_category', 'cooking_time', 'ingredient'],
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
router.post('/UpdateLocation', async (req, res) => {
	const latitude = req.body.latitude;
	const longitude = req.body.longitude;
	const userId = req.body.userId;

	veganUser.update(
		{latitude: latitude, longitude: longitude},
		{
			where: {userId: userId},
		}
	).then((result) => {
		res.send('success');
	});
});
router.get('/getlocation', async (req, res) => {
	const userId = req.query.userId;
		try {
			const resData = await veganUser.findOne(
			{
				where : {userId: userId}
			}
			);
			res.json(resData);
		} catch (err) {
			console.log(err);
		}
});
router.post('/fetchresult', async (req, res) => {
	const parameter = req.body.parameter;
	product
		.findAll({
			attributes: ['productId', 'description', 'productName', 'productImage', 'product_category', 'cooking_time', 'ingredient'],
			include: {
				model: sellProducts,
				attributes: ['manufactureId', 'price', 'quantity'],
				required: true,
			},
			where: {
				productName: {[Op.like]: `%${parameter}%`},
			},
		})
		.then((result) => {
			//console.log(result);
			res.send(result);
		});

	// product.hasMany(sellProducts, {
	// 	foreignKey: 'productId',
	// });
	// sellProducts.belongsTo(product, {
	// 	foreignKey: 'productId',
	// });
	// product
	// 	.findAll({
	// 		attributes: ['productId', 'description', 'productName', 'productImage', 'product_category', 'cooking_time', 'ingredient'],
	// 		include: {
	// 			model: sellProducts,
	// 			attributes: ['manufactureId', 'price', 'quantity'],
	// 			where: {
	// 				productId: productId,
	// 				manufactureId: id,
	// 			},
	// 			required: true,
	// 		},
	// 	})
	// 	.then((result) => {
	// 		console.log(result);
	// 		res.send(result);
	// 	});
});
const storage1 = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, './uploads/community');
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + path.extname(file.originalname));
	},
});
const upload1 = multer({storage: storage1});
router.post('/registerCommunityOrganizer',upload1.single('profilePicture'), async (req, res) => {
	try {
		const {userId,organizeName,regNo,description,nic,profilePicture} = req.body;
		const {filename} = req.file;
		const productData = await communityEventOrganizer.create({
			eventOrganizerId:userId,
			organizeName,
			regNo,
			description,
			nic,
			verifyState:0,
			profilePicture:filename
		});
		res.send(productData);
	} catch (err) {
		console.log(err);
	}

});
//search foods, restaurants, events

const { Op } = require('sequelize');

router.get('/search', async (req, res) => {
  const search = req.query.search;
  console.log(search);
  try {
    const resData = await product.findAll({
      where: {
        productName: {
          [Op.like]: `%${search}%` // Use the like operator to perform a partial match
        }
      }
    });
    res.json(resData);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//new customer codes
// product store
const storage3 = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, './uploads/products');
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + path.extname(file.originalname));
	},
});
const upload3 = multer({storage: storage3});
router.post('/productStore', upload3.single('productImage'), async (req, res) => {
	console.log(req.file);
	try {
		const {description, quantity, price, productName} = req.body;
		const {filename} = req.file;
		const productData = await product.create({
			productName,
			description,
			productImage: filename,
		});
		await sell_product.create({
			productId: productData.productId,
			manufacturerId: productData.manufacturerId,
			quantity,
			price,
		});
	} catch (err) {
		console.log(err);
	}
});

//get product details

router.get('/productGet', async (req, res) => {
	try {
		const products = await product.findAll({
			include: {
				model: sell_product,
				as: 'sell_products',
				foreignKey: 'productId',
			},
		});
		res.json(products);
	} catch (err) {
		console.log(err);
	}
});
router.get('/restaurantGet', async (req, res) => {
	try {
		const resData = await restaurant.findAll();
		res.json(resData);
	} catch (err) {
		console.log(err);
	}
});
router.post('/verifyuser', async (req, res) => {
	try {
		User.findAll({
			attributes: ['status'],
			where: {
				email: req.body.email,
			},
		}).then((result) => {
			if (result.length > 0) {
				//res.send(result[0].status);
				//res.send(result.toJSON());
				const otp = result[0].status;
				if (otp == req.body.otp) {
					User.update(
						{status: 'verified'},
						{
							where: {
								email: req.body.email,
							},
						}
					);
					res.send('OTP matched');
				} else {
					res.send('Invalid OTP');
				}
			}
		});
		//res.json(resData);
	} catch (err) {
		console.log(err);
	}
});

// Define the association between place_order and order
place_order.hasMany(order, {foreignKey: 'orderId'});
order.belongsTo(place_order, {foreignKey: 'orderId'});

router.post('/orderPost', async (req, res) => {
	try {
		const {userId,productId,quantity,paymentType,amount,date,time,status,orderType,price } = req.body;

		// Create a record in the order table
		const orderData = await order.create({
			totalQuantity: quantity.length >= 2 ? (+quantity[0] + +quantity[1]) : 0,
			orderType:orderType,
			amount: amount,
			paymentType:paymentType, // Use 'amount' instead of 'price' if that's the correct field name in your 'place_order' model
			date: date,
			time: time,
			orderState: status,

			// other fields...
		});
		const placeOrderData=[];
		for(let i=0;i<productId.length;i++){
		const decrementQuantity = await sell_product.decrement('quantity', {
			by: quantity[i],
			where: {
				productId: productId[i],
			},
		});
        const restaurantobjId = await sell_product.findOne({
			attributes: ['manufactureId'],
			where: {
				productId: productId[i],
			},
		});
      const  restaurantId = restaurantobjId ? restaurantobjId.manufactureId : null;
		// Create a record in the place_order table
		const placeOrderItem = await place_order.create({
			userId,
			productId: productId[i],
			resturantManagerId:restaurantId, // Use the 'productId' from the 'product' table
			quantity:quantity[i],
			price:price[i],
            orderId: orderData.orderId, // Use the 'orderId' from the 'order' table
		});
		placeOrderData.push(placeOrderItem,decrementQuantity);
		}
		const paymentData=await payments.create({
			orderId:orderData.orderId,
			status:0,
			userId:userId,
		});

		res.json({  orderData,placeOrderData,paymentData });
		console.log(placeOrderData);
		console.log(orderData);
	} catch (err) {
		console.log(err);
		res.status(500).json({error: 'An error occurred while creating the order.'});
	}
});

//post image add
const storage2 = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, './uploads/feed');
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + path.extname(file.originalname));
	},
});
const upload2 = multer({storage: storage2});

//create post
router.post('/createPost', upload2.single('feedImage'), async (req, res) => {
	console.log(req.file);
	try {
		const {userId, feedName, description} = req.body;
		const {filename} = req.file;
		const feedData = await feed.create({
			userId,
			feedName,
			description,
			feedImage: filename,
		});
		res.json(feedData);
	} catch (err) {
		console.log(err);
	}
});
//get post
router.get('/getFeed', async (req, res) => {
	try {
		const feedData = await feed.findAll();
		res.json(feedData);
	} catch (err) {
		console.log(err);
	}
});

//delete post
router.delete('/deleteFeed/:id', async (req, res) => {
	try {
		const feedData = await feed.destroy({
			where: {
				feedId: req.params.id,
			},
		});
		res.json(feedData);
	} catch (err) {
		console.log(err);
	}
});
//update post
router.put('/updateFeed/:id', async (req, res) => {
	try {
		const feedData = await feed.update(
			{
				feedName: req.body.feedName,
				description: req.body.description,
			},
			{
				where: {
					feedId: req.params.id,
				},
			}
		);
		res.json(feedData);
	} catch (err) {
		console.log(err);
	}
});
//get user by userId
router.get('/getUser/:id', async (req, res) => {
	try {
		const userData = await User.findAll({
			where: {
				userId: req.params.id,
			},
		});
		res.json(userData);
	} catch (err) {
		console.log(err);
	}
});
router.get('/getProfile/:id', async (req, res) => {
	try {
		const userData = await User.findAll({
			where: {
				userId: req.params.id,
			},
		});
		res.json(userData);
	} catch (err) {
		console.log(err);
	}
});


module.exports = router;
