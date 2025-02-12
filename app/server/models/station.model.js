const mongoose = require('mongoose');
const { Schema } = mongoose;

const stationSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    linesServed: [{
        type: Schema.Types.ObjectId,
        ref: 'Line'
    }]
});

module.exports = mongoose.model('Station', stationSchema);
