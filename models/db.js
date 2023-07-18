const { Sequelize } = require('sequelize');

// Create a new Sequelize instance
const sequelize = new Sequelize('vgen','root',null, {
    host: 'localhost',
    dialect: 'mysql',
    dialectModule: require('mysql2')
});
sequelize.authenticate().then(() => {
    console.log('Connection has been established successfully.');
}).catch((error) => {
    console.error('Unable to connect to the database: ', error);
});
module.exports = sequelize;