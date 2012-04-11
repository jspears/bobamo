var fs = require('fs'), path = require('path'), crypto = require('crypto');


var FilePersistence = function (file) {

    this.filename = file || path.join(process.cwd, 'conf', 'bobamo.json');

}
module.exports = FilePersistence;

FilePersistence.prototype.save = function (key, data, callback) {
    var conf = this.read(this.filename);
    var now = Date.now();
    if (conf) {
        fs.renameSync(this.filename, this.filename + '.' + now);
    } else {
        conf = {};
        var dir = path.dirname(this.filename);
        if (!path.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
    }
    (conf.plugins || (conf.plugins = {}))[key] = data;
    var conf_str = JSON.stringify(conf);
    var sha = crypto.createHash('sha1').update(conf_str).digest('base64');

    fs.writeFile(this.filename, conf_str, 'utf-8', function(err, stuff){
        if (err){
            fs.renameSync(this.filename+'.'+now, this.filename);
        }
        callback(err, {_id:sha, timestamp:now});
    }.bind(this));
}
FilePersistence.prototype.list = function(callback){
    fs.readdir(path.dirname(this.filename), callback);
}

FilePersistence.prototype.read = function (filename) {
    filename = filename+'';
    console.log('reading ', filename);
    if (path.existsSync(filename)) {
        var content = fs.readFileSync(filename);
        return JSON.parse(content);
    }
}
