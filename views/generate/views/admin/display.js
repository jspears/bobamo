define(['underscore', 'jquery', 'Backbone', 'libs/bobamo/edit', 'text!templates/admin/display.html', 'libs/editors/unit-editor', 'libs/editors/color-editor', 'libs/editors/placeholder-editor'], function (_,$, Backbone, EditView, template) {
    var fieldsets = {{html JSON.stringify(factory.fieldsets()) }};
    var schema = {{html JSON.stringify(factory.schemaFor()) }};
    var id = '${lessFactory.checksum}';
    var Model = Backbone.Model.extend({
        schema:schema,
        urlRoot:'admin/less',
        parse:function(resp){
            console.log('response',resp);
            return resp.payload && resp.payload.variables || resp.payload || resp;
        },
        idAttribute:'id',
        get:function(key){
            if (key && key.indexOf('.') > -1){
                var split = key.split('.');
                var val = this.attributes;
                while (split.length && val)
                    val = val[split.shift()];

                return val;
            }
            return Backbone.Model.prototype.get.call(this, key);
        }
    });
    return EditView.extend({
        fieldsets:fieldsets,
        template:_.template(template),
//        collection:collection,
        model:Model,
        isWizard:true,

        events:{
            'click .preview':'onPreview',
            'click .save':'onInstall'
        },
        onInstall:function(e){
            console.log('onInstall', this.model, this.model.set);

          this.form.model.set('install',true);
          this.onSave(e);
        },
        onPreview:function(){
            var self = this;
            var save = this.form.getValue();
            this.form.model.save(save, {success:function onPreviewSave(obj){
            require([ 'text!templates/admin/preview.html', 'libs/bootstrap/js/bootstrap-modal'], function(preview){
                var template = _.template(preview, {title:'Display Changes', previewUrl:'${base}/bobamo/index.html?checksum='+obj.id});

                self.$modal = $(template);
                $('body').append(self.$modal)
                self.$modal.modal();
                self.$modal.on('hidden', function(){
                    $(this).remove();
                })
            });
            }});
        },
        onSuccess:function (resp, obj) {
            EditView.prototype.onSuccess.call(this, resp, obj);
            setTimeout(function(){
                window.location.reload();
            }, 1000);

        },
        render:function(obj){
            if (obj) obj.id = id;
            EditView.prototype.render.apply(this, Array.prototype.slice.call(arguments));
        },
        config:{
            title:'Display',
            plural:'Display Variables',
            modelName:'less'
        }
    });
//    return Backbone.View.extend({
//        events:{
//            'click .save':'onSave'
//        },
//        onSave:function (e) {
//            e.preventDefault();
//            var $form = $('form', this.$el);
//            var data = $form.serializeArray();
//            console.log('onSave', data);
//            $.ajax({
//                type:'POST',
//                data:data,
//                url:'less',
//                success:$.proxy(this.onSuccess, this),
//                error:$.proxy(this.onError, this)
//            })
//        },
//        onError:function(err){
//          console.log('error', arguments);
//        },
//        onSuccess:function(resp){
//            console.log('response',resp);
//        },
//        template:_.template(lessTemplate),
//        render:function (obj) {
//            this.$container = obj && obj.container ? $(obj.container) : $('#content');
//
//            this.$el.html(this.template());
//            var colorMap = {};
//            $('input[type=color]', this.$el).removeClass('span3').addClass('span2').each(function () {
//                var val = $(this).val() || $(this).attr('placeholder');
//                //               $(this).miniColors('value', val);
//                $(this).wrap('<div class="input-append"></div>')
//                $(this).miniColors();
//                if (val) {
//                    if (val[0] == '#') {
//                        $(this).miniColors('value', val);
//                        colorMap[$(this).attr('name')] = val;
//                    }
//                }
//
//            });
//            console.log('colorMap', colorMap);
//            var pxre = /(.*)(px|%|em)$/
//            $('input[placeholder]', this.$el).filter(
//                function () {
//                    return pxre.test($(this).attr('placeholder'));
//                }).each(function () {
//                    var $this = $(this).addClass('span2').removeClass('span3');
//                    var vp = $this.attr('placeholder');
//                    $this.wrap('<div class="input-append"></div>').parent().append('<span class="add-on">' + vp.replace(pxre, '$2') + '</span>')
//                    $this.attr('placeholder', vp && vp.replace(pxre, '$1'));
//
//                })
//            $('.miniColors-trigger', this.$el).addClass('add-on')
//            this.$container.empty().append(this.$el);
//        }
//    })
});