/**
 * User Module Router
 */
var User = require('../models/users'),
    Logger = require('../models/logger'),
    Role = require('../models/roles'),
    express = require('express'),
    passport = require('passport'),
    mongoose = require('mongoose'),
    crypto = require('crypto'),
    randomstring = require('randomstring'),
    commonService = require('../utilities/helper'),
    router = express.Router();
var configJson = require('../../config.json')
//configure routes
router.route('/register').post(addUser)
router.route('/login').post(login);
router.route('/forgotPassword').post(forgotPassword);
router.route('/resetPassword').post(resetPassword)
router.route('/rolePermission').get(rolePermission)
router.route('/logout').post(logout);
router.route('/getLog').get(getLog)
//Create the New user record in DB.
function addUser(req, res) {

    try {
        var text = randomstring.generate({
            length: 7,
            charset: 'alphanumeric',
        })

        console.log(req.body.emailId + ",password:" + text)
        var userDetail = req.body;
        Role.findOne({ roleId: userDetail.role }, function (err, userRoles) {
            if (err || !userRoles) {
                res.status(404).send("Please send role to proceed");
                return;
            }
            else {
                if (userRoles.admin) {
                    userDetail.ParentCompany = ["All"]
                } else {
                    if (!userDetail.OrganizationId) {
                        return res.status(400).send("Plaese select organization to proceed")
                    }
                }
                var user = new User(userDetail);
                if (user.ParentCompany.length == 0) {
                    res.status(400).send({ message: "Please add parent company for this user" })
                    return
                } else {
                    var organizationTeam;
                    user.setPassword(text);
                    User.count({}, function (err, count) {
                        user.userId = commonService.getModelId('U', count);
                        user.save(function (err, doc) {
                            if (err) {
                                if ((err.code == 11000)) {
                                    if (err.errmsg.search("emailId_1") > 1) {
                                        return res.status(409).send("Email Id already exists");
                                    } else if (err.errmsg.search("userName_1 ") > 1) {
                                        return res.status(409).send("Username already exists");
                                    }
                                    else {
                                        return res.status(409).send("Please try again after sometime");
                                    }
                                    // User.findOne({ emailId: userDetail.emailId, isActive: false }, function (emp, data) {
                                    //     console.log(data)
                                    //     if (emp || !data) {
                                    //         console.log(emp)
                                    //         return res.status(409).send(err.message);
                                    //     } else {
                                    //         userDetail.isActive = true;
                                    //         console.log(data)
                                    //         for (prop in userDetail) {
                                    //             data[prop] = userDetail[prop];
                                    //         }

                                    //         data.save(function (err) {
                                    //             if (err) {
                                    //                 return res.status(409).send(err.message);
                                    //             }
                                    //             else {
                                    //                 return res.send(JSON.stringify({ message: "User activated successfully." }));
                                    //             }
                                    //         });

                                    //     }
                                    // })
                                }
                                else {
                                    res.status(409).send(err.message);
                                    return
                                }
                            }
                            else {

                                if (req.body.hasOwnProperty('organizationName')) {
                                    organizationTeam = req.body.organizationName;
                                } else {
                                    organizationTeam = 'Administraion';
                                }
                                var mailText = '<body style="background: #FFFFFF; color: #333333;"><table border="0" cellpadding="20" cellspacing="0" height="100%" width="600" style="background: #d3d3d32e; border: 1px solid #DDDDDD;"><tbody><tr><td> <b>Dear ' + doc.userName + ',</b><p> Your login details are as follows:</p><p><b>Email Id:</b> ' + doc.emailId + '<br><b>Password: </b>' + text + '</p><p> To change your password to something more memorable,after logging in go to<br>Settings > Change Password</p> <p> If you have any questions or trouble logging on please contact a site administrator.</p><p style="text-transform: capitalize;">Thank you!!! <br> ' + organizationTeam + '</p></td></tr></tbody></table></body>';
                                var mailSubject = "Check Your Login Credentials";
                                commonService.sendMail(doc.emailId, mailSubject, mailText, function (response) {
                                    if (response) {
                                        res.send(JSON.stringify({ message: "User registered successfully." }));
                                    }
                                    else {
                                        res.status(500).send({ message: "Please try again after sometime." })
                                    }
                                })
                            }

                        });
                    });

                }
            }

        });
    } catch (err) {
        console.log(err)
        res.status(500).send({ message: "Please try again with valid parameters" })
    }
}


/**
 *login  - validate user credentials and check wheater the user is authenticate or not.
 */
function login(req, res) {
    try {
        passport.authenticate('local', function (err, user, info) {
            var token;
            if (err) {
                res.status(404).json(err);
                return;
            }
            // If user found in db 
            if (user) {
                //  console.log(user)
                token = user.generateJwt(function (data, payload) {
                    if (data == 'error') {
                        res.status(400).send("This user is in active state.Please contact your site administrator for further details.")
                    } else {
                        var logData = new Logger({ userId: user._id, loginTime: Date.now() });
                        logData.save(function (err, doc) {
                            res.status(200).json({
                                "access_token": data,
                                "role": user.role,
                                "master": payload.master,
                                "userName": user.userName,
                                "id": user._id,
                                "OrganizationId": user.OrganizationId,
                                //  "selectedTable": user.selectedTable,
                                "selectedTemplates": user.selectedTemplates,
                                "selectedThemes": user.selectedThemes

                            });
                        })
                    }
                    // console.log(data)

                })

            } else {
                // If user is not found in db
                res.status(401).json(info);
            }
        })(req, res);
    } catch (error) {
        // console.log(error);
        res.send({ message: "Please try again after sometime" });
    }
};

/**
 *forgotPassword  -  check wheater the user data is available in db or not.Send random password for available user
 */

function forgotPassword_old(req, res) {
    var user = req.body;
    User.findOne({ 'emailId': user.email, isActive: true }, function (err, doc) {

        if (err || !doc) {
            res.status(404).send({ message: "User not found. Please enter valid user details." });
            return;
        }
        else {
            var data = doc.toJSON()
            var text = randomstring.generate({
                length: 7,
                charset: 'alphanumeric',
            })
            doc.setPassword(text);
            // update user details in db
            doc.save(function (err) {
                if (err) {
                    res.status(404).send({ message: "User not found. Please enter valid user details." });
                    return;
                }
                else {
                    var mailText = '<body style="background: #FAFAFA; color: #333333;"><table border="0" cellpadding="20" cellspacing="0" height="100%" width="600" style="background: #ffffff; border: 1px solid #DDDDDD;"><tbody><tr><td> <b>Dear ' + doc.userName + ',</b><p> As you requested, your password has now been reset.Your new login details are as follows:</p><p><b>Username:</b> ' + doc.userName + '<br><b>Password: </b>' + text + '</p><p> To change your password to something more memorable,after loggin in go to<br>Settings > Change Password</p> <p> If you have any questions or trouble logging on please contact a site administrator.</p><p>Thank you!!!<br />Team CompanyName</p></td></tr></tbody></table></body>';
                    var mailSubject = " Check your updated password";
                    commonService.sendMail(data.emailId, mailSubject, mailText, function (response) {
                        if (response) {
                            res.send(JSON.stringify({ message: "Reset Password link has been sent to your email address. Please check your registered email" }));
                        }
                        else {
                            res.status(500).send({ message: "Please try again after sometime." })
                        }
                    })
                }
            });

        }

    });

}


function forgotPassword(req, res) {
    var user = req.body;
    User.findOne({ 'emailId': user.email, isActive: true }, function (err, doc) {

        if (err || !doc) {
            res.status(404).send({ message: "User not found. Please enter valid user details." });
            return;
        }
        else {
            var mailText = '<body style="background: #FAFAFA; color: #333333;"><table border="0" cellpadding="20" cellspacing="0" height="100%" width="600" style="background: #ffffff; border: 1px solid #DDDDDD;"><tbody><tr><td> <b>Dear ' + doc.userName + ',</b><p>We heard you need a password reset.Click the link below and you will be redirected to a secure site from which you can be set a new password</p><a type="button" href="http://182.72.201.145:4200/#/reset-password/' + doc._id + '"><button style="        cursor: pointer;border-radius: 16px; color: white; background: rgb(60, 164, 70);padding: 11px;border: none;font-size: 17px;">Reset Password</button></a> <p> If you have any questions or trouble logging on please contact a site administrator.</p><p>Thank you!!!<br />Team CompanyName</p></td></tr></tbody></table></body>';
            //var mailText = '<body style="background: #FAFAFA; color: #333333;"><table border="0" cellpadding="20" cellspacing="0" height="100%" width="600" style="background: #ffffff; border: 1px solid #DDDDDD;"><tbody><tr><td> <b>Dear ' + doc.userName + ',</b><p>We heard you need a password reset.Click the link below and you will be redirected to a secure site from which you can be set a new password</p><a type="button" href="http://localhost:2000/#/reset-password/' + doc._id + '"><button style="        cursor: pointer;border-radius: 16px; color: white; background: rgb(60, 164, 70);padding: 11px;border: none;font-size: 17px;">Reset Password</button></a> <p> If you have any questions or trouble logging on please contact a site administrator.</p><p>Thank you!!!<br />Team CompanyName</p></td></tr></tbody></table></body>';

            var mailSubject = "Reset your password";
            commonService.sendMail(doc.emailId, mailSubject, mailText, function (response) {
                if (response) {
                    res.send(JSON.stringify({ message: "Your updated Password has been sent to your email address. Please check your registered email" }));
                }
                else {
                    res.status(500).send({ message: "Please try again after sometime." })
                }
            })
        }
    });

}


//reset password
function resetPassword(req, res) {
    var user = req.body;
    // console.log(user)
    try {
        User.findOne({ _id: req.body.id, isActive: true }, function (err, doc) {
            if (err || !doc) {

                res.status(404).send({
                    message: "User not found. Please enter valid user details."
                });
                return;
            }
            else {
                if (user.newPassword) {
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
                } else {
                    res.send({ message: "Please enter valid password to proceed" });
                }

            }

        })
    } catch (error) {
        //  console.log(error)
        res.send(400).json({
            message: 'Please send valid password.'
        });
    }


}


function rolePermission(req, res) {
    try {
        res.send(configJson[0].RBAC)
    } catch (error) {
        res.status(500).send(configJson[0].RBAC)
    }

}

function logout(req, res) {
    var logData = new Logger({ userId: req.body.id, logoutTime: Date.now() });
    logData.save(function (err, doc) {
        if (err) {
            res.status(400).send("Internal server error")
        }
        else {
            res.send("User logout record saved")
        }
    })
}

function getLog1(req, res) {
    Logger.find({}).
        populate({ path: 'userId', select: 'userName OrganizationId' }).
        //  populate('userId','userName').
        exec(function (err, logs) {
            if (err || !logs) {
                res.status(204).send("No logs available.");
            }
            else {
                res.json(logs);
            }

        });
}

function getLog(req, res) {
    Logger.aggregate(
        [
            { $sort: { createdDateTime: -1 } },
            {
                "$lookup": {
                    "from": "users",
                    "localField": "userId",
                    "foreignField": "_id",
                    "as": "user"
                }
            },
            { "$unwind": "$user" },
            {
                "$lookup": {
                    "from": "organizations",
                    "localField": "user.OrganizationId",
                    "foreignField": "_id",
                    "as": "organization"
                }
            },
            { "$unwind": "$organization" },
            {
                "$lookup": {
                    "from": "roles",
                    "localField": "user.role",
                    "foreignField": "roleId",
                    "as": "role"
                }
            },
            { "$unwind": "$role" },
            { $project: { 'user.userName': 1, 'organization.organizationName': 1, 'role.roleName': 1, 'loginTime': 1, 'logoutTime': 1 } }
        ],
        function (err, result) {
            if (err || !result) {
                res.status(400).send(result)
            } else {
                res.send(result)
            }
        }
    )
}

module.exports = router;