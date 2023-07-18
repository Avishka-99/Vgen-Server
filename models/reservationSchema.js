
const { DataTypes } = require('sequelize');
const sequelize = require('./db');

// Define the User model
const reservation = sequelize.define('reservation', {
reservationId:{
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
},userId:{
        type: DataTypes.INTEGER,
        allowNull: true,
        foriegnKey:true,

},resturantManagerId:{
        type: DataTypes.INTEGER,
        allowNull: true,
        foriegnKey:true,
},date:{
        type: DataTypes.DATE,
        allowNull: true
},time:{
        type: DataTypes.TIME,
        allowNull: true
},reservationState:{
    type: DataTypes.TINYINT,
    allowNull: true
},
timePeriod:{
    type: DataTypes.STRING,
    allowNull: true
}
,
}, {
    timestamps: false,
});

module.exports = reservation;