define(['underscore', 'Backbone', 'Backbone.Form', 'csvimport/mapping-form', 'Backbone.Form/form-model', 'libs/editors/reorder-list-editor'], function (_, B, Form, MappingForm) {
    return B.Model.extend({
        parse:function (resp) {
            var p = resp && resp.payload || resp;
            p.mapping = _.map(p.mapping, function(v){

                var parser = v.parser;

                var options = v.options;
                var type = parser.type ||  parser;
                v.parser = { type:type, parsers:{}};
                v.parser.parsers[type] = options;
                delete v.options;
                return v;
            });
            return p;
        },
        createForm:function(opt){
          return (this.form = new Form(opt));
        },
        urlRoot:function () {
            return '${pluginUrl}/admin/configure/' + this.get('modelName')
        },
        defaults:{
            configuration:'Default'
        },
        idAttribute:'configuration',
        schema:{
            configuration:{
                type:'Text',
                help:'Name this profile'
            },
            file:{
                type:'File',
                help:'A Sample CSV file to look for headers'
            },
            mapping:{
                type:'ReorderList',
                itemType:'NestedModel',
                model:B.Model.extend({
                    toString:function(){
                        var p = this.get('parser') || {};
                      return '['+this.get('colIndex')+'] '+ (this.get('title')||'') +(p.type ? '->'+ p.type : '')+' -> '+this.get('property')
                    },

                    createForm:function (opts) {
                        var p= opts._parent && opts._parent.model && opts._parent.model.toJSON();
//                        f.fields.property.

                        var columns=[], properties = p.properties && _.map(p.properties, function(v){
                            return v.name;
                        }) || [],indexes = [];
                        _.each(p.mapping, function(v,i){
                            if (!p.properties)
                                properties.push(v.property);
                            columns.push(v.title);
                            indexes.push(i);
                        });
                        indexes.push(indexes.length);
                        opts.schema.property.options = properties;
                        opts.schema.title.options = columns;
                        opts.schema.colIndex.options = indexes;
                        return ( this.form = new Form(opts));
                    },
                    schema:{
                        colIndex:{
                            type:'Select'
                        },
                        title:{
                            title:'Column',
                            type:'Select'
                        },
                        property:{
                            type:'Select',
                            options:[]
                        },
                        parser:{
                            type:'NestedModel',
                            model:MappingForm
                        }
                    }})
            }

        }
    });
});