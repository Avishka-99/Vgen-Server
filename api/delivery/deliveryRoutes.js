const path = require('path');
const express = require('express');
const router = express.Router();
const app = express();
const jwt = require('jsonwebtoken');
const orders = require('../../models/ordersSchema');
const sequelize = require('../../models/db');
const {type} = require('os');
const { json } = require('sequelize');
router.use(express.json());
router.get('/deliverDetails', async (req, res) => {
	try {
		const ordertData = await orders.findAll();
		res.json(ordertData);
		console.log(ordertData);
	} catch (err) {
		console.log(err);
	}
});

router.get('/deliveryOrders', async (req, res) => {
	const userid = req.query.userid;
	const latitude = req.query.lat;
	const longitude = req.query.lon;
	console.log('my location latitude',latitude);
	console.log('my location longitude',longitude);
	console.log('delivery id',userid);

	try{ 
		
        await sequelize.query(`SELECT
        orders.totalQuantity AS order_quantitiy,
		orders.foodType AS order_type,
		orders.date AS order_date,
		orders.time AS order_time,
		orders.amount AS order_amount,
		orders.orderId AS order_id,
        restaurant_managers.resturantManagerId AS rest_id,
		restaurant_managers.latitude AS rest_latitude,
		restaurant_managers.longitude AS rest_longitude,
		restaurant_managers.resturantName AS rest_name ,
		restaurant_managers.openTime AS rest_openTime,
		restaurant_managers.closeTime AS rest_closeTime,
		restaurant_managers.image AS res_image,
		(SELECT users.contactNo  FROM users WHERE users.userId=rest_id) AS rest_contacNo,
		(SELECT users.street  FROM users WHERE users.userId=rest_id)AS rest_address,	
		(SELECT users.contactNo  FROM users WHERE users.userId=place_orders.userId) AS vgen_contacNo,
		(SELECT users.firstName  FROM users WHERE users.userId=place_orders.userId)AS vgen_name,
		(SELECT users.street  FROM users WHERE users.userId=place_orders.userId)AS vgen_address,
		vegan_users.latitude AS vgen_latitude,
		vegan_users.longitude AS vgen_longitude
        
       FROM orders 
			INNER JOIN 
					place_orders
					ON
					place_orders.orderId=orders.orderId
				INNER JOIN 
					restaurant_managers 
					ON 
					restaurant_managers.resturantManagerId=place_orders.resturantManagerId
				INNER JOIN
					vegan_users
					ON 
					vegan_users.userId=place_orders.userId
				    WHERE  orders.deliveryState=0 AND orders.foodType="Hot" AND orders.deliveryPersonId=${userid} AND orders.rejectDilever=0
				    GROUP BY orders.orderId;
		        `).then((response)=>{
					console.log(response[0])
					res.send(response[0])
				})  

	}
	catch(error){
       console.log(error);    
	}
	
});

router.get('/deliveryHistory',async(req,res)=>{
  const userId=req.query.userid
  console.log("iddddddd",userId)

		await sequelize.query(`SELECT orders.totalQuantity as quantitiy,orders.amount AS price,orders.orderState as state,products.productName AS foodNAme,products.productImage AS image ,
		orders.orderId AS order_id,
		(SELECT orders.foodType FROM orders WHERE orders.orderId=order_id) AS foodType
		FROM place_orders 
		INNER JOIN orders
		ON orders.orderId=place_orders.orderId
		INNER JOIN  products
		ON products.productId=place_orders.productId WHERE place_orders.userId=29 GROUP BY place_orders.orderId;`
		).then((response)=>{
			console.log(response[0])
			res.send(response[0])  
		})
	}
		
);

router.get('/deliveryRject',async(req,res)=>{
     
	const userId=req.query.userid
	const orderid=req.query.orderID

		await sequelize.query(`
		UPDATE orders SET orders.rejectDilever=1 
		WHERE orders.orderId=${orderid} 
		AND orders.deliveryPersonId=${userId}; `
		)


});

	


module.exports = router;
