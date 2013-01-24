define(['Backbone', 'underscore', 'jsonschema/js/EpicEditor'], function(B, _, EpicEditor){

    var MD = B.View.extend({
        el:'#content',
        render:function(){
            var $edit = $('<div id="epiceditor" style="height:800px"></div>')
             this.$el.html($edit);
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