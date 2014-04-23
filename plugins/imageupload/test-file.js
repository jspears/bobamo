var mongoose= require('../../index').mongoose;
var File = require('./mongoose-file');

var StuffSchema = new mongoose.Schema({
    name:String,
    file:{type:'File'},
    files:[File]
})
mongoose.connect('mongodb://localhost/filetest');

var Stuff = mongoose.model('stuff', StuffSchema);

var b = new Stuff({name:'test', file:{path:'/Users/jspears/stuff/bobamo/plugins/imageupload/public/img/loading.gif'}})//, files:[{name:'st', size:10}]});

b.save(function(e,o){ console.log('done',e,o)

    Stuff.findOne({_id:o._id}, function(e,o){
        console.log('found', o.file);

    })

});