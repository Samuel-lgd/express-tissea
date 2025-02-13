const mongoose = require('mongoose');
const { Schema } = mongoose;

const stopSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            default: [0, 0]
        }
    },
    orderIndex: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Stop', stopSchema);
