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
				bcrypt.compare(password, result[0].password, (err, result_2) => {
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
							const type = result[0].userRole;
							const userID = result[0].userId;
							const payload = {
								userId: result[0].userId,
								password: result[0].password,
								time: new Date(),
							};
							const secretKey = 'Avishka';
							const token = jwt.sign(payload, secretKey, {expiresIn: '10h'});
							const response = {type, token , userID};
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
			}).then((result) => {
				console.log(result.length);
				if (result.length == 0) {
					User.create({
						email: email,
						password: hash,
						firstName: firstName,
						lastName: lastName,
						nic: nic,
						userRole: userRole,
						contactNo: contactNo,
					});
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
					console.log(mailStatus);
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
		const {userId, productId, quantity, price, orderDate, orderStatus} = req.body;

		// Create a record in the place_order table

		// Create a record in the order table
		const orderData = await order.create({
			productId,
			quantity,
			amount: price, // Use 'amount' instead of 'price' if that's the correct field name in your 'order' model
			orderDate,
			orderStatus,
		});
		const placeOrderData = await place_order.create({
			orderId: orderData.orderId, // Use the generated orderId from place_order
			userId,
			productId,
		});

		res.json({placeOrderData, orderData});
	} catch (err) {
		console.log(err);
		res.status(500).json({error: 'An error occurred while creating the order.'});
	}
});
module.exports = router;

