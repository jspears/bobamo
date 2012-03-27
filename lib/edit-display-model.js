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
    var paths = this.modelPaths;
    var m = paths[model];
    return m;
}

EditApp.prototype.schemaFor = function (model, fields) {
    return this.schema;
}
function EditModel(k, Model) {
    this.model = Model;
    this.modelName = k;
    this.title = this.model.title;
    this.plural = this.model.plural;


    this.__defineGetter__('paths', function () {
        var paths = this.schema;
        return _u.map(this.schema, function (v, k) {
            paths[k].path = k;
        });
    })
    this.__defineGetter__('fieldsets', function(v,k){
        var fieldsets = [
            {
                legend:'Edit '+this.title,
                fields:['title','plural','hidden','labelAttr', 'fieldsets']
            }
        ];
        _u(this.model.paths).each(function (v, k) {
            if (k.indexOf('.') > -1)
                return;
            fieldsets.push({
                legend:'Property '+k,
                fields:['paths.'+k+'.title','paths.'+k+'.help', 'paths.'+k+'.views', 'paths.'+k+'.type','paths.'+k+'.dataType','paths.'+k+'.required']
            })
        });
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

    var schema = this._schema = _u.extend({}, this.schema);
    this._schema.fieldsets = {
        type:'List',
        listType: 'Object',
        help:'Fieldsets to use to edit object',
        title:'Fieldsets',
        sortable:true,
        subSchema:{

            legend:{
                title:'Legend fo the fieldset',
                type:'Text'
            },
            fields:{
                title:'Fields to be used in this fieldset',
                type:'MultiEditor',
                options:Object.keys(this.model.paths)
            }
        }

    }
    var obj = (this._schema.paths = { subSchema:{}, type:'Object'}).subSchema;

    _u(this.model.paths).each(function (v, k) {
//        if (k.indexOf('.') > -1)
//            return;

        obj[k] = {type:'Object'};
        obj[k].subSchema = {
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
                options:['Text','Checkbox',
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
                    'TextArea', 'MultiEditor']
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

    })

    return this._schema;

}
function EditField(Field) {

}

module.exports = EditApp;