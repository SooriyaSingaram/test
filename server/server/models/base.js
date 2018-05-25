var mongoose = require('mongoose');

//This is the base schema for all other schema.(For common models)
var baseSchema = mongoose.Schema({
    createdDateTime: {
        type: Date,
        default: Date.now
    },
    modifiedDateTime: {
        type: Date,
        default: Date.now
    }
}, {
    versionKey: false
});

baseSchema.pre('save', function(next) {

    //only update the ModifiedDateTime if this is not a new record, otherwise let it
    //create the default Created and Modified time.
    if (this._id !== null)
        this.modifiedDateTime = Date.now();

    next();
});

module.exports = baseSchema;  