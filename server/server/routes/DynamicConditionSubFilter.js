/**
 * Dynamic Sub Condition Module Router
 */
var SubCondition = require('../models/DynamicConditionSubFilter'),
express = require('express'),
mongoose = require('mongoose'),
commonService = require('../utilities/helper'),
router = express.Router();

//configure routes
router.route('/').post(addSubCondition).get(getAllSubCondition)
router.route('/:id').get(getSubCondition)
.put(updateSubCondition)

/**
* addSubCondition  - Create the New Web Condition record in DB.
*/
function addSubCondition(req, res) {
var requestData = req.body;
requestData.DataType = typeof (req.body.ConditionValue);
SubCondition.count({}, function (err, count) {
    requestData.SubFilterId = commonService.getModelId('', count);
    var subWebCont = new SubCondition(requestData);

    subWebCont.save(function (err) {
        if (err) {
            res.status(400).send(err.message);
        }
        else {
            res.send({
                message: 'Web Condition Sub Filter created Successfully'
            });
        }
    });
});

}
/**
*getAllSubCondition  - get all the available Roles records in db.
*/
function getAllSubCondition(req, res) {
    SubCondition.find({}).
    populate('UsersList','userName').
    exec(function(err, data){
    if (err) {
        res.status(204).send(err);
    }
    else {
        if (data) {
            res.json(data);
        } else {
            res.status(404).send({ "message": "No Conditions found" });
        }

    }

});
}
/**
*getSubCondition  - Get the Particular Role Detail based on Id
*/
function getSubCondition(req, res) {
SubCondition.findOne({ SubFilterId: req.params.id }).
    populate('UsersList','userName').
    exec(function(err, wc){
        if (err) {
    res.status(404).send(err);
}
else {
    if (wc) {
        res.json(wc);
    } else {
        res.status(404).send({ "message": "This Condition does not exist in db" });
    }

}

});

}
/**
*updateSubCondition - update particular Role Data
*/
function updateSubCondition(req, res) {
SubCondition.findOne({
id: req.params.id
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
                message: 'Web Condition updated successfully'
            });
        });
    }
    else {
        res.status(404).send({ "message": "This Web Condition does not exist in db" });
    }

}
});
}


module.exports = router;



