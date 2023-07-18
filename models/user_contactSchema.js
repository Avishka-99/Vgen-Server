const { DataTypes } = require('sequelize');
const sequelize = require('./db');
const User = require('./userSchema');


const UserContact = sequelize.define(
  'user_contact',{
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        foriegnKey: true,
    },
     contactNo: {
      type: DataTypes.INTEGER,
      allowNull: true,

    },
  },
  {
    timestamps: false,
  }
);

module.exports = UserContact;
