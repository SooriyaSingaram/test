var mongoose = require('mongoose');
var tblBagContainerSchema = mongoose.Schema({
    BagContainerID: {
        type: Number
    },
    ContainerID: {
        type: Number
    },
    BagID: {
        type: Number
    },
    InitialWeight: {
        type: Number
    },
    RemainingWeight: {
        type: Number
    },
    CreatedBy: {
        type: String
    },
    DateCreated: {
        type: String
    },
    LastUpdateBy: {
        type: String
    },
    LastUpdate: {
        type: String
    },
    ScanDatetime: {
        type: String
    },
    CompleteDatetime: {
        type: String
    },
    InvalidWeightID: {
        type: Number
    }

}, {
        strict: false,
        collection: 'tblBagContainer'
    });

module.exports = mongoose.model('tblBagContainer', tblBagContainerSchema);

module.exports.schema = tblBagContainerSchema;

