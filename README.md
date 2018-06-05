# Instant Lead Alerts
### ⏱ 15 min build time

Even though a lot of business transactions happen on the web, from both a business and user perspective, it's still often preferred to switch the channel and talk on the phone. Especially when it comes to high-value transactions in industries such as real estate or mobility, personal contact is essential.

One way to streamline this workflow is by building callback forms onto your website. Through these forms, customers can enter their contact details and receive a call to their phone, thus skipping queues where prospective leads need to stay on hold. 

Callback requests reflect a high level of purchase intent and should be dealt with as soon as possible to increase the chance of converting a lead. Therefore it's paramount to get them pushed to a sales agent as quickly as possible. SMS messaging has proven to be one of the most instant and effective channels for this use case.

In this tutorial, we'll show you how to implement a callback form on a NodeJS-based website with SMS integration powered by MessageBird for a fictitious car dealership named M.B. Cars.

## Getting Started

You need to have Node and npm installed on your machine to run the sample application, which can be downloaded [here](https://www.npmjs.com/get-npm).

The source code is available [in a GitHub repository](https://github.com/messagebirdguides/lead-alerts-guide) from which it can be cloned or downloaded into your development environment.

After saving the code, open a console for the download directory and run the following command, which downloads the Express framework, MessageBird SDK and other dependencies defined in the `package.json` file:

````bash
npm install
````

## Configuring the MessageBird SDK

The MessageBird SDK is used to send messages. It's added as a dependency and loaded with the following lines in `index.js`:

````javascript
// Load and initialize MesageBird SDK
var messagebird = require('messagebird')(process.env.MESSAGEBIRD_API_KEY);
````

You need an API key, which you can retrieve from [the MessageBird dashboard](https://dashboard.messagebird.com/en/developers/access). As you can see in the code example above, the key is set as a parameter when including the SDK, and it's loaded from an environment variable called MESSAGEBIRD_API_KEY. With [dotenv](https://www.npmjs.com/package/dotenv) you can define these variables in a `.env` file.

The repository contains an `env.example` file which you can copy to `.env` and then enter your information.

Apart from the API key, we also specify the originator, which is what is displayed as the sender of the messages. Please note that alphanumeric sender IDs like the one in our example file don't work in all countries, most importantly, they don't work in the United States. If you can't use alphanumeric IDs, use a real phone number instead.

Additionally, we specify the sales agent's telephone numbers. These are the recipients that will receive the SMS alerts when a potential customer submits the callback form. You can separate multiple numbers with commas.

Here's an example of a valid `.env` file for our sample application:

````env
MESSAGEBIRD_API_KEY=YOUR-API-KEY
MESSAGEBIRD_ORIGINATOR=MBCarsWebsite
SALES_AGENT_NUMBERS=+31970XXXXXXX,+31970YYYYYYY
````

## Showing a Landing Page

The landing page is a simple HTML page with information about our company, a call to action and a form with two input fields, name and number, and a submit button. We use Handlebars templates so we can compose the view with a layout and have the ability to show dynamic content. You can see the landing page in the file `views/landing.handlebars`, which extends the layout stored in `views/layouts/main.handlebars`. The `app.get('/')` route in `index.js` is responsible for rendering it.

## Handling Callback Requests

When the user submits the form, the `app.post('/callme')` route receives their name and number. First, we do some input validation:

````javascript
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
````

Then, we define where to send the message. As you've seen above, we specified multiple recipient numbers in the SALES_AGENT_NUMBERS environment variable. M.B. Cars have decided to randomly distribute incoming calls to their staff so that every salesperson receives roughly the same amount of leads. Here's the code for the random distribution:

````javascript
    // Choose one of the sales agent numbers randomly
    // a) Convert comma-separated values to array
    var numbers = process.env.SALES_AGENT_NUMBERS.split(',');
    // b) Random number between 0 and (number count - 1)
    var randomIndex = Math.floor((Math.random() * numbers.length) + 1) - 1;
    // c) Pick number
    var recipient = numbers[randomIndex];
````

Now we can formulate a message for the agent and send it through the MessageBird SDK using the `messagebird.messages.create()` method:

````javascript
    // Send lead message with MessageBird API
    messagebird.messages.create({
        originator : process.env.MESSAGEBIRD_ORIGINATOR,
        recipients : [ recipient ],
        body : "You have a new lead: " + req.body.name + ". Call them at " + req.body.number
    }, function (err, response) {
        // ...
````

There are three parameters:
- `originator`: The sender ID comes from the environment variable defined earlier.
- `recipients`: The API supports an array of recipients; we're sending to only one but this parameter is still specified as an array.
- `body`: The text of the message that includes the input from the form.

The API request is asynchronous and executes a callback function once it's complete. Inside this function, we handle the error case by showing the previous form again and inform the user that something went wrong. In the success case, we show a basic confirmation page which you can see in `views/sent.handlebars`. In both cases there's also a `console.log()` statement that sends the API response to the console for debugging. This is the callback function:

````javascript
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
````

## Testing the Application

Have you created your `.env` file with a working key and added one more phone number to the existing phone numbers, as explained above in _Configuring the MessageBird SDK_, to receive the lead alert? Awesome!

Now run the following command from your console:

````bash
npm start
````

Go to http://localhost:8080/ to see the form and request a lead!

## Nice work!

You've just learned how to send instant lead alert messages with MessageBird!

## Next steps
Want to build something similar but not quite sure how to get started? Please feel free to let us know at support@messagebird.com, we'd love to help!
