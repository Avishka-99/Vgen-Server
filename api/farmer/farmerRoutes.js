const path = require('path');
const express = require('express');
const router = express.Router();
const app = express();
const multer = require('multer');
const product = require('../../models/productSchema');
const sell_product=require('../../models/sell_productsSchema')
const orders = require('../../models/ordersSchema');
const raw_placeOrders = require('../../models/raw_place_orderSchema');
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
router.post('/rowProductStore', upload.single('productImage'), async (req, res) => {
	const transaction = await sequelize.transaction();
    const product_category="raw_food";
	try {
		const {quantity, description, productName, price,category,user_id} = req.body;
		const {filename} = req.file;
       
		const createdProduct = await product.create({
			description,
			productName,
			productImage: filename,
            product_category,
            row_category:category,
		},{transaction});

        const lastInsertedProductId = createdProduct.productId;
      
        await sell_product.create({
			productId: lastInsertedProductId,
			manufactureId:user_id,
			price,
            quantity,
        },{transaction});

        await transaction.commit();
        res.send({type:"success", message:"Product added Successfully"});
	} catch (err) {
        await transaction.rollback();
		console.log(err);
		res.send({type:"error",message:"error Occurred"});
	}
});
//



router.get('/allRowProduct', async (req, res) => {
	const user_id = req.query.user_id;

	/*Create a join relation */
	product.belongsTo(sell_product, {
		foreignKey: 'productId',
	});
	sell_product.hasMany(product, {
		foreignKey: 'productId',
	});
	/* */
	try {
		const productData = await sell_product.findAll({
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


//get all order id relevant manufacture

router.get('/getAllOrderIDRelevantManufacture', async (req, res) => {
	const user_id = req.query.user_id;
	/*Create a join relation */
	orders.belongsTo(raw_placeOrders, {
		foreignKey: 'orderId',
	});
	raw_placeOrders.hasMany(orders, {
		foreignKey: 'orderId',
	});
	/* */
	try {
		const result = await orders.findAll({
			attributes: ['orderId'],
			include: [
				{
					model: raw_placeOrders,
					attributes: [],
					where: {
						productManufactureId: user_id,
					},
				},
			],
			group: ['raw_place_order.orderId'],
		});

	    res.json(result);
		console.log(result);
	} catch (err) {
		console.log(err);
	}
});
//

//get manufacture order details
router.get('/manufactureOrderDetails', async(req,res)=>{
	const user_id = req.query.user_id;
	try {
		const result= await sequelize.query(
		`SELECT o.orderId, o.date, o.time, o.amount, o.orderState, o.orderType,
		CONCAT(u.firstName, ' ',u.lastName) AS customerName,
		CONCAT(u.homeNo,'',u.street,'',u.city) AS address,
		pay.status AS paymentStatus
		FROM orders o 
		INNER JOIN raw_place_orders p ON p.orderId=o.orderId 
		INNER JOIN product_manufactures pm ON pm.productManufactureId=p.productManufactureId 
		INNER JOIN users u ON u.userId=p.userId 
		INNER JOIN payments pay ON pay.orderId=o.orderId 
		WHERE pm.productManufactureId=:restaurantManagerId AND pay.userId=:restaurantManagerId AND o.orderState>-1

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

//get Manufacture dashboard counts
router.get('/manufactureOrderCountsDetails', async(req,res)=>{
	const user_id = req.query.user_id;
	try {
		const result= await sequelize.query(
		`
		SELECT COUNT(t.orderId) AS totalCount, SUM(t.amount) AS totalAmount
		FROM (
			SELECT o.orderId, o.amount, o.date
			FROM orders o
			INNER JOIN raw_place_orders p ON p.orderId = o.orderId
			WHERE p.productManufactureId = :restaurantManagerId AND o.orderState>-1
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



//get most order with limit

router.get('/getManufactureMostOrderCountWithLimit', async (req, res) => {
	const user_id = req.query.user_id;

	try {
		const Q_count_L = await sequelize.query(
			`
      SELECT pr.*, p.productId,p.productManufactureId,p.orderId,SUM(p.quantity) AS count 
      FROM raw_place_orders p 
	  INNER JOIN orders o ON o.orderId=p.orderId
      INNER JOIN products pr ON pr.productId=p.productId 
      WHERE
      p.productManufactureId = :productManufactureId
	  AND o.date=CURRENT_DATE
	  AND o.orderState>-1
      GROUP BY p.productId 
      ORDER by count DESC 
      LIMIT 1
    `,
			{
				type: sequelize.QueryTypes.SELECT,
				replacements: {
					productManufactureId: user_id,
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

router.get('/getManufactureMostOrderCountWithOutLimit', async (req, res) => {
	const user_id = req.query.user_id;

	try {
		const Q_count = await sequelize.query(
			`
			SELECT pr.*, p.productId,p.productManufactureId,p.orderId,SUM(p.quantity) AS count 
			FROM raw_place_orders p 
			INNER JOIN orders o ON o.orderId=p.orderId
			INNER JOIN products pr ON pr.productId=p.productId 
			WHERE
			p.productManufactureId = :productManufactureId
			AND o.orderState>-1
			AND o.date=CURRENT_DATE
			GROUP BY p.productId 
			ORDER by count DESC 
   
        `,
			{
				type: sequelize.QueryTypes.SELECT,
				replacements: {
					productManufactureId: user_id,
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
//get most order type count

router.get('/getManufactureMostOrderTypeCountToday', async (req, res) => {
	const user_id = req.query.user_id;

	try {
		const Q_count_L = await sequelize.query(
			`
			SELECT t.orderType,COUNT(t.orderId) AS orderTypeCount
			FROM (
				SELECT o.orderId, o.amount, o.date,o.orderType
				FROM orders o
				INNER JOIN raw_place_orders p ON p.orderId = o.orderId
				WHERE p.productManufactureId = :productManufactureId
				AND o.date = CURRENT_DATE()
				GROUP BY p.orderId
			) t
			GROUP BY t.orderType
    `,
			{
				type: sequelize.QueryTypes.SELECT,
				replacements: {
					productManufactureId: user_id,
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

//get order count details

router.get('/getManufactureMostOrderCountDetailsToday', async (req, res) => {
	const user_id = req.query.user_id;

	try {
		const result = await sequelize.query(
			`
				SELECT t.orderState, COUNT(t.orderId) as totalCount
				FROM (
					SELECT o.orderId, o.orderState
					FROM orders o
					INNER JOIN raw_place_orders p ON p.orderId = o.orderId
					WHERE p.productManufactureId = :productManufactureId
					AND o.date=CURRENT_DATE
					GROUP BY o.orderId
				) t
				GROUP BY t.orderState
			`,
			{
				type: sequelize.QueryTypes.SELECT,
				replacements: {
					productManufactureId: user_id,
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

//get order details in table

router.get('/getManufactureMostOrderDetailsInTableToday', async (req, res) => {
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
					raw_place_orders p ON p.orderId = o.orderId
				INNER JOIN
					users u ON u.userId = p.userId
				WHERE
					p.productManufactureId = :productManufactureId
					AND o.orderState = 0
					AND o.date=CURRENT_DATE
				GROUP BY
				o.orderId;
    		`,
			{
				type: sequelize.QueryTypes.SELECT,
				replacements: {
					productManufactureId: user_id,
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
router.get('/getManufactureOrderMoreDetails', async (req, res) => {
	const order_id = req.query.order_id;
	const Manufacture_id = req.query.user_id;
	try {
		const result_3 = await sequelize.query(
			`
			SELECT p.orderId,pr.*,p.price,p.quantity 
			FROM raw_place_orders p 
			INNER JOIN products pr ON p.productId=pr.productId 
			WHERE
			p.productManufactureId = :manufactureId
			AND p.orderId= :orderId
         
          `,
			{
				type: sequelize.QueryTypes.SELECT,
				replacements: {
					manufactureId: Manufacture_id,
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
		  raw_place_orders p ON p.orderId = o.orderId
        INNER JOIN
          users u ON u.userId = p.userId
        WHERE
          p.productManufactureId = :manufactureId
          AND o.orderId= :orderId
        GROUP BY
          o.orderId;
        `,
			{
				type: sequelize.QueryTypes.SELECT,
				replacements: {
					manufactureId: Manufacture_id,
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

//get order sorted details
router.get('/getManufactureOrderDetailsInSortedByType', async (req, res) => {
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
					raw_place_orders p ON p.orderId = o.orderId
				INNER JOIN
					users u ON u.userId = p.userId
				WHERE
					p.productManufactureId = :productManufactureId
					AND o.orderState = 0
                    AND o.orderType=:order_type
					AND o.date=CURRENT_DATE
				GROUP BY
				o.orderId;
    		`,
			{
				type: sequelize.QueryTypes.SELECT,
				replacements: {
					productManufactureId: user_id,
					order_type:order_type
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

//get accepted order details
router.get('/getManufactureAcceptedOrderDetailsInTableToday', async (req, res) => {
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
					raw_place_orders p ON p.orderId = o.orderId
				INNER JOIN
					users u ON u.userId = p.userId
				WHERE
					p.productManufactureId = :productManufactureId
					AND o.orderState = 1
					AND o.date=CURRENT_DATE
				GROUP BY
				o.orderId;
    		`,
			{
				type: sequelize.QueryTypes.SELECT,
				replacements: {
					productManufactureId: user_id,
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
router.get('/getManufactureOrderDetailsInSortedByTypeWithAccepted', async (req, res) => {
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
					raw_place_orders p ON p.orderId = o.orderId
				INNER JOIN
					users u ON u.userId = p.userId
				WHERE
					p.productManufactureId = :productManufactureId
					AND o.orderState = 1
                    AND o.orderType=:order_type
					AND o.date=CURRENT_DATE
				GROUP BY
				o.orderId;
    		`,
			{
				type: sequelize.QueryTypes.SELECT,
				replacements: {
					productManufactureId: user_id,
					order_type:order_type
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

//update the order state
router.post('/updateOrderState', async (req, res) => {
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
				res.send({type:"success", message:"Order state update Successfully"});
			});
	} catch (err) {
		console.log('Error:', err);
		res.send({type:"error",message:"error Occurred"});
	}
});

//

module.exports = router;