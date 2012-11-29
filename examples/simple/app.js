/**
 * Module dependencies.
 */

//require('bobamo/examples/model/User');
//require('bobamo/examples/model/Group');
//require('bobamo/examples/model/Employee');

var bobamo    = require('bobamo'), mongoose= bobamo.mongoose;

var JunkSchema = new mongoose.Schema({
//    name:String,
//    date:Date,
//    dateT:{
//        type:Date,
//        display:{display:'none'}
//    },
//    number:Number,
//    numberT:{
//        type:Number,
//        min:3,
//        max:100
//    },
//    meta:{
//        number:Number,
//        numberT:{
//            type:Number
//        }
//    },
//    bool:Boolean,
//    boolT:{
//        type:Boolean
//    },
    str:{
        type:String,
        min:5,
        max:10
    },
    arr:[{by:String, date:Date}]


})
mongoose.model('Junk', JunkSchema);



var app = bobamo.app({ uri:'mongodb://localhost/bobamo_development'});
app.get('/', function(req,res){ res.render('redir_index.html', {layout:false})});
app.listen(3001);
