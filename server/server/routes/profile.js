/**
 * User Profile Module Router
 */
var User = require('../models/users'),
    express = require('express'),
    passport = require('passport'),
    mongoose = require('mongoose'),
    crypto = require('crypto'),
    commonService = require('../utilities/helper'),
    router = express.Router();
var countryJson = require('../../country.json')
var ObjectId = require('mongoose').Types.ObjectId;

//configure routes
router.route('/').get(getUserList)
router.route('/:id').get(getUser).put(updateUser).delete(deleteUser);
router.route('/changePassword').post(changePassword)
router.route('/getOrgBasedUsers').post(getOrgBasedUsers)
router.route('/get/Countrylist').get(getCountry)

/**
*getAllUsers  - get all the available user records in db.
*/
function getUsers(req, res) {
    User.find({ isActive: true }, function (err, users) {
        if (err) {
            res.status(204).send(err);
        }
        else {
            if (users) {
                res.json(users);
            } else {
                res.status(404).send({ "message": "No users found" });
            }

        }

    });
}

/**
*getUser  - Get the User Details for Particular Id
*/
function getUser(req, res) {
    User.findOne({ _id: req.params.id, isActive: true }).
        exec(function (err, user) {
            if (err) {
                res.status(404).send(err);
            }
            else {
                if (user) {
                    res.json(user);
                } else {
                    res.status(404).send({ "message": "This user data not exist in db" });
                }

            }

        });
}



/**
*updateUser - update particular user profile
*/
function updateUser(req, res) {

    User.findOne({
        _id: req.params.id, isActive: true
    }, function (err, user) {

        if (err) {
            res.send(err);
        }
        else {
            if (user) {
                var userInfo = req.body;
               // console.log(userInfo)
                if (userInfo.password !== undefined) {
                    userInfo.salt = crypto.randomBytes(16).toString('hex');
                    userInfo.hashed_pwd = crypto.createHmac('sha256', userInfo.salt)
                        .update(userInfo.password)
                        .digest('hex')
                }

                for (prop in userInfo) {
                    user[prop] = userInfo[prop];
                }

                // update user details in db
                user.save(function (err, data) {
                    if (err || !data) {
                        if ((err.code == 11000)) {
                            if (err.errmsg.search("emailId_1") > 1) {
                                return res.status(409).send("Email Id already exists");
                            } else if (err.errmsg.search("userName_1 ") > 1) {
                                return res.status(409).send("Username already exists");
                            }
                            else {
                                return res.status(409).send("Please try again after sometime");
                            }
                        }
                        else{
                            return res.status(409).send("Please try again after sometime");
                        }
                    }
                    else {
                        user.populate('OrganizationId', 'organizationName', function (err, doc) {
                            if (err || !doc) {
                                res.send(err);
                            } else {
                                var org = doc.OrganizationId.organizationName;
                                if (userInfo.password) {
                                    var mailText = '<body style="background: #FAFAFA; color: #333333;"><table border="0" cellpadding="20" cellspacing="0" height="100%" width="600" style="background: #ffffff; border: 1px solid #DDDDDD;"><tbody><tr><td> <b>Dear ' + user.userName + ',</b><p> Your password has now been reset.Your new login details are as follows:</p><p><b>Email ID:</b> ' + user.emailId + '<br><b>Password: </b>' + userInfo.password + '</p><p> To change your password to something more memorable,after loggin in go to<br>Settings > Change Password</p> <p> If you have any questions or trouble logging on please contact a site administrator.</p><p>Thank you!!!<br />Team ' + org + '</p></td></tr></tbody></table></body>';
                                    var mailSubject = " Check your updated password";
                                    commonService.sendMail(user.emailId, mailSubject, mailText, function (response) {
                                        res.json({
                                            message: 'User profile updated successfully'
                                        });
                                    })
                                }
                                else {
                                    //  console.log(user)
                                    res.json({
                                        message: 'User profile updated successfully'
                                    });
                                }
                            }

                        })
                    }

                });
            }
            else {
                res.status(404).send({ "message": "This user data not exist in db" });
            }

        }
    });
}


/**
*deleteUser - delete particular user 
*/
function deleteUser1(req, res) {

    User.findOne({
        _id: req.params.id
    }, function (err, user) {

        if (err) {
            res.status(404).send(err);
        }
        else {
            if (user) {
                var userInfo = req.body;
               // console.log(userInfo)
                userInfo.isActive = false;
                for (prop in userInfo) {
                    user[prop] = userInfo[prop];
                }
                // update user details in db
                user.save(function (err) {
                    if (err) {
                        res.status(404).send({ "message": "User not found. Please enter valid user details." });
                    }

                    else {
                        res.json({
                            message: 'User profile deleted successfully'
                        });
                    }

                });
            }
            else {
                res.status(404).send({ "message": "This user data not exist in db" });
            }

        }
    });
}
function deleteUser(req, res) {
    
    User.remove({
        _id: req.params.id
        }, function(err, user) {
            if (err){
                res.status(400).send(err);
            }
              else{

                res.json({
                    message: 'User profile deleted successfully'
                });
              }  
    
        });
    }

/**
*changePassword- Update/Reset particular user's password
*/
function changePassword(req, res) {
    var user = req.body;
    try {
        User.findOne({ _id: req.body.id, isActive: true }, function (err, doc) {
            if (err || !doc) {

                res.status(400).send({
                    message: "User not found. Please enter valid user details."
                });
                return;
            }
            else {
                if (!doc.validPassword(user.oldPassword)) {
                    res.status(400).send({
                        message: "Old password incorrect. Please enter correct password."
                    });
                    return;
                }
                else {
                    if (doc.validPassword(user.oldPassword)) {
                        if (doc.validPassword(user.newPassword)) {
                            res.status(400).send({ message: "Please enter a new password" });
                            return;
                        }
                    }
                    doc.setPassword(user.newPassword);
                    for (prop in user) {
                        doc[prop] = user[prop];
                    }
                    // update user details in db
                    doc.save(function (err) {
                        if (err) {
                            res.send({ message: "User not found. Please enter valid user details." });
                            return;
                        }
                        else {
                            res.json({
                                message: 'Your password changed successfully!'
                            });
                        }
                    });
                }
            }
        })
    } catch (error) {
        console.log(error)
        res.send(400).json({
            message: 'Please send valid password.'
        });
    }

}


function getUserList(req, res) {
    var matchObj;
    var role = req.decoded.role;
    var org = req.decoded.organization;
    //console.log(org)
    if(req.decoded.master == 'Super Admin'){
        if(role == 'Super Admin'){
            var matchObj = {
                userName: { $ne: 'SuperAdmin' },
                isActive: true
            }
        }else{
            var matchObj = {
                userName: { $ne: 'SuperAdmin' },
                role: { $ne:req.decoded.role},
                isActive: true
            }
        }

        
    } else if (role == 'R001' || role == 'R002') {
        var matchObj = {
            userName: { $ne: 'SuperAdmin' },
            OrganizationId: ObjectId(org),
            isActive: true
        }
    }

    User.aggregate([
        { $match: matchObj },
        { $lookup: { from: "roles", localField: "role", foreignField: "roleId", as: "roleData" } },
        { $lookup: { from: "organizations", localField: "OrganizationId", foreignField: "_id", as: "orgData" } },
        { $project: { "role": 1, "OrganizationId": 1, "orgData.organizationName": 1, "roleData.roleName": 1, "_id": 1, "userName": 1, "userId": 1, "emailId": 1, "ParentCompany": 1, "mobile": 1 } }
    ], function (err, data) {
        if (err || !data) {
            res.status(404).send("No users found in organization")
        }
        else {
            res.send(data)
        }
    })

}

function getOrgBasedUsers(req, res) {
    try {
        User.find({ OrganizationId: req.body.OrganizationId, isActive: true }, function (err, doc) {
            if (err || !doc) {

                res.status(400).send({
                    message: "User not found. Please send valid organization id"
                });
                return;
            }
            else {
                res.send(doc)
            }

        })
    } catch (error) {
        console.log(error);
        res.status(400).send({
            message: "User not found. Please send valid organization id"
        });
    }
}

function getCountry(req, res) {
    try {
        res.send(countryJson)
    } catch (error) {
        res.status(500).send("Please try again after sometime.")
    }
}

module.exports = router;

