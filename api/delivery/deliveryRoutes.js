const path = require('path');
const express = require('express');
const router = express.Router();
const app = express();
const jwt = require('jsonwebtoken');
const orders=require('../../models/ordersSchema');
const sequelize = require('../../models/db');


router.get("/deliverDetails",async (req, res) => {
    try{
        const ordertData=await orders.findAll();
        res.json(ordertData);
        console.log(ordertData);
    }catch(err){
        console.log(err);
    }
          
                
});

router.get("/deliveryOrders",async(req,res)=>{

   try{
    const orderData=await sequelize.query(`
     SELECT orders.orderId,orders.quantity,orders.date,orders.time,orders.amount,orders.deliveryFee,place_orders.orderId,place_orders.productId, place_orders.resturantManagerId,place_orders.userId,place_orders.price,place_orders.quantity,vegan_user.userId,vegan_user.latitude, vegan_user.longitude
     FROM orders 
     INNER JOIN place_orders ON orders.orderId=place_orders.orderId 
     INNER JOIN vegan_user ON place_orders.userId=vegan_user.userId WHERE orders.orderState=2;
    
    `)
    res.json(orderData)
    console.log(orderData)
   }
   catch(err){
      console.log(err)
   }

});

module.exports = router;