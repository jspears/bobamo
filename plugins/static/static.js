var Plugin = require('../../lib/plugin-api'), util = require('util'), path = require('path'), static = require('connect/lib/middleware/static'), _u = require('underscore');
var StaticPlugin = function (options, app, name, p, pluginManager) {
    Plugin.apply(this, arguments);
    var public = path.join(this.path, 'public', 'js')
    _u.extend(this.pluginManager.requireConfig.paths, {
        underscore:path.join(public, 'libs/underscore/underscore-1.4.2'),
        Backbone:path.join(public, 'libs/backbone/backbone-0.9.2'),
        'jquery-ui':path.join(public, 'libs/backbone-forms/editors/jquery-ui'),
        'Backbone.Form':path.join(public, 'libs/bobamo/backbone-forms'),
        'Backbone.FormOrig':path.join(public, 'libs/backbone-forms/backbone-forms'),
        'jquery-editors':path.join(public, 'libs/backbone-forms/editors/list'),
        'bootstrap':path.join(public, 'libs/bootstrap/js'),
        templates:path.join(public, '../templates'),
        'backbone-modal':path.join(public, 'libs/backbone-forms/editors/backbone.bootstrap-modal'),
        'libs':path.join(public, 'libs')
    });
}
util.inherits(StaticPlugin, Plugin);

var DataTypes = {
    'String':[
        'text',
        'password',
        'color',
        'date',
        'datetime',
        'datetime-local',
        'email',
        'month',
        'number',
        'range',
        'search',
        'tel',
        'time',
        'url',
        'week'],
    'Number':[
        'number',
        'range']
}
var formatters = [
    {name:'Text',
        schema:{
            default:'Text',
            labelAttr:'Text',
            maxLength:'Number'
        }
    },
    {
        name:'Number',
        types:['Number'],
        schema:{
           numberFormat:{
               type:'Text',
               placeholder:'##.#'
           }

        }
    },
    {
        name:'Date',
        types:['Date','DateTime'],
        schema:{
            dateFormat:'Text'
        }
    },
    {
        name:'Password',
        schema:{
            showAs:{
                type:'Select',
                options:['******', 'Text', 'None']
            }
        }
    },
    {
        name:'List',
        types:['List','Array'],
        schema:{
            labelAttr:'Text',
            count:{
                type:'Radio',
                options:['None', 'count', 'delimited']
            }
        }
    }
]
var editors = [
    {
        name:'Text',
        types:['String', 'Boolean', 'Number', 'Date'],
        schema:{
            placeholder:{ type:'Text' },
            dataType:{ type:'Select', options:DataTypes.String}

        }
    },
    {
        name:'TypeAhead',
        types:['String', 'Number', 'Date'],
        schema:{
            placeholder:{ type:'Text' },
            dataType:{ type:'Select', options:DataTypes.String},
            options:{
                type:'List'
            }
        }
    },
    {
        name:'TextArea',
        types:['String', 'Boolean', 'Number', 'Date'],
        schema:{
            placeholder:{ type:'Text' },
            dataType:{ type:'Select', options:DataTypes.String},
            maxChars:{type:'Number', help:'Maximum number of charecters for twitter-esq display'},
            rows:{type:'Number', help:'Default number of rows'},
            cols:{type:'Number', help:'Default number of cols'}

        }
    },
    {
        name:'Hidden',
        types:['String', 'Boolean', 'Number', 'Date'],
        schema:{
            defaultValue:{type:'Text' }
        }
    },
    {   name:'Checkbox',
        types:['String', 'Number', 'Boolean'],
        schema:{
            defaultValue:{type:'Checkbox' }
        }
    },
    {   name:'Date',
        types:['Date', 'Number', 'String'],
        schema:{
            yearStart:{type:'Number', help:'The year to start the display'},
            yearEnd:{type:'Number', help:'The year to stop display'},
            showMonthNames:{type:'Checkbox', checked:true},
            monthNames:{type:'Text', help:"Comma deliminted listing of month names 'Jan', 'Feb', ...'"}
        }
    },
    {   name:'DateTime',
        types:['Date', 'Number', 'String'],
        schema:{
            minsInterval:{type:'Number', help:'Defaults to 15, so it is populated with 0, 15, 30, and 45 minutes.'}
        }
    },
    {
        name:'Password',
        types:['String']
    },
    {
        name:'Radio',
        types:['Boolean', 'String'],
        schema:{
            options:{
                type:'List',
                help:'A list of options, A, B, C...'
            }
        }
    },
    {
        name:'Select',
        types:['String'],
        schema:{
            options:{
                type:'List',
                help:'A list of options, A, B, C...'
            }
        }
    },
    {
        name:'MultiEditor',
        types:[ 'ObjectId'],
        schema:{
            ref:{
                type:'MultiEditor',
                collection:'views/modeleditor/admin/schema-collection',
                multiple:false
            },
            multiple:{
                type:'Checkbox'
            }
        }
    },
    {   name:'Number',
        types:['Number', 'String'],
        schema:{
            placeholder:{ type:'Text' },
            defaultValue:{type:'Number' },
            dataType:{ type:'Select', options:DataTypes.Number}
        }
    },
    //  { name:'Search', types:['ObjectId']},
    //  { name:'Link', types:['ObjectId']},
    //  { name:'List', types:['ObjectId']},
    { name:'NestedModel', types:['ObjectId', 'Object']},
    { name:'Object', types:['Object']}

];
StaticPlugin.prototype.format = function(obj){
    if (obj){
      var val = obj.name ||obj;
      return _u.filter(formatters, function(v){
          return !v.types || ~v.types.indexOf(val);
      });

    }
    return formatters;

}
StaticPlugin.prototype.editors = function () {
    return editors;
}
StaticPlugin.prototype.filters = function () {
    var prefix = this.baseUrl;
    var sdir = path.join(this.path, 'public');
    var psdir = path.join(process.cwd(), 'public');

    var public = static(sdir);
    var publicUser = static(psdir);
    console.log("Public Dir: ", psdir);
    this.app.get(prefix + '*', function (req, res, next) {
        req._url = req.url;
        req.url = req.url.substring(prefix.length - 1);

        next();

    }, publicUser, public, function (req, res, next) {
        req.url = req._url;
        next();
    });
}
StaticPlugin.prototype.routes = function () {
}
module.exports = StaticPlugin;