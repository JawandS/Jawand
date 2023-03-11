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
    layoutsDir: __dirname + '/views/layouts',
    extname: 'hbs',
    defaultLayout: 'index', // use index as layout by default
    partialsDir: __dirname + '/views/partials/' // insert partials with {{> partialName}} in html
}));

// use static files (css)
console.log(__dirname + '/public')
app.use(express.static(__dirname + '/public'))

// parse body of post req
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false })

// setup openai
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    apiKey: "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",
});
const openai = new OpenAIApi(configuration);


// request information
var info = {};

// openai endpoint
app.post('/api/chatgpt', urlencodedParser, async (req, res) => {
    var standardQuery = { // standard query
        model: "davinci",
        temperature: 0.5,
        max_tokens: 75,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    }
    standardQuery["prompt"] = req.body.prompt;
    console.log(req.body.prompt)

    openai.createCompletion(standardQuery).then(response => { // success
        const responseData = response.data;
        const generatedText = responseData.choices[0].text;
        info = {
            prompt: standardQuery.prompt,
            response: generatedText
        };
        res.redirect('/')
        // res.json(response.data)
    }).catch(err => { // handle error
        res.status(500)
        res.send("error!")
    });
});

// render main page
app.get('/', [], (req, res) => {
    res.render('main', info);
});

app.listen(port, () => console.log(`App listening to port ${port}`));