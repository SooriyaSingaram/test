var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var baseSchema = require("./base.js");
var templateSchema = baseSchema.extend({
    templateId: {
        type: String
    },
    templateName: {
        type: String,
        unique: true,
        required: true
    },
    dashboardName: {
        type: String,
        required: true
    },
    widget: {
        type: Array,
        "default": []
    },
    isActive: {
        type: Boolean,
        default: true
    },
    table: {
        type: String
    },
    
    filterOption:{
        type:Array,
        default:[]
    },
    templateType: {
        type: String
    },
	
    pageExport:{
        type:Boolean
    },
	mailDashboard:{
		type:Boolean
    },
    contentFilter:{
		type:Array,
        default:[]
	}


});

module.exports = mongoose.model('template', templateSchema);
module.exports.schema = templateSchema;
