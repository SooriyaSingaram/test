var mongoose = require('mongoose');
var subWebConditionSchema = mongoose.Schema({
    SubFilterId: {
        type: Number,
        required: true
    },
    DynamicConditionId: {
        type: Number
    },
    PropertyName: {
        type: String
    },
    DataType: {
        type: String
    },
    ComparisonOperator: {
        type: String
    },
    ConditionValue: {
        type: String
    },
    UsersList: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],    
    Period: {
        type: Number
    },
    Template: {
        type: String
    }

}, {
        collection: 'TriggerSubCondition'
    });

module.exports = mongoose.model('TriggerSubCondition', subWebConditionSchema);

module.exports.schema = subWebConditionSchema;