// Used to handle user related requests
const path = require('path');
const express = require('express');
const router = express.Router();
const app = express();

const jwt = require('jsonwebtoken');
const User = require('../models/userSchema');
const product = require('../models/productSchema');
const restaurant = require('../models/restaurant_managerSchema');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const multer = require('multer');
const {sendMail} = require('../include/NodemailerConfig');
const {generateOtp} = require('../include/OtpGen');
const order = require('../models/ordersSchema');
const place_order = require('../models/place_orderSchema');
const sell_product = require('../models/sell_productsSchema');
const vegan_user = require('../models/vegan_userSchema');
const feed = require('../models/feedsSchema');
const delivery_person = require('../models/delivery_personSchema');
const {or} = require('sequelize');
app.use(bodyParser.json());
router.post('/signinuser', (req, res) => {
	const email = req.body.email;
	const password = req.body.password;
	// console.log(email);
	User.findAll({
		where: {
			email: email,
		},
	})
		.then((result) => {
			console.log(result);
			if (result.length == 0) {
				res.send('Please check email');
			}
			{
				bcrypt.compare(password, result[0].password, async (err, result_2) => {
					if (result_2) {
						if (result[0].status != 'verified') {
							const otp = generateOtp(6);
							User.update(
								{status: otp},
								{
									where: {
										email: email,
									},
								}
							);
							var mailStatus = sendMail(otp, email);
							res.send('Not verified');
						} else {
							var lang = 0;
							var long = 0;
							const type = result[0].userRole;
							const userID = result[0].userId;
							const payload = {
								userId: result[0].userId,
								password: result[0].password,
								time: new Date(),
							};
							if (type == 'Customer') {
								await vegan_user.findAll({
									raw: true,
									where: {
										userId: userID,
									},
								}).then((result)=>{
									lang=result[0].latitude,
									long=result[0].longitude
								});
							}
							const secretKey = 'Avishka';
							const token = jwt.sign(payload, secretKey, {expiresIn: '10h'});
							const response = {type, token, userID,lang,long};
							res.send(response);
						}
					} else {
						res.send('Please check password');
					}
				});
			}
		})
		.catch((error) => {
			console.error('Failed to retrieve data : ', error);
		});
});
router.post('/registeruser', (req, res) => {
	const email = req.body.email;
	const password = req.body.password;
	const firstName = req.body.firstName;
	const lastName = req.body.lastName;
	const nic = req.body.age;
	const userRole = req.body.userRole;
	const contactNo = req.body.contactNo;
	const latitude = req.body.latitude;
	const longitude = req.body.longitude;
	//res.send(userRole)
	// const profilePicture=req.body.profilePicture;
	bcrypt.hash(password, 10, (err, hash) => {
		if (err) {
			res.send({type: 'error', message: 'An error occured. Try again later'});
		} else {
			User.findAll({
				where: {
					email: email,
				},
			}).then(async (result) => {
				//console.log(result.length);
				if (result.length == 0) {
					await User.create({
						email: email,
						password: hash,
						firstName: firstName,
						lastName: lastName,
						nic: nic,
						userRole: userRole,
						contactNo: contactNo,
					});
					const otp = generateOtp(6);
					await User.update(
						{status: otp},
						{
							where: {
								email: email,
							},
						}
					);
					await User.findAll({
						raw: true,
						where: {
							email: email,
						},
					}).then(async (result) => {
						const userId = result[0].userId;
						const role = result[0].userRole;
						console.log(role);
						if (role == 'Customer') {
							await vegan_user.create({
								userId: userId,
								veganCategory: 'vegan',
								latitude: latitude,
								longitude: longitude,
							});
						} else if (role == 'Delivery') {
							await delivery_person.create({
								deliveryPersonId: userId,
								latitude: latitude,
								longitude: longitude,
							});
						}
					});
					var mailStatus = sendMail(otp, email);
					//console.log(mailStatus);
					res.send({type: 'success', message: 'Account created successfully'});
					//res.send(mailStatus);
				} else {
					res.send({type: 'error', message: 'Email already exists'});
				}
			});
		}
	});
});
// product store
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, './uploads/products');
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + path.extname(file.originalname));
	},
});
const upload = multer({storage: storage});
router.post('/productStore', upload.single('productImage'), async (req, res) => {
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
		const {userId,productId,quantity,amount,date,time,status,orderType } = req.body;

		// Create a record in the order table
		const orderData = await order.create({
			totalQuantity:quantity,
			orderType:orderType,
			amount: amount, // Use 'amount' instead of 'price' if that's the correct field name in your 'place_order' model
			date: date,
			time: time,
			orderState: status,

			// other fields...
		});
		const decrementQuantity = await sell_product.decrement('quantity', {
			by: quantity,
			where: {
				productId: productId,
			},
		});
        const restaurantobjId = await sell_product.findOne({
			attributes: ['manufactureId'],
			where: {
				productId: productId,
			},
		});
      const  restaurantId = restaurantobjId ? restaurantobjId.manufactureId : null;
		// Create a record in the place_order table
		const placeOrderData = await place_order.create({
			userId,
			productId: productId,
			resturantManagerId:restaurantId, // Use the 'productId' from the 'product' table
			quantity:quantity,
			price:amount,
            orderId: orderData.orderId, // Use the 'orderId' from the 'order' table
		});

		res.json({  orderData,placeOrderData,decrementQuantity });
		console.log(placeOrderData);
		console.log(orderData);
	} catch (err) {
		console.log(err);
		res.status(500).json({error: 'An error occurred while creating the order.'});
	}
});

//post image add
const storage1 = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, './uploads/feed');
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + path.extname(file.originalname));
	},
});
const upload1 = multer({storage: storage1});

//create post
router.post('/createPost', upload1.single('feedImage'), async (req, res) => {
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
