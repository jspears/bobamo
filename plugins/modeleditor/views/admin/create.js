define([
    'underscore',
    'Backbone',

    'libs/bobamo/edit',
    'text!${pluginUrl}/templates/admin/edit.html',
    'jquery-ui',
    'libs/backbone-forms/editors/list',

    'libs/editors/multi-editor'
], function (_, Backbone, EditView, template) {
    "use strict";
    var typeOptions =   ["Text", "Checkbox", "Checkboxes", "Date", "DateTime", "Hidden", "List", "NestedModel", "Number", "Object", "Password", "Radio", "Select", "TextArea", "MultiEditor", "ColorEditor", "UnitEditor", "PlaceholderEditor"];
    var dataTypes =    ["text", "tel", "time", "url", "range", "number", "week", "month", "year", "date", "datetime", "datetime-local", "email", "color"];
    var schema = {
        "modelName":{
            "title":"Model Name",
            "help":"The model name of the object",
            "type":"Text",
            "path":"modelName"
        },
        "plural":{
            "title":"Plural",
            "help":"The plural of the object",
            "type":"Text",
            "path":"plural"
        },

        "title":{"title":"Title", "help":"The title of the object singular", "type":"Text", "path":"title"},
        "hidden":{"title":"Hidden", "help":"Is this object hidden?", "type":"Checkbox", "path":"hidden"},
        "labelAttr":{"title":"Label Attribute", "help":"This is a label that gives a succinct description of object", "path":"labelAttr"},
        "properties":{
            type:'List',
            itemType:'Object',
            subSchema:{
                name:{type:'Text', required:true},
                title:{type:'Text'},
                description:{type:'Text'},
                required:{type:'Checkbox'},
                editor:{ title:'Editor Type', type:'Select', options:typeOptions},
                schemaType:{
                    type:'Select',
                    options:['String','Number','Date','Buffer','Boolean','Mixed','ObjectId','Array']
                }
            }
        }
    } ;
   var fieldsets = ['modelName','plural','title','hidden', 'labelAttr','properties'];

//    schema.fieldsets.itemToString = function (obj) {
//        if (obj.fields && _.isString(obj.fields)) {
//            obj.fields = obj.fields.split(',');
//        }
//        var fields = '[' + obj.fields.join(',') + ']';
//        if (fields.length > 30)
//            fields = fields.substring(0, 27) + '...';
//
//        return obj.legend + ' ' + fields;
//    }
    var Model = Backbone.Model.extend({
        schema:schema,
//        url:'/modeleditor/admin/model/ProfileImage',
//        parse:function (resp) {
//            console.log('response', resp);
//            return resp.payload;
//        },
        defaults:{
          modelName:null,
          plural:null,
            title:null,
            hidden:null,
            labelAttr:null,
            properties:null
        },
        idAttribute:'_id',  // changed to _id for MongoDB
        set:function (a, b, c, d) {
            return Backbone.Model.prototype.set.call(this, a, b, c, d)
        },
        get:function (key) {
            if (key && key.indexOf('.') > -1) {
                var split = key.split('.');
                var val = this.attributes;
                //"paths", "meta", "subSchema", "stars", "title"
                if (split.length > 3) {
                    var last = split.pop();
                    var ret = [split.shift()];
                    for (var i = 0, l = split.length; i < l; i++) {
                        ret.push(split[i]);
                        if (i + 1 < l)
                            ret.push('subSchema');
                    }

                    ret.push(last)
                    split = ret;
                    console.log('splits', split.concat());
                }
                while (split.length && val)
                    val = val[split.shift()];

                return val;
            }
            return Backbone.Model.prototype.get.call(this, key);
        }
    });
    return EditView.extend({
        fieldsets: {legend:'Create a new model', fields:fieldsets},
        template:_.template(template),
//        collection:collection,
        model:Model,
/*      createForm:function(){

        }, */
        isWizard:false,
        config:{
            title:'Model',
            plural:'Models'
        }
    });

});
