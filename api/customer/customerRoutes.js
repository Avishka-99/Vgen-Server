const path = require('path');
const express = require('express');
const router = express.Router();
const app = express();
const multer = require('multer');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const Recipe = require('../../models/recipeSchema');
const feed = require('../../models/feedsSchema');
const order = require('../../models/ordersSchema');
const community = require('../../models/communitySchema');
//app.use(express.json())
router.use(express.json());
const sell_product = require('../../models/sell_productsSchema');
const payments = require('../../models/paymentsSchema');
const User = require('../../models/userSchema');
const product = require('../../models/productSchema');
const restaurant = require('../../models/restaurant_managerSchema');
const sellProducts = require('../../models/sell_productsSchema');
const orders = require('../../models/ordersSchema');
const communityEventOrganizer = require('../../models/community_event_organizerSchema');
const place_order = require('../../models/place_orderSchema');
const Sequelize = require('sequelize');
const veganUser = require('../../models/vegan_userSchema');
const {or} = require('sequelize');
const categories = require('../../models/categorySchema');
const communityUser = require('../../models/community_responseSchema');
const communityEventPhotos = require('../../models/community_event_photosSchema');
const deliveryPerson = require('../../models/delivery_personSchema');
app.use(express.json());
router.post('/fetchrestaurants', (req, res) => {
	//console.log(req.body);
	//const userId = req.body.userId;
	//const data = JSON.parse(fs.readFileSync('./data/' + userId + '.json'));
	//console.log(JSON.parse(data).stores)
	//console.log(userId)
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
		//const response = {result, data};
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
router.post('/recipeupload', upload.single('image'), async (req, res) => {
	try {
		const {userId, recipeName, cuisine, category, veganCategory, isVegan, ingredients, instructions, servingSize, preparationTime} = req.body;
		const {filename} = req.file;
		let isVegan2;
		if (isVegan === true) {
			isVegan2 = 'yes';
		} else {
			isVegan2 = 'no';
		}
		const productData = await Recipe.create({
			userId,
			recipeName,
			cuisineType: cuisine,
			categoryType: category,
			veganCategory,
			checkVegan: isVegan2,
			ingredients,
			instructions,
			servingSize,
			preparationTime,
			recipeImage: filename,
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
	sellProducts.belongsTo(User, {
		foreignKey: 'manufactureId',
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

	veganUser
		.update(
			{latitude: latitude, longitude: longitude},
			{
				where: {userId: userId},
			}
		)
		.then((result) => {
			res.send('success');
		});
});
router.get('/getlocation', async (req, res) => {
	const userId = req.query.userId;
	try {
		const resData = await veganUser.findOne({
			where: {userId: userId},
		});
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

//community organizer register
router.post('/registerCommunityOrganizer', async (req, res) => {
	try {
		const userId = req.body.userId;
		const description = req.body.description;
		communityEventOrganizer
			.findOne({
				eventOrganizerId: userId,
				where: {
					eventOrganizerId: userId,
				},
			})
			.then(async (result) => {
				if (!result) {
					await communityEventOrganizer
						.create({
							eventOrganizerId: userId,
							description: description,
							verifyState: 0,
						})
						.then(() => {
							res.send(productData);
							res.send('success');
						});
				} else {
					res.send('unsuccess');
				}
			});
	} catch (err) {
		console.log(err);
	}
});
//check if user is community organizer
router.post('/checkCommunityOrganizer', async (req, res) => {
	try {
		const userId = req.body.userId;
		communityEventOrganizer
			.findOne({
				eventOrganizerId: userId,
				where: {
					eventOrganizerId: userId,
				},
			})
			.then(async (result) => {
				if (!result) {
					res.send('unsuccess');
				} else {
					res.send('success');
				}
			});
	} catch (err) {
		console.log(err);
	}
});
//create community
router.post('/createCommunity', upload1.single('image'), async (req, res) => {
	try {
		const userId = req.body.userId;
		const name = req.body.communityName;
		const description = req.body.description;
		const image = req.file;

		const sendData = await community.create({
			name: name,
			description: description,
			image: image.filename,
			date: Date.now(),
			eventOrganizerId: userId,
		});
		res.send(sendData);
	} catch (err) {
		console.log(err);
	}
});
//get community
router.get('/getCommunity', async (req, res) => {
	try {
		const resData = await community.findAll();
		res.json(resData);
	} catch (err) {
		console.log(err);
	}
});
//join community
router.post('/joinCommunity', async (req, res) => {
	try {
		const userId = req.body.userId;
		const communityId = req.body.communityId;
		const noOfMembers = req.body.noOfMembers;

		communityUser
			.findOne({
				where: {
					userId: userId,
					communityId: communityId,
				},
			})
			.then(async (result) => {
				if (!result) {
					await communityUser
						.create({
							userId: userId,
							communityId: communityId,
						})
						.then(() => {
							res.send('success');
							community.update(
								{noOfMembers: noOfMembers},
								{
									where: {
										communityId: communityId,
									},
								}
							);
						});
				} else {
					res.send('unsuccess');
				}
			});
	} catch (err) {
		console.log(err);
	}
});
//check if user is in community
router.get('/checkCommunity', async (req, res) => {
	try {
		const userId = req.query.userId;

		communityEventOrganizer
			.findAll({
				where: {
					eventOrganizerId: userId,
				},
			})
			.then(async (result) => {
				if (!result) {
					res.send('unsuccess');
				} else {
					res.send(result);
				}
			});
	} catch (err) {
		console.log(err);
	}
});

//search foods, restaurants, events

const {Op} = require('sequelize');

router.get('/search', async (req, res) => {
	const search = req.query.search;
	console.log(search);
	try {
		const resData = await product.findAll({
			where: {
				productName: {
					[Op.like]: `%${search}%`, // Use the like operator to perform a partial match
				},
			},
		});
		res.json(resData);
	} catch (err) {
		console.log(err);
		res.status(500).json({error: 'Internal Server Error'});
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
router.post('/orderPost', async (req, res) => {
	try {
		const {userId, products, paymentType, amount, orderType, status, date, time} = req.body;

		if (!Array.isArray(products) || products.length === 0) {
			res.status(400).json({error: 'Invalid product data.'});
			return;
		}

		// Calculate total quantity and create a record in the order table
		const totalQuantity = products.reduce((acc, product) => acc + parseInt(product.quantity, 10), 0);
		const orderData = await order.create({
			totalQuantity: totalQuantity,
			orderType: orderType,
			amount: amount,
			paymentType: paymentType,
			date: date,
			time: time,
			orderState: status,
			// other fields...
		});

		const placeOrderData = [];
		for (const product of products) {
			const {productId, quantity, price} = product;
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
			const restaurantId = restaurantobjId ? restaurantobjId.manufactureId : null;

			// Create a record in the place_order table
			const placeOrderItem = await place_order.create({
				userId,
				productId: productId,
				resturantManagerId: restaurantId,
				quantity: quantity,
				price: price,
				orderId: orderData.orderId,
			});
			placeOrderData.push(placeOrderItem, decrementQuantity);
		}

		const paymentData = await payments.create({
			orderId: orderData.orderId,
			status: 0,
			userId: userId,
		});

		res.json({orderData, placeOrderData, paymentData});
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
router.post('/createPost', upload2.array('image', 5), async (req, res) => {
	try {
		const {userId, title, description} = req.body;
		const communityId = req.body.communityId;
		const images = req.files.map((file) => ({
			image: file.filename,
		}));

		const feedData = await feed.create({
			userId,
			communityId,
			title,
			description,
		});

		await communityEventPhotos.bulkCreate(
			images.map((image) => ({
				eventId: feedData.postId,
				images: image.image,
			}))
		);
		res.send(feedData);
		const id=feedData.postId;
		const path = './data/post/' + id + '.json';
		const config = {comments: [], likes: []};
		try {
			fs.writeFileSync(path, JSON.stringify(config, null, 2), 'utf8');
			console.log('Data successfully saved to disk');
		} catch (error) {
			console.log('An error has occurred ', error);
		}
	} catch (err) {
		console.log(err);
	}
});



//get post
router.get('/getFeed', async (req, res) => {
    const communityId = req.query.communityId;
    try {
        const posts = await feed.findAll({
            where: {
                communityId: communityId,
            },
        });

        const postIds = posts.map(post => post.postId); // Extract postIds from resData

        const eventPhotos = await communityEventPhotos.findAll({
            where: {
                eventId: postIds, // Use the extracted postIds to filter communityEventPhotos
            },
        });

        // Combine posts with their respective event photos
        const combinedData = posts.map(post => {
            const photos = eventPhotos.filter(photo => photo.eventId === post.postId);
            return {
                ...post.toJSON(), // Convert the Sequelize object to a plain JSON object
                images: photos,
            };
        });

        res.json(combinedData);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
//liked post
router.post('/likedPost', async (req, res) => {

	const postId = req.body.postId;
	const userId = req.body.userId;
	const like = req.body.like;
	const path = './data/post/' + postId + '.json';
    
	const fileData = fs.readFileSync(path);
	console.log(JSON.parse(fileData));
	const config = {likes: JSON.parse(fileData).likes, comments: JSON.parse(fileData).comments};
	if(like==true){
		//check if user already liked
		const index=config.likes.indexOf(userId);
		if(index==-1){

			config.likes.push(userId);
		}
		else{
			config.likes.splice(index,1);
		}
		
	}
	else{
		const index=config.likes.indexOf(userId);
		config.likes.splice(index,1);
	}
	try {
		fs.writeFileSync(path, JSON.stringify(config, null, 2), 'utf8');
		console.log('Data successfully saved to disk');
	} catch (error) {
		console.log('An error has occurred ', error);
	}
	res.send('success'); 
});
//comment post
router.post('/commentPost', async (req, res) => {
	const postId = req.body.postId;
	const userId = req.body.userId;
	const comment = req.body.comment;
	const path = './data/post/' + postId + '.json';
	const fileData = fs.readFileSync(path);
	console.log(JSON.parse(fileData));

	const config = {likes: JSON.parse(fileData).likes, comments: JSON.parse(fileData).comments};
	const commentData = {userId: userId, comment: comment};
	config.comments.push(commentData);
	try {
		fs.writeFileSync(path, JSON.stringify(config, null, 2), 'utf8');
		console.log('Data successfully saved to disk');
	}catch (error) {
		console.log('An error has occurred ', error);
	}
	res.send('success');
});
router.get('/getComment/:postId', (req, res) => {
	const postId = req.params.postId;
	const path = `./data/post/${postId}.json`;
  
	try {
	  const fileData = fs.readFileSync(path, 'utf8');
	  const postData = JSON.parse(fileData);
	  const comments = postData.comments;
	  res.json({ comments: comments });
	  console.log(comments);
	} catch (error) {
	  res.status(500).json({ error: 'Error occurred while fetching comments.' });
	}
  });
  router.get('/getLike/:postId', (req, res) => {
	const postId = req.params.postId;
	const path = `./data/post/${postId}.json`;
  
	try {
	  const fileData = fs.readFileSync(path, 'utf8');
	  const postData = JSON.parse(fileData);
	  const likes = postData.likes;
	  res.json({ likes: likes });
	  console.log(likes);
	} catch (error) {
	  res.status(500).json({ error: 'Error occurred while fetching likes.' });
	}
  });


//get deliveryPerson Location
router.get('/getDeliveryPersonLocation', async (req, res) => {
  const deliveryPersonId = req.query.deliveryPersonId;
	try {
		
	   const resData = await deliveryPerson.findAll({
			where: {
				deliveryPersonId: deliveryPersonId,
			},
		});
		res.json(resData);
	} catch (err) {
		console.log(err);
	}
}
);
router.get('/getUserLocation', async (req, res) => {
	const userId = req.query.userId;
	try {
		
	   const resData = await veganUser.findAll({
			where: {
				userId: userId,
			},
		});
		res.json(resData);
	} catch (err) {
		console.log(err);
	}
}
);
	


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
router.get('/getProfile', async (req, res) => {
	const userId=req.query.userId;
	try {
		const userData = await User.findAll({
			where: {
				userId: userId,
			},
		});
		res.json(userData);
	} catch (err) {
		console.log(err);
	}
});
router.get('/getRecipe', async (req, res) => {
	try {
		const recipeData = await Recipe.findAll();
		res.json(recipeData);
	} catch (err) {
		console.log(err);
	}
});
router.get('/fetchcategories', async (req, res) => {
	try {
		const result = await categories.findAll();
		res.send(result);
	} catch (err) {
		console.log(err);
	}
});
router.post('/getallproducts', async (req, res) => {
	// User.findAll({
	// 	attributes: ['userId', 'city'],
	// 	include: {
	// 		model: product,
	// 		attributes: ['productId', 'description', 'productName', 'productImage', 'product_category', 'vegan_category', 'cooking_time', 'ingredient'],
	// 		include: {
	// 			model: sellProducts,
	// 			attributes: ['manufactureId', 'price', 'quantity', 'options'],
	// 			required: true,
	// 			include:{
	// 				model:restaurant,
	// 				attributes:['resturantName','resturantType'],
	// 				required:true,
	// 			}
	// 		},
	// 	},
	// }).then((result) => {
	// 		console.log(result);
	// 		res.send(result);
	// 	});
	product.hasMany(sellProducts, { foreignKey: 'productId' });
sellProducts.hasMany(restaurant, { foreignKey: 'resturantManagerId' });
restaurant.belongsTo(sellProducts, { foreignKey: 'resturantManagerId' });
	product
		.findAll({
			attributes: ['productId', 'description', 'productName', 'productImage', 'product_category', 'vegan_category', 'cooking_time', 'ingredient'],
			include: {
				model: sellProducts,
				attributes: ['manufactureId', 'price', 'quantity', 'options'],
				required: true,
			},
				
			
		})
		.then((result) => {
			console.log(result);
			res.send(result);
		});
});
router.post('/fetchrestaurant', async (req, res) => {
	restaurant
		.findAll({
			attributes: ['latitude', 'longitude', 'resturantName'],
			where: {
				resturantManagerId: req.body.id,
			},
		})
		.then((response) => {
			console.log(response);
			res.send(response);
		});
});
router.post('/requestcommunityorganizer', async (req, res) => {
	//console.log("called")
	//res.send('success')
	const user_id = req.body.user_id;
	communityEventOrganizer
		.findOne({
			eventOrganizerId: user_id,
			where: {
				eventOrganizerId: user_id,
			},
		})
		.then(async (result) => {
			if (!result) {
				await communityEventOrganizer
					.create({
						eventOrganizerId: user_id,
						description: 'blaa blaa',
						verifyState: 0,
					})
					.then(() => {
						res.send('success');
					});
			} else {
				res.send('unsuccess');
			}
		});
});
router.post('/addfavstore', async (req, res) => {
	const user_id = req.body.user_id;
	const data = req.body.data;
	const path = './data/users/' + user_id + '.json';
	const fileData = fs.readFileSync(path);
	console.log(JSON.parse(fileData));
	const config = {foods: JSON.parse(fileData).foods, stores: data};
	//console.log(config)
	// const config = {stores: [], foods: []};
	try {
		fs.writeFileSync(path, JSON.stringify(config, null, 2), 'utf8');
		console.log('Data successfully saved to disk');
	} catch (error) {
		console.log('An error has occurred ', error);
	}
	console.log(data);
	res.send('success');
});

//get orders for user Id in place order and order
router.get('/getOrders', async (req, res) => {
     const userId = req.query.userId;
     try{
		const orders = await place_order.findAll({
			where: {
				userId: userId,
			},
		});
		const orderIds = orders.map((order) => order.orderId);
		const orderData = await order.findAll({
			where: {
				orderId: orderIds,
			},
		});
		res.json(orderData);

	 }
	 catch (err) {
		console.log(err);
		res.status(500).json({error: 'Internal Server Error'});
	 }
}
);

router.post('/fetchcommunities', async (req, res) => {
	community.findAll().then((response) => {
		console.log(response);
		res.send(response);
	});
});
router.post('/updateOrderState', async (req, res) => {
	const orderId = req.body.orderId;
	const orderState = req.body.orderState;
	order.update(
		{orderState: orderState},
		{
			where: {
				orderId: orderId,
			},
		}
	);
	res.send('success');
});
module.exports = router;
