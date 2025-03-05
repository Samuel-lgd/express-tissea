const mongoose = require('mongoose');
const {Schema} = mongoose;

const lineSchema = new Schema({
    categoryId: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    startOfActivity: {
        type: String,
        default: '05:00'
    },
    endOfActivity: {
        type: String,
        default: '22:00'
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
    stops: [{
        type: Schema.Types.ObjectId,
        ref: 'Stop'
    }]
});

module.exports = mongoose.model('Line', lineSchema);
