/**
 * Module dependencies.
 */

//require('bobamo/examples/model/Employee');

var bobamo    = require('bobamo'), mongoose= bobamo.mongoose;
//require('bobamo/examples/model/User');
//require('bobamo/examples/model/Group');

var app = bobamo.app({
    //uri:'mongodb://localhost/bobamo_development',
    plugin:['jsonschema','markdown', 'csvimport','renderer']});

app.get('/', function(req,res){ res.render('redir_index.html', {layout:false})});
app.listen(3001);
console.log('listening on 3001');
