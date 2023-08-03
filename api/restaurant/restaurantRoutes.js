const path = require('path');
const express = require('express');
const router = express.Router();
const app = express();
const orders = require('../../models/ordersSchema');
const placeOrders = require('../../models/place_orderSchema');
const product = require('../../models/productSchema');
const payments = require('../../models/paymentsSchema');
const users=require('../../models/userSchema');
const sellProduct=require('../../models/sell_productsSchema');
const multer = require('multer');
const { Sequelize,Op, where } = require('sequelize');




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



//table view details gets of the restaurant manager home
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
    placeOrders.hasOne(payments, {
      foreignKey: 'orderId',
    });
    payments.belongsTo(placeOrders, {
      foreignKey: 'orderId',
    });
    /* */
    
    try{
      const productData=await placeOrders.findAll({
        where: {
          resturantManagerId: user_id,
          
        },
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
          {
            model: payments,
            required: true,
            attributes: ['status'],
            where: {
              userId: '24',
            },
            
          },
          
        ],
       
        group:'place_order.orderId',
        
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
     }catch(err){
      console.log(err);
     };

});
//

router.get('/allProduct',async (req, res) => {
  const user_id = req.query.user_id;

  /*Create a join relation */
  product.belongsTo(sellProduct,{
    foreignKey:'productId',
  });
  sellProduct.hasMany(product,{
    foreignKey: 'productId',
  });
  /* */
  try{
    const productData=await sellProduct.findAll({
       include:{
        model:product,
        attributes:['productId','productName','productImage','description'],
       },
       where:{
        manufactureId:user_id
       }
    })
    res.json(productData);
    console.log(productData);
  }
  catch(err){
    console.log(err);
  }




});

//bar chart details get of the restaurant manager home
router.get('/orderTypes',async (req, res) => {
  const user_id = req.query.user_id;
   /*Create a join relation */
  orders.belongsTo(placeOrders,{
    foreignKey:'orderId',
  });
  placeOrders.hasMany(orders,{
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
      'Delivery': 0,
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
    const countsArray = Object.entries(orderTypeCounts).map(([orderType, count]) => ({ orderType, count }));

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
router.get('/orderCountDetails',async (req, res) => {
  const user_id = req.query.user_id;
   /*Create a join relation */
  orders.belongsTo(placeOrders,{
    foreignKey:'orderId',
  });
  placeOrders.hasMany(orders,{
    foreignKey: 'orderId',
  });
  /* */
  try {
    
    // const currentDate = new Date();
    // const today = currentDate.getDate();
    
    const FirstLevelGroup =await  orders.findAll({
      attributes: ['quantity', 'orderId', 'amount'],
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
       total_quantity += order.dataValues.quantity;
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
module.exports = router;