var Haml  = require('haml'), fs = require('fs');

function render(str){

}
var fs = require('fs');
var empty = /^(?!\s*$).+/;
function render(file, options, cb) {
    content(file, function(err, data){
        if (err) return cb(err);
        var tmpl = Haml.render(data, options);
        cb(null, tmpl);
    })
}
function content(file, cb) {
    fs.readFile(file, 'utf-8', function (err, data) {
        if (err) return cb(err, null);
        cb(null, data.split('\n'));
    });
}



module.exports = {
    render:render,
    content:content
}