var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var baseSchema = require("./base.js");
var organizationSchema = baseSchema.extend({
    organizationId: {
        type: String,
    },
    organizationName: {
        type: String,
        unique: true,
        required: true
    },
    PartnerName: {
        type: String,
        required: true
    },
    theme: {
        type: Array,
        required: true
    },
    mobile: {
        type: String
    },
    address: {
        type: String
    },
    state: {
        type: String
    },
    country: {
        type: String
    },
    postCode: {
        type: String
    },
    suburb: {
        type: String
    },
    logo: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    templates:{
        type:Array,
        default:[]
    }


});

module.exports = mongoose.model('Organization', organizationSchema);
module.exports.schema = organizationSchema;

