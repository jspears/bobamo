define(['jquery', 'Backbone', 'confirm_change', 'replacer'], function ($, Backbone, ConfirmView, replacer) {
    "use strict";

    var DeleteView = Backbone.View.extend({
        options:{
            redirect:'#/{modelName}/list?refresh=true',
            body:'Are you sure you want to delete {modelName} "{id}"?',
            button:'Delete',
            title:'Delete  {title} "{id}"'
        },
        render:function (opts) {
            var config = _.extend({}, opts, this.config);
            var confirm = new ConfirmView({
                defaults:{
                    body:replacer(this.options.body, config),
                    button:replacer(this.options.button, config),
                    title:replacer(this.options.button, config)
                }
            });
            var redir = this.options.redirect;
            confirm.render('show', function onDelete() {
                $.ajax({type:'delete',
                    url:replacer('rest/{modelName}', config),
                    data:{
                        _id:opts.id
                    },
                    success:function (resp) {
                        if (resp.status == 0) {
                            window.location.hash = replacer(redir, config);
                        }
                    }
                });
            });
        }
    });
    return DeleteView;
})