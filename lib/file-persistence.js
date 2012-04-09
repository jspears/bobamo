var fs = require('fs'), path = require('path');


var FilePersistence = function (file) {

    this.filename = file || path.join(process.cwd, 'conf', 'bobamo.json');

}
module.exports = FilePersistence;

FilePersistence.prototype.save = function (key, data, callback) {
    var conf = this.read(this.filename);
    if (conf) {
        fs.renameSync(this.filename, this.filename + '.' + Date.now());
    } else {
        conf = {};
        var dir = path.dirname(this.filename);
        if (!path.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
    }
    (conf.plugins || (conf.plugins = {}))[key] = data;
    fs.writeFile(this.filename, JSON.stringify(conf), 'utf-8', callback);
}

FilePersistence.prototype.read = function (filename) {
    filename = filename+'';
    console.log('reading ', filename);
    if (path.existsSync(filename)) {
        var content = fs.readFileSync(filename);
        return JSON.parse(content);
    }
}
