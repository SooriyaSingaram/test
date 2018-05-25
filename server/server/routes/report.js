var Report = require('../models/reports'),
commonService = require('../utilities/helper'),
router = require('express').Router();

router.route('/').post(addReport)

function addReport(req,res){
    var reports =new Report(req.body);
    Report.count({},function(err,count){
        reports.id = commonService.getModelId('FYR', count);
        reports.save(function(err,data){
            if(err){
                res.status(400).send(err)
                return;
            }else{
               res.send({message:"Financial Year Report saved successfully."}) 
            }
        })
    })
    
}

module.exports =router;