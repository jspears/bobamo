define(['Backbone', 'jsonschema/js/SwaggerUi', 'underscore', 'jquery',
    'jsonschema/js/hljs',
    'text!jsonschema/tpl/swagger.html',

    'jsonschema/js/swagger-ui/lib/jquery.slideto.min',
    'jsonschema/js/swagger-ui/lib/jquery.wiggle.min',
    'jsonschema/js/swagger-ui/lib/jquery.ba-bbq.min'
//    'jsonschema/js/swagger-ui/lib/handlebars-1.0.rc.1',
//    'jsonschema/js/swagger-ui/lib/swagger',
//    'jsonschema/js/swagger-ui/lib/highlight.7.3.pack'


], function (B, sui, _, $, hljs, template) {
    function readCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
        return null;
    }
    var extensionMap = {{json plugin.extensionMap}};
    var DocView = B.View.extend({
        el:'#content',
        template:_.template(template),
        events:{
            'click a':'onLink',
            'change .exportForm select':'onExport',
            'click .printBtn':'onPrint'
        },
        onPrint:function(){
            window.open("${pluginUrl}/print.html", "${appModel.title}", "status=0,toolbar=0,height=600,width=800,menubar=0");
        },
        onExport:function (e) {
            e.preventDefault();
            var type = $(e.target).val();

            if (type) {
                $(e.target).attr('disabled', 'true');
                var $status = this.$el.find('.exportStatus');
                var finishDownload = function(){
                    $status.html('finished generating client').hide(10000);
                    $(e.target).removeAttr('disabled');
                    clearInterval(fileDownloadCheckTimer);
                }
                var fileDownloadCheckTimer = window.setInterval(function () {
                    if (readCookie('download') == type)
                        finishDownload();
                }, 100);
                $status.html('generating "'+type+'" client...').addClass('label label-success').show();
                var docRe = /^document-(.*)/;
                var docType = extensionMap[type.replace(docRe, '$1')];
                if (docType && docType.ext == 'html' ){
                    finishDownload();
                    window.open("${pluginUrl}/export/" + type, "${appModel.title} api v${appModel.version} as "+type, "menubar=no,status=yes");

                }else{
                 this.$el.find('.downloadFrame').attr('src', "${pluginUrl}/export/" + type);
                }
            }

        },
        onLink:function (e) {
            if (!$(e.target).hasClass('go'))
                e.preventDefault();
        },
        discoveryUrl:"${pluginUrl}/api-docs/",
        onInit:function () {
            var $el = this.$el;
            var self = this;
            console.log('discoveryUrl', this.discoveryUrl);
            this.swaggerUi = new SwaggerUi({
                discoveryUrl:this.discoveryUrl,
                // apiKey:"special-key",
                dom_id:"swagger-ui-container",
                supportHeaderParams:false,
                supportedSubmitMethods:['get', 'post', 'put', 'delete'],
                onComplete:function (swaggerApi, swaggerUi) {
//                    $el.find('.response_throbber').attr('src', 'jsonschema/js/swagger-ui/images/throbber.gif')
                    if (console) {
                        console.log("Loaded SwaggerUI")
                        console.log(swaggerApi);
                        console.log(swaggerUi);
                    }
                    $('pre code', this.$el).each(function (i, e) {
                        hljs.highlightBlock(e)
                    });
                    self.trigger('doc-swagger-complete', this);
                },
                onFailure:function (data) {
                    if (console) {
                        console.log("Unable to Load SwaggerUI");
                        console.log(data);
                    }
                },
                docExpansion:"full"
            });

            this.swaggerUi.load();
        },

        tryLoad:function () {
            if (!window['SwaggerUi']) {
                if (this._load++ < 5) {
                    setTimeout(_.bind(this.tryLoad, this), 100 * this._load);
                } else {
                    console.warn('did not load swagger');
                }
            } else {
                this.onInit();

            }
        },
        render:function (opts) {
            this._load = 0;
            this.$el.html(this.template());
            this.$el.find('ul').addClass('unstyled');
            if (opts.mode == "print"){
                this.docExpansion = "full";
                this.mode = "print"
            }else{
                this.docExpansion = "none"
            }
            this.tryLoad();
            return this;
        }
    })
    return DocView;
});