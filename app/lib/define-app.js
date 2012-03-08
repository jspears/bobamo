var mongoose = require('mongoose'), factory = require('display-factory'), u = require('underscore'), app = require('app-model');


MongooseBuilder = function (opts, schemas) {
    var models = this.loadDir('../model');
    this.application = new app.Application(opts);
    u.each(models.modelSchemas, this.loadSchema, this);

}
MongooseBuilder.prototype.loadSchema = function(schema, path){
    var model = this.application.schema[path] = new app.Model(schema);
    schema.eachPath(function(m, p){

    });
}
MongooseBuilder.prototype.loadDir = function loadDir(dir) {
    var loaded = {};
    var jsRe = /\.js$/;
    fs.readdirSync(dir).forEach(function (file) {
        var fPath = [dir, file].join('/');
        var stat = fs.statSync(fPath);
        if (stat.isFile() && jsRe.test(file)) {
            file = file.replace(jsRe, '');
            fPath = fPath.replace(jsRe, '');
            console.log('loading ', fPath, 'as', file);
            try {
                loaded[file] = require(fPath);
            } catch (e) {
                console.error('Error loading [' + fPath + '] ', e);
            }
        }
    });
    return loaded;
}