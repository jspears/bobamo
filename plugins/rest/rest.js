var Plugin = require('../../lib/plugin-api'), util = require('../../lib/util'), _u = require('underscore'), mutil = require('mers/lib/util');
var RestPlugin = function () {
    Plugin.apply(this, arguments);
    if (!this.options.apiUrl)
        this.options.apiUrl = this.baseUrl+'rest';
}
util.inherits(RestPlugin, Plugin);
RestPlugin.prototype.filters = function(){
    this.app.all(this.options.apiUrl+'/*', function (req, res, next) {
        req.query.transform = mutil.split(req.query.transform, ',', ['_idToId']);
        next();
    });

}
RestPlugin.prototype.routes = function () {
    var options = this.options;
    var pluginManager = this.pluginManager;
    var mers = options.mers || require('mers');
    this.app.use(options.apiUrl , mers(_u.extend({}, options, {
        transformers:{
            labelval:function (m) {
                var model = pluginManager.appModel.modelFor(m.modelName);
                var labelAttr = model && model.labelAttr;
                return function (obj) {
                    return {
                        val:obj._id || obj.id,
                        label:labelAttr && obj[labelAttr] ? obj[labelAttr] : m.modelName + '[' + (obj.id || obj._id) + ']'
                    }
                }
            },
            _idToId:function (M) {
                return function (obj) {
                    if (!obj) return null;
                    var o = obj.toObject ? obj.toObject() : obj;
                    o.id = obj._id;
                    delete o._id;
                    delete o.id_;
                    delete o.managerId_;
                    if (M && M.modelName == 'user')
                        o.password = '';
                    var manager = obj.manager;
                    o.managerFirstName = manager ? manager.firstName : '';
                    o.managerLastName = manager ? manager.lastName : '';
                    o.managerId = manager && manager._id ? manager._id.toString() : manager || '';
                    delete o.reports;
                    delete o.manager;
                    return o;
                }
            }
        }
    })).rest());
}
module.exports = RestPlugin;