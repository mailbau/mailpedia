const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
    products: [
        {
            product_id: String,
        }
    ],
    user: String,
    total_price: Number,
    created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', OrderSchema);