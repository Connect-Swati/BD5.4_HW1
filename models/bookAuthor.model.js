/*
Exercise 3: Define associations

Create a model bookAuthor.model.js which uses a join table to connect both book & author tables with many-to-many relationship
 */

// Import Sequelize ORM and DataTypes object to define model attributes
const { DataTypes, sequelize } = require("../lib/index");

// Import book and author models to establish relationships
let { book } = require("./book.model");
let { author } = require("./author.model");

// Define the 'bookAuthor' model to represent a many-to-many relationship between books and authors
let bookAuthor = sequelize.define("bookAuthor", {
    bookId: {
        type: DataTypes.INTEGER, // Specifies the data type for bookId
        references: {
            model: book, // Establishes a foreign key relationship with the 'book' model
            key: "id"    // Specifies that bookId will reference the 'id' column in the 'book' model
        }
    },
    authorId: {
        type: DataTypes.INTEGER, // Specifies the data type for authorId
        references: {
            model: author, // Establishes a foreign key relationship with the 'author' model
            key: "id"      // Specifies that authorId will reference the 'id' column in the 'author' model
        }
    }
});

// Set up a many-to-many relationship through the 'bookAuthor' junction table
book.belongsToMany(author, { through: bookAuthor }); // Indicates that a book can have many authors
author.belongsToMany(book, { through: bookAuthor }); // Indicates that an author can write many books

// Export the 'bookAuthor' model to be available in other parts of the application
module.exports = { bookAuthor };
