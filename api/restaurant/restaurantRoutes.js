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
const sequelize = require('../../models/db');



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

//order type details
router.get('/getOrderDetails',async (req, res) => {
  const user_id = req.query.user_id;
  try {
    
    const result_1= await sequelize.query(`
    SELECT t.orderState, COUNT(t.orderId) as totalCount
    FROM (
      SELECT o.orderId, o.orderState
      FROM orders o
      INNER JOIN place_orders p ON p.orderId = o.orderId
      WHERE p.resturantManagerId = :restaurantManagerId
      GROUP BY o.orderId
    ) t
    GROUP BY t.orderState;
  `, {
    type: sequelize.QueryTypes.SELECT,
    replacements: {
      restaurantManagerId: user_id
    }
  });
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
  router.get('/getOrderMoreDetails',async (req,res)=>{
    const order_id=req.query.order_id;
    const restaurantManagerId=req.query.user_id
     try{
        const result_3=await sequelize.query(
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
              orderId:order_id,
            },
          }
        );

      const result_4=await sequelize.query(
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
            orderId:order_id,
          },
        }
      );
      const responseData = {
        result_3: result_3,
        result_4: result_4,
      };
    
      res.json(responseData);
      console.log(responseData);
    }catch(err){
      console.log(err);
    }
  });

//

  //get sorted order details

  router.get('/getOrderSortedDetails',async (req, res) => {
    const user_id = req.query.user_id;
    const order_type= req.query.order_type;
    try {
      const result_1= await sequelize.query(`
      SELECT t.orderState, COUNT(t.orderId) as totalCount
      FROM (
        SELECT o.orderId, o.orderState
        FROM orders o
        INNER JOIN place_orders p ON p.orderId = o.orderId
        WHERE p.resturantManagerId = :restaurantManagerId
        GROUP BY o.orderId
      ) t
      GROUP BY t.orderState;
    `, {
      type: sequelize.QueryTypes.SELECT,
      replacements: {
        restaurantManagerId: user_id
      }
    });
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
            orderType: order_type
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
  
  router.get('/getMostOrderCountWithLimit',async (req, res) => {
    const user_id = req.query.user_id;
    
    try {
      const Q_count_L= await sequelize.query(`
      SELECT pr.*, p.productId,p.resturantManagerId,p.orderId,SUM(p.quantity) AS count 
      FROM orders o
      INNER JOIN place_orders p 
      INNER JOIN products pr ON pr.productId=p.productId 
      WHERE
      p.resturantManagerId = :restaurantManagerId
      GROUP BY p.productId 
      ORDER by count DESC 
      LIMIT 1
    `, {
      type: sequelize.QueryTypes.SELECT,
      replacements: {
        restaurantManagerId: user_id
      }
    });
      res.json(Q_count_L);
      console.log(Q_count_L);
    } catch (err) {
      console.log(err);
    }
      
    });

  //

   //get most order without limit
  
   router.get('/getMostOrderCountWithOutLimit',async (req, res) => {
    const user_id = req.query.user_id;
    
    try {
      const Q_count= await sequelize.query(`
      SELECT pr.*, p.productId,p.resturantManagerId,p.orderId,SUM(p.quantity) AS count 
      FROM orders o
      INNER JOIN place_orders p 
      INNER JOIN products pr ON pr.productId=p.productId 
      WHERE
      p.resturantManagerId = :restaurantManagerId
      GROUP BY p.productId 
      ORDER by count DESC 
    `, {
      type: sequelize.QueryTypes.SELECT,
      replacements: {
        restaurantManagerId: user_id
      }
    });
      res.json(Q_count);
      console.log(Q_count);
    } catch (err) {
      console.log(err);
    }
      
    });

  //
module.exports = router;