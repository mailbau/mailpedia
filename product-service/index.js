const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const amqp = require('amqplib');
app.use(express.json());

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

app.listen(PORT, () => {
    console.log(`Product service is running on port ${PORT}`);
});