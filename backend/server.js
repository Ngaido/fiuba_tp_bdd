const express = require('express');
const { Client } = require('pg');
const cors = require('cors');
const Datastore = require('nedb'); // Importar NeDB
const app = express();
const port = 8000;

// Inicializar NeDB para reemplazar Firebase
const db = new Datastore({ filename: 'items.db', autoload: true }); // Cambiar a NeDB

// Middleware
app.use(cors()); // Allow CORS for frontend
app.use(express.json()); // To parse JSON body

// PostgreSQL client (para los datos existentes)
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'my_database', // Cambia con el nombre de tu base de datos PostgreSQL
  password: 'mypassword',
  port: 5432,
});

client.connect();

// Crear la tabla si no existe (PostgreSQL)
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL
  );
`;

client.query(createTableQuery, (err, res) => {
  if (err) {
    console.error('Error creating table:', err);
  } else {
    console.log('Items table is ready.');
  }
});

// ** Rutas PostgreSQL **

// Obtener todos los items (PostgreSQL)
app.get('/api/items', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM items');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching items:', err);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// Crear un nuevo item (PostgreSQL)
app.post('/api/items', async (req, res) => {
  const { name, description, price, stock } = req.body;
  try {
    const result = await client.query(
      'INSERT INTO items (name, description, price, stock) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, description, price, stock]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating item:', err);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// Actualizar un item (PostgreSQL)
app.put('/api/items/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, price, stock } = req.body;
  try {
    const result = await client.query(
      'UPDATE items SET name = $1, description = $2, price = $3, stock = $4 WHERE id = $5 RETURNING *',
      [name, description, price, stock, id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Item not found' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (err) {
    console.error('Error updating item:', err);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// Eliminar un item (PostgreSQL)
app.delete('/api/items/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query('DELETE FROM items WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Item not found' });
    } else {
      res.json({ message: 'Item deleted successfully' });
    }
  } catch (err) {
    console.error('Error deleting item:', err);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// ** Rutas NeDB (en reemplazo de Firebase) **

// Obtener todos los productos (NeDB)
app.get('/api/products', (req, res) => {
  db.find({}, (err, items) => {
    if (err) {
      console.error('Error fetching items from NeDB:', err);
      return res.status(500).json({ error: 'Failed to fetch items from NeDB' });
    }
    res.json(items);
  });
});

// Crear un nuevo producto (NeDB)
app.post('/api/products', (req, res) => {
  const { name, description, price, stock, attributes } = req.body;
  const newItem = { name, description, price, stock, attributes };

  db.insert(newItem, (err, item) => {
    if (err) {
      console.error('Error creating item in NeDB:', err);
      return res.status(500).json({ error: 'Failed to create item in NeDB' });
    }
    res.status(201).json(item);
  });
});

// Actualizar un producto (NeDB)
app.put('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, price, stock, attributes } = req.body;
  const updatedItem = { name, description, price, stock, attributes };

  db.update({ _id: id }, updatedItem, {}, (err, numReplaced) => {
    if (err) {
      console.error('Error updating item in NeDB:', err);
      return res.status(500).json({ error: 'Failed to update item in NeDB' });
    }
    if (numReplaced === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(updatedItem);
  });
});

// Eliminar un producto (NeDB)
app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;

  db.remove({ _id: id }, {}, (err, numRemoved) => {
    if (err) {
      console.error('Error deleting item in NeDB:', err);
      return res.status(500).json({ error: 'Failed to delete item in NeDB' });
    }
    if (numRemoved === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json({ message: 'Item deleted successfully' });
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
