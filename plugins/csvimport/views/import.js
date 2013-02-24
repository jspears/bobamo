define(['underscore', 'Backbone', 'Backbone.Form', 'libs/bobamo/edit', 'text!csvimport/templates/import.html'], function (_, B, Form, EditView, template) {
    var ImportView = B.View.extend({
        el:"#content",
        template:_.template(template),
        events:{
            'click .save':'onSave'
        },
        onSave:function(e){
            e.preventDefault();
            var $fel = this.form.$el;
            $fel.iframePostForm({
                complete:_.bind(this._save, this),
                json:true
            })
            $fel.attr('enctype','multipart/form-data');
            $fel.attr('method', 'POST');
            $fel.attr('action', "${pluginUrl}/import");
            $fel.submit();
        },
        _save:function(resp){
          console.log('resp', resp);
            var $sl = this.$el.find('.success-list'),
                $el = this.$el.find('.error-list');
          if (resp.payload){
            $sl.html("<li>Imported <i>"+resp.payload.length+"</i> rows into <i>"+this.form.getValue().modelName+"</i></li>").show();
          }else{
            $sl.hide();
          }
          if (resp.errors){
              $el.append.apply($el, _.map(resp.errors, function(e){
                   return '<li> error importing <code>'+e+'</code></li>'
              }));
              $el.show();
          }else{
              $el.hide();
          }

        },
        render:function () {
            this.$el.html(this.template);
            this.form = new Form({
                schema:{
                    import:{
                        type:'File',
                        help:'CSV File to import'
                    },
                    empty:{
                        type:'Checkbox',
                        help:'Do you want to erase all previous data in the object before import'
                    },

                    modelName:{
                        type:'Select',
                        help:'Which model would you like to import this to',
                        collection:'views/modeleditor/admin/schema-collection'
                    }
                },
                fieldsets:[
                    {
                        legend:'Upload CSV',
                        fields:['import',  'modelName', 'empty']
                    }
                ]
            });
            this.form.on('render', function () {
                this.$el.find('.form-container').html(this.form.$el);
            }, this);

            this.form.render();


            return this;
        }

    })
    return ImportView;
});