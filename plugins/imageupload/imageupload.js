var Plugin = require('../../lib/plugin-api'),
    static = require('connect/lib/middleware/static'),
    ImageInfo = require('./ImageInfo'),
    fs = require('fs-extra'),
    path = require('path'),
    util = require('util'),
    _u = require('underscore'),
    imageMagick = require('imagemagick'),
    mongoose = require('mongoose')
    ;
var ImageUploadPlugin = module.exports = function () {
    Plugin.apply(this, arguments);
}
util.inherits(ImageUploadPlugin, Plugin);
ImageUploadPlugin.prototype.editorFor = function (p, property, Model) {
    var apiPath = this.options.apiUri || this.baseUrl + 'rest/';
    var isArray = property instanceof Array;
    var ret = {
        type:'ImageUpload',
        multiple:isArray
    }

    var ref = isArray ? property.length ? property[0] : null : property;
    if (ref.ref && mongoose.modelSchemas[ref.ref] == ImageInfo){
        ret.url = apiPath+ref.ref;
        return ret;
    }
    if (ref == ImageInfo){
        return ret;
    }

}


ImageUploadPlugin.prototype.editors = function () {
    return ['ImageUpload']
}
var options = {
    safeFileTypes:/\.(gif|jpe?g|png)$/i,
    imageTypes:/\.(gif|jpe?g|png)$/i,
    imageVersions:{
        'thumbnail':{
            width:80,
            height:80
        }
    }
};
ImageUploadPlugin.prototype.routes = function () {

    var dir = path.dirname(module.filename);

    var fullDir = dir + '/public/images/full/';
    if (!fs.existsSync(fullDir)) {
        fs.mkdirSync(fullDir)
    }

    //   this.app.get(this.baseUrl+'js/libs/editors/image-uploader.js', static(dir+'/public'));
    this.app.del(this.pluginUrl + '/:id', function (req, res, next) {
        var id = req.params.id;
        if (id) {
            ['full'].concat(Object.keys(options.imageVersions)).forEach(function (k) {
                var img = dir + '/public/images/' + k + '/' + id;
                if (fs.existsSync(img)) {
                    fs.unlinkSync(img);
                }
            })
            res.send('');
        }
    });

    this.app.get(this.pluginUrl, function (req, res, next) {
        res.redirect(this.pluginUrl + '/index.html');
    });

    this.app.get(this.pluginUrl + '/images/:version/:id.:format?', function (req, res, next) {
        var version = req.params.version;
        var id = req.params.id;
        var type = req.params.format || 'jpeg';
        console.log('params', version, id);
        var opts = options.imageVersions[version];

        if (!(opts && id))
            return next();                                              //error

        req.url = '/images/' + version + '/' + id;

        res.setHeader('Content-Type', 'image/' + type)
        var destDir = dir + '/public/images/' + version;

        if (fs.existsSync(destDir + '/' + id) || !fs.existsSync(fullDir + id)) { //already exists.
            return next();
        }

        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir);
        }
        imageMagick.resize({
            width:opts.width,
            height:opts.height,
            srcPath:fullDir + id,
            dstPath:destDir + '/' + id
        }, next);


    }.bind(this),
        static(dir + '/public')
    );
    //, static(dir+'/public'));
//    _u.each(options.imageVersions, function(v,k){
//           this.get(this.pluginUrl+k, function(){
//
//           });
//    }, this);
    var pluginUrl = this.pluginUrl;
    this.app.post(this.pluginUrl, function (req, res, next) {
        var counter = 0;
        var infos = [];
        //  console.log('files', req.files);
        var files = _u.flatten(req.files);
        var doStuff = function (err) {
            if (err)
                next(err);
            if (!files.length)
                return res.send(infos);

            var f = files.shift();
            var types = f.type.split('/');
            var type = types.length > 1 ? types[1] : types[0];
            var name = path.basename(f.path);
            var obj = {
                name:f.name,
                size:f.size,
                type:f.type,
                fileId:name,
                url:pluginUrl + '/images/full/' + name + '.' + type,
                delete_url:pluginUrl + '/' + name,
                delete_type:'DELETE'
            };

            _u.each(Object.keys(options.imageVersions), function (k) {
                obj[k + '_url'] = pluginUrl + '/images/' + k + '/' + name + '.' + type;
            })

            infos.push(obj);
            fs.copy(f.path, dir + '/public/images/full/' + name, doStuff)

        };
        doStuff();


    }.bind(this));
    Plugin.prototype.routes.apply(this, arguments);
}