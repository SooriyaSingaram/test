/**
 * Organization Module Router
 */
var Organization = require('../models/organizations'),
    User = require('../models/users'),
    express = require('express'),
    mongoose = require('mongoose'),
    fs = require('fs'),
    commonService = require('../utilities/helper'),
    router = express.Router();
var ObjectId = require('mongoose').Types.ObjectId;


//configure routes
router.route('/').post(addOrganization).get(getAllOrganizations)
router.route('/:id').get(getOrganization).put(updateOrganization).delete(deleteOrganization);
router.route('/upload').post(uploadLogo)
router.route('/homePage/userCount').get(homePageData)
router.route('/homePage/adminList').get(adminList)


/**
* addOrganization  - Create the New Organization record in DB.
*/
function addOrganization(req, res) {
    var organization = new Organization(req.body);
    Organization.count({}, function (err, count) {
        organization.organizationId = commonService.getModelId('Org', count);
        organization.save(function (err) {
            if (err) {
                if (err.code == 11000) {
                    res.status(409).json(req.body.organizationName + '- Organization name  is already exist'
                    );

                } else {
                    res.status(500).json({ message: "Please try again after sometime" });
                }

            }
            else {
                res.send({
                    message: 'Organization created Successfully'
                });
            }
        });
    });

}
/**
*getAllOrganizations  - get all the available Organizations records in db.
*/
function getAllOrganizations(req, res) {
    Organization.find({ isActive: true }, function (err, organizations) {
        if (err) {
            res.status(204).send(err);
        }
        else {
            if (organizations) {
                res.json(organizations);
            } else {
                res.status(404).send({ "message": "No Organizations found" });
            }

        }

    });
}
/**
*getOrganization  - Get the Particular Organization Detail based on Id
*/
function getOrganization(req, res) {
    Organization.findOne({ _id: req.params.id, isActive: true }, function (err, organization) {
        if (err) {
            res.status(404).send(err);
        }
        else {
            if (organization) {
                res.json(organization);
            } else {
                res.status(404).send({ "message": "This organization data not exist in db" });
            }

        }

    });
}
/**
*updateOrganization - update particular Organization Data
*/
function updateOrganization(req, res) {
    Organization.findOne({
        _id: req.params.id, isActive: true
    }, function (err, organization) {

        if (err) {
            res.status(500).json({ message: "Please try again after sometime" });
        }
        else {
            if (organization) {
                var organizationInfo = req.body;

                for (prop in organizationInfo) {
                    organization[prop] = organizationInfo[prop];
                }

                // update organization details in db
                organization.save(function (err) {
                    if (err) {
                        if (err.code == 11000) {
                            res.status(409).json(req.body.organizationName + '- Organization name  is already exist'
                            );

                        } else {
                            res.status(500).json({ message: "Please try again after sometime" });
                        }
                    }

                    else {
                        res.json({
                            message: 'Organization data updated successfully'
                        });
                    }

                });
            }
            else {
                res.status(404).send({ "message": "This Organization not exist in db" });
            }

        }
    });
}
/**
*deleteOrganization - delete particular Organization based on id
*/
function deleteOrganization(req, res) {

    Organization.findOne({
        _id: req.params.id
    }, function (err, organization) {
        if (err || !organization) {
            return res.send(400).send("This organization not exist in db.")
        } else {
            User.findOne({ OrganizationId: req.params.id, isActive: true }, function (err, data) {
                if (err) {
                    res.status(404).send(err);
                    return;
                }
                else {
                    if (data) {
                        //console.log(data)
                        res.status(404).send({ "message": "This Organization assigned for users.So Cannot delete this organization from db" });
                        return
                    } else {

                        Organization.remove({
                            _id: req.params.id
                        }, function (err, org) {
                            if (err || !org) {
                                res.status(400).send(err);
                            }
                            else {

                                res.json({
                                    message: 'Organization Successfully deleted'
                                });
                            }

                        });

                    }

                }
            });
        }

    })
}

function uploadLogo(req, res) {

    try {
        if (!req.files.file) {
            res.status(400).send("Please send valid file object");
        } else {
            var fileDetail = req.files.file;
            var oldpath = fileDetail.path;
            var todayDate = Date.now();

            var newpath = './uploads/' + todayDate + '.jpg';

            fs.rename(oldpath, newpath, function (err) {
                if (err) {
                    res.status(400).send("Please send valid file object");
                }
                else {
                    res.send({ logo: todayDate + '.jpg' });
                }
            });
        }

    } catch (error) {
        console.log(error)
        res.status(400).send("Please send valid file object");
    }

}


function homePageData(req, res) {
    // console.log(req.decoded)
    try {
        if (req.decoded.role == 'Super Admin') {
            var sum = 0;
            var query = [
                {
                    $group: {
                        _id: { role: "$role" },  //$region is the column name in collection
                        count: { $sum: 1 }
                    }
                }
            ]
        } else {
            var sum = 1;
         //   console.log(req.decoded.organization)
            var query = [
                {
                    $match: { OrganizationId: ObjectId(req.decoded.organization) }
                },
                {
                    $group: {
                        _id: { role: "$role" },  //$region is the column name in collection
                        count: { $sum: 1 }
                    }
                }
            ]
        }

        User.aggregate(query, function (err, data) {
            if (err || !data) {
                res.status(404).send("No users found in organization")
            }
            else {
                var result = [];

                data.map((user) => {
                   // console.log(user)
                    if (user._id.role == 'R001' || user._id.role == 'R002') {
                        result.push({ role: user._id.role, count: user.count })
                    }
                    else {
                        sum += user.count

                    }
                })
                var userCount = sum - 1
                result.push({ role: "standard users", count: userCount })
                res.send(result)

            }
        })
    } catch (error) {
        console.log(error)
        res.status(400).send("Please send valid token to proceed")
    }



}


function adminList(req, res) {
    //   User.find( { role: { $in: [ 'R001', 'R002' ] } } , function (err, docs) {
    User.find({ role: { $in: ['R001', 'R002'] } }).
        populate('OrganizationId', 'organizationName').
        exec(function (err, docs) {

            if (err || !docs) {
                res.status(404).send("No users found in organization")
            }
            else {
                var result = [
                    { 'R001': [] },
                    { 'R002': [] },
                ];
                docs.map((admin) => {
                    if (admin.role == 'R001') {
                        result[0].R001.push(admin)
                    } else {
                        result[1].R002.push(admin)
                    }
                })

                res.send(result)

            }
        })
}

module.exports = router;



