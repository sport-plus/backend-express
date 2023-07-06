const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const slotModelSchema = new Schema(
    {
        sportFieldId: {
            type: Schema.Types.ObjectId,
            ref: 'sportFields',
            required: true
        },
        availability: {
            type: [
                {
                    startTime: String,
                    endTime: String,
                }
            ],
            required: true
        },
    },
    { timestamps: true }
);

const Slots = mongoose.model('slots', slotModelSchema);

module.exports = Slots;
