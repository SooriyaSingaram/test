var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var baseSchema = require("./base.js");
var loggerSchema = baseSchema.extend({
    userId: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User',
    },
    loginTime: {
        type: Date
    },
    logoutTime:{
        type: Date
    }

});

module.exports = mongoose.model('Logger', loggerSchema);
module.exports.schema = loggerSchema;