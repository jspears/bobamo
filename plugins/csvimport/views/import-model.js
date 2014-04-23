define(['underscore', 'Backbone', 'Backbone.Form', 'libs/bobamo/edit', 'views/modeleditor/admin/create',
    'csvimport/mapping-form', 'csvimport/parserprovider',
    'csvimport/configure-model',
    'libs/jquery/jquery.busy'], function (_, B, Form, EditView, CreateView, MappingForm, parsers, ConfModel) {
    var CVP = CreateView.prototype;
    var CVM = CreateView.prototype.model;

    var FileModel = B.Model.extend({
        schema:{
            import:{
                type:'File',
                help:'CSV File to import'
            }
        },
        _update:function (r) {
            var resp = r.payload || r;
            this.model.set(resp);
            console.log('update', resp, this);
            var se = this.fields.schema.editor,
                //lfe = this.fields.list_fields.editor,
                me = this.fields.mapping.editor;
            _.each([se, me], function (e) {
                _.invoke(e.items, 'remove');
                e.items = [];
            });
            _.each(resp.properties, se.addItem, se);
//            _.each(resp.properties, function(v){
//                this.addItem(v.name);
//            }, lfe);

            if (resp.mapping)
                _.each(resp.mapping, function(v){
                    var parser = {
                        type:v.parser,
                        parsers:{}
                    };
                    parser.parsers[v.parser] = v.options;
                    v.parser = parser;
                    this.addItem(v);
                }, me);
            var modelName = resp.modelName.replace(/\..*$/, '');
            this.fields.modelName.setValue(modelName);
            var $el = this.$el;
            setTimeout(function () {
                $el.removeClass('disabled busy').busy('remove');
            }, 2000)
        },
        _startUpload:function (form) {
            form.$el.addClass('disabled').busy({
                img:'img/ajax-loader.gif',
                title:'Uploading File...'
            });
        },
        createForm:function (args) {
            //   args.model.schema = Editors;
            var form = new Form(args);
            var start = _.bind(this._startUpload, this);
            form.on('render', function () {
                var $fel = form.$el;
                $fel.iframePostForm({
                    complete:_.bind(this._update, args.pform),
                    json:true
                });
                $fel.attr('enctype', 'multipart/form-data');
                $fel.attr('method', 'POST');
                $fel.attr('action', "${pluginUrl}/admin/configure/");
                $fel.find("input[type=file]").on('change', function () {
                    console.log('import');
                    $fel.submit();
                    start(args.pform);
                });
            }, this);
            return form;
        }
    });
    var ImportModel = CVM.extend({
        schema:_.extend({}, CVM.prototype.schema,
            {
                import:{
                    type:'NestedModel',
                    model:FileModel,
                    title:'Import'
                },
                mapping:ConfModel.prototype.schema.mapping

            }
        )
    });


    return CreateView.extend({
        model:ImportModel,
        url:"${pluginUrl}/admin/createmodel",
        fieldsets:[
            {legend:'Import', fields:['import']}
        ].concat(CVP.fieldsets)
            .concat({
                legend:'Data Mapping',
                fields:['mapping']
            }),
        changeType:function (itm, property) {
            if (!(itm || property)){
                console.log('can\'t change type without itm and property');
                return ;
            }
            var first = _.filter(parsers,function (v) {
                return !v.types || ~v.types.indexOf(property.type);
            }).shift();

            if (first) {
                //so what you are setting up here is the item when it gets rendered.  If it does
                // not get rendered, well you know.  It is a long path to new MappingForm so
                // don't loose your mind.
                console.log('changeType', itm, property, first);
                var schemaType = property.persistence && property.persistence.schemaType || property.type;
                var val = _.extend({}, itm.getValue(), {type:first.type, parser:_.extend({type:first.type, schemaType:schemaType})});
                itm.setValue(val);
            } else {
                console.log('could not find type for ', itm, property);
            }

        },
        createForm:function () {
            var f = CVP.createForm.apply(this, _.toArray(arguments));
            f.on("schema:item:close", function (a, b, c) {
                var value = c.getValue().name;
                var items = f.fields.mapping.editor.items;
                var itm = _.filter(items,function (it) {
                    return it.value.property == value
                }).shift();
                this.changeType(itm, c.getValue());
            }, this);
            return f;
        }
    });

});