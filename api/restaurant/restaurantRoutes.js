const path = require('path');
const express = require('express');
const router = express.Router();
const app = express();
const orders = require('../../models/ordersSchema');
const placeOrders = require('../../models/place_orderSchema');
const product = require('../../models/productSchema');
const payments = require('../../models/paymentsSchema');
const users = require('../../models/userSchema');
const manufacture = require('../../models/product_manufactureSchema');
const sellProduct = require('../../models/sell_productsSchema');
const complain = require('../../models/complainSchema');
const check_complain = require('../../models/check_complainSchema');
const reservation = require('../../models/reservationSchema');
const place_complain = require('../../models/place_complainSchema')
const multer = require('multer');
const { Sequelize, Op, where } = require('sequelize');
const sequelize = require('../../models/db');
router.use(express.json());
// product store
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, './uploads/products');
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + path.extname(file.originalname));
	},
});
const upload = multer({ storage: storage });
router.post('/productAdd', upload.single('productImage'), async (req, res) => {
	const transaction = await sequelize.transaction();
	const product_category = 'food';
	const {category, user_id, quantity, description, productName, price } = req.body;
	const { filename } = req.file;

	try {
		const createdProduct = await product.create(
			{
				description,
				productName,
				productImage: filename,
				product_category,
				vegan_category: category,
			},
			{ transaction }
		);

		const lastInsertedProductId = createdProduct.productId;

		await sellProduct.create(
			{
				productId: lastInsertedProductId,
				manufactureId: user_id,
				price,
				quantity,
			},
			{ transaction }
		);

		await transaction.commit();
		res.send({ type: "success", message: "product Added Successfully" });
	} catch (err) {
		await transaction.rollback();
		console.log(err);
	}
});
//

//table view details gets of the restaurant manager home
router.get('/resDetailsGet', async (req, res) => {
	const user_id = req.query.user_id;

	try {
		const result = await sequelize.query(
			`SELECT o.orderId, o.date, o.time, o.amount, o.orderState, o.orderType,
		CONCAT(u.firstName, ' ',u.lastName) AS customerName,
		CONCAT(u.homeNo,'',u.street,'',u.city) AS address,
		pay.status AS paymentStatus
		FROM orders o 
		INNER JOIN place_orders p ON p.orderId=o.orderId 
		INNER JOIN restaurant_managers pm ON pm.resturantManagerId=p.resturantManagerId 
		INNER JOIN users u ON u.userId=p.userId 
		INNER JOIN payments pay ON pay.orderId=o.orderId 
		WHERE pm.resturantManagerId=:restaurantManagerId AND pay.userId=:restaurantManagerId AND o.orderState>-1 AND o.date = CURRENT_DATE()
        GROUP BY p.orderId
     
        `,
			{
				type: sequelize.QueryTypes.SELECT,
				replacements: {
					restaurantManagerId: user_id,
				},
			}
		);
		res.json(result);
		console.log(result);
	} catch (err) {
		console.log(err);
	}

});
//

router.get('/allProduct', async (req, res) => {
	const user_id = req.query.user_id;

	/*Create a join relation */
	product.belongsTo(sellProduct, {
		foreignKey: 'productId',
	});
	sellProduct.hasMany(product, {
		foreignKey: 'productId',
	});
	/* */
	try {
		const productData = await sellProduct.findAll({
			include: {
				model: product,
				attributes: ['productId', 'productName', 'productImage', 'description'],
			},
			where: {
				manufactureId: user_id,
				'$products.deleteState$': 1
			},
		});
		res.json(productData);
		console.log(productData);
	} catch (err) {
		console.log(err);
	}
});

//bar chart details get of the restaurant manager home
router.get('/orderTypes', async (req, res) => {
	const user_id = req.query.user_id;

	try {
		const Q_count_L = await sequelize.query(
			`
			SELECT t.orderType,COUNT(t.orderId) AS orderTypeCount
			FROM (
				SELECT o.orderId, o.amount, o.date,o.orderType
				FROM orders o
				INNER JOIN place_orders p ON p.orderId = o.orderId
				WHERE p.resturantManagerId = :restaurantManagerId
				AND o.date = CURRENT_DATE()
				AND o.orderState>-1
				GROUP BY p.orderId
			) t
			GROUP BY t.orderType
            `,
			{
				type: sequelize.QueryTypes.SELECT,
				replacements: {
					restaurantManagerId: user_id,
				},
			}
		);
		res.json(Q_count_L);
		console.log(Q_count_L);
	} catch (err) {
		console.log(err);
	}
});
//

//order count details
router.get('/orderCountDetails', async (req, res) => {
	const user_id = req.query.user_id;
	try {
		const result = await sequelize.query(
			`
		SELECT COUNT(t.orderId) AS totalCount, SUM(t.amount) AS totalAmount
		FROM (
			SELECT o.orderId, o.amount, o.date
			FROM orders o
			INNER JOIN place_orders p ON p.orderId = o.orderId
			WHERE p.resturantManagerId = :restaurantManagerId 
			AND o.date = CURRENT_DATE()
			AND o.orderState>-1
			GROUP BY p.orderId
		) t
		WHERE t.date = CURRENT_DATE();
     
        `,
			{
				type: sequelize.QueryTypes.SELECT,
				replacements: {
					restaurantManagerId: user_id,
				},
			}
		);
		res.json(result);
		console.log(result);
	} catch (err) {
		console.log(err);
	}
});

//

//order type details
router.get('/getOrderDetails', async (req, res) => {
	const user_id = req.query.user_id;

	try {
		const result = await sequelize.query(
			`
				SELECT
					o.orderId, o.date, o.time, o.orderState,o.orderType, 
					CONCAT(u.firstName, " ", u.lastName) AS name,o.amount,o.totalQuantity
				FROM
					orders o
				INNER JOIN
					place_orders p ON p.orderId = o.orderId
				INNER JOIN
					users u ON u.userId = p.userId
				WHERE
					p.resturantManagerId = :restaurantMangerId
					AND o.orderState = 0
					AND o.date=CURRENT_DATE
				GROUP BY
				o.orderId;
    		`,
			{
				type: sequelize.QueryTypes.SELECT,
				replacements: {
					restaurantMangerId: user_id,
				},
			}
		);
		res.json(result);
		console.log(result);
	} catch (err) {
		console.log(err);
	}
});




router.get('/OrderTypeCountToday', async (req, res) => {
	const user_id = req.query.user_id;

	try {
		const result = await sequelize.query(
			`
			SELECT t.orderState, COUNT(t.orderId) as totalCount
				FROM (
					SELECT o.orderId, o.orderState
					FROM orders o
					INNER JOIN place_orders p ON p.orderId = o.orderId
					WHERE p.resturantManagerId = :RestaurantManager
					AND o.date=CURRENT_DATE
					GROUP BY o.orderId
				) t
				GROUP BY t.orderState
    `,
			{
				type: sequelize.QueryTypes.SELECT,
				replacements: {
					RestaurantManager: user_id,
				},
			}
		);
		res.json(result);
		console.log(result);
	} catch (err) {
		console.log(err);
	}
});

//

//get sorted order details

router.get('/getOrderSortedDetails', async (req, res) => {
	const user_id = req.query.user_id;
	const order_type = req.query.order_type;
	try {
		const result = await sequelize.query(
			`
				SELECT
					o.orderId, o.date, o.time, o.orderState,o.orderType, 
					CONCAT(u.firstName, " ", u.lastName) AS name,o.amount,o.totalQuantity
				FROM
					orders o
				INNER JOIN
					place_orders p ON p.orderId = o.orderId
				INNER JOIN
					users u ON u.userId = p.userId
				WHERE
					p.resturantManagerId = :resturantManagerId
					AND o.orderState = 0
                    AND o.orderType=:order_type
					AND o.date=CURRENT_DATE
				GROUP BY
				o.orderId;
    		`,
			{
				type: sequelize.QueryTypes.SELECT,
				replacements: {
					resturantManagerId: user_id,
					order_type: order_type
				},
			}
		);
		res.json(result);
		console.log(result);
	} catch (err) {
		console.log(err);
	}
});

//get accepted order details
router.get('/getRestaurantAcceptedOrderDetailsInTableToday', async (req, res) => {
	const user_id = req.query.user_id;

	try {
		const result = await sequelize.query(
			`
				SELECT
					o.orderId, o.date, o.time, o.orderState,o.orderType, 
					CONCAT(u.firstName, " ", u.lastName) AS name,o.amount,o.totalQuantity
				FROM
					orders o
				INNER JOIN
					place_orders p ON p.orderId = o.orderId
				INNER JOIN
					users u ON u.userId = p.userId
				WHERE
					p.resturantManagerId = :resturantManagerId
					AND o.orderState = 1
					AND o.date=CURRENT_DATE
				GROUP BY
				o.orderId;
    		`,
			{
				type: sequelize.QueryTypes.SELECT,
				replacements: {
					resturantManagerId: user_id,
				},
			}
		);
		res.json(result);
		console.log(result);
	} catch (err) {
		console.log(err);
	}
});
//

//get order sorted with accepted details
router.get('/getRestaurantOrderDetailsInSortedByTypeWithAccepted', async (req, res) => {
	const user_id = req.query.user_id;
	const order_type = req.query.order_type;
	try {
		const result = await sequelize.query(
			`
				SELECT
					o.orderId, o.date, o.time, o.orderState,o.orderType, 
					CONCAT(u.firstName, " ", u.lastName) AS name,o.amount,o.totalQuantity
				FROM
					orders o
				INNER JOIN
					place_orders p ON p.orderId = o.orderId
				INNER JOIN
					users u ON u.userId = p.userId
				WHERE
					p.resturantManagerId = :resturantManagerId
					AND o.orderState = 1
                    AND o.orderType=:order_type
					AND o.date=CURRENT_DATE
				GROUP BY
				o.orderId;
    		`,
			{
				type: sequelize.QueryTypes.SELECT,
				replacements: {
					resturantManagerId: user_id,
					order_type: order_type
				},
			}
		);
		res.json(result);
		console.log(result);
	} catch (err) {
		console.log(err);
	}
});
//


//more details of order
router.get('/getOrderMoreDetails', async (req, res) => {
	const order_id = req.query.order_id;
	const restaurantManagerId = req.query.user_id;
	try {
		const result_3 = await sequelize.query(
			`
          SELECT p.orderId,pr.*,p.price,p.quantity FROM 
          place_orders p 
          INNER JOIN products pr ON p.productId=pr.productId 
          WHERE
            p.resturantManagerId = :restaurantManagerId
            AND p.orderId= :orderId
         
          `,
			{
				type: sequelize.QueryTypes.SELECT,
				replacements: {
					restaurantManagerId: restaurantManagerId,
					orderId: order_id,
				},
			}
		);

		const result_4 = await sequelize.query(
			`
        SELECT
          o.orderId, o.date, o.time, o.orderType, CONCAT(u.firstName, " ", u.lastName) AS name,u.contactNo, CONCAT(u.homeNo," ",u.street," ",u.city) as address,u.profilePicture 
        FROM
          orders o
        INNER JOIN
          place_orders p ON p.orderId = o.orderId
        INNER JOIN
          users u ON u.userId = p.userId
        WHERE
          p.resturantManagerId = :restaurantManagerId
          AND o.orderId= :orderId
        GROUP BY
          o.orderId;
        `,
			{
				type: sequelize.QueryTypes.SELECT,
				replacements: {
					restaurantManagerId: restaurantManagerId,
					orderId: order_id,
				},
			}
		);
		const responseData = {
			result_3: result_3,
			result_4: result_4,
		};

		res.json(responseData);
		console.log(responseData);
	} catch (err) {
		console.log(err);
	}
});

//

//get most order with limit

router.get('/getMostOrderCountWithLimit', async (req, res) => {
	const user_id = req.query.user_id;

	try {
		const Q_count_L = await sequelize.query(
			`
			SELECT pr.*, p.productId,p.resturantManagerId,p.orderId,SUM(p.quantity) AS count 
			FROM place_orders p 
			INNER JOIN orders o ON o.orderId=p.orderId
			INNER JOIN products pr ON pr.productId=p.productId 
			WHERE
			p.resturantManagerId = :restaurantManagerId
			AND o.date=CURRENT_DATE
			AND o.orderState>-1
			GROUP BY p.productId 
			ORDER by count DESC  
			LIMIT 1
			`,
			{
				type: sequelize.QueryTypes.SELECT,
				replacements: {
					restaurantManagerId: user_id,
				},
			}
		);
		res.json(Q_count_L);
		console.log(Q_count_L);
	} catch (err) {
		console.log(err);
	}
});

//

//get most order without limit

router.get('/getMostOrderCountWithOutLimit', async (req, res) => {
	const user_id = req.query.user_id;

	try {
		const Q_count = await sequelize.query(
			`
			SELECT pr.*, p.productId,p.resturantManagerId,p.orderId,SUM(p.quantity) AS count 
			FROM place_orders p 
			INNER JOIN orders o ON o.orderId=p.orderId
			INNER JOIN products pr ON pr.productId=p.productId 
			WHERE
			p.resturantManagerId = :restaurantManagerId
			AND o.date=CURRENT_DATE
			AND o.orderState>-1
			GROUP BY p.productId 
			ORDER by count DESC 
			

    `,
			{
				type: sequelize.QueryTypes.SELECT,
				replacements: {
					restaurantManagerId: user_id,
				},
			}
		);
		res.json(Q_count);
		console.log(Q_count);
	} catch (err) {
		console.log(err);
	}
});

//

//get shop details limit

router.get('/getShopDetails', async (req, res) => {
	try {
		const shopData = await manufacture.findAll({
			attributes: ['productManufactureId', 'image', 'shopName'],
		});
		res.json(shopData);
		console.log(shopData);
	} catch (err) {
		console.log(err);
	}
});

//
//reservation details
router.get('/getReservationDetails', async (req, res) => {
	const user_id = req.query.user_id;

	try {
		const result_1 = await sequelize.query(
			`
		SELECT r.*, CONCAT(u.firstName, " ", u.lastName) AS fullName FROM reservations r 
		INNER join users u on u.userId=r.userId
		WHERE
		r.resturantManagerId = :restaurantManagerId
		AND r.reservationState=0
	  `,
			{
				type: sequelize.QueryTypes.SELECT,
				replacements: {
					restaurantManagerId: user_id,
				},
			}
		);
		const result_2 = await sequelize.query(
			`
		SELECT  reservationState,COUNT(reservationState) AS count FROM reservations
		WHERE
		resturantManagerId = :restaurantManagerId
		GROUP BY reservationState 
		
	  `,
			{
				type: sequelize.QueryTypes.SELECT,
				replacements: {
					restaurantManagerId: user_id,
				},
			}
		);

		const responseData = {
			result_1: result_1,
			result_2: result_2,
		};

		res.json(responseData);
		console.log(responseData);
	} catch (err) {
		console.log(err);
	}
});

//get all order id relevant restaurant

router.get('/getAllOrderIDRelevantRestaurant', async (req, res) => {
	const user_id = req.query.user_id;
	/*Create a join relation */
	orders.belongsTo(placeOrders, {
		foreignKey: 'orderId',
	});
	placeOrders.hasMany(orders, {
		foreignKey: 'orderId',
	});
	/* */
	try {
		const result = await orders.findAll({
			attributes: ['orderId'],
			include: [
				{
					model: placeOrders,
					as: 'place_order',
					attributes: [],
					where: {
						resturantManagerId: user_id,
					},
				},
			],
			group: ['place_order.orderId'],
		});

		res.json(result);
		console.log(result);
	} catch (err) {
		console.log(err);
	}
});
//
//complain add
const complain_ing_storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, './uploads/complains/restaurant');
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + path.extname(file.originalname));
	},
});
const complain_ing = multer({ complain_ing_storage: complain_ing_storage });
router.post('/addComplain', complain_ing.single('photo'), async (req, res) => {
	const transaction = await sequelize.transaction();
	const currentDate = new Date();
	const formattedDate = currentDate.toISOString().slice(0, 10);
	const formattedTime = currentDate.toLocaleTimeString('en-US', {
		hour12: false,
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
	});

	try {
		const { orderId, description, user_id } = req.body;
		// const {filename} = req.file;
		const filename = req.file ? req.file.filename : null;

		const createdComplain = await complain.create(
			{
				date: formattedDate,
				description: description,
				time: formattedTime,
				photo: filename,
				orderId: orderId,
			},
			{ transaction }
		);
		// const {orderId, description,user_id} = req.body;
		// // const {filename} = req.file;
		// const filename = req.file ? req.file.filename : null;

		// const createdComplain= await complain.create({
		// 	date:formattedDate,
		// 	description:description,
		// 	time:formattedTime,
		// 	photo: filename,
		//     orderId:orderId,
		// },{transaction});

		const lastInsertedComplainId = createdComplain.complainId;

		await check_complain.create(
			{
				complainId: lastInsertedComplainId,
				userId: user_id,
			},
			{ transaction }
		);

		// await transaction.commit();
		await place_complain.create({
			complainId: lastInsertedComplainId,
			orderId: orderId,
			userId: user_id
		}, { transaction })

		await transaction.commit();
		res.send({ type: "success", message: "Complain added Successfully" });
	} catch (err) {
		await transaction.rollback();
		console.log(err);
	}
});

//get complain

//complain details
router.get('/getComplain', async (req, res) => {
	const user_id = req.query.user_id;

	try {
		const complain_result = await sequelize.query(
			`
		SELECT c.*, CONCAT(u.firstName, " ",u.lastName) As fullName,cc.action,cc.date as action_date FROM 
		complains c INNER JOIN check_complains cc ON c.complainId=cc.complainId INNER JOIN users u ON u.userId=cc.userId
		WHERE
		cc.userId = :userId`,
			{
				type: sequelize.QueryTypes.SELECT,
				replacements: {
					userId: user_id,
				},
			}
		);
		res.json(complain_result);
		console.log(complain_result);
	} catch (err) {
		console.log(err);
	}
});
//
// delete complain
router.delete('/deleteComplain', async (req, res) => {
	const transaction = await sequelize.transaction();


	try {
		const id = req.query.id;


		await complain.destroy({
			where: {
				complainId: id
			}
		}, { transaction });

		await check_complain.destroy({
			where: {
				complainId: id
			}
		}, { transaction });

		await place_complain.destroy({
			where: {
				complainId: id
			}
		}, { transaction })

		await transaction.commit();
		res.send({ type: "success", message: "Complain delete Successfully" });
	} catch (err) {
		await transaction.rollback();
		console.log(err);
		res.send({ type: "error", message: "error Occurred" });
	}
});
//

//sorted order by order state =1
router.get('/getAcceptOrders', async (req, res) => {
	const user_id = req.query.user_id;

	try {
		const result_1 = await sequelize.query(
			`
      SELECT t.orderState, COUNT(t.orderId) as totalCount
      FROM (
        SELECT o.orderId, o.orderState
        FROM orders o
        INNER JOIN place_orders p ON p.orderId = o.orderId
        WHERE p.resturantManagerId = :restaurantManagerId
        GROUP BY o.orderId
      ) t
      GROUP BY t.orderState;
    `,
			{
				type: sequelize.QueryTypes.SELECT,
				replacements: {
					restaurantManagerId: user_id,
				},
			}
		);
		const result_2 = await sequelize.query(
			`
        SELECT
          o.orderId, o.date, o.time, o.orderState,o.orderType, CONCAT(u.firstName, " ", u.lastName) AS name,o.amount
        FROM
          orders o
        INNER JOIN
          place_orders p ON p.orderId = o.orderId
        INNER JOIN
          users u ON u.userId = p.userId
        WHERE
          p.resturantManagerId = :restaurantManagerId
          AND o.orderState = 1
          
        GROUP BY
          o.orderId;
        `,
			{
				type: sequelize.QueryTypes.SELECT,
				replacements: {
					restaurantManagerId: user_id,
				},
			}
		);

		const responseData = {
			result_1: result_1,
			result_2: result_2,
		};

		res.json(responseData);
		console.log(responseData);
	} catch (err) {
		console.log(err);
	}
});

//



//get all raw products
router.get('/getAllRawProductsDetails', async (req, res) => {

	/*Create a join relation */
	product.belongsTo(sellProduct, {
		foreignKey: 'productId',
	});
	sellProduct.hasMany(product, {
		foreignKey: 'productId',
	});
	/* */
	try {
		const productData = await sellProduct.findAll({
			include: {
				model: product
			}, where: {
				product_category: 'raw_food'
			}
		});
		res.json(productData);
		console.log(productData);
	} catch (err) {
		console.log(err);
	}
});
//

//update the order state
router.post('/updateOrderStateToFinal', async (req, res) => {
	try {
		const order_id = req.body.order_id;
		const order_state = req.body.order_state;
		await orders
			.update(
				{
					orderState: order_state,

				},
				{
					where: {
						orderId: order_id,
					},
				}
			)
			.then((result) => {
				console.log('Update result:', result);
				res.send({ type: "success", message: "Order state update Successfully" });
			});
	} catch (err) {
		console.log('Error:', err);
		res.send({ type: "error", message: "error Occurred" });
	}
});

//

//update the reservation state
router.post('/updateReservationState', async (req, res) => {
	try {
		const reservation_id = req.body.reservation_id;
		const reservation_state = req.body.reservation_state;
		
		await reservation
			.update(
				{
					reservationState: reservation_state
				},
				{
					where: {
						reservationId: reservation_id,
					},
				}
			)
			.then((result) => {
				console.log('Update result:', result);
				res.send({ type: "success", message: "Update reservation state Successfully" });
			});
	} catch (err) {
		console.log('Error:', err);
		res.send({ type: "error", message: "error Occurred" });
	}
});

// accepted reservation details
router.get('/acceptedReservationDetails', async (req, res) => {
	const user_id = req.query.user_id;

	try {
		const result_1 = await sequelize.query(
			`
		SELECT r.*, CONCAT(u.firstName, " ", u.lastName) AS fullName FROM reservations r 
		INNER join users u on u.userId=r.userId
		WHERE
		r.resturantManagerId = :restaurantManagerId
		AND r.reservationState=1
	  `,
			{
				type: sequelize.QueryTypes.SELECT,
				replacements: {
					restaurantManagerId: user_id,
				},
			}
		);
		const result_2 = await sequelize.query(
			`
		SELECT  reservationState,COUNT(reservationState) AS count FROM reservations
		WHERE
		resturantManagerId = :restaurantManagerId
		GROUP BY reservationState 
		
	  `,
			{
				type: sequelize.QueryTypes.SELECT,
				replacements: {
					restaurantManagerId: user_id,
				},
			}
		);

		const responseData = {
			result_1: result_1,
			result_2: result_2,
		};

		res.json(responseData);
		console.log(responseData);
	} catch (err) {
		console.log(err);
	}
});


//


// search chart details
router.get('/searchForChart', async (req, res) => {
	const value = req.query.value;
	const user_id = req.query.user_id;
	let responseData;

	try {
		if (value == 1) {
			responseData = await sequelize.query(
				`
				SELECT t.orderType,COUNT(t.orderId) AS orderTypeCount
				FROM (
					SELECT o.orderId, o.amount, o.date,o.orderType
					FROM orders o
					INNER JOIN place_orders p ON p.orderId = o.orderId
					WHERE p.resturantManagerId = :restaurantManagerId
					AND o.date = CURRENT_DATE()
					AND o.orderState>-1
					GROUP BY p.orderId
				) t
				GROUP BY t.orderType
				`,
				{
					type: sequelize.QueryTypes.SELECT,
					replacements: {
						restaurantManagerId: user_id,
					},
				}
			);

		} else if (value == 2) {
			responseData = await sequelize.query(
				`
				SELECT t.orderType,COUNT(t.orderId) AS orderTypeCount
				FROM (
					SELECT o.orderId, o.amount, o.date,o.orderType
					FROM orders o
					INNER JOIN place_orders p ON p.orderId = o.orderId
					WHERE p.resturantManagerId = :restaurantManagerId
					AND o.date >= CURRENT_DATE - INTERVAL 7 DAY 
					AND o.orderState>-1
					GROUP BY p.orderId
				) t
				GROUP BY t.orderType
				`,
				{
					type: sequelize.QueryTypes.SELECT,
					replacements: {
						restaurantManagerId: user_id,
					},
				}
			);

		} else if (value == 3) {
			responseData = await sequelize.query(
				`
				SELECT t.orderType,COUNT(t.orderId) AS orderTypeCount
				FROM (
					SELECT o.orderId, o.amount, o.date,o.orderType
					FROM orders o
					INNER JOIN place_orders p ON p.orderId = o.orderId
					WHERE p.resturantManagerId = :restaurantManagerId
					AND o.date >= CURRENT_DATE - INTERVAL 14 DAY 
					AND o.orderState>-1
					GROUP BY p.orderId
				) t
				GROUP BY t.orderType
				`,
				{
					type: sequelize.QueryTypes.SELECT,
					replacements: {
						restaurantManagerId: user_id,
					},
				}
			);

		} else if (value == 4) {
			responseData = await sequelize.query(
				`
				SELECT t.orderType,COUNT(t.orderId) AS orderTypeCount
				FROM (
					SELECT o.orderId, o.amount, o.date,o.orderType
					FROM orders o
					INNER JOIN place_orders p ON p.orderId = o.orderId
					WHERE p.resturantManagerId = :restaurantManagerId
					AND o.date >= CURRENT_DATE - INTERVAL 30 DAY 
					AND o.orderState>-1
					GROUP BY p.orderId
				) t
				GROUP BY t.orderType
				`,
				{
					type: sequelize.QueryTypes.SELECT,
					replacements: {
						restaurantManagerId: user_id,
					},
				}
			);

		} else if (value == 5) {
			responseData = await sequelize.query(
				`
				SELECT t.orderType,COUNT(t.orderId) AS orderTypeCount
				FROM (
					SELECT o.orderId, o.amount, o.date,o.orderType
					FROM orders o
					INNER JOIN place_orders p ON p.orderId = o.orderId
					WHERE p.resturantManagerId = :restaurantManagerId
					AND o.orderState>-1
					GROUP BY p.orderId
				) t
				GROUP BY t.orderType
				`,
				{
					type: sequelize.QueryTypes.SELECT,
					replacements: {
						restaurantManagerId: user_id,
					},
				}
			);

		}
		res.json(responseData);

	} catch (err) {
		console.log(err);
	}
});

//

// search value details
router.get('/searchForValue', async (req, res) => {
	const value = req.query.value;
	const user_id = req.query.user_id;
	let responseData;

	try {
		if (value == 1) {
			responseData = await sequelize.query(
				`
				SELECT pr.*, p.productId,p.resturantManagerId,p.orderId,SUM(p.quantity) AS count 
				FROM place_orders p 
				INNER JOIN orders o ON o.orderId=p.orderId
				INNER JOIN products pr ON pr.productId=p.productId 
				WHERE
				p.resturantManagerId = :restaurantManagerId
				AND o.date=CURRENT_DATE
				AND o.orderState>-1
				GROUP BY p.productId 
				ORDER by count DESC  
				LIMIT 1
				`,
				{
					type: sequelize.QueryTypes.SELECT,
					replacements: {
						restaurantManagerId: user_id,
					},
				}
			);
		} else if (value == 2) {
			responseData = await sequelize.query(
				`
				SELECT pr.*, p.productId,p.resturantManagerId,p.orderId,SUM(p.quantity) AS count 
				FROM place_orders p 
				INNER JOIN orders o ON o.orderId=p.orderId
				INNER JOIN products pr ON pr.productId=p.productId 
				WHERE
				p.resturantManagerId = :restaurantManagerId
				AND o.date>= CURRENT_DATE - INTERVAL 7 DAY
				AND o.orderState>-1
				GROUP BY p.productId 
				ORDER by count DESC  
				LIMIT 1
				`,
				{
					type: sequelize.QueryTypes.SELECT,
					replacements: {
						restaurantManagerId: user_id,
					},
				}
			);

		} else if (value == 3) {
			responseData = await sequelize.query(
				`
				SELECT pr.*, p.productId,p.resturantManagerId,p.orderId,SUM(p.quantity) AS count 
				FROM place_orders p 
				INNER JOIN orders o ON o.orderId=p.orderId
				INNER JOIN products pr ON pr.productId=p.productId 
				WHERE
				p.resturantManagerId = :restaurantManagerId
				AND o.date>= CURRENT_DATE - INTERVAL 14 DAY
				AND o.orderState>-1
				GROUP BY p.productId 
				ORDER by count DESC  
				LIMIT 1
				`,
				{
					type: sequelize.QueryTypes.SELECT,
					replacements: {
						restaurantManagerId: user_id,
					},
				}
			);

		} else if (value == 4) {
			responseData = await sequelize.query(
				`
				SELECT pr.*, p.productId,p.resturantManagerId,p.orderId,SUM(p.quantity) AS count 
				FROM place_orders p 
				INNER JOIN orders o ON o.orderId=p.orderId
				INNER JOIN products pr ON pr.productId=p.productId 
				WHERE
				p.resturantManagerId = :restaurantManagerId
				AND o.date>= CURRENT_DATE - INTERVAL 30 DAY
				AND o.orderState>-1
				GROUP BY p.productId 
				ORDER by count DESC  
				LIMIT 1
				`,
				{
					type: sequelize.QueryTypes.SELECT,
					replacements: {
						restaurantManagerId: user_id,
					},
				}
			);

		} else if (value == 5) {
			responseData = await sequelize.query(
				`
				SELECT pr.*, p.productId,p.resturantManagerId,p.orderId,SUM(p.quantity) AS count 
				FROM place_orders p 
				INNER JOIN orders o ON o.orderId=p.orderId
				INNER JOIN products pr ON pr.productId=p.productId 
				WHERE
				p.resturantManagerId = :restaurantManagerId
				AND o.orderState>-1
				GROUP BY p.productId 
				ORDER by count DESC  
				LIMIT 1
				`,
				{
					type: sequelize.QueryTypes.SELECT,
					replacements: {
						restaurantManagerId: user_id,
					},
				}
			);

		}
		res.json(responseData);

	} catch (err) {
		console.log(err);
	}
});

//

// search details
router.get('/searchData', async (req, res) => {
	const orderType = req.query.orderType;
	const user_id = req.query.user_id;
	const paymentState = req.query.paymentState;
	const orderState = req.query.orderState;
	const orderDate = req.query.orderDate;

	console.log(orderType)
	console.log(paymentState)
	console.log(orderState)
	console.log(orderDate)
	
    try {

		const result = await sequelize.query(
			`SELECT o.orderId, o.date, o.time, o.amount, o.orderState, o.orderType,
				CONCAT(u.firstName, ' ',u.lastName) AS customerName,
				CONCAT(u.homeNo,'',u.street,'',u.city) AS address,
				pay.status AS paymentStatus
				FROM orders o 
				INNER JOIN place_orders p ON p.orderId=o.orderId 
				INNER JOIN restaurant_managers pm ON pm.resturantManagerId=p.resturantManagerId 
				INNER JOIN users u ON u.userId=p.userId 
				INNER JOIN payments pay ON pay.orderId=o.orderId 
				WHERE pm.resturantManagerId=:restaurantManagerId 
					AND pay.userId=:restaurantManagerId 
					AND o.orderState=:orderState
					AND o.date =:orderDate
					AND pay.status =:paymentState
					AND o.orderType =:orderType
				GROUP BY p.orderId
			`,
			{
				type: sequelize.QueryTypes.SELECT,
				replacements: {
					restaurantManagerId: user_id,
					orderState: orderState,
					orderDate: orderDate,
					paymentState: paymentState,
					orderType: orderType
				},
			}
		);
		res.json(result);

	} catch (err) {
		console.log(err);
	}
});

//

//update the product details
router.post('/updateProductDetails', async (req, res) => {
	try {
		const productId = req.body.productId;
		const price = req.body.price;
		const quantity = req.body.quantity;
		await sellProduct
			.update(
				{
					price: price,
					quantity: quantity
				},
				{
					where: {
						productId: productId,
					},
				}
			)
			.then((result) => {
				console.log('Update result:', result);
				res.send({ type: "success", message: "product details update Successfully" });
			});
	} catch (err) {
		console.log('Error:', err);
		res.send({ type: "error", message: "error Occurred" });
	}
});


module.exports = router;
