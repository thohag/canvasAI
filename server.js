const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({apiKey: process.env.OPENAI_API_KEY,});
const openai = new OpenAIApi(configuration);

app.use(express.static('public'));
app.use(bodyParser.json());

const systemMessage = {role: 'system', content: `You are an expert on using canvas with javascript.
You should only respond with javascript code, no explanations.
The user have created a canvas like this: 
<canvas id="canvas" width="800" height="800"></canvas>
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
`}

app.post('/data.json', (req, res) => {
    let msg = req.body.msg;
    let log = req.body.log;
    let settings = {model: "gpt-3.5-turbo",messages: []}
    console.log("Request:", msg)

    settings.messages.push(systemMessage)
    for (let l of log) {
        settings.messages.push(l);
    }
    settings.messages.push({role: 'user', content: msg})

    openai.createChatCompletion(settings).then(completion => {
        let result = {};
        result.status = "OK"
        result.response = completion.data.choices[0].message.content;
        res.send(JSON.stringify(result));
    }).catch(error => {
        let result = {}
        result.status = "ERROR"
        res.send(JSON.stringify(result));
    });
});


app.listen(port, () => {
  console.log(`Listening on port ${port}`)
});