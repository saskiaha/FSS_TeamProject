"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var platform_browser_dynamic_1 = require("@angular/platform-browser-dynamic");
var app_module_1 = require("./app/app.module");
var environment_1 = require("./environments/environment");
if (environment_1.environment.production) {
    core_1.enableProdMode();
}
platform_browser_dynamic_1.platformBrowserDynamic().bootstrapModule(app_module_1.AppModule)
    .catch(function (err) { return console.error(err); });
//# sourceMappingURL=main.js.map
/*
const express = require('express')
const https = require('https')
const http = require('http');
const app = express()
var db = require("./db/database.js")
const fs = require('fs')

const path = require('path')

app.use(express.static(path.join(__dirname, 'public')));

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/', function (req, res) {

  res.sendFile('index.html', { root: __dirname })
});

app.post("/api/interaction/", (req, res, next) => {
  var errors = []

  if (errors.length) {
    res.status(400).json({ "error": errors.join(",") });
    return;
  }
  var data = {
    userID: req.body.userID,
    treatment: req.body.commentID,
    task: req.body.task,
    time: req.body.time,
    type: req.body.type,
    parameters: req.body.parameters
  }
  var sql = 'INSERT INTO interaction (userID, treatment, task, time, type, parameters) VALUES (?,?,?,?,?,?)'
  var params = [data.userID, data.treatment, data.task, data.time, data.type, data.parameters]
  db.run(sql, params, function (err, data) {
    if (err) {
      res.status(400).json({ "error": err.message })
      return;
    }
    res.json({
      "message": "success",
      "data": data,
    })
  });
})

https
  .createServer(
    {
      key: fs.reInspector ToolileSync('../../etc/letsencrypt/live/feeasy.org/privkey.pem', 'utf8'),
      cert: fs.reInspector ToolileSync('../../etc/letsencrypt/live/feeasy.org/cert.pem', 'utf8'),
      ca: fs.reInspector ToolileSync('../../etc/letsencrypt/live/feeasy.org/chain.pem', 'utf8')
    },
    app
  )
  .listen(443, () => {
    console.log('Listening...')
  });

http.createServer(app).listen(80);

*/
