var _u = require('underscore'), util = require('../../lib/util');
var EditApp = function (App, options) {
    this.app = App;
    this.options = _u.extend({}, options);
    this.editors = this.options.editors;
    this.__defineGetter__('models', function () {
        return _u.map(this.modelPaths, function (k, v) {
            return k
        });
    });

    this.__defineGetter__('modelPaths', function () {
        var ret = {};
        _u.each(this.app.modelPaths, function onModelPaths(v, k) {
            ret[k] = new EditModel(k, v, {editors:this.editors});
        }, this);
        return ret;
    });
    this.__defineGetter__('data', function () {
        var d = [];
        _u.each(this.app.modelPaths, function (v, k) {
            var o = _u.extend({}, v);
            delete o._paths;
            d.push(o);
        });
        return d;
    });

}
EditApp.prototype.modelFor = function (model) {
    var paths = this.modelPaths;
    var m = paths[model];
    return m;
}

EditApp.prototype.schemaFor = function (model, fields) {
    return this.schema;
}
var EditModel = function (k, Model, options) {
    this.model = Model;
    this.modelName = k;
    this.title = this.model.title;
    this.plural = this.model.plural;
    this.editors = options.editors;

//    this.__defineGetter__('schema', function () {
//        var paths = this.schema;
//        return _u.map(this.schema, function (v, k) {
//            paths[k].path = k;
//        });
//    })
    this.__defineGetter__('fields', function () {
        var fields = Object.keys(util.flatten(this.model.schema));
        return fields;
    });
    this.__defineGetter__('fieldsets', function () {
        var fieldsets = [
            {
                legend:'Edit ' + this.title,
                fields:['title', 'plural', 'hidden', 'labelAttr', 'fieldsets', 'list_fields']
            }
        ];
        //  var _paths = util.flatten(this.schemaFor());

        _u(this.fields).each(function ( k,v) {
            var fieldset = {
                legend:this.title + '.' + k,
                fields:['paths.' + k + '.title','paths.' + k + '.help', 'paths.' + k + '.views', 'paths.' + k + '.type', 'paths.' + k + '.dataType', 'paths.' + k + '.required']
            };
            fieldsets.push(fieldset);
        }, this);
        return fieldsets;
    })

}
EditModel.prototype.schema = {
    plural:{
        title:"Plural",
        help:'The plural of the object',
        type:'Text'
    },
    title:{
        title:"Title",
        help:'The title of the object singular',
        type:'Text'
    },
    hidden:{
        title:'Hidden',
        help:'Is this object hidden?',
        type:'Checkbox'
    },
    labelAttr:{
        title:'Label Attribute',
        help:'This is a label that gives a sussinct description of object'
    }
};

EditModel.prototype.schemaFor = function () {
    var fields = this.fields;
    var schema = this._schema = _u.extend({}, this.schema);
    this._schema.fieldsets = {
        type:'List',
        listType:'Object',
        help:'Fieldsets to use to edit object, if more than 1 a wizard is created.',
        title:'Edit View',
        sortable:true,
        subSchema:{

            legend:{
                title:'Legend fo the fieldset',
                type:'Text'
            },
            fields:{
                title:'Fields to be used in this fieldset',
                type:'MultiEditor',
                options:fields
            }
        }

    }
    this._schema.list_fields = {
        type:'List',
        listType:'Select',
        options:fields,
        help:'Fields to Show in the List View',
        title:'List View',
        sortable:true
    }

    var obj = (this._schema.schema = { subSchema:{}, type:'Object'}).subSchema;
    _u(this.model.schema).each(function (v, k) {
        obj[k] = {type:'Object', subSchema:createSubSchema(this.editors, k, v) };

    }, this);

    return this._schema;

}
function createSubSchema(editors, k, v) {
    var obj = {
        title:{
            title:'Title',
            help:'The title of the path',
            type:'Text'
        },
        help:{
            title:'Help',
            help:'The help text to show next to item',
            type:'Text'
        },
        views:{
            title:'View',
            help:'The views this property can be seen in.',
            dataType:'Select',
            options:[
                {label:'List View', val:'list_view'},
                {label:'Edit View', val:'edit_view'},
                {label:'None', val:'no_view'}
            ]
        },
        type:{
            title:'Editor',
            help:'The editor to use with field',
            type:'Select',
            options:editors
        },
        dataType:{
            title:'Data Type',
            help:'The Data Type of the field for html5 enabled browsers',
            options:'text,tel,time,url,range,number,week,month,year,date,datetime,datetime-local,email,color'.split(','),
            type:'Select'
        },
        required:{
            title:'Required',
            help:'Is this a required field.',
            type:'Checkbox'
        }
    }
    _u(v.subSchema).each(function (vv, kk) {
        obj[kk] = {type:'Object', labelAttr:{type:'Text', help:'A label for this attribute'},subSchema:createSubSchema(editors, kk, vv)};
    });
    return obj;
}
var EditField = function (Field) {

}

module.exports = EditApp;