var express = require('express');
var app = express();

var PORT = 3000;

app.use(express.static('phonegap_setup'));


app.get('/', function(req, res){
  res.send('hello world');
});


console.log('App listening on port: ' + PORT);
app.listen(PORT);
