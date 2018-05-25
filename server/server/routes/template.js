/**
 * Template Module Router
 */
var Template = require('../models/template'),
    Organization = require('../models/organizations'),
    express = require('express'),
    mongoose = require('mongoose'),
    commonService = require('../utilities/helper'),
    router = express.Router();

//configure routes
router.route('/').post(addTemplate).get(getAllTemplates)
router.route('/:id').get(getTemplate).put(updateTemplate).delete(deleteTemplate);
router.route('/checkTemplateName').post(checkTemplateName);

/**
* addTemplate  - Create the New Template record in DB.
*/
function addTemplate(req, res) {
    var template = new Template(req.body);
    Template.count({}, function (err, count) {
        template.templateId = commonService.getModelId('Org', count);
        template.save(function (err) {
            if (err) {
                if (err.code == 11000) {
                    res.status(409).json(req.body.templateName + '- Template name  is already exist'
                    );

                } else {
                    res.status(500).json({ message: "Please try again after sometime" });
                }

            }
            else {
                res.send({
                    message: 'Template created Successfully'
                });
            }
        });
    });

}
/**
*getAllTemplates  - get all the available templates records in db.
*/
function getAllTemplates(req, res) {
    Template.find({ isActive: true }, function (err, templates) {
        if (err) {
            res.status(204).send(err);
        }
        else {
            if (templates) {
                res.json(templates);
            } else {
                res.status(404).send({ "message": "No templates found" });
            }

        }

    });
}
/**
*getTemplate  - Get the Particular Template Detail based on Id
*/
function getTemplate(req, res) {
    Template.findOne({ _id: req.params.id, isActive: true }, function (err, template) {
        if (err) {
            res.status(404).send(err);
        }
        else {
            if (template) {
                res.json(template);
            } else {
                res.status(404).send({ "message": "This template data not exist in db" });
            }

        }

    });
}
/**
*updateTemplate - update particular Template Data
*/
function updateTemplate(req, res) {
    Template.findOne({
        _id: req.params.id, isActive: true
    }, function (err, template) {

        if (err) {
            res.send(err);
        }
        else {
            if (template) {
                var templateInfo = req.body;

                for (prop in templateInfo) {
                    template[prop] = templateInfo[prop];
                }

                // update template details in db
                template.save(function (err) {
                    if (err)
                        res.send(err);

                    res.json({
                        message: 'Template data updated successfully'
                    });
                });
            }
            else {
                res.status(404).send({ "message": "This Template does not exist in db" });
            }

        }
    });
}
/**
*deleteTemplate - delete particular Template based on id
*Soft delete
*/
function deleteTemplate1(req, res) {

    Template.findOne({
        _id: req.params.id
    }, function (err, template) {

        if (err) {
            res.status(404).send(err);
        }
        else {
            if (template) {
                var templateInfo = req.body;
                // console.log(templateInfo)
                templateInfo.isActive = false;
                for (prop in templateInfo) {
                    template[prop] = templateInfo[prop];
                }
                // update template details in db
                template.save(function (err) {
                    if (err) {
                        res.status(404).send({ "message": "Template not found. Please enter valid user details." });
                    }

                    else {
                        res.json({
                            message: 'Template deleted successfully'
                        });
                    }

                });
            }
            else {
                res.status(404).send({ "message": "This template not exist in db" });
            }

        }
    });
}

function deleteTemplate(req, res) {

    Template.findOne({
        _id: req.params.id
    }, function (err, template) {

        if (err || !template) {
            res.status(404).send(err);
        }
        else {
            Organization.findOne({ templates: { $elemMatch: { id: req.params.id } } }, function (err, data) {
                if (err) {
                    res.status(404).send(err);
                    return;
                }
                else {
                    if (data) {
                        // console.log(data)
                        res.status(404).json("This Template assigned for organization.So Cannot delete this template from db");
                        return
                    } else {

                        Template.remove({
                            _id: req.params.id
                        }, function (err, temp) {
                            if (err || !temp) {
                                res.status(400).send(err);
                            }
                            else {

                                res.json({
                                    message: 'Template Successfully deleted'
                                });
                            }

                        });

                    }

                }
            })
        }


    })

}

function checkTemplateName(req,res) {
    Template.findOne({ templateName: req.body.templateName }, function (err, template) {
        if (err) {
            res.send(true)
        }
        else {
            if (!template) {
                res.send(true)
            } else {
                res.send(false);
            }

        }

    });
}

module.exports = router;



