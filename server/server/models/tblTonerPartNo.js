var mongoose = require('mongoose');
var tonerPartNoSchema = mongoose.Schema({
    TonerPartID: {
        type: Number
    },
    OEMID: {
        type: Number
    },
    TypeID: {
        type: Number
    },
    Part_No: {
        type: String
    },
    Model: {
        type: String
    },
    Information: {
        type: String
    },
    Status: {
        type: String
    },
    Category: {
        type: String
    },
    DateCreated: {
        type: String
    },
    CreatedBy: {
        type: String
    },
    LastUpdate: {
        type: String
    },
    LastUpdateBy: {
        type: String
    },
    TypeSelectedByOperator: {
        type: String
    },
    TypeSelectedUserName: {
        type: String
    },
    DateTypeSet: {
        type: String
    },
    DescriptionType: {
        type: String
    },
    DisplayRow: {
        type: String
    },
    DisplayCol: {
        type: String
    },
    NewItemFromOperator: {
        type: String
    },
    NewItemUserName: {
        type: String
    },
    DateNewItem: {
        type: String
    },
    Picture: {
        type: String
    },
    Colour: {
        type: String
    },
    Weight: {
        type: String
    },
    PackagedWeight: {
        type: String
    },
    LowerWeight: {
        type: String
    },
    LowerPackagedWeight: {
        type: String
    },
    Plastic: {
        type: String
    },
    Boring: {
        type: String
    }

}, {
        strict: false,
        collection: 'tblTonerPartNo'
    });

module.exports = mongoose.model('tblTonerPartNo', tonerPartNoSchema);

module.exports.schema = tonerPartNoSchema;

