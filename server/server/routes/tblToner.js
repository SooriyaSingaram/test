/**
 * Toner Module Router
 */
var Toner = require('../models/tblToner'),
    Report = require('../models/reports'),
    TonerPartNo = require('../models/tblTonerPartNo'),
    User = require('../models/users'),
    Organization = require('../models/organizations'),
    express = require('express'),
    mongoose = require('mongoose'),
    commonService = require('../utilities/helper'),
    router = express.Router();


//configure routes
router.route('/partNoData').get(partNoData);
router.route('/partNoData/:id').get(getpartNoData);
router.route('/getTables').get(findTable);
router.route('/getFields').get(getFields);
router.route('/testView').get(testViewMongo);
router.route('/summation').post(summation);
router.route('/dataFilter').post(charts);
router.route('/FilterFieldList').post(getFilterFieldList);
router.route('/topFiveRecord').post(topFiveRecords);
router.route('/staticWidget').get(staticWidget);
router.route('/emailDashboard').post(emailDashboard);

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
*getFields  - Get list of fields in collection without schema and native drive
*/
function getFields(req, res) {
    try {

        try {
            var Thing = mongoose.model('Market Share');
        } catch (error) {
            var collectionSchema = mongoose.Schema({}, {
                strict: false,
                collection: 'Market Share'
            })
            var Thing = mongoose.model('Market Share', collectionSchema);
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

    } catch (error) {
        console.log(error)
        res.status(400).send({ message: "Please send valid parameter to proceed" })
    }

}

//view in MongoDB
function testViewMongo(req, res) {
    var result = [];
    try {
        mongoose.connection.db.collection('userData').find({}, function (err, docs) {
            //console.log(docs)
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
        console.log(error)
        res.send(400).send("Please try again after some time")
    }

}

function summation(req, res) {
    console.log(req.body.table)
    if (!req.body.table || !req.body.sumProperty) {
        res.send(400).send("Please Send valid table name and field name to proceed")
    }
    else {
        console.log(req.body)
        try {
            var CollectionTable = mongoose.model(req.body.table);
        } catch (error) {
            var collectionSchema = mongoose.Schema({}, {
                strict: false,
                collection: req.body.table
            })
            var CollectionTable = mongoose.model(req.body.table, collectionSchema);
        }
        CollectionTable.aggregate([{
            $group: {
                _id: '',
                total: { $sum: "$" + req.body.sumProperty }
            }

        }], function (err, data) {
            if (err) {
                console.log(err)
                res.send(400).send("Please Send valid table name and field name to proceed")
            }
            else {
                if (data) {
                    var result = {};
                    var propertyName = req.body.sumProperty;
                    result[propertyName] = data[0].total;
                    // console.log(result)
                    res.json(result)
                }

            }
        })
    }
}

function getFilterFieldList(req, res) {
    //  console.log(req.decoded)
    var tableName = 'Market Share';
    var fieldName = req.body.fieldName;
    var baseFilter = req.body.baseFilter;
    var ParentCompany = req.decoded.ParentCompany;
    var PartnerName = req.decoded.PartnerName;
    // console.log("Parent:" + ParentCompany);
    // console.log("fieldName:" + fieldName);
    var matchquery;

    if (req.decoded.master == 'Super Admin') {

        if (baseFilter) {
            matchquery = baseFilter;
        }
        //  else {
        //     matchquery = { "PartnerName": "HP" }
        // }
        // console.log("admin")
    }

    else if (req.decoded.role == 'R002' || req.decoded.role == 'R001') {
        if (baseFilter) {
            // console.log(baseFilter)
            matchquery = baseFilter;
        } else {
            matchquery = {
                "PartnerName": PartnerName
            }
        }


    }
    else {
        if (baseFilter) {
            matchquery = baseFilter;
        } else {
            matchquery = {
                "ParentCompany": { "$in": ParentCompany }
            }
        }


    }
    // console.log(matchquery)
    try {
        var CollectionTable = mongoose.model(tableName);
    } catch (error) {
        var collectionSchema = mongoose.Schema({}, {
            strict: false,
            collection: tableName
        })
        var CollectionTable = mongoose.model(tableName, collectionSchema);
    }
    var group = {};
    group[fieldName] = '$' + fieldName;
    var aggregareQuery;
    if (fieldName == "OemName") {
        aggregareQuery = [
            {
                $match: matchquery
            },
            {
                $group: {
                    _id: group
                }
            },
            { $lookup: { from: "OEMGeneric", localField: "_id.OemName", foreignField: "OemName", as: "details" } },
            {
                $unwind: "$details"
            },
            {
                $project: {
                    "_id": 0,
                    "_id": { OemName: "$details.OEMGeneric" }
                }
            }
        ]
    }
    else {
        if (fieldName == "PartnerName") {
            aggregareQuery = [
                {
                    $group: {
                        _id: group
                    }
                }
            ]
        } else {
            aggregareQuery = [
                {
                    $match: matchquery
                },
                {
                    $group: {
                        _id: group
                    }
                }
            ]
        }

    }
    var query = CollectionTable.aggregate(aggregareQuery)
    query.exec(function (err, docs) {
        if (err) {
            res.status(400).send(err)
            return;
        }
        else {
            if (req.body.fieldName == "OemName") {
                for (var i = 0; i < docs.length; i++) {
                    if (docs[i]._id.OemName == req.decoded.OEMGeneric) {
                        docs[i]._id.OemName = req.decoded.PartnerName
                    }
                }
            }

            res.send(docs);

        }

    });
}


function topFiveRecords(req, res) {

    var matchData = [];
    var matchFilter = {};
    var matchData = []
    if (req.decoded.master == 'Super Admin') {
        res.status(501).send("Chart data only available for users");
        return
    }
    if (req.decoded.role == 'R002' || req.decoded.role == 'R001') {
        var PartnerName = req.decoded.PartnerName;
        // console.log(PartnerName)
        matchFilter = { PartnerName: PartnerName };
    } else {
        var ParentCompany = req.decoded.ParentCompany;
        var matchFilter = {
            ParentCompany: { "$in": ParentCompany }

        }
    }

    matchData.push(matchFilter)
    var temp = {
        "CompanyName": "$CompanyName"
    };
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
                $and: matchData
            }
        },
        {
            $group: {
                _id: temp,
                prCompany: { $first: "$ParentCompany" },
                value: {
                    $sum: "$Quantity"
                }
            }
        },
        { $group: { _id: "$prCompany", CompanyList: { $push: { CompanyName: '$_id.CompanyName', Quantity: '$value' } } } },
        { $project: { _id: 0, ParentCompany: "$_id", "CompanyList": 1 } },
        {
            $sort: { "value": -1 }
        }

    ])
    query.exec(function (err, docs) {
        if (err || !docs) {
            console.log(err)
            res.status(400).send("No data available")
        } else {
            var result = []
            for (var i = 0; i < docs.length; i++) {
                docs[i].CompanyList.sort((a, b) => parseFloat(a.Quantity) - parseFloat(b.Quantity));
                result.push({ ParentCompany: docs[i].ParentCompany, CompanyList: docs[i].CompanyList.slice(0, 5) })
            }
            res.send(result)
        }

    })
}
//data filter 16-03-18
function chartDataFilter(req, res) {
    // console.log(req.decoded.role)
    var matchFilter = {};
    if (req.decoded.role == 'Super Admin' || req.decoded.role == 'R001') {
        res.status(501).send("Chart data only available for users");
        return
    }
    if (req.decoded.role == 'R002') {
        var PartnerName = req.decoded.PartnerName;


        if (req.body.userFilter) {
            matchFilter = req.body.userFilter;
            matchFilter["PartnerName"] = PartnerName

        }
        else {
            matchFilter = {
                PartnerName: PartnerName
            }
        }

    } else {
        var ParentCompany = req.decoded.ParentCompany;


        if (req.body.userFilter) {
            matchFilter = req.body.userFilter;
            matchFilter["ParentCompany"] = { "$in": ParentCompany }

        }
        else {
            matchFilter = {
                ParentCompany: { "$in": ParentCompany }
            }
        }
    }

    var chartFields = req.body.chartFields;
    try {
        var CollectionTable = mongoose.model(req.body.table);
    } catch (error) {
        var collectionSchema = mongoose.Schema({}, {
            strict: false,
            collection: req.body.table
        })
        var CollectionTable = mongoose.model(req.body.table, collectionSchema);
    }

    var tempFilterObj = {};
    for (var i = 0; i < chartFields.length; i++) {
        tempFilterObj[chartFields[i]] = 1
    }

    tempFilterObj["_id"] = 0;
    var query = CollectionTable.find(matchFilter).select(tempFilterObj);
    // console.log(matchFilter)
    query.exec(function (err, doc) {
        var docs = JSON.parse(JSON.stringify(doc));

        var data = [];
        if (docs) {
            var result = [];
            var targetObj = {};
            for (var i = 0; i < docs.length; i++) {
                //  console.log(docs[i][chartFields[0]])
                if (!targetObj.hasOwnProperty(docs[i][chartFields[0]])) {
                    targetObj[docs[i][chartFields[0]]] = 0;
                }
                targetObj[docs[i][chartFields[0]]] += docs[i][chartFields[1]];
            }
            var GrantTotal = 0;
            for (property in targetObj) {
                GrantTotal += targetObj[property];
            }
            for (property in targetObj) {
                var percent = ((targetObj[property]) / GrantTotal).toFixed(2);
                result.push({ label: property, value: targetObj[property], percentage: percent })
            }
            if (req.body.table == 'Top 10 Returners') {
                result.sort((b, a) => parseFloat(a.value) - parseFloat(b.value));
                var finalResult = result.slice(0, 10);
                res.send(finalResult)
            }
            else {
                res.send(result)
            }

        }
        else {
            console.log(err)
            res.status(404).send({ "message": "No data found" });
        }
    })

}


function staticWidget0(req, res) {

    try {
        var CollectionTable = mongoose.model('Market Share');
    } catch (error) {
        var collectionSchema = mongoose.Schema({}, {
            strict: false,
            collection: 'Market Share'
        })
        var CollectionTable = mongoose.model('Market Share', collectionSchema);
    }
    CollectionTable.aggregate([{
        $group: {
            _id: '',
            Quantity: { $sum: "$Quantity" },
            Weight: { $sum: "$Weight" }
        }

    }], function (err, data) {
        if (err) {
            console.log(err)
            res.send(400).send("Please Send valid table name and field name to proceed")
        }
        else {
            if (data) {
                var result = {};
                result.Weight = data[0].Weight;
                result.Quantity = data[0].Quantity;
                // console.log(result)
                res.json(result)
            }

        }
    })

}
function staticWidget(req, res) {
    Report.find({}, function (err, data) {
        if (err) {
            res.status(400).send("err")
        } else {
            res.send(data)
        }
    })
}

function emailDashboard(req, res) {
    var mailText = req.body.data;
    var email = req.body.email;
    var mailSubject = req.body.name;
    commonService.sendAttachment(email, mailSubject, mailText, function (response) {

        if (response) {
            res.send(response)
        } else {
            res.status(500).send(response)
        }
    })

}
function charts(req, res) {
    //console.log(req.decoded)
    var cloneOfRequest;
    if (req.body.hasOwnProperty('userFilter')) {

        cloneOfRequest = JSON.parse(JSON.stringify(req.body.userFilter));

    }

    var percentFilter = req.body.percentFilter;
    var matchFilter = {};
    var matchData = []
    if (req.decoded.master == 'Super Admin') {
        res.status(501).send("Chart data only available for users");
        return
    }
    if (req.decoded.role == 'R002' || req.decoded.role == 'R001') {
        var PartnerName = req.decoded.PartnerName;

        if (req.body.userFilter) {
            for (const key in req.body.userFilter) {
                matchFilter[key] = { "$in": req.body.userFilter[key] }
            }
            // matchFilter = req.body.userFilter;
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
                for (const key in req.body.userFilter) {
                    matchFilter[key] = { "$in": req.body.userFilter[key] }
                }
                //matchFilter = req.body.userFilter;

            }
            else {
                for (const key in req.body.userFilter) {

                    matchFilter[key] = { "$in": req.body.userFilter[key] }
                }
                //matchFilter = req.body.userFilter;
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

    if (req.body.hasOwnProperty('contentFilter')) {


        var contFilter = configContentFiler(req.body.contentFilter);
        for (key of contFilter) {
            if (key.ComparisonOperator == 'Contains') {
                var likeString = new RegExp(key.ConditionValue, 'i')
                matchFilter[key.PropertyName] = likeString
            }
            if (key.ComparisonOperator == 'EqualTo') {

                matchFilter[key.PropertyName] = key.ConditionValue
            }

        }


    }
    matchData.push(matchFilter)
    //console.log(matchFilter)
    var chartFields = req.body.chartFields
    var temp = {};

    var SumBy = req.body.chartFields[1];
    temp[chartFields[0]] = "$" + chartFields[0]
    if (chartFields.length > 2) {
        temp[chartFields[2]] = "$" + chartFields[2]
    }

    if (req.body.hasOwnProperty('summaryFields')) {
        var summaryByFields = req.body.summaryFields;
        for (var i = 0; i < summaryByFields.length; i++) {
            temp[summaryByFields[i]] = "$" + summaryByFields[i]
        }

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
    //console.log(matchData)
    var label, volume;
    if ((req.body.chartFields[0] == 'OemName')) {
        label = { $first: "$docs.OEMGeneric" };

    } else {
        label = { $first: "$" + req.body.chartFields[0] };

    }
    if ((req.body.chartFields[2] == 'OemName')) {
        volume = { $first: "$docs.OEMGeneric" }
    } else {
        volume = { $first: "$" + req.body.chartFields[2] }
    }
    var aggregareQuery = [
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
                label: label,
                volume: volume
            }
        }
    ]
    if ((req.body.chartFields[0] == 'OemName') || (req.body.chartFields[2] == 'OemName')) {
        var star = [{
            $lookup:
            {
                from: "OEMGeneric",
                localField: "OemName",
                foreignField: "OemName",
                as: "docs"
            }
        },
        { $unwind: "$docs" }]

        aggregareQuery.unshift(star[1])
        aggregareQuery.unshift(star[0])
        //  console.log(aggregareQuery)


    }
    //  else {
    //     label = { $first: "$" + req.body.chartFields[0] };
    //     volume = { $first: "$" + req.body.chartFields[2] }
    // }

    if (req.body.hasOwnProperty('userFilter')) {
        if (cloneOfRequest.hasOwnProperty('OemName')) {
            var checkOems = cloneOfRequest.OemName.indexOf(req.decoded.PartnerName);
            if (checkOems > -1) {
                cloneOfRequest.OemName[checkOems] = req.decoded.OEMGeneric;
            }
            console.log(cloneOfRequest.OemName)
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
                // $match:
                // {
                //     "docs.OEMGeneric": cloneOfRequest.OemName
                // }
                $match: {
                    $and: [
                        { "docs.OEMGeneric": { $in: cloneOfRequest.OemName } }]
                }
            }]

            aggregareQuery.unshift(star[2])
            aggregareQuery.unshift(star[1])
            aggregareQuery.unshift(star[0])
        }
    }
    // console.log(aggregareQuery)
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
                    var percentage = ((((docs[i].value) / GrantTotal)) * 100).toFixed(2);
                    if (!percentFilter) {
                        childLabel[docs[i].label] = [{ label: (docs[i].label), [docs[i].volume]: docs[i].value.toFixed(2), name: docs[i].volume, value: docs[i].value.toFixed(2), percentage: percentage }]
                    }
                    else {
                        if (percentage < percentFilter) {
                            childLabel[docs[i].label] = [{ label: (docs[i].label), [docs[i].volume]: docs[i].value.toFixed(2), name: docs[i].volume, value: docs[i].value.toFixed(2), percentage: percentage }]
                        }
                    }
                }
                else {

                    var percentage = ((((docs[i].value) / GrantTotal)) * 100).toFixed(2);
                    if (!percentFilter) {
                        childLabel[docs[i].label].push({ label: (docs[i].label), [docs[i].volume]: docs[i].value.toFixed(2), name: docs[i].volume, value: docs[i].value.toFixed(2), percentage: percentage })
                    } else {
                        if (percentage < percentFilter) {
                            childLabel[docs[i].label].push({ label: (docs[i].label), [docs[i].volume]: docs[i].value.toFixed(2), name: docs[i].volume, value: docs[i].value.toFixed(2), percentage: percentage })
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
                    var percent = ((((targetObj[property]) / GrantTotal)) * 100).toFixed(2);
                    if (!percentFilter) {
                        result.push({ label: property, value: targetObj[property].toFixed(2), percentage: (percent) })
                    }
                    else {
                        if (percent < percentFilter) {
                            result.push({ label: property, value: targetObj[property].toFixed(2), percentage: (percent) })
                        }
                    }

                }
            }
            if (chartFields.length > 2) {
                var text = [];
                var months = [];

                let formated = result.reduce(function (r, a) {
                    text.push(a.name)
                    months.push(a.label)
                    r[a.name] = r[a.name] || [];

                    r[a.name].push(a);

                    return r;
                }, Object.create(null));
                // console.log(formated)
                var missedElem = []
                var uniqueMonth = Array.from(new Set(months))
                var uniqueItems = Array.from(new Set(text))
                //console.log(uniqueItems)
                for (key in formated) {
                    if (formated[key].length != uniqueMonth.length) {
                        for (d of formated[key]) {
                            missedElem.push(d.label)
                        }
                        var respon = uniqueMonth.filter(function (n) { return !this.has(n) }, new Set(missedElem));
                        respon.map(function (des) {
                            //console.log(key)
                            var index = result.findIndex(x => x.label == des);
                            //  console.log(index)
                            result.splice(index, 0, { label: des, name: key, value: "0.00", percentage: "0.00" });

                        })
                    }

                }
            }

            if (req.body.hasOwnProperty('limit')) {

                result.sort((b, a) => parseFloat(a.value) - parseFloat(b.value));
                var finalResult = result.slice(0, req.body.limit);
                if (chartFields[0] == 'Month' || chartFields[0] == 'Month-YY') {
                    res.send(finalResult.reverse())
                }
                else if (chartFields[0] == 'OemName') {

                    var data = JSON.parse(JSON.stringify(result));
                    data.map((item, index) => {
                        if (item.label == req.decoded.OEMGeneric) {
                            item.label = req.decoded.PartnerName;
                            result.splice(index, 1)
                            result.unshift(item)
                            res.send(result)
                        } else {
                            res.send(result)
                        }
                    })

                }
                else {
                    res.send(finalResult)
                }

            }
            else {
                if (chartFields.length > 2) {
                    if (chartFields[2] == 'OemName') {
                        var data = JSON.parse(JSON.stringify(result));
                        var desData = []
                        result.map((item, index) => {
                            if (item.name == req.decoded.OEMGeneric) {
                                item.name = req.decoded.PartnerName;
                                desData.push(item)
                            } else {
                                desData.push(item)
                            }

                        })
                        if ((chartFields[0] == 'Month') || (chartFields[0] == 'Month-YY')) {
                            res.send(desData.reverse())
                        }
                        else if (chartFields[0] == 'OemName') {
                            var desData1 = []
                            var data = JSON.parse(JSON.stringify(desData));
                            data.map((item, index) => {
                                if (item.label == req.decoded.OEMGeneric) {
                                    item.label = req.decoded.PartnerName;
                                    desData1.push(item)
                                } else {
                                    desData1.push(item)
                                }
                            })
                            res.send(desData1)
                        }
                        else {
                            res.send(desData)
                        }

                    } else {

                        if ((chartFields[0] == 'Month') || (chartFields[0] == 'Month-YY')) {
                            res.send(result.reverse())
                        }
                        else if (chartFields[0] == 'OemName') {
                            var desData1 = []
                            var data = JSON.parse(JSON.stringify(result));
                            data.map((item, index) => {
                                if (item.label == req.decoded.OEMGeneric) {
                                    item.label = req.decoded.PartnerName;
                                    desData1.unshift(item)
                                } else {
                                    desData1.push(item)
                                }
                            })
                            res.send(desData1)
                        }
                        else {
                            res.send(result)
                        }
                    }

                   
                } else {
                    
                    if (chartFields[0] == 'Month') {
                        res.send(result.reverse())
                    }
                    else if (chartFields[0] == 'Month-YY') {
                        res.send(result.reverse())
                    }
                    else if (chartFields[0] == 'OemName') {
                       
                        var data = JSON.parse(JSON.stringify(result));
                        data.map((item, index) => {
                            if (item.label == req.decoded.OEMGeneric) {
                                item.label = req.decoded.PartnerName;
                                result.splice(index, 1)
                                result.unshift(item)
                                res.send(result)
                            } else {
                                if(index == (data.length-1)){
                                    res.send(result)
                                }
                               
                            }
                        })

                    }
                    else {
                        res.send(result)
                    }
                }




            }
        }
        else {
            res.status(404).send({ "message": "No data found" });
        }
    })
}



module.exports = router;



// [ {$lookup:
//     {
//       from: "OEMGeneric",
//       localField: "OemName",
//       foreignField: "OemName",
//       as: "docs"
//     }
//   },
//    {$unwind:"$docs"},
//   {$match: 
//     {
//       "docs.OEMGeneric": OemTest
//     }
// }]