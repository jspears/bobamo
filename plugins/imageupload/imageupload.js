var Plugin = require('../../lib/plugin-api'), static = require('connect/lib/middleware/static'), fs = require('fs-extra'), path = require('path'), util = require('util'), path = require('path'), static = require('connect/lib/middleware/static'), _u = require('underscore'), imageMagick = require('imagemagick');
var ImageUploadPlugin = module.exports = function () {
    Plugin.apply(this, arguments);
}
util.inherits(ImageUploadPlugin, Plugin);

ImageUploadPlugin.prototype.editors = function () {
    return ['Image']
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
ImageUploadPlugin.prototype.filters = function () {
    var dir = path.dirname(module.filename);

    var fullDir =dir + '/public/images/full/';
    if (!fs.existsSync(fullDir)){
              fs.mkdirSync(fullDir)
    }
    this.app.get(this.pluginUrl, function (res, res, next) {
        res.send('<form method="post" enctype="multipart/form-data">'
            + '<p>Title: <input type="text" name="title" /></p>'
            + '<p>Image: <input type="file" name="image" /></p>'
            + '<p><input type="submit" value="Upload" /></p>'
            + '</form>');
    })
    this.app.get(this.pluginUrl + '/images/:version/:id', function (req, res, next) {
        var version = req.params.version;
        var id = req.params.id;
        console.log('params', version,id);
        var opts = options.imageVersions[version];

        if (!(opts && id))
            return next();

        var destDir = dir + '/public/images/' + version;

        if (fs.existsSync(destDir + '/' + id) || !fs.existsSync(fullDir + id)) {
            return next();
        }

        if (!fs.existsSync(destDir)){
            fs.mkdirSync(destDir);
        }
        imageMagick.resize({
            width:opts.width,
            height:opts.height,
            srcPath:fullDir + id,
            dstPath:destDir + '/' + id
        }, next);


    }, function(req,res,next){
              req.url = req.url.substring(this.pluginUrl.length);
            next();
    }.bind(this)
        ,
        static(dir+'/public')
    );
        //, static(dir+'/public'));
//    _u.each(options.imageVersions, function(v,k){
//           this.get(this.pluginUrl+k, function(){
//
//           });
//    }, this);
    this.app.post(this.pluginUrl, function (req, res, next) {
        var counter = 0;
        var infos = [];
      //  console.log('files', req.files);
        var files = _u.values(req.files);
        var doStuff = function (err) {
            if (err)
                next(err);
            if (!files.length)
                return res.send(infos);

            var f = files.shift();
            var name =  path.basename(f.path);
            infos.push({
                name:name,
                size:f.size,
                type:f.type
            })
            fs.copy(f.path, dir + '/public/images/full/'+name, doStuff)
        };
        doStuff();


    });
}