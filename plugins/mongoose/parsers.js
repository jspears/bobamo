module.exports = [
    {
        type:'ref',
        types:['ObjectId'],
        schema:{
            lookup:{
                type:'Select',
                help:'Reference another object by field, ' +
                    'If the property is marked required it will error if nothing is found.' +
                    'by default it looks up by the first field marked unique, otherwise Id, function',
                collection:'views/modeleditor/admin/schema-collection'
            },
            property:{
                type:'Text',
                help:'The field on the lookup object to resolve this to, should be a unique field'
            }
        },
        //Consider adding a this.setCallback, it may be a bit more inconvient...
        isAsync:true,
        parser:function (opts) {
            var func = opts.lookup || 'findOne';
            var model = opts.model;
            var property = opts.property;
            return function (value) {
                var obj = {};
                obj[property] =value;
                this.options.mongoose.model(model)[func](obj, Array.prototype.slice.call(arguments).pop());
            }
        }
    }
]