module.exports = [
    {
        type:'ref',
        types:['ObjectId'],
        schema:{
//            lookup:{
//                type:'Select',
//                help:'Reference another object by field, ' +
//                    'If the property is marked required it will error if nothing is found.' +
//                    'by default it looks up by the first field marked unique, otherwise Id, function',
//                collection:'views/modeleditor/admin/schema-collection'
//            },

            property:{
                type:'Typeahead',
                help:'The field on the lookup object to resolve this to, should be a unique field it will be mapped to the value of this field',
                url:'modeleditor/admin/properties/?',
                validators:[ {type:'required'}]
            }
        },
        //Consider adding a this.setCallback, it may be a bit more inconvient...
        isAsync:true,
        parser:function (opts) {
            var property = opts.property.split('.');
            var model = opts.model || property.shift();
            var func =  'findOne';
            property = property.shift();
            return function (value) {
                var obj = {};
                obj[property] =value;
                this.options.mongoose.model(model)[func](obj, arguments[arguments.length -1]);
            }
        }
    }
]