/**
 * Notification Module Router
 */
var Notification = require('../models/notification'),
express = require('express'),
mongoose = require('mongoose'),
// commonService = require('../utilities/helper'),
router = express.Router();

//configure routes
router.route('/').get(getAllNotification)
router.route('/:id').get(getNotification)

/**
* addTemplate  - Create the New Template record in DB.
*/
function addTemplate(req, res) {
var template = new Template(req.body);
Template.count({}, function (err, count) {
    template.templateId = commonService.getModelId('Org', count);
    template.save(function (err) {
        if (err) {
            res.status(409).send(err.message);
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
*getAllNotification  - get all the available templates records in db.
*/
function getAllNotification(req, res) {
Notification.find({ }, function (err, notify) {
    if (err) {
        res.status(204).send(err);
    }
    else {
        if (notify) {
            res.json(notify);
        } else {
            res.status(404).send({ "message": "No notification found" });
        }

    }

});
}
/**
*getNotification  - Get the Particular Notification Detail based on Id
*/
function getNotification(req, res) {
    Notification.findOne({ UserId: req.params.id}, function (err, notify ) {
    if (err) {
        res.status(404).send(err);
    }
    else {
        if (notify ) {
            res.json(notify );
        } else {
            res.status(404).send({ "message": "No notification for this user" });
        }

    }

});
}
/**
*updateTemplate - update particular Template Data
*/
function updateTemplate(req, res) {
Template.findOne({
    _id: req.params.id,isActive: true
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
*/
function deleteTemplate(req, res) {

Template.findOne({
    _id: req.params.id
}, function (err, template) {

    if (err) {
        res.status(404).send(err);
    }
    else {
        if (template) {
            var templateInfo = req.body;
          //  console.log(templateInfo)
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

module.exports = router;



