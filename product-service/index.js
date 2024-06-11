const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const amqp = require('amqplib');
const Product = require('./product');
const isAuthenticated = require('../isAuthenticated');
app.use(express.json());

var order;
var channel, connection;

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/product-service', {});
        console.log('Connected to Product service database');
    } catch (error) {
        console.log('Error connecting to database', error);
    }
};

connectDB();

async function connect() {
    const amqpServer = "amqp://localhost:5672";
    connection = await amqp.connect(amqpServer);
    channel = await connection.createChannel();
    await channel.assertQueue('PRODUCT');
}
connect();

app.post('/product/create', isAuthenticated, async (req, res) => {
    const { name, description, price } = req.body;
    const newProduct = new Product({
        name,
        description,
        price,
    });
    newProduct.save();
    return res.json(newProduct)
}
);

app.post('/product/buy', isAuthenticated, async (req, res) => {
    const { ids } = req.body;
    const products = await Product.find({ _id: { $in: ids } });

    channel.sendToQueue('ORDER', Buffer.from(JSON.stringify({
        products,
        userEmail: req.user.email,

    })));
    channel.consume('PRODUCT', (data) => {
        console.log('Consuming Product Queue');
        order = JSON.parse(data.content);
        channel.ack(data);
    });
    return res.json(order);
});

app.listen(PORT, () => {
    console.log(`Product service is running on port ${PORT}`);
});