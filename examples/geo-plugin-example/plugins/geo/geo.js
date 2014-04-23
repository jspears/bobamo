var bobamo = require('bobamo'), mongoose = bobamo.mongoose, Model = bobamo.DisplayModel,
    PluginApi = bobamo.PluginApi, util = require('util'), _u = require('underscore');

/**
 * This is a custom Mongoose data type.  Use this pattern if
 * you need something more complex than what is built into mongoose.
 * @param path
 * @param options
 * @constructor
 */
var GeoPoint = function GeoPoint(path, options) {
    options = _u.extend({type:Object, index:'2d', strict:true}, options);
    this.lon = Number;
    this.lat = Number;
    this.formatted_address = String;
    GeoPoint.super_.call(this, path, options);

    console.log('geopoint', this);
};

util.inherits(GeoPoint, mongoose.Schema.Types.Object);

GeoPoint.prototype.cast = function (test, obj) {
   // console.log('cast', arguments, this);
    return test;
}
exports.GeoPoint = GeoPoint;

mongoose.Types.GeoPoint = GeoPoint;

mongoose.Schema.Types.GeoPoint = GeoPoint;

GeoPoint.prototype.display = {


}
/**
 * Subclass PluginAPI to create your own plugin.  Note this file is
 * <pluginName>/<pluginName>.js  that is the convention.
 *
 * This is required
 * @constructor
 */
var GeoPlugin = function () {
    PluginApi.apply(this, arguments);
    //this is the configuration you will see how to edit in the
    this.conf = {
        defaults:{}
    }
}

/**
 * This is required.
 */
util.inherits(GeoPlugin, PluginApi);
/**
 * Register custom renderers.  Use this
 * if you want the output to come out different.
 *
 * Use if you have custom renderers.
 * @returns {Array}
 */
GeoPlugin.prototype.renderers = function(){
    return [
        {
            name:'StaticMap', //The name of the renderer the id will be geo.StaticMap
            types:['GeoPoint'], // The types you can use this for (only GeoPoint)
            fieldsets:[{
                legend:'Static Map Renderer',
                fields:['height','width','zoomLevel','scale','markerColor','markerLabel','markerIcon','maptype']
            }],
            schema:{ // How you configure said renderer
                height:{
                    type:'Integer'
                },
                width:{
                    type:'Integer'
                },
                zoomLevel:{
                    type:'Number'
                },
                scale:{
                    type:'Number'
                },
                markerColor:{
                    type:'Color'
                },
                markerLabel:{
                    type:'FilterText',
                    filter:'/^[a-zA-Z0-9]$/'
                },
                markerIcon:{
                    type:'Text',
                    dataType:'url'
                },
                maptype:{
                    type:'Select',
                    options:['roadmap','satellite','terrain','hybrid']
                }
            }
        }
    ]
}
/**
 * Register custom editors.  Here we have 2,
 * One for finding by address the other by finding on a map.
 *
 * Again optional, only if you have custom editors
 * @returns {Array}
 */
GeoPlugin.prototype.editors = function () {
    return [
        {
            types:['GeoPoint'],
            name:'MapEditor',
            schema:{
                defaults:{
                    type:'LocationEditor'
                }
            }
        },
        {
            types:['GeoPoint'],
            name:'LocationEditor',
            schema:{
                defaults:{
                    type:'LocationEditor'
                }
            }
        }
    ]
}
/**
 * This is the tricky one.  Or at least not obvious.  In order
 * for your plugin to automatically create the right editor for
 * a particular type you need this.  This is called recursively
 * throughout the model.   If you don't implement this it won't
 * automatically find the right editor type.
 *
 * Again optional
 * @param path
 * @param property
 * @param Model
 * @returns {{type: string, schemaType: string, labelAttr: string}}
 */
GeoPlugin.prototype.editorFor = function (path, property, Model) {
    if (property.type == 'GeoPoint' || (property.lat && property.lon)) {
        return {
            type:'LocationEditor',
            schemaType:'GeoPoint',
            labelAttr:'formatted_address'
        }
    }
}
/**
 * This is what creates the admin interface for this plugin.
 * Basically what this.conf gets configured to.
 *
 * This is optional, depending on your plugin needs
 * @returns {Model}
 */
GeoPlugin.prototype.admin = function () {
    return new Model('geoplugin', [
        {
            schema:{
                apiKey:{
                    type:'Text',
                    help:'Enable your API key for static maps,geocoding,map api from <a target="_blank"  href="https://code.google.com/apis/console/">google</a>',
                    validators:[{
                        type:'required'
                    }]
                },
                defaults:{
                    type:'LocationEditor',
                    help:'Where on the map do you want to be the default, you may need to setup the apiKey first?'
                }

            },
            fieldsets:[
                {legend:"Geo Plugin Configure", fields:['apiKey', 'defaults']}
            ],
            title:'Geo Plugin',
            defaults:this.conf
        }

    ]);
}
/**
 * This is how you add something custom to the menu.  Otherwise it will
 * add an item based on the returns of plugin.admin().  If plugin.admin() doesn't
 * return anything than no addition to the menu will be added. If plugin.admin,
 * does return something than an entry for like this will be created.
 * {
 *   '<plugin-name>-admin':{
 *      label:'Configure '+model.title,
 *      href: '#views/configure/<plugin-name>,
 *      iconCls:model.iconCls
 *
 *   }
 * }
 *
 *
 * @returns {{header: {admin-menu: { 'plugin': {label: string, href: string}}}}}
 */
//GeoPlugin.prototype.appModel = function () {
//    return {
//        header: {
//            'admin-menu': {
//                'geoplugin': {
//                    label: 'Configure GeoPlugin'
////                    href: '#views/configure/geo',
//
//                }
//            }
//        }
//    }
//};


module.exports = GeoPlugin;
