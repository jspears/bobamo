// Filename: ${baseUrl}/js/views/list.js
define([
    'underscore',
    'Backbone.Form',
    'libs/bobamo/list',

    'modelcollections/${model.modelName}',
    'text!templates/${model.modelName}/table.html',
    'text!templates/${model.modelName}/table-item.html'
], function (_,Form,View, m, tableTemplate, tableItemTemplate) {
    "use strict";

     var qform = {{html JSON.stringify(model.finder(view).display) || 'null' }};
    return View.extend({
        initialize:function(options, params){
            var FM =     m.Collection.extend({
                url:'${api}/${model.modelName}/finder/${view}'
            });
            this.collection = new FM()
            View.prototype.initialize.apply(this, arguments);
        },
        events:_.extend({},View.prototype.events,{
                submit:'onFormSubmit'
        }),
        onFormSubmit:function(e){
            e.preventDefault();
            console.log('onFormSubmit',this.form.getValue());
            this.$paginate.paginate('update', {skip:0}); //reset the skip.
            this.update(null, {skip:0});
        },
        update:function(mesg, data){
            View.prototype.update.call(this, mesg, _.extend({}, data,  this.form && this.form.getValue() || null));
        },
        template:_.template(tableTemplate),
        render:function(){
            View.prototype.render.apply(this, arguments);
            if (qform){
                var form = this.form = new Form(qform).render();
                form.$el.append('<div class="form-actions"><input type="reset" class="btn" value="Clear"><button type="submit" class="btn pull-right btn-primary save finish">Submit</button></div>')
                this.$el.find('.table').before(form.el);
            }

            this.$table.find('.title').append(" &gt; <span>${model.finder(view).title}</span>")

            return this;
        },
        listItemTemplate:_.template(tableItemTemplate),
        config:{
            title:'${model.title}',
            modelName:'${model.modelName}',
            plural:'${model.plural}'
        }
    });
});
