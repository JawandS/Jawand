#!/usr/bin/env node

const express = require('express');
const app = express();
const port = 80;

//Loads the handlebars module
const { engine } = require('express-handlebars');
//Sets our app to use the handlebars engine
app.set('view engine', 'hbs');
//Sets handlebars configurations
app.engine('hbs', engine({
    layoutsDir: __dirname + '/views/layouts/',
    extname: 'hbs',
    partialsDir: __dirname + '/views/partials/' // insert partials with {{> partialName}} in html
}));

// use static files (css)
app.use(express.static(__dirname + '/public'))

// parse body of post req
var bodyParser = require('body-parser')
var urlencodedParser = bodyParser.urlencoded({ extended: false })

// setup openai
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    apiKey: process.env.OPENAI_KEY,
});
const openai = new OpenAIApi(configuration);

// cookies
var cookieParser = require('cookie-parser');
app.use(cookieParser());

// openai endpoint
app.post('/api/chatgpt', urlencodedParser, async (req, res) => {
    var standardQuery = { // standard query
        model: "davinci",
        temperature: 0.5,
        max_tokens: 75,
        top_p: 1,
        frequency_penalty: 0.1,
        presence_penalty: 0.1,
    }
    standardQuery["prompt"] = req.body.prompt;

    openai.createCompletion(standardQuery).then(response => { // success
        res.cookie('prompt', standardQuery.prompt)
        res.cookie('response', response.data.choices[0].text)
        res.redirect('/')
        // res.json(response.data)
    }).catch(err => { // handle error
        console.log(err.message)
        res.send(err.message)
    });
});

// render namemate page
app.get('/namemate', [], (req, res) => {
    res.render('namemate', { layout: "nameLayout" })
});

// render main page
app.get('/', [], (req, res) => {
    var info = {
        prompt: req.cookies.prompt !== 'undefined' ? req.cookies.prompt : "no query",
        response: req.cookies.response !== 'undefined' ? req.cookies.response : "no response",
        layout: "index"
    }
    res.render('home', info);
});

app.listen(port, () => console.log(`App listening to port ${port}`));