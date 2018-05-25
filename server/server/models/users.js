var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var baseSchema = require("./base.js"),
    Role = require('../models/roles');
var Organization = require('../models/organizations');
var userSchema = baseSchema.extend({
    userId: {
        type: String,
    },
    emailId: {
        type: String,
        unique: true,
        required: true
    },
    userName: {
        type: String,
        unique: true,
        required: true
    },
    salt: {
        type: String
    },
    hashed_pwd: {
        type: String
    },
    role: {
        type: String,
        required: true
    },
    mobile: {
        type: String
    },
    OrganizationId: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Organization',
        //required: true
    },

    isActive: {
        type: Boolean,
        default: true
    },
    selectedThemes:
    {
        type: Array,
        "default": []
    },
    ParentCompany: {
        type: Array,
        required: true
    },
    selectedTemplates: {
        type: Array,
        require: true
    }
});


//Save user password as hashing password using salt
userSchema.methods.setPassword = function (password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hashed_pwd = crypto.createHmac('sha256', this.salt)
        .update(password)
        .digest('hex')
};

//Validate the entered password for the corresponding user
userSchema.methods.validPassword = function (password) {
    var hash = crypto.createHmac('sha256', this.salt)
        .update(password)
        .digest('hex');
    return this.hashed_pwd === hash;
};

//Generate access token for succssfully logined user
userSchema.methods.generateJwt = function (cb) {
    try {
        var userName = this.userName; var role = this.role; var ParentCompany = this.ParentCompany; var org = this.OrganizationId;
        console.log(role)
        console.log(role)
        if (role == 'Super Admin') {
            var payload = {
                userName: userName,
                role: role,
                master: role

            };
            var data = jwt.sign(payload, process.env.SECRET_KEY, {
                expiresIn: 86400 // expires in 24 hour
            });
            cb(data, payload)
        }
        else {
            Role.findOne({ roleId: role }, function (err, userRoles) {
                if (err || !userRoles) {
                    res.status(404).send("Please send a valid parameter to proceed");
                    return;
                } else {

                    if (userRoles.admin) {
                        var payload = {
                            userName: userName,
                            role: role,
                            master: "Super Admin"

                        };
                        var data = jwt.sign(payload, process.env.SECRET_KEY, {
                            expiresIn: 86400 // expires in 24 hour
                        });
                        cb(data, payload)
                    }
                    else {
                        Organization.findOne({ _id: org, isActive: true }, function (err, doc) {
                            if (err || !doc) {
                                cb("error", null)
                            } else {
                                try {
                                    var CollectionTable = mongoose.model('OEMGeneric');
                                } catch (error) {
                                    var collectionSchema = mongoose.Schema({}, {
                                        strict: false,
                                        collection: 'OEMGeneric'
                                    })
                                    var CollectionTable = mongoose.model('OEMGeneric', collectionSchema);
                                }
                                CollectionTable.findOne({ OemName: doc.PartnerName }, function (err, rec) {
                                    var oemGen = JSON.parse(JSON.stringify(rec))
                                    console.log(JSON.parse(JSON.stringify(rec)))
                                    if (role == 'R002' || role == 'R001') {
                                        var payload = {
                                            userName: userName,
                                            role: role,
                                            PartnerName: doc.PartnerName,
                                            organization: org,
                                            OEMGeneric: oemGen.OEMGeneric,
                                            master: "User"
                                        };
                                        var data = jwt.sign(payload, process.env.SECRET_KEY, {
                                            expiresIn: 86400 // expires in 24 hour
                                        });
                                        cb(data, payload)
                                    } else {
                                        var payload = {
                                            userName: userName,
                                            role: role,
                                            PartnerName: doc.PartnerName,
                                            ParentCompany: ParentCompany,
                                            OEMGeneric: oemGen.OEMGeneric,
                                            master: "User"
                                        };
                                        // console.log(payload)
                                        var data = jwt.sign(payload, process.env.SECRET_KEY, {
                                            expiresIn: 86400 // expires in 24 hour
                                        });
                                        cb(data, payload)
                                    }
                                })
                            }

                        })
                    }
                }
            })


        }
    } catch (error) {
        console.log(error);
        res.send({ message: "Please try again after sometime" });
    }


}

module.exports = mongoose.model('User', userSchema);
module.exports.schema = userSchema;
//


