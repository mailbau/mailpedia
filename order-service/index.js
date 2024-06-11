const express = require('express');
const app = express();
const PORT = process.env.PORT || 9090;
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const amqp = require('amqplib');
const Order = require('../order-service/order');
const isAuthenticated = require('../isAuthenticated');
app.use(express.json());

var channel, connection;

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/order-service', {});
        console.log('Connected to Order service database');
    } catch (error) {
        console.log('Error connecting to database', error);
    }
};

connectDB();

async function connect() {
    const amqpServer = "amqp://localhost:5672";
    connection = await amqp.connect(amqpServer);
    channel = await connection.createChannel();
    await channel.assertQueue('ORDER');
}

function createOrder(products, userEmail) {
    let total = 0;
    for (let i = 0; i < products.length; ++i) {
        total += products[i].price;
    }
    const newOrder = new Order({
        products,
        user: userEmail,
        total_price: total,
    });
    newOrder.save();
    return newOrder;
}

connect().then(() => {
    channel.consume('ORDER', (data) => {
        console.log('Consuming Order Queue')
        const { products, userEmail } = JSON.parse(data.content);
        const newOrder = createOrder(products, userEmail);
        channel.ack(data);
        channel.sendToQueue('PRODUCT', Buffer.from(JSON.stringify({ newOrder })));
    });
});

// get all orders
app.get('/order', isAuthenticated, async (req, res) => {
    const orders = await Order.find({ user: req.user.email });
    return res.json(orders);
});

// get order by id
app.get('/order/:id', isAuthenticated, async (req, res) => {
    const order = await Order.findOne({ _id: req.params.id, user: req.user.email });
    return res.json(order);
}
);

app.listen(PORT, () => {
    console.log(`Product service is running on port ${PORT}`);
});