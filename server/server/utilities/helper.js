var nodemailer = require('nodemailer');
var commonService = {
    getModelId: getModelId,
    sendMail: sendMail,
    sendAttachment: sendAttachment
}

//To get the model id using count of data in the collection and Model Key
function getModelId(modelKey, count) {
    var suffix = "000";
    count = count + 1;
    suffix = suffix.substring(0, suffix.length - count.toString().length) + count;
    return modelKey.concat(suffix);
}
/**
     * Mail Functionality
     * @param mailId - Email Id ,data -Mail text ,subject - Mail Subject ,cb -Callback return 
     */
function sendMail(mailId, subject, data, cb) {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'colan.onine.infotech@gmail.com',
            pass: 'infotech@123'
        }
    });

    var mailOptions = {
        from: 'colaninfotech@gmail.com',
        to: mailId,
        subject: subject,
        html: data
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            cb(false)
        } else {
            cb(true)
        }
    });
}

function sendAttachment(mailId, subject, data, cb) {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'colan.onine.infotech@gmail.com',
            pass: 'infotech@123'
        }
    });


    var mailOptions = {
        from: 'colaninfotech@gmail.com',
        to: mailId,
        subject: subject,
        attachments: [{
            filename: subject,
            path: data,
            html:'<p>Please find the attachment</p>'
        }
        ]

    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            cb(false)
        } else {
            cb(true)
        }
    });
}
module.exports = commonService