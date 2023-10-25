const path = require('path');
const express = require('express');
const router = express.Router();
const app = express();
const KEYS = require('../keys/Keys')
const stripe = require('stripe')(KEYS.STRIPE_KEY);
router.use(express.json());
router.post('/intents', async (req, res) => {
	try {
		const paymentIntent = await stripe.paymentIntents.create({
			amount: req.body.amount,
			currency: 'lkr',
			automatic_payment_methods: {
				enabled: true,
			},
		});
		res.json({paymentIntent: paymentIntent.client_secret});
		//res.json({message: 'success'});
	} catch(e) {
        res.send('error')
    }
});
module.exports = router;
