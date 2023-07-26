const path = require('path');
const express = require('express');
const router = express.Router();
const app = express();
const orders = require('../../models/ordersSchema');
const product = require('../../models/productSchema')
const multer = require('multer');

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
    console.log(user_id);

    try{
        const orderData=await orders.findAll();
        console.log(orderData)
        res.json(orderData);
    }catch(err){
        console.log(err);
    }

});
module.exports = router;