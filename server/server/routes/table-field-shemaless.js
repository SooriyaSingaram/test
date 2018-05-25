/**
 * Toner Module Router
 */
var Toner = require('../models/tblToner'),
TonerPartNo = require('../models/tblTonerPartNo'),
User = require('../models/users'),
Organization = require('../models/organizations'),
express = require('express'),
mongoose = require('mongoose'),
router = express.Router();

//configure routes
router.route('/tonerData').get(tonerData);
router.route('/partNoData').get(partNoData);
router.route('/partNoData/:id').get(getpartNoData);
router.route('/getTables').get(findTable);
router.route('/dynamicData').post(dynamicData);
router.route('/getFields/:id').get(getFields);
router.route('/testView').get(testViewMongo);


/**
*tonerData  - Get sum of quantity with matched OemID,BagContainerID 
*/
function tonerData(req, res) {
var result = [];
var query = Toner.aggregate([
    {
        $group: {
            _id: { "OemID": "$OemID", "BagContainerID": "$BagContainerID" },
            Quantity: { $sum: "$Quantity" }
        }
    }
]).limit(10)

query.exec(function (err, docs) {
    if (err) {
        res.status(204).send(err);
    } else {
        if (docs) {
            for (var i = 0; i < docs.length; i++) {
                var data = {}
                data.OemID = docs[i]._id.OemID;
                data.BagContainerID = docs[i]._id.BagContainerID;
                data.Quantity = docs[i].Quantity;
                result.push(data);
            }
            res.json(result);
        }
        else {
            res.status(404).send({ "message": "No data found" });
        }
    }
});
}
/**
*getpartNoData  - Get all toner part Detail 
*/
function partNoData(req, res) {
TonerPartNo.find({}, function (err, data) {
    if (err) {
        res.status(204).send(err);
    }
    else {
        if (data) {
            res.json(data);
        } else {
            res.status(404).send({ "message": "No data found" });
        }

    }

});
}

/**
*getpartNoData  - Get Particular toner part Detail based on partNo
*/
function getpartNoData(req, res) {
TonerPartNo.findOne({ Part_No: req.params.id }, function (err, data) {
    if (err) {
        res.status(404).send(err);
    }
    else {
        if (data) {
            res.json(data);
        } else {
            res.status(404).send({ "message": "This toner part data not exist in db" });
        }

    }

});
}
/**
*findTable  - Get list of collection names from db
*/
function findTable(req, res) {
try {
    var result = [];
    mongoose.connection.db.listCollections().toArray(function (err, collInfos) {
        if (err) {
            console.log(err);
            res.status(404).send({ message: "Please try again after sometime." });
        }
        else {
            for (var i = 0; i < collInfos.length; i++) {
                var data = {};
                data.id = i + 1;
                data.name = collInfos[i].name;
                // data.name = (collInfos[i].name).replace(/([a-z])([A-Z])/g, '$1-$2').toUpperCase();
                result.push(data);

            }
            const toDelete = new Set(['users', 'roles', 'organizations', 'system.views', 'userData']);
            const resultData = result.filter(obj => !toDelete.has(obj.name));
            res.json(resultData);
        }

    })
} catch (error) {
    res.status(404).send({ message: "Please try again after sometime." });
}

}

/**
*findTable  - Get list of fields in collection using schema
*/
function getFields0(req, res) {
try {
    if (req.params.id) {
        var CollectionTable = require('../models/' + req.params.id);
        if (CollectionTable) {
            var columnFields = CollectionTable.schema.tree;
            ['id', '__t', '_id', 'isActive', 'createdDateTime', 'modifiedDateTime', '__v'].forEach(removeKey => delete columnFields[removeKey]);
            var result = []
            //console.log(columnFields)
            for (key in columnFields) {
                result.push(key)
            }
            res.send(result);
        }

        else {
            res.status(400).send({ message: "Please send valid parameter to proceed" })
        }


    }

    else {
        res.status(400).send({ message: "Please send valid parameter to proceed" })
    }
} catch (error) {
    res.status(400).send({ message: "Please send valid parameter to proceed" })
}

}

/**
*getFields  - Get list of fields in collection without using schema
*/
function getFields1(req, res) {
try {
    if (req.params.id) {
        var CollectionTable = mongoose.connection.db.collection(req.params.id);
        CollectionTable.aggregate([
            { "$project": { "arrayofkeyvalue": { "$objectToArray": "$$ROOT" } } },
            { "$project": { "keys": "$arrayofkeyvalue.k" } }
        ], function (err, data) {
            data.toArray(function (err, detail) {
                var largest = 0;
                var result = [];

                for (var i = 0; i < detail.length; ++i) {
                    if (detail[i].keys.length > largest) {
                        result = detail[i].keys;
                    }
                }
                if (result.length >= 0) {
                    const toDelete = new Set(['id', '__t', '_id', 'isActive', 'createdDateTime', 'modifiedDateTime', '__v']);
                    const resultData = result.filter(obj => !toDelete.has(obj));
                    res.json(resultData);
                }
                else {
                    res.status(400).send({ message: "Please send valid parameter to proceed" })
                }
            })
        })
    }
} catch (error) {
    console.log(error)
    res.status(400).send({ message: "Please send valid parameter to proceed" })
}

}
/**
*getFields  - Get list of fields in collection without schema and native drive
*/
function getFields(req, res) {
try {
    if (req.params.id) {
        try {
            var Thing = mongoose.model(req.params.id);
        } catch (error) {
            var collectionSchema = mongoose.Schema({}, {
                strict: false,
                collection: req.params.id
            })
            var Thing = mongoose.model(req.params.id, collectionSchema);
        }
        
        var query = Thing.findOne();
        query.exec(function (err, docs) {
            if (err) {
                res.status(204).send(err);
            }
            else {
                //   console.log(data)
                if (docs) {
                    var data = JSON.stringify(docs);
                    var resultData = JSON.parse(data)
                    var result = []
                    //console.log(columnFields)
                    for (key in resultData) {
                        result.push(key)
                    }
                    const toDelete = new Set(['id', '__t', '_id', 'isActive', 'createdDateTime', 'modifiedDateTime', '__v']);
                    const finalData = result.filter(obj => !toDelete.has(obj));
                    res.send(finalData);

                }
                else {
                    res.status(400).send({ message: "Please send valid parameter to proceed" })
                }

            }

        });
    }
} catch (error) {
    console.log(error)
    res.status(400).send({ message: "Please send valid parameter to proceed" })
}

}

/**
* dynamicData - filter data based on collection name  and fields with schema
*/
function dynamicData1(req, res) {
try {
    if (!req.body.table) {
        res.status(400).send({ "message": "Please Send valid Table name to proceed" });
    } else {
        var CollectionTable = require('../models/' + req.body.table);

        if (req.body.field.length >= 2) {
            var fieldList = req.body.field;
            console.log(fieldList)
            var result = [];
            var fieldObj = {};
            // var fieldObj = { "OemID": "$OemID", "BagContainerID": "$BagContainerID" }
            for (var i = 0; i < fieldList.length; ++i)
                fieldObj[fieldList[i]] = "$" + fieldList[i];
            console.log(fieldObj)
            console.log(fieldObj)
            var query = CollectionTable.aggregate([
                {
                    $group: {
                        _id: fieldObj
                    }
                }
            ]).limit(10)
            query.exec(function (err, docs) {
                if (err) {
                    res.status(204).send(err);
                } else {
                    if (docs) {
                        console.log(docs)
                        for (var i = 0; i < docs.length; i++) {
                            var data = {};

                            for (property in docs[i]._id) {
                                data[property] = docs[i]._id[property];
                            }

                            result.push(data);
                        }
                        res.json(result);
                    }
                    else {
                        res.status(404).send({ "message": "No data found" });
                    }
                }
            });
        } else {
            res.status(404).send({ "message": "Please Send valid field name to proceed" });
        }

    }
} catch (error) {
    console.log(error)
    res.status(404).send({ "message": "Please Send valid field name to proceed" });
}

}
/**
* dynamicData - filter data based on collection name  and fields without schema
*/
function dynamicData(req, res) {
console.log(req.body)
try {
    if (!req.body.table) {
        res.status(400).send({ "message": "Please Send valid Table name to proceed"});
    } else {
        try {
            var CollectionTable = mongoose.model(req.body.table);
        } catch (error) {
            var collectionSchema = mongoose.Schema({}, {
                strict: false,
                collection: req.body.table
            })
            var CollectionTable = mongoose.model(req.body.table, collectionSchema);
        }         
       // var CollectionTable = mongoose.connection.db.collection(req.body.table);
        if (req.body.field.length >= 2) {
            var fieldList = req.body.field;
            var result = [];
            var fieldObj = {};
            for (var i = 0; i < fieldList.length; ++i)
                fieldObj[fieldList[i]] = "$" + fieldList[i];
            console.log(fieldObj)
            console.log(fieldObj)

            var query = CollectionTable.aggregate([
                {
                    $group: {
                        _id: fieldObj
                    }
                },
                { "$limit": 10 },
            ], function (err, detail) {
                // docs.toArray(function (err, detail) {
                    if (err) {
                        res.status(404).send("Please Send valid field name to proceed");
                    } else {
                        if (detail) {
                            console.log(detail)
                            for (var i = 0; i < detail.length; i++) {
                                var data = {};

                                for (property in detail[i]._id) {
                                    data[property] = detail[i]._id[property];
                                }

                                result.push(data);
                            }
                            res.json(result);
                        }
                        else {
                            res.status(404).send({ "message": "No data found" });
                        }
                    }
                })
           
        } else {
            res.status(404).send({ "message": "Please Send valid field name to proceed" });
        }

    }
} catch (error) {
    console.log(error)
    res.status(404).send({ "message": "Please Send valid field name to proceed" });
}

}


//view in MongoDB
function testViewMongo(req, res) {
var result = [];
try {
    mongoose.connection.db.collection('userData').find({}, function (err, docs) {
        console.log(docs)
        docs.toArray(function (err, data) {
            if (err) {
                res.send(400).send("Please try again after some time")
            }
            else {
                res.send(data)
            }
        })
    });
} catch (error) {
    res.send(400).send("Please try again after some time")
}

}


/**
*tonerData  - Get sum of quantity with matched OemID,BagContainerID 
*/
function ShareMarket(req, res) {
    //console.log(req.decoded)
    var ParentCompany = req.decoded.ParentCompany;
    var filterFields = req.body.filterFields;
    var queryData = []
    for (var i = 0; i < filterFields.length; i++) {
        var obj = {};
        obj[filterFields[i]] = { "$in": req.body[filterFields[i]] }
        queryData.push(obj)
    }
    try {
        var CollectionTable = mongoose.model('Market Share');
    } catch (error) {
        var collectionSchema = mongoose.Schema({}, {
            strict: false,
            collection: 'Market Share'
        })
        var CollectionTable = mongoose.model('Market Share', collectionSchema);
    }
    var query = CollectionTable.aggregate([

        {
            $match: {

                $and: queryData
            }
        },
        {

            $group: {
                _id: {
                    label: "$" + req.body.chartFields[0],
                    value: "$" + req.body.chartFields[1]
                }

            }

        }
    ])
    query.exec(function (err, docs) {

        var data = [];
        if (docs) {
            var result = [];
            var targetObj = {};
            for (var i = 0; i < docs.length; i++) {
                if (!targetObj.hasOwnProperty(docs[i]._id.label)) {
                    targetObj[docs[i]._id.label] = 0;
                }
                targetObj[docs[i]._id.label] += docs[i]._id.value;
            }
            var GrantTotal = 0;
            for (property in targetObj) {
                GrantTotal += targetObj[property];
            }
            for (property in targetObj) {
                var percent = ((targetObj[property]) / GrantTotal).toFixed(2);
                result.push({ label: property, value: targetObj[property], percentage: percent })
            }

            res.send(result)
        }
        else {
            res.status(404).send({ "message": "No data found" });
        }
    })

}

function getParentCompany(req, res) {
    
        try {
            var CollectionTable = mongoose.model('Market Share');
        } catch (error) {
            var collectionSchema = mongoose.Schema({}, {
                strict: false,
                collection: 'Market Share'
            })
            var CollectionTable = mongoose.model('Market Share', collectionSchema);
        }
        var query = CollectionTable.aggregate([
    
            {
                $group: {
                    _id: { "ParentCompany": "$ParentCompany" }
                }
            }
        ])
        query.exec(function (err, docs) {
            if (err) {
                res.status(400).send(err)
                return;
            }
            else {
                res.send(docs);
    
            }
    
        });
    }

/**
* dynamicData - filter data based on collection name  and fields with schema
*/

function dynamicData(req, res) {
    console.log(req.decoded)
    var ParentCompany = req.decoded.ParentCompany;
    console.log(req.body)
    try {
        if (!req.body.table) {
            res.status(400).send({ "message": "Please Send valid Table name to proceed" });
        } else {
            try {
                var CollectionTable = mongoose.model(req.body.table);
            } catch (error) {
                var collectionSchema = mongoose.Schema({}, {
                    strict: false,
                    collection: req.body.table
                })
                var CollectionTable = mongoose.model(req.body.table, collectionSchema);
            }
            // var CollectionTable = mongoose.connection.db.collection(req.body.table);
            if (req.body.field.length >= 2) {
                var fieldList = req.body.field;
                var result = [];
                var fieldObj = {};
                for (var i = 0; i < fieldList.length; ++i)
                    fieldObj[fieldList[i]] = "$" + fieldList[i];
                console.log(fieldObj)
                console.log(fieldObj)

                var query = CollectionTable.aggregate([
                    {
                        $match: {

                            ParentCompany: ParentCompany
                        }
                    },
                    {
                        $group: {
                            _id: fieldObj
                        }
                    },
                    { "$limit": 1000 },
                ], function (err, detail) {
                    if (err) {
                        res.status(404).send("Please Send valid field name to proceed");
                    } else {
                        if (detail) {
                            for (var i = 0; i < detail.length; i++) {

                                var data = {};
                                // for (property in detail[i]._id) {                            
                                //      data[property] = detail[i]._id[property];                                  
                                // }
                                data.label = detail[i]._id[req.body.field[0]];
                                for (var j = 1; j < fieldList.length; j++) {
                                    data["value" + j] = detail[i]._id[req.body.field[j]];
                                }
                                result.push(data);
                            }
                            res.json(result);
                        }
                        else {
                            res.status(404).send({ "message": "No data found" });
                        }
                    }
                })

            } else {
                res.status(404).send({ "message": "Please Send valid field name to proceed" });
            }

        }
    } catch (error) {
        console.log(error)
        res.status(404).send({ "message": "Please Send valid field name to proceed" });
    }

}    
module.exports = router;




////////////////////////////////////////TODAY CHART FILTER /////////////////////////////////////////


function dataFilter(req, res) {
    if (req.decoded.role == 'Super Admin' || req.decoded.role == 'R001') {
        res.status(501).send("Chart data only available for users");
        return
    }
    var ParentCompany = req.decoded.ParentCompany;
    var matchData = []
    if (req.body.userFilter) {
        var userFilter = req.body.userFilter;
        userFilter["ParentCompany"] = ParentCompany;
        matchData.push(userFilter)
        // if (userFilter.length > 0) {
        //     for (var i = 0; i < userFilter.length; i++) {
        //         var obj = {};
        //         obj[userFilter[i]] =  req.body[userFilter[i]] 
        //         obj["ParentCompany"] =ParentCompany;
        //         console.log(obj)
        //         matchData.push(obj)
        //     }
        // }
    }
    else {
        var obj = {
            ParentCompany: ParentCompany
        }
        matchData.push(obj)
    }

    chartFields = req.body.chartFields
    var temp = {};
    var GroupBy = req.body.filterFields;
    var SumBy = req.body.chartFields[1];

    for (var i = 0; i < GroupBy.length; i++) {

        temp[GroupBy[i]] = "$" + GroupBy[i]

    }

    console.log(temp)
    try {
        var CollectionTable = mongoose.model(req.body.table);
    } catch (error) {
        var collectionSchema = mongoose.Schema({}, {
            strict: false,
            collection: req.body.table
        })
        var CollectionTable = mongoose.model(req.body.table, collectionSchema);
    }
    console.log(matchData)
    var query = CollectionTable.aggregate([
        // {
        //     $match: {
        //         $and: matchData
        //     }
        // },
        {

            $group: {
                _id: temp,

                value: {
                    $sum: "$" + chartFields[1]
                },
                label: { $first: "$" + chartFields[0] },
                volume: { $first: "$" + req.body.filterFields[0] }
            }
        }



    ])
    query.exec(function (err, docs) {
        var data = [];
        if (docs) {
            var result = [];
            var targetObj = {};
            var childLabel = {};
            for (var i = 0; i < docs.length; i++) {
                if (!childLabel.hasOwnProperty(docs[i].label)) {
                    childLabel[docs[i].label] = [{ data: docs[i].volume, qty: docs[i].value }]
                }
                else {
                    childLabel[docs[i].label].push({ data: docs[i].volume, qty: docs[i].value })
                }
            }
            console.log(childLabel)
            for (var i = 0; i < docs.length; i++) {
                if (!targetObj.hasOwnProperty(docs[i].label)) {
                    targetObj[docs[i].label] = 0;
                }
                targetObj[docs[i].label] += docs[i].value;
            }
            var GrantTotal = 0;
            for (property in targetObj) {
                GrantTotal += targetObj[property];
            }
            for (property in targetObj) {
                var percent = ((targetObj[property]) / GrantTotal).toFixed(2);
                result.push({ label: property, value: targetObj[property], percentage: percent ,childLabel:childLabel[property]})
            }
            if (chartFields[0] == 'Month') {
                res.send(result.reverse())
            }
            else {
                res.send(result)
            }
            // if (req.body.table == 'Top 10 Returners') {
            //     result.sort((b, a) => parseFloat(a.value) - parseFloat(b.value));
            //     var finalResult = result.slice(0, 10);
            //     res.send(finalResult)
            // }
        }
        else {
            res.status(404).send({ "message": "No data found" });
        }
    })

}



//////////////////////////////////////////////////////////////////////////////////////////
//DATE _ 30-03-18 // Backup for chart

function dataFilter(req, res) {
    console.log(req.body.userFilter)
    var cloneOfA;
    if (req.body.hasOwnProperty('userFilter')) {

        cloneOfA = JSON.parse(JSON.stringify(req.body.userFilter));

    }
    console.log(req.decoded.role)
    var percentFilter = req.body.percentFilter;
    var matchFilter = {};
    var matchData = []
    if (req.decoded.role == 'Super Admin') {
        res.status(501).send("Chart data only available for users");
        return
    }
    if (req.decoded.role == 'R002'  || req.decoded.role == 'R001') {
        var PartnerName = req.decoded.PartnerName;
        console.log(PartnerName)

        if (req.body.userFilter) {
            matchFilter = req.body.userFilter;
            matchFilter["PartnerName"] = PartnerName
            delete matchFilter["OemName"];

        }
        else {
            matchFilter = {
                PartnerName: PartnerName
            }

        }

    } else {
        var ParentCompany = req.decoded.ParentCompany;
        if (req.body.userFilter) {

            if (req.body.userFilter.hasOwnProperty('ParentCompany')) {
                matchFilter = req.body.userFilter;

            }
            else {
                matchFilter = req.body.userFilter;
                matchFilter["ParentCompany"] = { "$in": ParentCompany }
            }
            delete matchFilter["OemName"];

        }
        else {
            matchFilter = {
                ParentCompany: { "$in": ParentCompany }
            }
        }
    }
    matchData.push(matchFilter)
    var chartFields = req.body.chartFields
    var temp = {};
    var aggregareQuery;
    var SumBy = req.body.chartFields[1];
    temp[chartFields[0]] = "$" + chartFields[0]

    if (chartFields.length > 2) {
        temp[chartFields[2]] = "$" + chartFields[2]
    }


    try {
        var CollectionTable = mongoose.model(req.body.table);
    } catch (error) {
        var collectionSchema = mongoose.Schema({}, {
            strict: false,
            collection: req.body.table
        })
        var CollectionTable = mongoose.model(req.body.table, collectionSchema);
    }

    if (chartFields[2] == 'OemName') {
        aggregareQuery = [
            {
                $match: {
                    $and: matchData
                }
            },
            {

                $group: {
                    _id: temp,

                    value: {
                        $sum: "$" + chartFields[1]
                    },
                    label: { $first: "$" + chartFields[0] },
                    volume: { $first: "$" + req.body.chartFields[2] }
                }
            },
            { $lookup: { from: "OEMGeneric", localField: "_id.OemName", foreignField: "OemName", as: "details" } },
            {
                $unwind: "$details"
            },
            {
                $project: {
                    "_id": 0,
                    "label": "$label",
                    "value": "$value",
                    "volume": "$details.OEMGeneric"
                }
            }
        ]
    } else {
        aggregareQuery = [
            {
                $match: {
                    $and: matchData
                }
            },
            {

                $group: {
                    _id: temp,

                    value: {
                        $sum: "$" + chartFields[1]
                    },
                    label: { $first: "$" + chartFields[0] },
                    volume: { $first: "$" + req.body.chartFields[2] }
                }
            }
        ]
    }
    if (req.body.hasOwnProperty('userFilter')) {
        if (cloneOfA.hasOwnProperty('OemName')) {
            var star = [{
                $lookup:
                {
                    from: "OEMGeneric",
                    localField: "OemName",
                    foreignField: "OemName",
                    as: "docs"
                }
            },
            { $unwind: "$docs" },
            {
                $match:
                {
                    "docs.OEMGeneric": cloneOfA.OemName
                }
            }]

            aggregareQuery.unshift(star[2])
            aggregareQuery.unshift(star[1])
            aggregareQuery.unshift(star[0])
        }
    }
    console.log(aggregareQuery)
    var query = CollectionTable.aggregate(aggregareQuery)
    query.exec(function (err, docs) {
        var data = [];
        if (docs) {
            var result = [];
            var targetObj = {};
            var childLabel = {};
            for (var i = 0; i < docs.length; i++) {
                if (!targetObj.hasOwnProperty(docs[i].label)) {
                    targetObj[docs[i].label] = 0;
                }
                targetObj[docs[i].label] += docs[i].value;
            }
            var GrantTotal = 0;
            for (property in targetObj) {
                GrantTotal += targetObj[property];
            }

            for (var i = 0; i < docs.length; i++) {
                if (!childLabel.hasOwnProperty(docs[i].label)) {
                    var percentage = (((docs[i].value) / GrantTotal).toFixed(2)) * 100;
                    if (!percentFilter) {
                        childLabel[docs[i].label] = [{ label: (docs[i].label + '-' + docs[i].volume), value: docs[i].value, percentage: percentage }]
                    }
                    else {
                        if (percentage < percentFilter) {
                            childLabel[docs[i].label] = [{ label: (docs[i].label + '-' + docs[i].volume), value: docs[i].value, percentage: percentage }]
                        }
                    }
                }
                else {

                    var percentage = (((docs[i].value) / GrantTotal).toFixed(2)) * 100;
                    if (!percentFilter) {
                        childLabel[docs[i].label].push({ label: (docs[i].label + '-' + docs[i].volume), value: docs[i].value, percentage: percentage })
                    } else {
                        if (percentage < percentFilter) {
                            childLabel[docs[i].label].push({ label: (docs[i].label + '-' + docs[i].volume), value: docs[i].value, percentage: percentage })
                        }
                    }
                }
            }
            if (chartFields.length > 2) {
                for (property in targetObj) {

                    for (prop in childLabel[property]) {
                        result.push(childLabel[property][prop])
                    }

                }
            } else {
                for (property in targetObj) {
                    var percent = (((targetObj[property]) / GrantTotal).toFixed(2)) * 100;
                    if (!percentFilter) {
                        result.push({ label: property, value: targetObj[property], percentage: (percent) })
                    }
                    else {
                        if (percent < percentFilter) {
                            result.push({ label: property, value: targetObj[property], percentage: (percent) })
                        }
                    }

                }
            }
            if (req.body.table == 'Top 10 Returners') {
                result.sort((b, a) => parseFloat(a.value) - parseFloat(b.value));
                var finalResult = result.slice(0, 10);
                if (chartFields[0] == 'Month') {
                    res.send(finalResult.reverse())
                } else {
                    res.send(finalResult)
                }

            }
            else {
                if (chartFields[0] == 'Month') {
                    res.send(result.reverse())
                }
                else if (chartFields[0] == 'Month-YY') {
                    res.send(result.reverse())
                }
                else {
                    res.send(result)
                }

            }
        }
        else {
            res.status(404).send({ "message": "No data found" });
        }
    })

}