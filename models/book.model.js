let { sequelize, DataTypes } = require("../lib/index");

let book = sequelize.define("book", {
  title: DataTypes.TEXT,
  genre: DataTypes.TEXT,
  publicationYear: DataTypes.INTEGER, 
});
module.exports = {book};
