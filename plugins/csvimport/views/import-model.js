define(['underscore', 'Backbone', 'Backbone.Form', 'libs/bobamo/edit', 'views/modeleditor/admin/create', 'text!csvimport/templates/import.html'], function (_, B, Form, EditView, CreateView, template) {
    var CVP = CreateView.prototype;
    var CVM = CreateView.prototype.model;

    var MappingModel = B.Model.extend({
        schema:{
            column:{
                type:'Text'
            },
            parser:{
                type:'Select',
                options:[
                    'automatic',
                    'toDate',
                    'toNumber',
                    'toLowercase',
                    'toUppercase',
                    'trim',
                    'split'
                ]
            },
            property:{
                type:'Text'
            }

        }
    });

    var FileModel = B.Model.extend({
        schema:{
            import:{
                type:'File',
                help:'CSV File to import'
            }
        },
        _update:function(r){
            var resp  = r.payload;
            console.log('update', resp, this);
            var schema = [];
            _.each(resp.headerMap, function(v,k){
                schema.push({ title:v, name:k, type:'Text', schemaType:'String' });
            })
            var modelName = resp.modelName.replace(/\..*$/,'');
            this.setValue('schema', schema);
            this.setValue('modelName', modelName);
            this.setValue('fieldsets', [{legend:modelName, fields:resp.headers}]);
            this.setValue('list_fields', resp.headers);
//            this.fields.schema.setValue(schema);
//            this.fields.modelName.setValue(resp.modelName);
//            this.fields.list_fields.setValue(resp.headers);
//            this.model.set({
//                schema:schema,
//                list_fields:resp.headers,
//                modelName:resp.modelName
//            })
////            this.commit();
//            this.render();

        },
        createForm:function (args) {
            //   args.model.schema = Editors;
            var form = new Form(args);
            form.on('render', function(){
                var $fel = form.$el;
                $fel.iframePostForm({
                    complete:_.bind(this._update, args.pform),
                    json:true
                })
                $fel.attr('enctype','multipart/form-data');
                $fel.attr('method', 'POST');
                $fel.attr('action', "${pluginUrl}/import");
                $fel.find("input[type=file]").on('change', function(){
                    console.log('import');
                    $fel.submit();
                });
            }, this);
            return form;
        }
    })
    var ImportModel = CVM.extend({
        schema:_.extend({}, CVM.prototype.schema,
            {
                import:{
                    type:'NestedModel',
                    model:FileModel
                },
                mapping:{
                    help:'Mapping from Column to Property',
                    type:'List',
                    itemType:'NestedModel',
                    model:MappingModel
                }
            }
        )
    });


    var ImportView = CreateView.extend({
        model:ImportModel,
        fieldsets:[
            {legend:'Import', fields:['import']}
        ].concat(CVP.fieldsets).concat({
                legend:'Data Mapping',
                fields:['mapping']
            })
    });

    return ImportView;
})
;