// Server Configuration

const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const passport = require('passport');
const cors = require('cors');
const morgan = require('morgan')
const apiRoutes = express.Router();
const db = require('./database');
const multipart = require('connect-multiparty');

const app = express();
require('dotenv').config()
require('./server/config/passport');
var enableCORS = function (request, response, next) {
    response.header('Access-Control-Allow-Origin', request.headers.origin);
    response.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    response.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Date, X-Date');
    return next();
};

app.use(morgan('dev'))
app.use(cors());
app.use(enableCORS);
app.use(bodyParser.urlencoded({
    limit: '1000mb'
}));

app.use(bodyParser.json({
    limit: '1000mb'
}));

app.use(bodyParser.json({
    type: 'application/vnd.api+json'
}));

app.use(passport.initialize());
app.use(multipart());
// routes 
const user = require('./server/routes/user.js');
const profile = require('./server/routes/profile.js')
const organization = require('./server/routes/organization.js')
const chart = require('./server/routes/tblToner.js')
const role = require('./server/routes/role');
const DynamicWebCondition = require('./server/routes/DynamicWebCondition');
const subCondition = require('./server/routes/DynamicConditionSubFilter')
const report = require('./server/routes/report')
const template = require('./server/routes/template')
const notification = require('./server/routes/notification')
const User = require('./server/models/users')
//apply the routes to User Module
app.use('/user', user);

// route middleware to verify a token
apiRoutes.use(function (req, res, next) {

    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    if (token) {
        jwt.verify(token, process.env.SECRET_KEY, function (err, decoded) {
            if (err) {
                // console.log(err)
                return res.json({ message: 'Failed to authenticate token.' });
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });

    } else {
        // if there is no token return unauthorized error
        return res.status(403).send({
            message: 'Please send valid authentication token.'
        });

    }
});

app.use(express.static(__dirname));
apiRoutes.get('/checkAuthentication', function (req, res) {
    res.send({message:"valid"})
})
//apply the routes to Other Modules  
apiRoutes.use('/userProfile', profile);
apiRoutes.use('/organization', organization);
apiRoutes.use('/chart', chart)
apiRoutes.use('/role', role)
apiRoutes.use('/webCondition', DynamicWebCondition)
apiRoutes.use('/webConditionSubFilter', subCondition)
apiRoutes.use('/report', report)
apiRoutes.use('/template', template)
apiRoutes.use('/notification', notification)

// apply the routes to our application with the prefix /api

app.use('/api', apiRoutes);

module.exports = app;


//app.listen(5000)
app.listen(process.env.SERVER_PORT, function() { //Port to access
    User.findOne({
        emailId: "admin@gmail.com"
    }, function(err, user) { // adding super admin in intial while system start
        if (!err && user === null) {
            var superAdmin = new User();
            superAdmin.emailId = "admin@gmail.com";
            superAdmin.userName = "SuperAdmin";
            superAdmin.setPassword("admin123");
            superAdmin.role = "Super Admin";
            superAdmin.save({ validateBeforeSave: false})
        }
    })
});

  console.log('Server running at http://127.0.0.1:' + process.env.SERVER_PORT);
//console.log('Server running at http://127.0.0.1:' + 5000);
