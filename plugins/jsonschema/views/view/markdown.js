define(['Backbone', 'Backbone.Form', 'underscore', 'jsonschema/js/EpicEditor',
    'backbone-modal', 'text!jsonschema/markdown.html'], function(B,Form, _, EpicEditor, Modal, template){
    var extensionMap = {{json plugin.extensionMap}};
    var docRe = /^document-(.*)/;
    var title = '${plugin.pluginManager.appModel.title} ${plugin.pluginManager.appModel.version}';

var MD = B.View.extend({
        el:'#content',
	template:_.template(template),
        events:{
          'change select':'onExportSelect'
        },
        initialize:function(){
            this.data = {
                title:title,
                pandoc_template:'${plugin.conf.pandoc_template}'
            }
        },
        onExportSelect:function(e){
            var val = this.$el.find('select').val();
            var self = this;
            var md = this.editor.exportFile();
            var form = new Form({
                data:_.extend({
                   type:val
                }, this.data, {markdown:md}),
                schema:{
                    toc:{
                        type:'Checkbox',
                        help:'Generate Table of Contents'
                    },
                    pandoc_template:{
                        type:'Text',
                        title:'A template for pandoc',
                        help:'Pandoc Template to use'
                    },
                    title:{

                        type:'Text',
                        help:'title of the document'
                    },
                    type:{
                        type:'Text',
                        fieldAttrs:{style:'display:none'}
                    },
                    markdown:{
                        type:'TextArea',
                        fieldAttrs:{style:'display:none'}
                    }

                },
                fields:['title','toc','pandoc_template','type', 'markdown']
            });
//            form.$el.find('field-markdown').hide();
//            form.$el.find('field-type').hide();

            new Modal(

                {
                    title:'Export to "'+val.replace(docRe, '$1')+'"',
                    content:form
                }
            ).open(function(){
                    self.onDoExport(form, val);
                });

        },
        onDoExport:function(form, type){
            var docRe = /^document-(.*)/;
            var docType = extensionMap[type.replace(docRe, '$1')];

            console.log('conf', form.getValue(), docType);
            form.$el.attr('target', '_blank');
            form.$el.attr('method', 'post');
            form.$el.attr('action', "${pluginUrl}/export/" + type);

            form.$el[0].submit();
//
//            if (docType && docType.ext == 'html' ){
//
//                window.open(url, "${appModel.title} api v${appModel.version} as "+type, "menubar=no,status=yes");
//            }else{
//                this.$el.find('.downloadFrame').attr('src', url);
//            }
        },
        render:function(){
	    this.$el.html(this.template());
            var $edit = $("#epiceditor")
            var editor = this.editor = new EpicEditor({container:$edit[0],basePath:'${pluginUrl}/js/epiceditor/'}).load(
                function(){
                    $.get('${pluginUrl}/markdown', function(resp){
                        editor.importFile('${plugin.pluginManager.appModel.title}', resp);
                    });
                }
            );
            return this;
        }
    })
    return MD;
});
