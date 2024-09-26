const express = require('express');
const redis = require('redis');
const { promisify } = require('util');

const app = express();
const port = 1245;

// Sample product data
const listProducts = [
  {
    id: 1, name: 'Suitcase 250', price: 50, stock: 4,
  },
  {
    id: 2, name: 'Suitcase 450', price: 100, stock: 10,
  },
  {
    id: 3, name: 'Suitcase 650', price: 350, stock: 2,
  },
  {
    id: 4, name: 'Suitcase 1050', price: 550, stock: 5,
  },
];

// Connect to Redis
const redisClient = redis.createClient();
const setAsync = promisify(redisClient.set).bind(redisClient);
const getAsync = promisify(redisClient.get).bind(redisClient);

// Function to get item by ID
function getItemById(id) {
  return listProducts.find((product) => product.id === id);
}

// Route to get list of products
app.get('/list_products', (req, res) => {
  const products = listProducts.map((product) => ({
    itemId: product.id,
    itemName: product.name,
    price: product.price,
    initialAvailableQuantity: product.stock,
  }));
  res.json(products);
});

// Function to reserve stock by ID
async function reserveStockById(itemId, stock) {
  await setAsync(`item.${itemId}`, stock);
}

// Function to get current reserved stock by ID
async function getCurrentReservedStockById(itemId) {
  const reservedStock = await getAsync(`item.${itemId}`);
  return reservedStock ? parseInt(reservedStock, 10) : 0;
}

// Route to get product details
app.get('/list_products/:itemId', async (req, res) => {
  const itemId = parseInt(req.params.itemId, 10);
  const product = getItemById(itemId);

  if (!product) {
    res.status(404).json({ status: 'Product not found' });
  }

  const currentQuantity = product.stock - await getCurrentReservedStockById(itemId);
  res.json({
    itemId: product.id,
    itemName: product.name,
    price: product.price,
    initialAvailableQuantity: product.stock,
    currentQuantity,
  });
});

// Route to reserve a product
app.get('/reserve_product/:itemId', async (req, res) => {
  const itemId = parseInt(req.params.itemId, 10);
  const product = getItemById(itemId);

  if (!product) {
    res.status(404).json({ status: 'Product not found' });
  }

  const currentQuantity = product.stock - await getCurrentReservedStockById(itemId);

  if (currentQuantity <= 0) {
    res.status(400).json({ status: 'Not enough stock available', itemId });
  }

  await reserveStockById(itemId, currentQuantity + 1); // Reserve one item
  res.json({ status: 'Reservation confirmed', itemId });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
