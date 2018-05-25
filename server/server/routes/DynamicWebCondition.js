/**
 * Dynamic Web Condition Module Router
 */
var WebCondition = require('../models/DynamicWebCondition'),
    express = require('express'),
    mongoose = require('mongoose'),
    commonService = require('../utilities/helper'),
    router = express.Router();

//configure routes
router.route('/').post(addWebCondition).get(getAllWebCondition)
 router.route('/:id').get(getWebCondtion).delete(deletecondition)
 .put(updateWebCondition)

/**
* addWebCondition  - Create the New Web Condition record in DB.
*/
function addWebCondition(req, res) {
    var requestData = req.body;
    requestData.DataType = typeof (req.body.ConditionValue);
    WebCondition.count({}, function (err, count) {
        requestData.Id = commonService.getModelId('', count);
        var webCont = new WebCondition(requestData);

        webCont.save(function (err) {
            if (err) {
                res.status(400).send(err.message);
            }
            else {
                res.send({
                    message: 'Trigger created Successfully'
                });
            }
        });
    });

}
/**
*getAllWebCondition  - get all the available Roles records in db.
*/
function getAllWebCondition(req, res) {
    WebCondition.find({isActive:true}).
        populate('OrganizationId','organizationName').
        exec(function(err, data){
         //function (err, data) {
        if (err) {
            res.status(204).send(err);
        }
        else {
            if (data) {
                res.json(data);
            } else {
                res.status(404).send({ "message": "No Triggers found" });
            }

        }

    });
}
/**
*getWebCondtion  - Get the Particular Role Detail based on Id
*/
function getWebCondtion(req, res) {
    WebCondition.findOne({ "_id": req.params.id,isActive:true}).
  //  populate('UsersList','userName').
    exec(function(err, wc){
        if (err) {
            res.status(404).send(err);
        }
        else {
            if (wc) {
                res.json(wc);
            } else {
                res.status(404).send({ "message": "This Trigger does not exist in db" });
            }
    
        }   
    });

}
/**
*updateWebCondition - update particular Role Data
*/
function updateWebCondition(req, res) {
    WebCondition.findOne({
    _id: req.params.id,isActive:true
}, function (err, data) {

    if (err) {
        res.send(err);
    }
    else {
        if (data) {
            var wcInfo = req.body;

            for (prop in wcInfo) {
                data[prop] = wcInfo[prop];
            }

            // update data details in db
            data.save(function (err) {
                if (err)
                    res.send(err);

                res.json({
                    message: 'Trigger  updated successfully'
                });
            });
        }
        else {
            res.status(404).send({ "message": "This Trigger  does not exist in db" });
        }

    }
});
}

function deletecondition(req, res) {
    
    WebCondition.findOne({
        _id: req.params.id
    }, function (err, wc) {
    
        if (err) {
            res.status(404).send({ "message": "This Trigger not exist in db" });
        }
        else {
            if (wc) {
                var wcInfo = req.body;
               // console.log(wcInfo)
                wcInfo.isActive = false;
                for (prop in wcInfo) {
                    wc[prop] = wcInfo[prop];
                }
                // update wc details in db
                wc.save(function (err) {
                    if (err) {
                        res.status(404).send({ "message": "This Trigger is not found. Please enter valid details." });
                    }
    
                    else {
                        res.json({
                            message: 'This Trigger deleted successfully'
                        });
                    }
    
                });
            }
            else {
                res.status(404).send({ "message": "Trigger not exist in db" });
            }
    
        }
    });
    }
module.exports = router;



