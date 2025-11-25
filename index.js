const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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

    // ============================================
    // USER ROUTES
    // ============================================

    // POST /users - Create a new user
    app.post('/users', async (req, res) => {
      try {
        const userData = req.body;
        userData.createdAt = new Date();
        
        const result = await usersCollection.insertOne(userData);
        res.status(201).json({
          message: 'User created successfully',
          userId: result.insertedId
        });
      } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Failed to create user' });
      }
    });

    // GET /users - Get all users
    app.get('/users', async (req, res) => {
      try {
        const users = await usersCollection.find().toArray();
        res.json(users);
      } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
      }
    });

    // GET /users/:id - Get user by ID
    app.get('/users/:id', async (req, res) => {
      try {
        const { id } = req.params;
        
        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ error: 'Invalid user ID' });
        }
        
        const user = await usersCollection.findOne({ _id: new ObjectId(id) });

        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
      } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
      }
    });

    // PUT /users/:id - Update user by ID
    app.put('/users/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const updates = req.body;

        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ error: 'Invalid user ID' });
        }

        // Remove fields that shouldn't be updated
        delete updates._id;
        delete updates.createdAt;

        const result = await usersCollection.findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: updates },
          { returnDocument: 'after' }
        );

        if (!result) {
          return res.status(404).json({ error: 'User not found' });
        }

        res.json({
          message: 'User updated successfully',
          user: result
        });
      } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user' });
      }
    });

    // ============================================
    // BOOK ROUTES
    // ============================================


    // ============================================
    // GENERAL ROUTES
    // ============================================

    // Health check route
    app.get('/', (req, res) => {
      res.json({ 
        message: 'ShelfShare Server is running',
        status: 'healthy',
        timestamp: new Date().toISOString()
      });
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
