const path = require('path');
const express = require('express');
const router = express.Router();
const app = express();
const fs = require('fs');
const jwt = require('jsonwebtoken');
const User = require('../models/userSchema');
const product = require('../models/productSchema');
const restaurant = require('../models/restaurant_managerSchema');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const multer = require('multer');
const {sendMail} = require('../include/NodemailerConfig');
const {generateOtp} = require('../include/OtpGen');

const vegan_user = require('../models/vegan_userSchema');

const delivery_person = require('../models/delivery_personSchema');
router.use(express.json());

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
								await vegan_user
									.findAll({
										raw: true,
										where: {
											userId: userID,
										},
									})
									.then((result) => {
										(lang = result[0].latitude), (long = result[0].longitude);
									});
							}
							var response;
							if (type == 'Customer') {
								const data = JSON.parse(fs.readFileSync('./data/users/' + userID + '.json'));
								const stores = data.stores;
								const foods = data.foods;
								const communities = data.communities;
								const cart = data.cart;
								const secretKey = 'Avishka';
								const token = jwt.sign(payload, secretKey, {expiresIn: '10h'});
								response = {type, token, userID, lang, long, stores, foods, communities,cart};
							} else {
								const secretKey = 'Avishka';
								const token = jwt.sign(payload, secretKey, {expiresIn: '10h'});
								response = {type, token, userID, lang, long};
							}
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
	const nic = req.body.nic;
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
					}).then((response) => {
						const id = response.dataValues.userId;
						if (userRole == 'Customer') {
							const path = './data/users/' + id + '.json';
							const config = {stores: [], foods: [], communities: [],posts:[],cart:[]};
							try {
								fs.writeFileSync(path, JSON.stringify(config, null, 2), 'utf8');
								console.log('Data successfully saved to disk');
							} catch (error) {
								console.log('An error has occurred ', error);
							}
						}
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
router.post('/getuserprofile', async (req, res) => {
	User.findAll({
		where: {
			userId: req.body.userId,
		},
	}).then((result) => {
		res.send(result);
	});
});
module.exports = router;
