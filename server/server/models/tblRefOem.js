var mongoose = require('mongoose');
var tblRefOemSchema = mongoose.Schema({
    OemID: {
        type: Number
    },
    OemName: {
        type: String
    },
    PicturePath: {
        type: String
    },
    BICustomer: {
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
    Deleted: {
        type: String
    },
    OrderBy: {
        type: String
    },
    ContactPersonName: {
        type: String
    },
    Address: {
        type: String
    },
    Logo: {
        type: String
    },
    IACreatedBy: {
        type: String
    },
    IACreatedDate: {
        type: String
    },
    IALastUpdateBy: {
        type: String
    },
    IALastUpdatedDate: {
        type: String
    },
    Remarks: {
        type: String
    },
    ProdShareBI: {
        type: String
    },
    ProdShareFirstBagID: {
        type: Number
    },
    ProdShareEmail: {
        type: Number
    },
    ProdShareTrigger: {
        type: Number
    },
    PartnerID: {
        type: Number
    }


}, {
        strict: false,
        collection: 'tblRefOem'
    });

module.exports = mongoose.model('tblRefOem', tblRefOemSchema);

module.exports.schema = tblRefOemSchema;

