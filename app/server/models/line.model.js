const mongoose = require('mongoose');
const { Schema } = mongoose;

const lineSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['Bus', 'Metro', 'Tram', 'Train'],
        default: 'Bus',
        required: true,
    },
    color: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model('Line', lineSchema);
