var mongoose = require('mongoose');
var dynamicWebConditionSchema = mongoose.Schema({
    ConditionName: {
        type: String,
        required: true
    },
    UsersList: {
        type: Array
    },
    //UsersList: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    Period: {
        type: String
    },
    Template: {
        type: String
    },
	 OrganizationId: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Organization',
        required: true
    },
	 isActive: {
        type: Boolean,
        default: true
    },
	conditionList:{
		 type: Array
	}

}, {
        collection: 'TriggerCondition'
    });

module.exports = mongoose.model('TriggerCondition', dynamicWebConditionSchema);

module.exports.schema = dynamicWebConditionSchema;

