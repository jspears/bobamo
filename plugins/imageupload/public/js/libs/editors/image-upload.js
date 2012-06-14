define(['jquery',
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


], function ($, Form, tmpl, formTmpl, uploadTmpl, downloadTmpl) {

    var liTmpl = '   <li class="span3"><div class="thumbnail"><img src="<%=thumbnail_url%>" alt="<%=name%>" height="80" width="80"></div></li>';
    var editors = Form.editors;
    var UploadEditor = editors.UploadEditor = editors.Base.extend({

        initialize:function (options) {
            editors.Base.prototype.initialize.call(this, options);

        },

        render:function () {
            if (uploadTmpl) {
                $('body').append(uploadTmpl);
                uploadTmpl = null;
            }
            if (downloadTmpl) {
                $('body').append(downloadTmpl);
                downloadTmpl = null;
            }
            var $tmpl = $(formTmpl);
            var $dialog = $('<div></div>');
            $dialog.append($tmpl);
            this.$el.append($dialog);

            $tmpl.fileupload().fileupload('add', {files:this.options.value});
            return this;
        },
        setValue:function (value, lng) {
        },
        getValue:function () {
        }
    });
    return UploadEditor;

})