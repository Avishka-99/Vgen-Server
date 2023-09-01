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
		WHERE pm.productManufactureId=:restaurantManagerId AND pay.userId=:restaurantManagerId

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
			WHERE p.productManufactureId = :restaurantManagerId
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



module.exports = router;