var mongoose = require('mongoose');
var reportSchema = mongoose.Schema({
    companyName: {
        type: String
    },
    Weight: {
        type: Number
    },
    Quantity: {
        type: Number
    },
    id:{
        type:String
    },
    financialYear:{
        type:Number
    }


}, {
    strict: false,
    collection: 'reports'
});

module.exports = mongoose.model('reports', reportSchema);

module.exports.schema = reportSchema;

