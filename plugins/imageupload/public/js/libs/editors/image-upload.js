define(['jquery', 'underscore',
    'Backbone.Form',

    'imageupload/js/libs/blueimp/tmpl.min',
    'text!imageupload/tpl/form.html',
    'text!imageupload/tpl/upload.html',

    'text!imageupload/tpl/download.html',

    'imageupload/js/libs/blueimp/canvas-to-blob.min',
    'imageupload/js/libs/blueimp/jquery.fileupload-fp',
    'imageupload/js/libs/blueimp/jquery.fileupload-ui',
    'imageupload/js/libs/blueimp/jquery.fileupload',
    'imageupload/js/libs/blueimp/jquery.iframe-transport',
    'imageupload/js/libs/blueimp/locale',
    'imageupload/js/libs/blueimp/load-image.min' ,
    'libs/bootstrap/js/bootstrap-modal'


], function ($, _, Form, tmpl, formTmpl, uploadTmpl, downloadTmpl) {
    "use strict;"

    var editors = Form.editors;
    var ImageUpload = editors.ImageUpload = editors.Base.extend({

        initialize:function (options) {
            editors.Base.prototype.initialize.call(this, options);
            this.deleted = [];
            this.model.on('sync', this.doDeletes, this);
        },
        doDeletes:function () {
            _.each(this.deleted, $.ajax, $);
        },

        render:function () {
            if (!$('#template-upload').length) {
                $('body').append(uploadTmpl);
            }
            if (!$('#template-download').length) {
                $('body').append(downloadTmpl);
            }
            var $tmpl = this.$fileupload = $(formTmpl);
            var $dialog = $('<div></div>');
            $dialog.append($tmpl);
            this.$el.append($dialog);
            var self = this;

            if (!this.value)
                this.value = [];
            _.each(this.value, function (v) {
                delete v.delete_url;
                delete v.delete_type;
            });
            var opts =
            $tmpl.fileupload({autoUpload:true, destroy:function (e, data) {
                var that = $(this).data('fileupload');
                self.deleted.push(data)
                that._transition(data.context).done(
                    function () {
                        $(this).remove();
                        that._trigger('destroyed', e, data);
                    }
                );
            }}).fileupload('add', {files:this.value})
                .bind('fileuploaddone', function (e, obj) {

                    self.value = self.value.concat(obj.result);
                })
                .bind('fileuploaddestroy', function (e, obj) {
                    self.deleted.push(obj);
                    self.value = _.filter(self.value, function (v) {
                        var ret = v.delete_url != obj.url
                        return ret;
                    });
                });
            return this;
        },
        setValue:function (value, lng) {
            this.value = value;
            this.$fileupload.fileupload('add', {files:value});
            return this;
        },
        getValue:function () {
            return this.value;
        }
    });
    return ImageUpload;

})