define(['jquery', 'underscore',
    'Backbone.Form',
    'imageupload/editor_conf.js',
    'imageupload/js/libs/blueimp/tmpl.min',
    'text!../../../imageupload/tpl/form.html',
    'text!../../../imageupload/tpl/upload.html',

    'text!../../../imageupload/tpl/download.html',

    'imageupload/js/libs/blueimp/canvas-to-blob.min',
    'imageupload/js/libs/blueimp/jquery.fileupload-fp',
    'imageupload/js/libs/blueimp/jquery.fileupload-ui',
    'imageupload/js/libs/blueimp/jquery.fileupload',
    'imageupload/js/libs/blueimp/jquery.iframe-transport',
    'imageupload/js/libs/blueimp/locale',
    'imageupload/js/libs/blueimp/load-image.min' ,
    'backbone-modal'


], function ($, _, Form, conf, tmpl, formTmpl, uploadTmpl, downloadTmpl) {
    "use strict;"
    var imageUrl = conf.imageBaseUrl;
    var filterNull = function (v) {
        return !!v;
    }
    var editors = Form.editors;
    var ImageUpload = editors.ImageUpload = editors.Base.extend({

        initialize:function (options) {
            editors.Base.prototype.initialize.call(this, options);
            this.deleted = [];
            this.multiple = this.schema.multiple == true;
            console.log('urlRoot', this.model.urlRoot)
            this.model.on('sync', this.doDeletes, this);
        },
        onSaveImage:function (evt, result) {
            var obj = result.result.concat();
            console.log('onSaveImage', obj);
            var self = this;
            if (this.schema.url) {
                while (obj.length) {
                    var data = obj.shift();
                    if (!data.id) {
                        $.ajax({
                            type:'POST',
                            data:data,
                            url:this.schema.url,
                            dataType:'json',
                            success:function (resp) {

                                if (resp.status != 0)
                                    return;
                                data.id = resp.payload._id;
                                self.value.push(data);

                            }
                        })
                    }
                }
            }
            else {
                this.value = this.value.concat(obj);
            }
        },
        doDeletes:function () {
            if (!this.schema.url) {
                _.each(this.deleted, $.ajax, $);
            }
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
            else if (!_.isArray(this.value)) {
                this.value = [this.value];
            }


            var opts = {autoUpload:true, destroy:function (e, data) {
                var that = $(this).data('fileupload');
                self.deleted.push(data)
                that._transition(data.context).done(
                    function () {
                        $(this).remove();
                        that._trigger('destroyed', e, data);
                    }
                );
            }};
            if (!this.multiple) {
                opts.maxNumberOfFiles = 1;
            }
            $tmpl.fileupload(opts)
                .bind('fileuploaddone', _.bind(this.onSaveImage, this))
                .bind('fileuploaddestroy', function (e, obj) {
                    self.deleted.push(obj);
                    self.value = _.filter(self.value, function (v) {
                        var ret = v.delete_url != obj.url
                        return ret;
                    });
                });
            this.addFiles();
            return this;
        },
        addFiles:function (values) {

            if (!this.schema.url)                {
                if (this.value && this.value.length){
                    this.value = _.map(this.value, function(val){
                       return _.extend({url:imageUrl+'/images/full/'+val.fileId, delete_url:imageUrl+'/'+val.fileId, delete_type:'DELETE', 'thumbnail_url':imageUrl+'/images/thumbnail/'+val.fileId+'.jpeg'},val );
                    });
                    this.$fileupload.fileupload('option', 'done').call( this.$fileupload, null, {result: this.value});
                }


            }else {
                var self = this;
                $.get([this.model.urlRoot, this.model.id, this.key].join('/'), function (result) {
                    self.value = result.payload;
                    self.$fileupload.fileupload('add', {files:result.payload});
                })
            }
        },
        setValue:function (value, lng) {
            this.value = value;
            this.$fileupload.fileupload('add', {files:value});
            return this;
        },
        getValue:function () {
            var values = this.schema.url ? _.filter(_.map(this.value, function (v) {
                if (v) return v.id
            }), filterNull) : this.value;
            return this.multiple ? values : values.length ? values[0] : null;
        }
    });
    return ImageUpload;

})