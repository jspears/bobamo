var bobamo = require('../../index'),
    mongoose = bobamo.mongoose,
    Plugin = bobamo.PluginApi,
    ImageInfo = require('./ImageInfo'),
    fs = require('fs-extra'),
    path = require('path'),
    util = require('util'),
    _u = require('underscore'),
    im = require('imagemagick'),
    File = require('./mongoose-file'),
    Model = bobamo.DisplayModel
    ;


var options = {
    safeFileTypes: /\.(gif|jpe?g|png)$/i,
    imageTypes: /\.(gif|jpe?g|png)$/i,
    imageVersions: {
        'thumbnail': {
            width: 80,
            height: 80
        }
    },
    sizes: [
        {
            name: 'thumbnail',
            width: 80,
            height: 80,
            scale: 'Fit'
        }
    ],
    paths: {
        convert: '/usr/local/bin/convert',
        identify: '/usr/local/bin/identity'
    }
};
var ImageUploadPlugin = function () {
    Plugin.apply(this, arguments);

    this.defaults = options;
    var dir = process.cwd();
    if (!options.directory)
        options.directory = dir + '/public/images/';
    this.conf = { sizes: this.defaults.sizes }
};
util.inherits(ImageUploadPlugin, Plugin);
ImageUploadPlugin.prototype.editorFor = function (p, property, Model) {
    var apiPath = this.options.apiUri || this.baseUrl + 'rest/';
    var isArray = property instanceof Array;
    var ret = {
        type: 'ImageUpload',
        multiple: isArray
    }
    if (property && property.type === File) {
        ret.schemaType = p.schemaType;
        return ret;
    } else {
        var ref = isArray ? property.length ? property[0] : null : property;
        var type = ref.type || ref.options && ref.options.type;
        if (type === File)
            return ret;
        if (type === ImageInfo) {
            return ret;
        }
    }
}


ImageUploadPlugin.prototype.editors = function () {
    return [
        {
            types: ['Buffer', 'Image', 'File'],
            name: 'ImageUpload',
            defaults: {
                sizes: [
                    {name: 'thumbnail', width: 80, height: 80, scale: 'Fit'}
                ]
            },
            schema: {
                directory: {
                    type: 'Text',
                    placeholder: options.directory
                },
                safeFileTypes: {
                    type: 'Text',
                    title: 'Safe File Types',
                    help: 'Allowable file types',
                    placeholder: options.safeFileTypes + ''

                },
                sizes: {
                    type: 'List',
                    itemType: 'Object',
                    subSchema: {
                        name: {
                            type: 'Text',
                            help: 'The name of the size ie. thumbnail, profile, portrait'
                        },
                        width: {
                            type: 'Number',
                            help: 'Maximum width',
                            min: 1
                        },
                        height: {
                            type: 'Number',
                            help: 'Maximum height',
                            min: 1
                        },
                        gravity: {
                            type: 'Select',
                            options: 'Center, NorthWest, North, NorthEast, West, East, SouthWest, South, SouthEast'.split(/\s*,\s*/)
                        }
                    }
                }
            }
        }
    ]
}
ImageUploadPlugin.prototype.renderers = function () {
    return [
        {
            name: 'ImageUpload',
            types: ['File', 'ImageUpload'],
            schema: {
                thumbnail: {
                    type: 'Select',
                    options: ['default'].concat(this.conf.sizes.map(function (v) {
                        return v.thumbnail
                    }))
                },
                href: {
                    type: 'Text',
                    placeholder: "/views/{type}/edit?id={id}/{size}",
                    help: 'Optional link to where the image goes'
                }
            }
        }
    ]
}
//I really want to configure the executable via the GUI but it is so full
//of security issues, I can't.
ImageUploadPlugin.prototype.admin = function () {
    return new Model('imageupload', [
        {
            schema: {
                convert: {
                    type: 'Text',
                    help: 'Path to imagemagick\'s convert, this value can only be changed by editing the bobamo.conf',
                    placeholder: this.defaults.paths.convert
                },
                identify: {
                    type: 'Text',
                    help: 'Path to imagemagick\'s identify, this value can only be changed by editing the bobamo.conf',
                    placeholder: this.defaults.paths.identify
                }
            },
            url: this.pluginUrl + 'views/admin/configure',
            fieldsets: [
                {legend: "ImageUpload Plugin", fields: ['convert', 'identify']}
            ],
            plural: 'ImageUpload',
            title: 'ImageUpload Plugin',
            modelName: 'imageupload'
        }
    ]);
}


ImageUploadPlugin.prototype.configure = function (conf) {
    _u.extend(this.defaults, conf);
    if (!this.defaults.directory) {
        this.defaults.directory = path.join(path.dirname(module.filename), 'images', 'full');
    }
    _u.each(this.defaults.paths, function (v, k) {
        if (im[k] && im[k].path) {
            im[k].path = v;
        }
    });
    return null;
}

ImageUploadPlugin.prototype.routes = function () {

    var dir = process.cwd();

    var fullDir = dir + '/public/images/full/';
    if (!fs.existsSync(fullDir)) {
        fs.mkdirsSync(fullDir)
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
    }.bind(this));

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
        im.resize({
            width: opts.width,
            height: opts.height,
            srcPath: fullDir + id,
            dstPath: destDir + '/' + id
        }, next);


    }.bind(this),
        require('express').static(dir + '/public')
    );
    //, static(dir+'/public'));
//    _u.each(options.imageVersions, function(v,k){
//           this.get(this.pluginUrl+k, function(){
//
//           });
//    }, this);
    var pluginUrl = this.pluginUrl;
    //change this to use a hash of the original file, so that we can
    // safely reference it from other places.

    //TODO - change this so that when we read the current models
    //settings for all of the options.   This is a bit tricky.  We
    // will need to change the url to contain both the Model and property to
    // look that up in the model so that we can create the right images for this
    //particular instance.
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
                name: f.name,
                size: f.size,
                type: f.type,
                fileId: name,
                url: pluginUrl + '/images/full/' + name + '.' + type,
                delete_url: pluginUrl + '/' + name,
                delete_type: 'DELETE'
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
module.exports = ImageUploadPlugin