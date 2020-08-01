var express = require('express');
var router = express.Router();
var amqp = require('amqplib/callback_api');
//var JSON=require('JSON');

/* GET home page. */
router.get('/', function(req, res, next) {
  var input = [
    req.query.funds, // a number
    req.query.query
  ]
  res.render('optimization', {title: 'Express',
  query_value:"SELECT MIN(t.title) AS movie_title\n\
  FROM keyword AS k,\n\
       movie_info AS mi,\n\
       movie_keyword AS mk,\n\
       title AS t\n\
  WHERE k.keyword LIKE '%sequel%'\n\
    AND mi.info IN ('Sweden',\n\
                    'Norway',\n\
                    'Germany',\n\
                    'Denmark',\n\
                    'Swedish',\n\
                    'Denish',\n\
                    'Norwegian',\n\
                    'German')\n\
    AND t.production_year > 2005\n\
    AND t.id = mi.movie_id\n\
    AND t.id = mk.movie_id\n\
    AND mk.movie_id = mi.movie_id\n\
    AND k.id = mk.keyword_id;",

  ori_runtime:604.13,
  opt_runtime:497.89,
  rewritten_query_value:"SELECT MIN(t.title) AS movie_title\nFROM mv8 AS mv8,\n    keyword AS k,\n     movie_keyword AS mk,\n     title AS t\nWHERE k.keyword LIKE '%sequel%'\n  AND mv8.info IN ('Sweden',\n                  'Norway',\n                  'Germany',\n                  'Denmark',\n                  'Swedish',\n                  'Denish',\n                  'Norwegian',\n                  'German')\n  AND t.production_year > 2005\n  AND t.id = mv8.movie_id\n  AND t.id = mk.movie_id\n  AND mk.movie_id = mv8.movie_id\n  AND k.id = mk.keyword_id;",
  result_value:"2 Days in New York"



});

  // amqp.connect('amqp://localhost', function (err, conn) {
  //   conn.createChannel(function (err, ch) {
  //     var simulations = 'simulations';
  //     ch.assertQueue(simulations, { durable: false });
  //     var results = 'results';
  //     ch.assertQueue(results, { durable: false });
  //     ch.sendToQueue(simulations, new Buffer(JSON.stringify(input)));
  //     ch.consume(results, function (msg) {
  //       //res.send(msg.content.toString())
  //       var resu=JSON.parse(msg.content.toString());
  //       //var resu="222";
  //       res.render('optimization', resu);
  //     }, { noAck: true });
  //   });
  //   setTimeout(function () { conn.close(); }, 500); 
  //   });
 //res.render('optimization', { title: 'Express',
    //funds:req.query.funds});
});

module.exports = router;
