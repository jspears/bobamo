var _u = require('underscore');
var global_options = {};
function EditApp(App, options) {
    this.app = App;
    this.options = _u.extend(global_options, options);

    this.__defineGetter__('models', function () {
        return _u.map(this.modelPaths, function (k, v) {
            return k
        });
    });

    this.__defineGetter__('modelPaths', function () {
        var ret = {};
        _u.each(this.app.modelPaths, function onModelPaths(v, k) {
            ret[k] = new EditModel(k, v);
        }, this);
        return ret;
    });
    this.__defineGetter__('data', function(){
        var d = [];
        _u.each(this.app.modelPaths, function(v,k){
            var o = _u.extend({},v);
            delete o._paths;
            d.push(o);
        });
        return d;
    });
}
EditApp.prototype.modelFor = function (model) {
    var obj = {
        title:'Admin',
        plural:'Admin',
        modelName:'admin'
    }
    obj.edit_fields = obj.list_fields = obj.fields = ['plural', 'title', 'hidden', 'labelAttr'];
    obj.paths = {
        plural:{
            title:'Model'
        },
        title:{
            title:'Title'
        },
        hidden:{
            title:'Hidden'
        },
        labelAttr:{
            title:'labelAttr'
        }
    };
    var self = this;

    return obj;
}

EditApp.prototype.schemaFor = function (model, fields) {
    return this.schema;
}
function EditModel(k, Model) {
    this.model = Model;
    this.modelName = k;
    this.title = 'Model';
    this.plural = 'Models';


    this.__defineGetter__('paths', function () {
        var paths = this.schema;
        return _u.map(this.schema, function (v, k) {
            paths[k].path = k;
        });
    })
}
EditModel.prototype.schema = {
    plural:{
        title:"Plural",
        help:'The plural of the object',
        type:'String'
    },
    title:{
        title:"Title",
        help:'The title of the object singular',
        type:'String'
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
    if (!this._schema);
    var schema = this.schema;
    this._schema = _u.extend({}, schema);
    var obj = this._schema.paths = {subSchema:{}, type:'Object'};
    _u(this.model.paths).each(function (v, k) {
        obj[k] = {
            title:{
                title:'Title',
                help:'The title of the path',
                type:'String',
                validator:['required']
            },
            help:{
                title:'Help',
                help:'The help text to show next to item',
                type:'String'
            },
            views:{
                title:'View',
                help:'The views this property can be seen in.',
                type:'Select',
                dataType:'String',
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
                options:['Checkbox',
                    'Checkboxes',
                    'Date',
                    'DateTime',
                    'Hidden',
                    'List',
                    'NestedModel',
                    'Number',
                    'Object',
                    'Password',
                    'Radio',
                    'Select',
                    'Text',
                    'TextArea', 'MultiEditor']
            },
            dataType:{
                title:'Data Type',
                help:'The Data Type of the field for html5 enabled browsers',
                options:'tel,text,time,url,range,number,week,month,year,date,datetime,datetime-local,email,color'.split(','),
                type:'Select'
            },
            required:{
                title:'Required',
                help:'Is this a required field.',
                type:'Checkbox'
            }
        }

    })
    ;
    return schema;

}
function EditField(Field) {

}

module.exports = EditApp;