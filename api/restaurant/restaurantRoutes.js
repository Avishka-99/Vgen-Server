const path = require('path');
const express = require('express');
const router = express.Router();
const app = express();
const orders = require('../../models/ordersSchema');
const placeOrders = require('../../models/place_orderSchema');
const product = require('../../models/productSchema');
const payments = require('../../models/paymentsSchema');
const users=require('../../models/userSchema')
const multer = require('multer');
const { Sequelize } = require('sequelize');




// product store 
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
     cb(null, './uploads/products');
    },
    filename: function (req, file, cb) {
           cb(null,Date.now()+path.extname(file.originalname));
    }
})
const upload = multer({ storage: storage });
router.post("/productAdd",upload.single('productImage'), async (req, res) => {
   
           console.log(req.file);
        try{
            const {quantity,description,productName,price}=req.body;
            const{filename}=req.file;
        
            await product.create({
                quantity,
                description,
                productName,
                price,
                productImage:filename
            });
        }catch(err){
            console.log(err);
        }
        
    });




router.get("/resDetailsGet",async (req, res) => {
    const user_id = req.query.user_id;
    
    /*Create a join relation */
    orders.belongsTo(placeOrders,{
      foreignKey:'orderId',
    });
    placeOrders.hasMany(orders,{
      foreignKey: 'orderId',
    });
    users.hasOne(placeOrders,{
      foreignKey:'userId',
    });
    placeOrders.belongsTo(users,{
      foreignKey: 'userId',
    });
    // placeOrders.belongsTo(payments, {
    //   foreignKey: 'orderId',
    // });
    // payments.hasOne(placeOrders, {
    //   foreignKey: 'orderId',
    // });
    /* */
    
    try{
      const productData=await placeOrders.findAll({
        attributes :{
          
          exclude:['orderId' ,'productId','resturantManagerId','userId']
        }
        ,include: [
          {
            model: orders,
            required: true,
            attributes: ['orderId', 'orderType', 'orderState'],
           
          },
          {
            model: users,
            required: true,
            attributes: [
              [Sequelize.literal('CONCAT(firstName, " ", lastName)'), 'fullName'],
            ],
          },
          // {
          //   model: payments,
          //   required: true,
          //   attributes: ['status'],
            
          // },
          
        ],
        where: {
          resturantManagerId: user_id,
        },
        group:'place_order.orderId',
        
      });
      
        
      // Flattening the result array to extract desired data
      const flattenedProductData = productData.map((placeOrder) => {
        return {
          orderId: placeOrder.orders[0].orderId,
          orderType: placeOrder.orders[0].orderType,
          orderState: placeOrder.orders[0].orderState,
          fullName: placeOrder.user.dataValues.fullName,
          // status: placeOrder.payment.status,
        };
      });

      res.json(flattenedProductData);
      console.log(flattenedProductData);
     }catch(err){
      console.log(err);
     };

});
module.exports = router;