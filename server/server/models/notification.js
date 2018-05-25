var mongoose = require('mongoose');
var notificationSchema = mongoose.Schema({
    NotificationMsg: {
        type: String
    },
    UserId: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    },
    UserName: {
        type: String      
    },
    CreatedDate: {
        type: Date
    },
    UpdatedDate: {
        type: Date
    }
}, {
    collection: 'Notification'
});


module.exports = mongoose.model('Notification', notificationSchema);
module.exports.schema = notificationSchema;


// {
//     "_id":"5aa91c823f8cf7628d2a21b7",
//     "NotificationMsg":"HI",
//     "UserId":"5ac479c2490a393cac83d18f",
//     "UserName":"SuperAdmin",
//     "CreatedDate":"10\/31\/2017 6:30:00 PM",
//     "UpdatedDate":"10\/31\/2017 6:30:00 PM"
//   }