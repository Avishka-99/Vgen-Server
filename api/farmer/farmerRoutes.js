const path = require('path');
const express = require('express');
const router = express.Router();
const app = express();
const multer = require('multer');
const product = require('../../models/productSchema');
const sell_product=require('../../models/sell_productsSchema')
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

	} catch (err) {
        await transaction.rollback();
		console.log(err);
	}
});


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



module.exports = router;