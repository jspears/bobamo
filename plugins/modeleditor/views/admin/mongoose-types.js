define(['Backbone', 'views/modeleditor/admin/property', 'underscore', 'jquery'], function (b, Property, _, $) {
    "use strict";
    var TC = b.Collection.extend({
        parse:function (resp) {
            var ret = resp.payload;
            return ret;
        }
    });

    function json(path, label) {
        var C = TC.extend({
            url:'${pluginUrl}' + path,
            model:b.Model.extend({
                toString:function () {
                    return this.get(label);
                }
            })
        });
        var collection = new C();
        return function (cb) {
            collection.fetch({
                success:cb
            })
        }
    }

    ;
    //   TC.extend({url:'${pluginUrl}/admin/validator/' + type}
    var Validator = function (type) {
        return b.Model.extend({
                schema:{
                    name:{
                        type:'Select',
                        options:json('/admin/validators/' + type, 'name')
                    },
                    message:{type:'Text', help:'Error message to display'},
                    configure:{type:'TextArea', help:'This will be parsed to JSON and passed into the validation method, please use carefully'}
                },
                toString:function () {
                    return this.get('name');
                }
            }
        )
    };
    var TM = b.Model.extend({
        parse:function (resp) {
            return resp.payload;
        }
    });
    var DataType = {
        String:TM.extend({
            schema:{

                defaultValue:{type:'Text', help:'Default value for field', title:'Default'},
                minLength:{type:'Number', help:'Minimum Length'},
                maxLength:{type:'Number', help:'Maximum Length'},
      //          match:{type:'Text', help:'Regular Expression'},
                textCase:{type:'Select', options:['none', 'uppercase', 'lowercase'], title:'Case', help:'Save text in specified case'},
                trim:{type:'Checkbox', help:'Trim text\'s white space'},
                enumValues:{type:'List', help:'Allow only these values'},
                validate:{type:'List', itemType:'NestedModel', model:Validator('String'), help:'Validators '},
                index:{type:'Checkbox', help:'Index this property'},
                unique:{type:'Checkbox', help:'Make property unique'}
            }
        }),
        Number:TM.extend({
            schema:{
                defaultValue:{type:'Number', help:'Default value for field', title:'Default'},
                min:{type:'Number', help:'Minimum Value'},
                max:{type:'Number', help:'Maximum Value'},
                validate:{type:'List', itemType:'NestedModel', model:Validator('Number'), help:'Validators '}
            }
        }),
        Date:TM.extend({
            schema:{
                defaultValue:{type:'Text', help:'Default time use "now" for the relative current time and "now:-23232" or a value to pass to the constructor' },
                validate:{type:'List', itemType:'NestedModel', model:Validator('Number'), help:'Validators '}
            }
        }),
        Boolean:TM.extend({
            schema:{
                defaultValue:{type:'Checkbox', help:'Default state', title:'Default'},
                validate:{type:'List', itemType:'NestedModel', model:Validator('Boolean'), help:'Validators '}
            }
        }),
        ObjectId:TM.extend({
            schema:{
                ref:{
                    type:'Select',
                    options:json('/admin/types/models', 'modelName')
                }, //new TC.extend({url:"${pluginUrl}/admin/types"})
                validate:{type:'List', itemType:'NestedModel', model:Validator('ObjectId'), help:'Validators '}
            }
        }),
        Buffer:TM.extend({
            schema:{
                maxSize:{type:'Number', help:'Maximum size of buffer'},
                unit:{type:'Select', options:['b', 'kb', 'mb', 'gb']},
                validate:{type:'List', itemType:'NestedModel', model:Validator('Buffer'), help:'Validators '}
            },
            default:{
                maxSize:1,
                unit:'mb'
            }
        }),
        Object:TM.extend({
            schema:{
                properties:{
                    type:'List',
                    itemType:'NestedModel',
                    model:Property
                }
            }
        })
    };
    var schema = {};
    var model = TM.extend({
        schema:schema,
        _schemaTypes:DataType
    });
    _.each(DataType, function (v, k) {
        schema[k] = {
            type:'NestedModel',
            model:v
        }
    });
    return model;

})
;