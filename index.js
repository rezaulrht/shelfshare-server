const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection URI
const uri = process.env.MONGODB_URI || `mongodb://localhost:27017`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server
    await client.connect();
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Successfully connected to MongoDB!");

    // Database and collections
    const database = client.db('shelfshare');
    const booksCollection = database.collection('books');
    const usersCollection = database.collection('users');

    // Routes
    app.get('/', (req, res) => {
      res.send('ShelfShare Server is running');
    });

    // Example route to get all books
    app.get('/api/books', async (req, res) => {
      try {
        const books = await booksCollection.find().toArray();
        res.send(books);
      } catch (error) {
        res.status(500).send({ error: 'Failed to fetch books' });
      }
    });

    // Example route to create a new book
    app.post('/api/books', async (req, res) => {
      try {
        const book = req.body;
        const result = await booksCollection.insertOne(book);
        res.status(201).send(result);
      } catch (error) {
        res.status(500).send({ error: 'Failed to create book' });
      }
    });

  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

run().catch(console.dir);

// Start server
app.listen(port, () => {
  console.log(`ShelfShare server is running on port ${port}`);
});
