const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for cross-device access
app.use(cors());
app.use(bodyParser.json());

// Sample product data
let products = [
    { id: 1, name: "Classic Cotton T-Shirt", price: 89.99, category: "men" },
    { id: 2, name: "Slim Fit Jeans", price: 159.99, category: "men" },
    // Add all your products here
];

// API Endpoints
app.get('/api/products', (req, res) => {
    res.json(products);
});

app.get('/api/products/:id', (req, res) => {
    const product = products.find(p => p.id === parseInt(req.params.id));
    if (!product) return res.status(404).send('Product not found');
    res.json(product);
});

app.post('/api/orders', (req, res) => {
    const order = req.body;
    // In a real app, save to database
    console.log('New order:', order);
    res.json({ 
        success: true,
        orderId: Math.floor(Math.random() * 1000000),
        message: 'Order received'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`NYATHI X API running on port ${PORT}`);
});
// Add helmet for security
const helmet = require('helmet');
app.use(helmet());

// Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);