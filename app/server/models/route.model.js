const mongoose = require('mongoose');
const { Schema } = mongoose;

const routeSchema = new Schema({
    lineId: {
        type: Schema.Types.ObjectId,
        ref: 'Line',
        required: true
    },
    stations: [{
        type: Schema.Types.ObjectId,
        ref: 'Station'
    }],
    distance: {
        type: Number,
        required: true
    },
    approximateTime: {
        type: Number,
        default: 0
    },
    direction: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Route', routeSchema);
