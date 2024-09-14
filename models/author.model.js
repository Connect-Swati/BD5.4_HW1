let { sequelize, DataTypes } = require("../lib/index");

let author = sequelize.define("author", {
  name: DataTypes.TEXT,
  birthYear: DataTypes.INTEGER, 
});
module.exports = {author};
