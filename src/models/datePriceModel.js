const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const datePricesSchema = new Schema(
    {
        sportFieldId: {
            type: Schema.Types.ObjectId,
            ref: 'sportFields',
            required: true
        },
        price: {
            type: Number,
            required: true,
        },
        weekday: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

const DatePrices = mongoose.model('datePrices', datePricesSchema);

module.exports = DatePrices;
