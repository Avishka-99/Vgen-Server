
const { DataTypes } = require('sequelize');
const sequelize = require('./db');

// Define the User model
const deliveryPerson = sequelize.define('delivery_person', {
deliveryPersonId:{
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        foriegnKey:true,
        autoIncrement:true,
},vehicleType:{
        type: DataTypes.STRING,
        allowNull: true

},latitude:{
        type: DataTypes.STRING,
        allowNull: true
},longitude:{
        type: DataTypes.STRING,
        allowNull: true
},vehicleNo:{
        type: DataTypes.STRING,
        allowNull: true
},accountNo:{
        type: DataTypes.STRING,
        allowNull: true
},maxQuantity:{
        type: DataTypes.INTEGER,
        allowNull: true
},availability:{
        type: DataTypes.TINYINT,
        allowNull: true
},licenseNo:{
        type: DataTypes.STRING,
        allowNull: true
},drivingLicense:{
        type: DataTypes.STRING,
        allowNull: true
},vehicleRegistration:{
        type: DataTypes.STRING,
        allowNull: true
}
    }
    ,

 {
    timestamps: false,
});

module.exports = deliveryPerson;