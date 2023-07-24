const path = require('path');
const express = require('express');
const router = express.Router();
const app = express();
const orders = require('../../models/ordersSchema');

router.get("/res_details_get",async (req, res) => {
    const user_id = req.body.user_id;
    

    try{
        const orderData=await orders.findAll();
       console.log(orderData)
        res.json(orderData);
    }catch(err){
        console.log(err);
    }

});
module.exports = router;