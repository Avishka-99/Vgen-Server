const path = require('path');
const express = require('express');
const router = express.Router();
const app = express();
const orders = require('../../models/ordersSchema');
const placeOrders = require('../../models/place_orderSchema');
const product = require('../../models/productSchema');
const payment=require('../../models/paymentsSchema')
const users=require('../../models/userSchema')
const multer = require('multer');
const { Sequelize } = require('sequelize');
const payments = require('../../models/paymentsSchema');

/*Create a join relation */
orders.hasMany(placeOrders,{
  foreignKey:'orderId',
});
placeOrders.belongsTo(orders,{
  foreignKey: 'orderId',
});
users.hasOne(placeOrders,{
  foreignKey:'userId',
});
placeOrders.belongsTo(users,{
  foreignKey: 'userId',
});
orders.hasOne(payment,{
  foreignKey:'orderId',
});
payment.belongsTo(orders,{
  foreignKey:'orderId',
})

/* */

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
    
    
    try{
      const productData=await placeOrders.findAll({
        attributes :{
          exclude:['orderId' ,'productId' ,'resturantManagerId' ,'userId']
        }
        ,include: [
          {
            model: orders,
            required: true,
            attributes: ['orderId', 'orderType', 'orderState'],
            include: {
              model: payments,
              required: true,
              attributes: ['status'],
            },
          },
          {
            model: users,
            required: true,
            attributes: [
              [Sequelize.literal('CONCAT(firstName, " ", lastName)'), 'fullName'],
            ],
          }
         
          
        ],
        where: {
          userId: user_id,
        },
        group:'order.orderId',
        
      });
      
        
      
      
       
        
      
      res.json(productData);
      // console.log(productData[0].order.dataValues.orderId)

      
     }catch(err){
      console.log(err);
     };

});
module.exports = router;