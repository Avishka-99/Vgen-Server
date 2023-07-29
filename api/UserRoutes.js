// Used to handle user related requests
const path = require("path");
const express = require("express");
const router = express.Router();
const app = express();

const jwt = require("jsonwebtoken");
const User = require("../models/userSchema");
const product = require("../models/productSchema");

const bcrypt = require("bcrypt");
const multer = require("multer");

router.post("/signinuser", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  // console.log(email);
  User.findAll({
    where: {
      email: email,
    },
  })
    .then((result) => {
      if (result.length == 0) {
        res.send("Please check email")
      } else {
        bcrypt.compare(password, result.toJSON().password, (err, result_2) => {
          if (err) {
            res.send(200);
          }
          if (result_2) {
            console.log("Hello");
            const type = result.toJSON().userRole;
            console.log(result.toJSON().userRole);
            const payload = {
              userId: result.toJSON().userId,
              password: result.toJSON().password,
              time: new Date(),
            };
            const secretKey = "Avishka";
            const token = jwt.sign(payload, secretKey, { expiresIn: "10h" });
            const response = { type, token };
            res.send(response);
          } else {
            res.send("202");
          }
        });
      }
    })
    .catch((error) => {
      console.error("Failed to retrieve data : ", error);
    });
});
router.post("/registeruser", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const nic = req.body.age;
  const userRole = req.body.userRole;
  const contactNo = req.body.contactNo;
  //res.send(userRole)
  // const profilePicture=req.body.profilePicture;
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      res.send("unsuccessful");
    } else {
      User.findAll({
        where: {
          email: email,
        },
      }).then((result) => {
        if (result.length == 0) {
          User.create({
            email: email,
            password: hash,
            firstName: firstName,
            lastName: lastName,
            nic: nic,
            userRole: userRole,
            contactNo: contactNo,
          });
          res.send({ type: "success", message: "Account created successfully" });
        } else {
          res.send({ type: "error", message: "Email already exists" });
        }
      });
    }
  });
});
// product store
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/products");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });
router.post("/productStore",upload.single('productImage'),async (req, res) => {
           console.log(req.file);
        try{
            const {quantity,description,productName,price,productType,veganType}=req.body;
            const{filename}=req.file;
        
            await product.create({
                quantity,
                description,
                productName,
                price,
                productType,
                veganType,
                productImage:filename
            });
        }catch(err){
            console.log(err);
        }
        
    });

router.get("/productGet", async (req, res) => {
  try {
    const productData = await product.findAll();
    res.json(productData);
  } catch (err) {
    console.log(err);
  }
});
module.exports = router;
