let express = require("express");
/*
   - This line imports the Express framework, which is used to create and handle web servers and APIs in Node.js.
   - Express simplifies server creation by providing various built-in middleware and methods for routing, making it easier to handle HTTP requests and responses.
*/



const app = express();
/*
   - Here, the `app` constant is initialized as an instance of Express.
   - This creates your server object, which will be used to define routes (endpoints), middleware, and listen for incoming requests.
*/



app.use(express.json());
/*
   - This middleware is used to automatically parse incoming requests with a JSON payload.
   - Without this line, your application would not be able to handle requests containing JSON data in the request body.
   - It allows you to easily access the data sent in the request body via `req.body` in your route handlers.
   - This is especially necessary for POST and PUT requests, where data is typically sent in JSON format.
*/

let { book } = require("./models/book.model");
let { author } = require("./models/author.model");
let { bookAuthor } = require("./models/bookAuthor.model");


let { sequelize } = require("./lib/index");

const port = 3000;
app.listen(port, () => {
  console.log("Server is running on port" + port);
});



let bookData = [
  {
    title: 'Harry Potter and the Philosophers Stone',
    genre: 'Fantasy',
    publicationYear: 1997,
  },
  {
    title: 'A Game of Thrones',
    genre: 'Fantasy',
    publicationYear: 1996
  },

  {
    title: 'The Hobbit',
    genre: 'Fantasy',
    publicationYear: 1937
  },
];

let authorData = [
  {
    name: 'J.K Rowling',
    birthYear: 1965
  }
];


app.get("/", (req, res) => {
  res.status(200).json({ message: "BD5.4 - HW1 Application" });
});


// end point to seed the database with books and authors
app.get("/seed_db", async (req, res) => {
  try {
    // Synchronize the database, forcing it to recreate the tables if they already exist
    await sequelize.sync({ force: true });

    // Bulk create entries in the book table using predefined book data
    let insertedBooks  = await book.bulkCreate(bookData);

    // Bulk create entries in the author table using predefined author data
    let insertedAuthors  = await author.bulkCreate(authorData);

    // Send a 200 HTTP status code and a success message if the database is seeded successfully for both models
    res.status(200).json({
       message: "Database Seeding successful for Book and Author models",
       insertedAuthors : insertedAuthors ,
       insertedBooks : insertedBooks
      });
  } catch (error) {
    // Send a 500 HTTP status code and an error message if there's an error during seeding
    console.log("Error in seeding db", error.message);
    return res.status(500).json({
      code: 500,
      message: "Error in seeding db",
      error: error.message,
    });
  }
});


// self --- to see all data

// Endpoint to fetch all books, authors, and book-author relationships
app.get("/fetch_all_data", async (req, res) => {
  try {
      // Fetch all books
      const books = await book.findAll();

      // Fetch all authors
      const authors = await author.findAll();

      // Fetch all book-author relationships
      const bookAuthors = await bookAuthor.findAll();

      // Return all data
      res.status(200).json({
          message: "Data fetched successfully",
          booksData : books,
          authorData:  authors,
          bookAuthorData :bookAuthors
      });
  } catch (error) {
      console.log("Error fetching data", error.message);
      return res.status(500).json({
          code: 500,
          message: "Error fetching data",
          error: error.message
      });
  }
});





/*
Exercise 1: Create New Author

Create an endpoint /authors/new that will create a new author record in the database.

Declare a variable named newAuthor to store the data from the request body, i.e., req.body.newAuthor.

Create a function named addNewAuthor to create a new record in the database based on the request body.

API Call

http://localhost:3000/authors/new

Request Body

{
  'newAuthor': {
    'name': 'New Author',
    'birthYear': 1970
  }
}

Expected Output

{
  'newAuthor': {
    'id': 4,
    'name': 'New Author',
    'birthYear': 1970
  }
}
*/




// function to add a new author
async function addNewAuthor (newAuthor ) {
  try {
    // Create a newAuthor  in the database using Sequelize's create method.
    let result = await author.create(newAuthor );

    // If the result is falsy (i.e., null or undefined), throw an error.
    // Normally, if the creation was successful, result will contain the newAuthor data.
    if (!result) {
      throw new Error("No author created"); // Custom error message to indicate that the creation failed.
    }

    // Return the newly created author in the response.
    return { newAuthor: result };
  } catch (error) {
    // Log the error message if an error occurs during the creation process.
    console.log("Error in adding new author", error.message);

    // Return the error object so that it can be handled later in the request flow.
    return error;
  }
}

// Endpoint to add a new author
app.post("/authors/new", async (req, res) => {
  try {


    // Extract the 'newAuthor' property from the request body. This contains the details of the new author to be added.
    let newAuthor = req.body.newAuthor;

    // Call the 'addNewAuthor' function to add the author to the database and wait for the result.
    let result = await addNewAuthor(newAuthor);

    // Send a successful response with a 200 HTTP status code and the newly created author data.
    return res.status(200).json(result);
  } catch (error) {
    // Handle the case where no author were found or created (custom error message defined in the addNewAuthor function).
    if (error.message === "No author created") {
      return res.status(404).json({
        code: 404,
        message: "No author created", // Response message indicating that the author creation failed.
        error: error.message, // Send the error message back to the client for further information.
      });
    } else {
      // Handle general errors, such as database connection issues or validation errors.
      return res.status(500).json({
        code: 500,
        message: "Error in adding new Author", // Response message indicating an internal server error occurred.
        error: error.message, // Provide the error message to help with debugging.
      });
    }
  }
});

/*
Exercise 2: Update Author by ID

Create an endpoint /authors/update/:id that will update an author record by ID.

Retrieve the author ID from the path parameters and parse it to an integer.

Declare a variable named newAuthorData to store the data from the request body.

Create a function named updateAuthorById to find and update the author record based on the ID and request body.

API Call

http://localhost:3000/authors/update/1

Request Body

{
  'name': 'Updated Author Name',
  'birthYear': 1960
}

Expected Output

{
  'message': 'Author updated successfully',
  'updatedAuthor': {
    'id': 1,
    'name': 'Updated Author Name',
    'birthYear': 1960
  }
}
     */

// function to update Author  by id
async function updateAuthorById (id, newAuthorData ) {
  try {
    let authorToBeUpdated = await author.findByPk(id);
    if (!authorToBeUpdated) {
      throw new Error("Author not found");
    }
    let updatedAuthor = await authorToBeUpdated.update(newAuthorData);
    return {
      message: "Author  updated  successfully",
      updatedAuthor: updatedAuthor
    };

  } catch (error) {
    console.log("error in updating Author ", error.message)
    throw error;

  }

}

// endpoint to update Author by id 
app.post("/authors/update/:id", async (req, res) => {
  try {

    let id = parseInt(req.params.id);
    let newAuthorData  = req.body;
    let result = await updateAuthorById(id, newAuthorData);
    return res.status(200).json(result);
  } catch (error) {
    if (error.message === "Author not found") {
      return res.status(404).json({
        code: 404,
        message: "Author not found",
        error: error.message
      });
    } else {
      return res.status(500).json({
        code: 500,
        message: "Internal server error",
        error: error.message
      })

    }
  }
})



