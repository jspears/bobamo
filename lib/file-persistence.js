var fs = require('fs'), path = require('path'), crypto = require('crypto'), J=require('./stringify');


var FilePersistence = function (file) {

    this.filename = file || path.join(process.cwd, 'conf', 'bobamo.json');

}
module.exports = FilePersistence;


FilePersistence.prototype.saveAll = function(conf, callback){
    var gconf = this.read(this.filename);
    var now = Date.now();
    if (gconf) {
        fs.renameSync(this.filename, this.filename + '.' + now);
    } else {
        var dir = path.dirname(this.filename);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
    }
    if (!gconf) gconf = {};
    if (!gconf.plugins) gconf.plugins = {};
    var aconf = (gconf.plugins.appeditor || (gconf.plugins.appeditor = {}));

    if (aconf.modified)
        (aconf.last_modified ||(aconf.last_modified =  [])).push(gconf.modified )
    aconf.modified = new Date(now);

    Object.keys(conf).forEach(function(k){
        if (conf[k])
            this[k] = conf[k];
        else
            delete this[k];
    }, gconf.plugins);
    var sha = crypto.createHash('sha1').update(J.stringify(gconf,  3)).digest('base64');

    fs.writeFile(this.filename, J.stringify(gconf,  3), 'utf-8', function(err, stuff){
        if (err){
            fs.renameSync(this.filename+'.'+now, this.filename);
        }
        callback(err, {_id:sha, timestamp:now});
    }.bind(this));

}
FilePersistence.prototype.save = function (key, data, callback) {
    var conf = {};
    conf[key] = data;
    this.saveAll(conf, callback);
}
FilePersistence.prototype.list = function(callback){
    fs.readdir(path.dirname(this.filename), callback);
}

FilePersistence.prototype.read = function (filename) {
    filename = filename+'';
    console.log('reading ', filename);
    if (fs.existsSync(filename)) {
        var content = fs.readFileSync(filename);
        return JSON.parse(content);
    }
}
