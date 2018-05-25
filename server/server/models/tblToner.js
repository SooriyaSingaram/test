var mongoose = require('mongoose');
var tonerSchema = mongoose.Schema({
    TonerID: {
        type: Number
    },
    OemID: {
        type: Number
    },
    BagContainerID: {
        type: Number
    },
    Quantity:{
        type: Number
    },
    Weight:{
        type: Number
    },
    TypeID:{
        type: Number
    },
    Part_No:{
        type: Number
    },
    SerialNo:{
        type: Number
    },
    ReplyPaid:{
        type: Number
    },


}, {
    strict: false,
    collection: 'tblToner'
});

module.exports = mongoose.model('tblToner', tonerSchema);

module.exports.schema = tonerSchema;

