// Load dependencies
var express = require('express');
var exphbs  = require('express-handlebars');
var bodyParser = require('body-parser');

// Load configuration from .env file
require('dotenv').config();

// Load and initialize MesageBird SDK
var messagebird = require('messagebird')(process.env.MESSAGEBIRD_API_KEY);

// Set up and configure the Express framework
var app = express();
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use(bodyParser.urlencoded({ extended : true }));

// Render landing page
app.get('/', function(req, res) {
    res.render('landing');
});

// Handle callback request
app.post('/callme', function(req, res) {
    // Check if user has provided input for all form fields
    if (!req.body.name || !req.body.number
        || req.body.name == '' || req.body.number == '') {
            // If not, show an error
            res.render('landing', {
                error : "Please fill all required fields!",
                name : req.body.name,
                number: req.body.number,
            });
            return;
    }

    // Choose one of the sales agent numbers randomly
    // a) Convert comma-separated values to array
    var numbers = process.env.SALES_AGENT_NUMBERS.split(',');
    // b) Random number between 0 and (number count - 1)
    var randomIndex = Math.floor((Math.random() * numbers.length) + 1) - 1;
    // c) Pick number
    var recipient = numbers[randomIndex];
    
    // Send lead message with MessageBird API
    messagebird.messages.create({
        originator : process.env.MESSAGEBIRD_ORIGINATOR,
        recipients : [ recipient ],
        body : "You have a new lead: " + req.body.name + ". Call them at " + req.body.number
    }, function (err, response) {
        if (err) {
            // Message could not be sent
            console.log(err);
            res.render('landing', {
                error : "An error occurred while requesting a callback!",
                name : req.body.name,
                number: req.body.number,
            });
        } else {
            // Message was sent successfully
            console.log(response);
            res.render('sent');
        }
    });
});

// Start the application
app.listen(8080);