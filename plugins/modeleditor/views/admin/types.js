define(['Backbone', 'underscore', 'jquery'], function (b, _, $) {
    var TC = b.Collection.extend({
        parse:function (resp) {
            var ret = resp.payload;
            return ret;
        }
    });
    var Validator = function (type) {
        return b.Model.extend({
            schema:{
                name:{type:'Select', options:TC.extend({url:'${pluginUrl}/admin/validator/' + type})},
                message:{type:'Text', help:'Error message to display'},
                configure:{type:'TextArea', help:'This will be parsed to JSON and passed into the validation method, please use carefully'}
            },
            toString:function(){
                return this.get('name');
            }
        })
    };

    var DataType = {
        String:b.Model.extend({
            schema:{

                defaultValue:{type:'Text', help:'Default value for field', title:'Default'},
                minLength:{type:'Number', help:'Minimum Length'},
                maxLength:{type:'Number', help:'Maximum Length'},
                match:{type:'Text', help:'Regular Expression'},
                textCase:{type:'Select', options:['none', 'uppercase', 'lowercase'], title:'Case', help:'Save text as lowercase'},
                trim:{type:'Checkbox', help:'Trim text\'s white space'},
                enumValues:{type:'List', help:'Allow only these values'},
                validate:{type:'List', itemType:'NestedModel', model:Validator('String'), help:'Validators '}
            }
        }),
        Number:b.Model.extend({
            schema:{
                defaultValue:{type:'Number', help:'Default value for field', title:'Default'},
                min:{type:'Number', help:'Minimum Value'},
                max:{type:'Number', help:'Maximum Value'},
                validate:{type:'List', itemType:'NestedModel', model:Validator('Number'), help:'Validators '}
            }
        }),
        Date:b.Model.extend({
            schema:{
                defaultValue:{type:'Text', help:'Default time use "now" for the relative current time and "now:-23232" or a value to pass to the constructor' },
                validate:{type:'List', itemType:'NestedModel', model:Validator('Number'), help:'Validators '}
            }
        }),
        Boolean:b.Model.extend({
            schema:{
                defaultValue:{type:'Checkbox', help:'Default state', title:'Default'},
                validate:{type:'List', itemType:'NestedModel', model:Validator('Boolean'), help:'Validators '}
            }
        }),
        ObjectId:b.Model.extend({
            schema:{
                ref:{type:'Select', options:TC.extend({url:"${pluginUrl}/admin/types"})},
                validate:{type:'List', itemType:'NestedModel', model:Validator('ObjectId'), help:'Validators '}
            }
        }),
        Buffer:b.Model.extend({
            schema:{
                maxSize:{type:'Number', help:'Maximum size of buffer'},
                unit:{type:'Select', options:['b', 'kb', 'mb', 'gb']},
                validate:{type:'List', itemType:'NestedModel', model:Validator('Buffer'), help:'Validators '}
            }
        })
    }
    return DataType;


})
;