const express = require('express');
const { Client } = require('pg');
const cors = require('cors');
const { MongoClient } = require('mongodb'); // MongoDB package
const app = express();
const port = 8000;

// Middleware
app.use(cors()); // Allow CORS for frontend
app.use(express.json()); // To parse JSON body

// PostgreSQL client (for your existing SQL data)
const pgClient = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'my_database', // Replace with your PostgreSQL database name
  password: 'mypassword',
  port: 5432,
});

pgClient.connect();

// MongoDB client setup
const mongoClient = new MongoClient("mongodb://localhost:27017");  // MongoDB URL
const dbName = "myDatabase"; // MongoDB database name
let mongoDb;

mongoClient.connect()
  .then(() => {
    mongoDb = mongoClient.db(dbName);
    console.log("MongoDB connected");
  })
  .catch(err => console.error("Failed to connect to MongoDB", err));

// Routes for PostgreSQL (as before)
app.get('/api/items', async (req, res) => {
  try {
    const result = await pgClient.query('SELECT * FROM items');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching items from PostgreSQL:', err);
    res.status(500).json({ error: 'Failed to fetch items from PostgreSQL' });
  }
});


// MongoDB CRUD Operations
const mongoItemsCollection = mongoDb ? mongoDb.collection('items') : null;

app.get('/api/products', async (req, res) => {
  try {
    const items = await mongoItemsCollection.find().toArray();
    res.json(items);
  } catch (err) {
    console.error('Error fetching items from MongoDB:', err);
    res.status(500).json({ error: 'Failed to fetch items from MongoDB' });
  }
});

app.post('/api/products', async (req, res) => {
  const { name, description, price, stock, attributes } = req.body;
  try {
    const result = await mongoItemsCollection.insertOne({
      name, description, price, stock, attributes,
    });
    res.status(201).json(result.ops[0]); // Send back the inserted item
  } catch (err) {
    console.error('Error creating item in MongoDB:', err);
    res.status(500).json({ error: 'Failed to create item in MongoDB' });
  }
});

app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, price, stock, attributes } = req.body;
  try {
    const result = await mongoItemsCollection.updateOne(
      { _id: new MongoClient.ObjectID(id) }, // Convert id to ObjectID
      { $set: { name, description, price, stock, attributes } }
    );
    if (result.matchedCount === 0) {
      res.status(404).json({ error: 'Item not found' });
    } else {
      res.json({ _id: id, name, description, price, stock, attributes });
    }
  } catch (err) {
    console.error('Error updating item in MongoDB:', err);
    res.status(500).json({ error: 'Failed to update item in MongoDB' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await mongoItemsCollection.deleteOne({ _id: new MongoClient.ObjectID(id) });
    if (result.deletedCount === 0) {
      res.status(404).json({ error: 'Item not found' });
    } else {
      res.json({ message: 'Item deleted successfully' });
    }
  } catch (err) {
    console.error('Error deleting item from MongoDB:', err);
    res.status(500).json({ error: 'Failed to delete item from MongoDB' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
