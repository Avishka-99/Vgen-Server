const path = require('path');
const express = require('express');
const router = express.Router();
const app = express();
const jwt = require('jsonwebtoken');
const orders = require('../../models/ordersSchema');
const sequelize = require('../../models/db');
const {type} = require('os');




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
    const userid=req.query.userid;
    const latitude=req.query.lat
    const longitude=req.query.lon;
    console.log("my location",longitude)
    console.log("userrtttt",userid)
   try{
    const orderData=await sequelize.query(`SELECT
    orders.orderId,
    orders.totalQuantity,
    orders.amount,
    orders.date,
    orders.time,
    place_orders.userId,
    place_orders.resturantManagerId,
    vegan_users.latitude AS vegan_latitude,
    vegan_users.longitude AS vegan_longitude,
    (SELECT users.street FROM users WHERE users.userId=place_orders.userId AND users.userRole='Customer') AS cust_Address,
    (SELECT users.street FROM users WHERE users.userId=place_orders.resturantManagerId AND users.userRole='resturantManager') AS rest_Address,
    users.firstName,
    (SELECT users.contactNo FROM users WHERE users.userId=place_orders.userId AND users.userRole='Customer') AS cust_contact,
    (SELECT users.contactNo FROM users WHERE users.userId=place_orders.resturantManagerId AND users.userRole='resturantManager') AS rest_contact,
    restaurant_managers.latitude AS rest_latitude,
    restaurant_managers.longitude AS rest_longitude,
    restaurant_managers.resturantName,
    restaurant_managers.openTime,
    restaurant_managers.closeTime
  FROM
    orders
  INNER JOIN
    place_orders ON orders.orderId = place_orders.orderId
  INNER JOIN
    vegan_users ON place_orders.userId = vegan_users.userId
  INNER JOIN
    users ON place_orders.userId = users.userId
  INNER JOIN
    restaurant_managers ON place_orders.resturantManagerId = restaurant_managers.resturantManagerId
  
  WHERE
    orders.orderState = 2
    GROUP BY orders.orderId;
  `);

    const deliveryData=await sequelize.query(
        `SELECT delivery_persons.vehicleType,delivery_persons.latitude,delivery_persons.longitude,delivery_persons.maxQuantity, delivery_persons.availability 
         FROM delivery_persons WHERE delivery_persons.deliveryPersonId=${userid};`
    )

    // const udatelocation=await sequelize.query(`UPDATE delivery_persons SET delivery_persons.latitude=${latitude} ,
    // delivery_persons.longitude=${longitude} 
    // WHERE delivery_persons.deliveryPersonId=${userid};`)

    const result ={
        deliveryData:deliveryData,
        orderData:orderData
    };
     // console.log(result.orderData)
     //const uniqdeliveryData=new Map() //remove dublicat array
     const uniqorderData=new Map()
     const frontEnd_pass_orders=[]

     result.orderData.forEach((data) => {
        const key=`${data.orderId}`
        uniqorderData.set(key,data)
    });
    
    //  result.deliveryData.forEach((data)=>{
    //     const key=`${data.deliveryPersonId}`
    //     uniqdeliveryData.set(key,data)
        
    //  })
    // const newDeliveyData=Array.from(uniqdeliveryData.values());
     const neworderData=Array.from(uniqorderData.values());
    // console.log(neworderData)
     const deliverLatitude= result.deliveryData[0][0].latitude
     const deliveryLongitude=result.deliveryData[0][0].longitude
    // console.log(deliverLatitude)
    // console.log(deliveryLongitude)
     
     for(let i=0;i<neworderData.length;i++){
        for(let j=0;j<neworderData[i].length;j++){
            const RestDistance=calculateDistance(neworderData[i][j].rest_latitude,neworderData[i][j].rest_longitude,deliverLatitude,deliveryLongitude)
            const VegenuserDistance=calculateDistance(neworderData[i][j].vegan_latitude,neworderData[i][j].vegan_longitude,deliverLatitude,deliveryLongitude)
            const timeClose=getTime(RestDistance)
            const closetimeShop=neworderData[i][j].closeTime
            const openTimeShop=neworderData[i][j].openTime
            const orderDate=neworderData[i][j].date
            const aroundTime=AroundTime(timeClose)
           // console.log("dsfsdf",RestDistance)
            //console.log("mmmm",VegenuserDistance)
           // console.log(aroundTime)
             console.log("open",openTimeShop)
             console.log("close",closetimeShop)
            // console.log("time clo",timeClose)
            console.log("around",aroundTime)
            //console.log(isTimeBetween(new Date(`${openTimeShop}`),new Date(`${closetimeShop}`),new Date(`${aroundTime}`)))
            // console.log()
            // console.log(orderDate)
           
            if(VegenuserDistance<=10 && areDatesEqual(new Date(orderDate),new Date())){
               // 
                frontEnd_pass_orders.push(neworderData[i][j])
                //console.log("distinc",distance)
            }
        }
        
     }

		//  result.deliveryData.forEach((data)=>{
		//     const key=`${data.deliveryPersonId}`
		//     uniqdeliveryData.set(key,data)

		//  })
		// const newDeliveyData=Array.from(uniqdeliveryData.values());
		// const neworderData = Array.from(uniqorderData.values());
		// // console.log(neworderData)
		// const deliverLatitude = result.deliveryData[0][0].latitude;
		// const deliveryLongitude = result.deliveryData[0][0].longitude;
		// console.log(deliverLatitude)
		// console.log(deliveryLongitude)

		// for (let i = 0; i < neworderData.length; i++) {
		// 	for (let j = 0; j < neworderData[i].length; j++) {
		// 		const RestDistance = calculateDistance(neworderData[i][j].rest_latitude, neworderData[i][j].rest_longitude, deliverLatitude, deliveryLongitude);
		// 		const VegenuserDistance = calculateDistance(neworderData[i][j].vegan_latitude, neworderData[i][j].vegan_longitude, deliverLatitude, deliveryLongitude);
		// 		const timeClose = getTime(RestDistance);
		// 		const closetimeShop = neworderData[i][j].closeTime;
		// 		const openTimeShop = neworderData[i][j].openTime;
		// 		const orderDate = neworderData[i][j].date;
		// 		const aroundTime = AroundTime(timeClose);
		// 		// console.log(aroundTime)
		// 		//console.log("open",openTimeShop)
		// 		//console.log("close",closetimeShop)
		// 		// console.log("time clo",timeClose)
		// 		// console.log()
		// 		// console.log(orderDate)

		// 		if (VegenuserDistance <= 10 && RestDistance <= 10 && isTimeBetween(new Date(`1970-01-01T${openTimeShop}`), new Date(`1970-01-01T${closetimeShop}`), new Date(`1970-01-01T${aroundTime}`)) && areDatesEqual(new Date(orderDate), new Date())) {
		// 			//
		// 			frontEnd_pass_orders.push(neworderData[i][j]);
		// 			//console.log("distinc",distance)
		// 		}
		// 	}
		// }

		console.log('front end data', frontEnd_pass_orders);

      function AroundTime(addTime){
        const nowTime = new Date();
        const hoursToAdd = new Date(`1970-01-01T${addTime}`);
      
        // Calculate the total time in hours and minutes
        const totalHours = nowTime.getHours() + hoursToAdd.getHours();
        //const totalHours24=totalHours % 12;
        const totalMinutes = nowTime.getMinutes() + hoursToAdd.getMinutes();
       
      
        // Calculate the additional days and adjust hours
        const daysToAdd = Math.floor(totalMinutes / 60);
        const adjustedHours = totalHours + daysToAdd;
      
        // Calculate the remaining minutes
        const remainingMinutes = totalMinutes % 60;
      
        // Format the result
        const formattedTime = `${adjustedHours < 10 ? '0' : ''}${adjustedHours}:${remainingMinutes < 10 ? '0' : ''}${remainingMinutes}`;
      
        return formattedTime;

      }
      //time check between open time and close time
     
      //

		function toRadians(degrees) {
			return degrees * (Math.PI / 180);
		}

		function getTime(distance) {
			const time = distance / 30.5;
			const roundedHours = Math.floor(time);
			const minutes = Math.round((time - roundedHours) * 60);
			const formattedTime = `${roundedHours < 10 ? '0' : ''}${roundedHours}:${minutes < 10 ? '0' : ''}${minutes}`;
			return formattedTime;
		}

		function AroundTime(addTime) {
			const nowTime = new Date();
			const hoursToAdd = new Date(`1970-01-01T${addTime}`);

			// Calculate the total time in hours and minutes
			const totalHours = nowTime.getHours() + hoursToAdd.getHours();
			const totalMinutes = nowTime.getMinutes() + hoursToAdd.getMinutes();

			// Calculate the additional days and adjust hours
			const daysToAdd = Math.floor(totalMinutes / 60);
			const adjustedHours = totalHours + daysToAdd;

			// Calculate the remaining minutes
			const remainingMinutes = totalMinutes % 60;

			// Format the result
			const formattedTime = `${adjustedHours < 10 ? '0' : ''}${adjustedHours}:${remainingMinutes < 10 ? '0' : ''}${remainingMinutes}`;

			return formattedTime;
		}
		//time check between open time and close time
		function isTimeBetween(openTime, closeTime, targetTime) {
			const targetHours = targetTime.getHours();
			const targetMinutes = targetTime.getMinutes();

			const openHours = openTime.getHours();
			const openMinutes = openTime.getMinutes();

			const closeHours = closeTime.getHours();
			const closeMinutes = closeTime.getMinutes();

			if ((targetHours > openHours || (targetHours === openHours && targetMinutes >= openMinutes)) && (targetHours < closeHours || (targetHours === closeHours && targetMinutes <= closeMinutes))) {
				return true;
			} else {
				return false;
			}
		}
		//

		//seme data check
		function areDatesEqual(date1, date2) {
			return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate();
		}

		//

		res.json(frontEnd_pass_orders);
		//res.json({ result });
		//console.log(result)
	} catch (err) {
		console.log(err);
	}
});

module.exports = router;
