var PluginApi = require('../../lib/plugin-api'),
    u = require('util'), maker = require('./makemarkdown'), _ = require('underscore');


var CsvPlugin = function () {
    PluginApi.apply(this, arguments);
    this.conf = {};
}
u.inherits(CsvPlugin, PluginApi);
CsvPlugin.prototype.appModel = function () {
    return {
        header:{
            'admin-menu':{
                'csvimport':{
                    label:'Import CSV',
                    href:'#csvimport/import'

                }
            }
        }
    }

}

CsvPlugin.prototype.import = function (Type, content, callback) {
    var i = 0, end = content.length - 1, errors = null, saved = [];
    _.each(content, function (c, k) {
        new Type(c).save(function (e, v) {
            i++;
            if (e) {
                (errors || (errors = [])).push(e)
            } else {
                saved[k] = c;
            }
            if (callback && i == end)
                callback(errors, saved);
        });
    })
}


CsvPlugin.prototype.routes = function () {


    this.app.post(this.pluginUrl + '/import', function (req, res, next) {

        maker.readCsv(require('fs').createReadStream(req.files.import.path), function (err, resp) {
            if (err)
                return res.send({
                    status:1,
                    errors:err
                })
            if (req.body.modelName) {
                var mongoose = this.options.mongoose;
                var Model = mongoose.model(req.body.modelName);

                if (req.body.empty) {
                    console.log('clearing model of type ' + req.body.modelName)
                    Model.remove({}, function (e) {
                        if (e != null)
                            return next(e);
                        this.import(Model, resp.content, function (e, p) {
                            res.send({
                                status:0,
                                payload:p,
                                errors:e
                            });
                        })
                    }.bind(this));
                } else {
                    this.import(Model, resp.content, function (e, p) {
                        res.send({
                            status:0,
                            payload:p,
                            errors:e
                        });
                    })
                }

            } else {

                resp.content.splice(10);
                resp.file = req.files.import.path.split('/').pop();
                res.send({
                    status:0,
                    payload:resp
                })
            }

        }.bind(this))
    }.bind(this));

    PluginApi.prototype.routes.apply(this);
}
module.exports = CsvPlugin;

