/**
 * Module dependencies.
 */

require('bobamo/examples/model/User');
require('bobamo/examples/model/Group');
require('bobamo/examples/model/Employee');

var bobamo    = require('bobamo');



var app = bobamo.app({plugin:['session','imageupload','visualize'], uri:'mongodb://localhost/bobamo_development'});
app.get('/', function(req,res){ res.render('redir_index.html', {layout:false})});
app.listen(3001);
