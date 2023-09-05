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
const reservation=require('../../models/reservationSchema');
const place_complain=require('../../models/place_complainSchema')
const multer = require('multer');
const {Sequelize, Op, where} = require('sequelize');
const sequelize = require('../../models/db');

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
router.post('/productAdd', upload.single('productImage'), async (req, res) => {
	const transaction = await sequelize.transaction();
	const product_category = 'food';
	const {quantity, description, productName, price, category, user_id} = req.body;
	const {filename} = req.file;

	try {
		const createdProduct = await product.create(
			{
				description,
				productName,
				productImage: filename,
				product_category,
				vegan_category: category,
			},
			{transaction}
		);

		const lastInsertedProductId = createdProduct.productId;

		await sellProduct.create(
			{
				productId: lastInsertedProductId,
				manufactureId: user_id,
				price,
				quantity,
			},
			{transaction}
		);

		await transaction.commit();
	} catch (err) {
		await transaction.rollback();
		console.log(err);
	}
});
//

//table view details gets of the restaurant manager home
router.get('/resDetailsGet', async (req, res) => {
	const user_id = req.query.user_id;

	/*Create a join relation */
	orders.belongsTo(placeOrders, {
		foreignKey: 'orderId',
	});
	placeOrders.hasMany(orders, {
		foreignKey: 'orderId',
	});
	users.hasOne(placeOrders, {
		foreignKey: 'userId',
	});
	placeOrders.belongsTo(users, {
		foreignKey: 'userId',
	});
	placeOrders.hasOne(payments, {
		foreignKey: 'orderId',
	});
	payments.belongsTo(placeOrders, {
		foreignKey: 'orderId',
	});
	/* */

	try {
		const productData = await placeOrders.findAll({
			where: {
				resturantManagerId: user_id,
			},
			attributes: {
				exclude: ['orderId', 'productId', 'resturantManagerId', 'userId'],
			},
			include: [
				{
					model: orders,
					required: true,
					attributes: ['orderId', 'orderType', 'orderState'],
				},
				{
					model: users,
					required: true,
					attributes: [[Sequelize.literal('CONCAT(firstName, " ", lastName)'), 'fullName']],
				},
				{
					model: payments,
					required: true,
					attributes: ['status'],
					where: {
						userId: '24',
					},
				},
			],

			group: 'place_order.orderId',
		});

		// Flattening the result array to extract desired data
		const flattenedProductData = productData.map((placeOrder) => {
			return {
				orderId: placeOrder.orders[0].orderId,
				orderType: placeOrder.orders[0].orderType,
				orderState: placeOrder.orders[0].orderState,
				fullName: placeOrder.user.dataValues.fullName,
				status: placeOrder.payment.status,
			};
		});

		res.json(flattenedProductData);
		console.log(flattenedProductData);
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
			attributes: ['orderType'],
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

		// Initialize an object to store the counts
		const orderTypeCounts = {
			Delivery: 0,
			'Take away': 0,
			'Dine in': 0,
		};

		// Loop through the result array and count occurrences
		result.forEach((row) => {
			const orderType = row.orderType;
			if (orderTypeCounts.hasOwnProperty(orderType)) {
				orderTypeCounts[orderType]++;
			}
		});

		// Convert the object to an array
		const countsArray = Object.entries(orderTypeCounts).map(([orderType, count]) => ({orderType, count}));

		// const result = await orders.findAll({
		//   attributes: ['orderType', [Sequelize.fn('COUNT', Sequelize.col('orderType')), 'countPerType']],
		//   where: {
		//     orderType: firstLevelGroup.map((order) => order.orderType),
		//   },
		//   group: ['orderType'],
		// });

		res.json(countsArray);
		console.log(countsArray);
	} catch (err) {
		console.log(err);
	}
});
//

//order count details
router.get('/orderCountDetails', async (req, res) => {
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
		// const currentDate = new Date();
		// const today = currentDate.getDate();

		const FirstLevelGroup = await orders.findAll({
			attributes: ['totalQuantity', 'orderId', 'amount'],
			include: [
				{
					model: placeOrders,
					where: {
						resturantManagerId: user_id,
					},
				},
			],
			// where:{
			//     date : today,
			// },
			group: ['place_order.orderId'],
		});

		// Calculate total_count, total_quantity, and total_amount
		let total_count = 0;
		let total_quantity = 0;
		let total_amount = 0;

		for (const order of FirstLevelGroup) {
			total_count++;
			total_quantity += order.dataValues.totalQuantity;
			total_amount += parseInt(order.dataValues.amount); // Convert the amount to an integer before adding
		}

		const result = {
			total_count: total_count,
			total_quantity: total_quantity,
			total_amount: total_amount,
		};

		console.log(result);
		res.json(result);
	} catch (err) {
		console.log(err);
	}
});

//

//order type details
router.get('/getOrderDetails', async (req, res) => {
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
        o.orderId, o.date, o.time, o.orderState,o.orderType,o.totalQuantity ,CONCAT(u.firstName, " ", u.lastName) AS name,o.amount
      FROM
        orders o
      INNER JOIN
        place_orders p ON p.orderId = o.orderId
      INNER JOIN
        users u ON u.userId = p.userId
      WHERE
        p.resturantManagerId = :restaurantManagerId
        AND o.orderState = 0
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
          AND o.orderState = 0
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

//get sorted order details

router.get('/getOrderSortedDetails', async (req, res) => {
	const user_id = req.query.user_id;
	const order_type = req.query.order_type;
	const orderState = req.query.orderState;

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
          AND o.orderState = 0
          AND o.orderType= :orderType
        GROUP BY
          o.orderId;
        `,
			{
				type: sequelize.QueryTypes.SELECT,
				replacements: {
					restaurantManagerId: user_id,
					orderType: order_type,
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

//get most order with limit

router.get('/getMostOrderCountWithLimit', async (req, res) => {
	const user_id = req.query.user_id;

	try {
		const Q_count_L = await sequelize.query(
			`
      SELECT pr.*, p.productId,p.resturantManagerId,p.orderId,SUM(p.quantity) AS count 
      FROM orders o
      INNER JOIN place_orders p 
      INNER JOIN products pr ON pr.productId=p.productId 
      WHERE
      p.resturantManagerId = :restaurantManagerId
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
      FROM orders o
      INNER JOIN place_orders p 
      INNER JOIN products pr ON pr.productId=p.productId 
      WHERE
      p.resturantManagerId = :restaurantManagerId
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
const complain_ing = multer({complain_ing_storage: complain_ing_storage});
router.post('/addComplain', complain_ing.single('photo'), async (req, res) => {
	const transaction = await sequelize.transaction();
	const currentDate = new Date();

	// Formatting date as "Day-Month-Year"
	const day = String(currentDate.getDate()).padStart(2, '0');
	const month = String(currentDate.getMonth() + 1).padStart(2, '0');
	const year = currentDate.getFullYear();
	const formattedDate = `${day}-${month}-${year}`;

	// Formatting time as "Hour:Minute:Second"
	const hours = String(currentDate.getHours()).padStart(2, '0');
	const minutes = String(currentDate.getMinutes()).padStart(2, '0');
	const seconds = String(currentDate.getSeconds()).padStart(2, '0');
	const formattedTime = `${hours}:${minutes}:${seconds}`;

	try {
		const {orderId, description, user_id} = req.body;
		const {filename} = req.file;

		const createdComplain = await complain.create(
			{
				date: formattedDate,
				description: description,
				time: formattedTime,
				photo: filename,
				orderId: orderId,
			},
			{transaction}
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
			{transaction}
		);

		await transaction.commit();
		await place_complain.create({
			complainId:lastInsertedComplainId,
			orderId:orderId,
			userId:user_id
		},{transaction})
 
        await transaction.commit();
        res.send({type:"success", message:"Complain added Successfully"});
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
router.delete('/deleteComplain',async (req, res) => {
	const transaction = await sequelize.transaction();
   

	try {
		const id = req.query.id;
		
       
		await complain.destroy({
			where:{
				complainId:id
			}
		},{transaction});

        await check_complain.destroy({
			where:{
				complainId:id
			}
		},{transaction});

		await place_complain.destroy({
			where:{
				complainId:id
			}
		},{transaction})
 
        await transaction.commit();
        res.send({type:"success", message:"Complain delete Successfully"});
	} catch (err) {
        await transaction.rollback();
		console.log(err);
		res.send({type:"error",message:"error Occurred"});
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
			},where: {
				product_category :'raw_food'
			}	
		});
		res.json(productData);
		console.log(productData);
	} catch (err) {
		console.log(err);
	}
});
//

module.exports = router;
