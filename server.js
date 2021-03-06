 /******************************************************
 * PLEASE DO NOT EDIT THIS FILE
 * the verification process may break
 * ***************************************************/

'use strict';
var ShortUrlModel= require('./model/shorturl.js');
var mongoose = require('mongoose');
mongoose.connect('mongodb://root:phamphuquoc1@ds113935.mlab.com:13935/shorturl');
var db = mongoose.connecetion;
var fs = require('fs');
var express = require('express');
var app = express();


if (!process.env.DISABLE_XORIGIN) {
  app.use(function(req, res, next) {
    var allowedOrigins = ['https://narrow-plane.gomix.me', 'https://www.freecodecamp.com'];
    var origin = req.headers.origin || '*';
    if(!process.env.XORIG_RESTRICT || allowedOrigins.indexOf(origin) > -1){
         console.log(origin);
         res.setHeader('Access-Control-Allow-Origin', origin);
         res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    }
    next();
  });
}

app.use('/public', express.static(process.cwd() + '/public'));

app.route('/_api/package.json')
  .get(function(req, res, next) {
    console.log('requested');
    fs.readFile(__dirname + '/package.json', function(err, data) {
      if(err) return next(err);
      res.type('txt').send(data.toString());
    });
  });
  
app.route('/')
    .get(function(req, res) {
		  res.send(req.url).sendFile(process.cwd() + '/views/index.html');
    })
app.route('/(\\d+)')
    .get(function(req, res) {
      var regex = /\/(.*)/g;
      var m = regex.exec(req.url);
      ShortUrlModel.find({'shorturl':m[1]},
            function(err, docs)
            {  
              if(err)
              {
                res.send(500,'Internal error');  
              }
              else
              {
                if(docs.length >= 1)
                {
                  res.redirect(docs[0].url);
                }
                else
                  res.send(200,'Not found');
              }
            });
              
})
app.route('/new/*')
    .get(function(req, res) {
      var regex = /\/new\/(.*)/g;
      var m = regex.exec(req.url);
      var count;
      ShortUrlModel.find({'url':m[1]},
        function(err, docs)
        {
          if(err)
            res.send(500,'Internal error');
          else
          {
            if(docs.length <= 0)
            {
              ShortUrlModel.count({},
                function(err, count){
                  var urlmodel = new ShortUrlModel({url:m[1],shorturl:count+1})
                    urlmodel.save(function(err) {
                      if (!err) {
                        return res.send(JSON.stringify({original_url: m[1],short_url:'https://shortenurl.glitch.me/'+JSON.stringify(count)}));
                      } else {
                        return res.send(500,err);
                      }
                    });
              })
            }
            else
              return res.send(JSON.stringify({original_url: docs[0].url,short_url:'https://shortenurl.glitch.me/'+docs[0].shorturl}));
          }

        });


     
})

// Respond not found to all the wrong routes
app.use(function(req, res, next){
  res.status(404);
  res.type('txt').send('Not found');
});

// Error Middleware
app.use(function(err, req, res, next) {
  if(err) {
    res.status(err.status || 500)
      .type('txt')
      .send(err.message || 'SERVER ERROR');
  }  
})

app.listen(process.env.PORT, function () {
  console.log('Node.js listening ...');
});

