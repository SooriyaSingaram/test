var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var baseSchema = require("./base.js");
var roleSchema = baseSchema.extend({
    roleId: {
        type:String
    },
    roleName: {
        type: String,
        unique: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    permission:{
        type: Array,
        default:[]
    },
	admin:{
       type: Boolean
		}


});

module.exports = mongoose.model('Role', roleSchema);
module.exports.schema = roleSchema;