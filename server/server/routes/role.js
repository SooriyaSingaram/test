/**
 * Role Module Router
 */
var Role = require('../models/roles'),
    User = require('../models/users'),
    express = require('express'),
    mongoose = require('mongoose'),
    commonService = require('../utilities/helper'),
    router = express.Router();

//configure routes
router.route('/').post(addRole).get(getAllRoles)
router.route('/:id').get(getRole).put(updateRole).delete(deleteRole);

/**
* addRole  - Create the New Role record in DB.
*/
function addRole(req, res) {

    var role = new Role(req.body);
    Role.count({}, function (err, count) {
        role.roleId = commonService.getModelId('R', count);
        role.save(function (err) {
            if (err) {
                if (err.code == 11000) {
                    res.status(409).json(req.body.roleName + '- Role name  is already exist'
                    );

                } else {
                    res.status(500).json({ message: "Please try again after sometime" });
                }

            }
            else {
                res.send({
                    message: 'Role created Successfully'
                });
            }
        });
    });

}
/**
*getAllRoles  - get all the available Roles records in db.
*/
function getAllRoles(req, res) {
    Role.find({}, function (err, roles) {
        if (err || !roles) {
            res.status(204).send("No roles available.");
        }
        else {
            res.json(roles);
        }

    });
}
/**
*getRole  - Get the Particular Role Detail based on Id
*/
function getRole(req, res) {
    Role.findOne({ roleId: req.params.id }, function (err, role) {
        if (err) {
            res.status(404).send(err);
        }
        else {
            if (role) {
                res.json(role);
            } else {
                res.status(404).send({ "message": "This role data not exist in db" });
            }

        }

    });
}
/**
*updateRole - update particular Role Data
*/
function updateRole(req, res) {
    Role.findOne({
        roleId: req.params.id
    }, function (err, role) {

        if (err) {
            res.send(err);
        }
        else {
            if (role) {
                var roleInfo = req.body;

                for (prop in roleInfo) {
                    role[prop] = roleInfo[prop];
                }

                // update role details in db
                role.save(function (err) {
                    if (err) {
                        if (err.code == 11000) {
                            res.status(409).json(req.body.roleName + '- Role name  is already exist'
                            );

                        } else {
                            res.status(500).json({ message: "Please try again after sometime" });
                        }
                    }
                    else {
                        res.json({
                            message: 'Role data updated successfully'
                        });
                    }


                });
            }
            else {
                res.status(404).send({ "message": "This Role not exist in db" });
            }

        }
    });
}
/**
*deleteRole - delete particular Role based on id
*/
function deleteRole(req, res) {

    Role.findOne({
        roleId: req.params.id
    }, function (err, role) {
        User.findOne({ role: req.params.id, isActive: true }, function (err, data) {
            if (err) {
                res.status(404).send(err);
                return;
            } else {

                if (data) {
                  //  console.log(data)
                    res.status(404).send({ "message": "This Role assigned for users.So Cannot delete this organization from db" });
                    return
                } else {

                    Role.remove({
                        roleId: req.params.id
                    }, function (err, role) {
                        if (err) {
                            res.status(400).send(err);
                        }
                        else {

                            res.json({
                                message: 'Role Successfully deleted'
                            });
                        }

                    });

                }
            }
        });

    });
}

module.exports = router;



