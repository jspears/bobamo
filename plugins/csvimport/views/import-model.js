define(['underscore', 'Backbone', 'Backbone.Form', 'libs/bobamo/edit', 'views/modeleditor/admin/create', 'text!csvimport/templates/import.html'], function (_, B, Form, EditView, CreateView, template) {
    var CVP = CreateView.prototype;
    var CVM = CreateView.prototype.model;

    var MappingModel = B.Model.extend({
        toString:function(){
          return this.get('column') || this.get('property');
        },
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
            var headerMap = resp.headerMap;
            var headers = resp.headers;
            _.each(headers, function(k){
               var v = headerMap[k];
               this.addItem({ title:v, name:k, type:'Text', schemaType:'String' });
            }, this.fields.schema.editor)
            _.each(headers, function(v){
                this.addItem(v)
            }, this.fields.list_fields.editor);
            _.each(headers, function(k){
                var v = headerMap[k];
                this.addItem({property:k, column:v, type:'automatic'})
            }, this.fields.mapping.editor);

            var modelName = resp.modelName.replace(/\..*$/,'');
            this.fields.modelName.setValue(modelName);
            this.commit();
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