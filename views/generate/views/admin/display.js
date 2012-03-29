define(['underscore', 'Backbone', 'libs/mojaba/edit',
    'text!templates/admin/edit.html', 'libs/editors/unit-editor', 'libs/editors/color-editor', 'libs/editors/placeholder-editor'], function (_, Backbone, EditView, template) {
    var fieldsets = {{html JSON.stringify(factory.fieldsets()) }};
    var schema = {{html JSON.stringify(factory.schemaFor()) }};
    var Model = Backbone.Model.extend({
        schema:schema,
        url:'admin/less',
        parse:function(resp){
            console.log('response',resp);
            return resp.payload;
        },
        idAttribute:'modelName',
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